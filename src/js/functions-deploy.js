// Functions Deploy page.
// The operator picks "make a new one" or "update an existing one".
// Both paths use the site bearer token from POST /sites/tokens.
// A version upload only starts a job. This page polls that job, then sets
// the finished version as the function's current version.

const outputConsole = document.getElementById("output");
const outputStatus = document.getElementById("output-status");
const triggerButton = document.getElementById("trigger-run");
const confirmBox = document.getElementById("confirm-run");
const tokenField = document.getElementById("access-token");
const choiceScreen = document.getElementById("choice-screen");
const workspace = document.getElementById("workspace");
const createFields = document.getElementById("create-fields");
const updateFields = document.getElementById("update-fields");
const resetButton = document.getElementById("reset-session");
const resetDialog = document.getElementById("reset-dialog");
const resetCopy = document.getElementById("reset-copy");
const resetYes = document.getElementById("reset-yes");

// "create" or "update". Empty means the choice screen is showing.
let mode = "";
// 0 hidden, 1 first confirm, 2 second confirm.
let resetStep = 0;
// Console text kept for the audit row.
let finalReport = "";
// Survives Reset session so a run that was cleared still writes one audit row.
let sealedReport = "";
// True only while a deploy is still waiting on this page.
let runActive = false;
// Bumped on reset so an in-flight run does not write into a cleared page.
let runSerial = 0;

// dynamo_write_audittable. The Audit Logs page reads these rows back on its own.
const WRITE_LOG_URI = "https://api.glia.com/integrations/f026a5b6-ba81-4211-99e1-3667bbaf16e9/endpoint";
const AUDIT_SITE_ID = "a5c110f6-a4a5-47d9-bbf1-d03d7a5e5089";
// Must match the Functions Deploy option in src/audit-logs.html.
const AUTOMATION_NAME = "Functions Deploy";

// Check 9 used to be the one that finished, at 2 seconds apart: about 18 seconds.
// Wait that long once, then check every second instead of polling from the start.
const FIRST_POLL_MS = 18000;
const LATER_POLL_MS = 1000;
const LATER_POLL_LIMIT = 20;
const MAX_CODE_BYTES = 512000;
const MAX_ENV_BYTES = 4000;
const MAX_HEADERS = 30;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("choose-create").addEventListener("click", () => chooseMode("create"));
    document.getElementById("choose-update").addEventListener("click", () => chooseMode("update"));

    confirmBox.addEventListener("change", () => {
        triggerButton.disabled = !confirmBox.checked;
    });

    document.getElementById("clear-output").addEventListener("click", () => {
        finalReport = "";
        outputConsole.textContent = "Console cleared.";
        outputStatus.textContent = "Ready";
    });

    document.getElementById("generate-token").addEventListener("click", async () => {
        try {
            setStatus("Requesting token");
            const token = await fetchSiteToken();
            tokenField.value = token;
            logOutput("Site token loaded: " + token.substring(0, 5) + "...", true);
            setStatus("Token ready");
        } catch (error) {
            logOutput("Token request failed: " + error.message, true);
            setStatus("Token failed");
        }
    });

    document.getElementById("list-functions").addEventListener("click", listFunctions);
    document.getElementById("list-versions").addEventListener("click", listVersions);
    triggerButton.addEventListener("click", handleTriggerClick);

    resetButton.addEventListener("click", openReset);
    resetYes.addEventListener("click", advanceReset);
    document.getElementById("reset-no").addEventListener("click", closeReset);
});

// Swap the choice screen for the form that matches the choice.
function chooseMode(nextMode) {
    mode = nextMode;
    choiceScreen.classList.add("hidden");
    workspace.classList.remove("hidden");
    createFields.classList.toggle("hidden", nextMode !== "create");
    updateFields.classList.toggle("hidden", nextMode !== "update");
    triggerButton.textContent = nextMode === "create" ? "Create and deploy" : "Update and deploy";
    triggerButton.disabled = !confirmBox.checked;
    document.getElementById("page-lead").textContent = nextMode === "create"
        ? "Make a new function and set version 1 as current."
        : "Update to version 2 or later, then set that version as current.";
    logOutput(nextMode === "create" ? "Mode: make a new function." : "Mode: update an existing function.", true);
    setStatus("Ready");
}

// First click opens the dialog. Yes once is not enough.
function openReset() {
    resetStep = 1;
    resetCopy.textContent = "This asks one more time before clearing the session.";
    resetYes.textContent = "Yes";
    resetDialog.classList.remove("hidden");
    resetDialog.style.display = "flex";
}

// The second Yes is the one that clears the page.
function advanceReset() {
    if (resetStep === 1) {
        resetStep = 2;
        resetCopy.textContent = "Are you sure you want to reset? This clears the session and returns to the start.";
        resetYes.textContent = "Yes, reset";
        return;
    }
    resetSession();
}

function closeReset() {
    resetStep = 0;
    resetDialog.classList.add("hidden");
    resetDialog.style.display = "";
}

// Wipe every field and go back to the choice screen.
function resetSession() {
    mode = "";
    resetStep = 0;
    finalReport = "";
    confirmBox.checked = false;
    triggerButton.disabled = true;
    triggerButton.textContent = "Create and deploy";
    tokenField.value = "";
    document.getElementById("base-url").value = "https://api.glia.com";
    ["api-key-id", "api-key-secret", "function-name", "function-desc", "create-site-id", "create-code", "create-env", "create-public-keys", "create-headers", "create-compat", "update-site-id", "function-id", "version-id", "update-code", "update-env", "update-public-keys", "update-headers", "update-compat"].forEach((id) => {
        document.getElementById(id).value = "";
    });
    document.getElementById("function-list").textContent = "";
    document.getElementById("version-list").textContent = "";
    outputConsole.textContent = "Choose make or update to begin.";
    outputStatus.textContent = "Ready";
    clearDeployStatus();
    document.getElementById("page-lead").textContent = "Create a new Glia Function, or update one that already exists.";
    workspace.classList.add("hidden");
    choiceScreen.classList.remove("hidden");
    closeReset();
}

// POST /sites/tokens. The typed secret never goes into the console.
async function fetchSiteToken() {
    const baseUrl = baseUrlValue();
    const apiKeyId = document.getElementById("api-key-id").value.trim();
    const apiKeySecret = document.getElementById("api-key-secret").value;
    if (!baseUrl || !apiKeyId || !apiKeySecret) {
        throw new Error("Base URL, API Key ID, and API Key Secret are required.");
    }

    const result = await gliaFetch(baseUrl + "/sites/tokens", {
        method: "POST",
        headers: {
            "Accept": "application/vnd.salemove.v1+json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            api_key_id: apiKeyId,
            api_key_secret: apiKeySecret
        })
    });
    if (!result.response.ok || !result.data.access_token) {
        throw new Error(apiError(result.response, result.data, "No access_token in the response."));
    }
    return result.data.access_token;
}

// Reuse a token already on screen, or request one.
async function ensureToken() {
    const existing = tokenField.value.trim();
    if (existing) {
        return existing;
    }
    logOutput("Requesting site access token");
    const token = await fetchSiteToken();
    tokenField.value = token;
    logOutput("   -> Token loaded: " + token.substring(0, 5) + "...");
    return token;
}

function baseUrlValue() {
    return document.getElementById("base-url").value.replace(/\/$/, "");
}

function authHeaders(token) {
    return {
        "Accept": "application/vnd.salemove.v1+json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

// GET /functions?site_ids[]= so the operator can pick one.
async function listFunctions() {
    try {
        setStatus("Listing functions");
        const siteId = document.getElementById("update-site-id").value.trim();
        if (!siteId) {
            throw new Error("Site ID is required to list functions.");
        }
        const token = await ensureToken();
        const result = await gliaFetch(baseUrlValue() + "/functions?site_ids[]=" + encodeURIComponent(siteId), {
            method: "GET",
            headers: authHeaders(token)
        });
        if (!result.response.ok) {
            throw new Error(apiError(result.response, result.data, "Could not list functions."));
        }
        renderFunctionChoices(result.data.functions || []);
        logOutput("Listed " + (result.data.functions || []).length + " function(s).");
        setStatus("Ready");
    } catch (error) {
        logOutput("List functions failed: " + error.message, true);
        setStatus("Failed");
    }
}

function renderFunctionChoices(functions) {
    const list = document.getElementById("function-list");
    list.textContent = "";
    if (!functions.length) {
        list.textContent = "No functions on that site.";
        return;
    }
    functions.forEach((func) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-small";
        button.style.margin = "0 0.5rem 0.5rem 0";
        button.textContent = (func.name || "Unnamed") + " · " + func.id;
        button.addEventListener("click", () => {
            document.getElementById("function-id").value = func.id || "";
            logOutput("Selected function " + (func.id || ""));
            if (func.invocation_uri) {
                logOutput("   -> Invocation URI (unchanged by a version swap): " + func.invocation_uri);
            }
        });
        list.appendChild(button);
    });
}

// GET /functions/{id}/versions so the operator can pick the base version.
async function listVersions() {
    try {
        setStatus("Listing versions");
        const functionId = document.getElementById("function-id").value.trim();
        if (!functionId) {
            throw new Error("Function ID is required to list versions.");
        }
        const token = await ensureToken();
        const result = await gliaFetch(baseUrlValue() + "/functions/" + encodeURIComponent(functionId) + "/versions", {
            method: "GET",
            headers: authHeaders(token)
        });
        if (!result.response.ok) {
            throw new Error(apiError(result.response, result.data, "Could not list versions."));
        }
        const versions = result.data.function_versions || result.data.versions || [];
        // The version list does not say which one is live. The function record does.
        const fetched = await gliaFetch(baseUrlValue() + "/functions/" + encodeURIComponent(functionId), {
            method: "GET",
            headers: authHeaders(token)
        });
        const activeId = fetched.response.ok ? currentVersionId(fetched.data) : "";
        renderVersionChoices(versions, activeId);
        setStatus("Ready");
    } catch (error) {
        logOutput("List versions failed: " + error.message, true);
        setStatus("Failed");
    }
}

function renderVersionChoices(versions, activeId) {
    const list = document.getElementById("version-list");
    list.textContent = "";
    if (!versions.length) {
        list.textContent = "No versions yet. A new function has none until the first upload finishes.";
        logOutput("No versions yet.");
        return;
    }
    // Newest created_at first, so the top button is the latest upload.
    const sorted = versions.slice().sort(function (a, b) {
        return String(b.created_at || "").localeCompare(String(a.created_at || ""));
    });
    const newest = sorted[0];
    const activeVersion = sorted.find(function (version) {
        return version.id === activeId || versionLooksActive(version);
    });
    const liveId = activeVersion ? activeVersion.id : activeId;

    const summary = document.createElement("p");
    summary.className = "form-hint";
    summary.style.marginBottom = "0.75rem";
    summary.textContent = "Active: " + versionLabel(activeVersion, liveId) + ". Most recent: " + versionLabel(newest, newest && newest.id) + ". Times are in your local timezone.";
    list.appendChild(summary);
    logOutput(summary.textContent);

    sorted.forEach(function (version) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-small";
        button.style.margin = "0 0.5rem 0.5rem 0";
        const tags = [];
        if (liveId && version.id === liveId) {
            tags.push("Active");
        }
        if (newest && version.id === newest.id) {
            tags.push("Most recent");
        }
        const when = readableTime(version.created_at);
        const prefix = tags.length ? tags.join(" · ") + " — " : "";
        button.textContent = prefix + (version.id || "Unknown version") + (when ? " · " + when : "");
        button.addEventListener("click", function () {
            document.getElementById("version-id").value = version.id || "";
            logOutput("Selected base version " + (version.id || ""));
        });
        list.appendChild(button);
    });
}

// A version row can mark itself current even when the function record does not.
function versionLooksActive(version) {
    if (version.current === true || version.is_current === true || version.deployed === true) {
        return true;
    }
    const status = String(version.status || version.state || "").toLowerCase();
    return status === "current" || status === "active" || status === "deployed";
}

// "id · Oct 8, 2026, 11:38:34 AM PDT", or a short fallback when the record is missing.
function versionLabel(version, id) {
    if (version) {
        const when = readableTime(version.created_at);
        return version.id + (when ? " · " + when : "");
    }
    if (id) {
        return id;
    }
    return "none";
}

// "2026-10-08T18:38:34.721395Z" becomes a local date and time.
function readableTime(iso) {
    if (!iso) {
        return "";
    }
    // Keep milliseconds only. Extra digits after that can confuse Date parsing.
    const trimmed = String(iso).replace(/\.(\d{3})\d+(Z)?$/, ".$1$2");
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
        return String(iso);
    }
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short"
    });
}

// Run the chosen path. Stop at the first failed step and still try to audit it.
async function handleTriggerClick() {
    const startedAt = Date.now();
    const batchSummary = [];
    let invocationUri = "";
    const runId = ++runSerial;
    finalReport = "";
    triggerButton.disabled = true;
    // The poll lives in this tab. Leaving the page abandons version 1.
    armStayWarning();
    logOutput("========================================", true);
    logOutput(mode === "create" ? "STARTING CREATE" : "STARTING UPDATE");
    logOutput("========================================");
    setStatus("Running");

    try {
        // Check the form before asking Glia for a token.
        validateMode();
        const token = await ensureToken();
        const headers = authHeaders(token);
        const baseUrl = baseUrlValue();
        batchSummary.push({ item: "site token", action: "Fetch bearer token", status: "Success" });

        if (mode === "create") {
            invocationUri = await runCreate(baseUrl, headers, batchSummary);
        } else if (mode === "update") {
            invocationUri = await runUpdate(baseUrl, headers, batchSummary);
        } else {
            throw new Error("Choose make or update before running.");
        }

        logOutput("BATCH JOB FINISHED");
        if (invocationUri) {
            logOutput("Invocation URI: " + invocationUri);
        }
        renderSummaryTable(batchSummary);
        await writeAuditLog({
            action: auditAction(),
            status: "Success",
            finalReport: executionReport(batchSummary),
            url: auditUrl(invocationUri),
            durationMs: Date.now() - startedAt
        });
        triggerButton.textContent = "Completed";
        setStatus("Success");
    } catch (error) {
        const cancelled = runId !== runSerial;
        if (!cancelled) {
            disarmStayWarning();
            document.getElementById("deploy-status-title").textContent = "Deploy stopped";
            document.getElementById("deploy-stay").textContent = "The deploy stopped before the version was current. You can leave this page.";
            logOutput("CRITICAL ERROR: " + error.message);
            if (batchSummary.length) {
                renderSummaryTable(batchSummary);
            }
            triggerButton.textContent = "Retry";
            triggerButton.disabled = !confirmBox.checked;
            setStatus("Failed");
        }
        // Success and failure each write one row, including a run stopped by Reset.
        await writeAuditLog({
            action: auditAction(),
            status: "Failed",
            finalReport: executionReport(batchSummary) || "Run stopped before it finished.",
            url: auditUrl(invocationUri),
            durationMs: Date.now() - startedAt
        });
    }
}

// Required fields for the mode that is on screen. Throws before any Glia call.
function validateMode() {
    if (mode === "create") {
        const name = document.getElementById("function-name").value.trim();
        const siteId = document.getElementById("create-site-id").value.trim();
        const code = document.getElementById("create-code").value;
        if (!name || !siteId || !code.trim()) {
            throw new Error("Function name, site ID, and function code are required.");
        }
        assertCode(code);
        return;
    }
    if (mode === "update") {
        const functionId = document.getElementById("function-id").value.trim();
        const versionId = document.getElementById("version-id").value.trim();
        const code = document.getElementById("update-code").value;
        const envText = document.getElementById("update-env").value.trim();
        if (!functionId || !versionId) {
            throw new Error("Function ID and base version ID are required.");
        }
        if (!code.trim() && !envText) {
            throw new Error("An update needs new code, environment variable changes, or both.");
        }
        if (code.trim()) {
            assertCode(code);
        }
        return;
    }
    throw new Error("Choose make or update before running.");
}

// POST /functions, POST /versions, poll the task, POST /deployments.
async function runCreate(baseUrl, headers, batchSummary) {
    const name = document.getElementById("function-name").value.trim();
    const description = document.getElementById("function-desc").value.trim();
    const siteId = document.getElementById("create-site-id").value.trim();
    const code = document.getElementById("create-code").value;
    assertCode(code);

    const versionBody = { code: code };
    addOptionalVersionFields(versionBody, {
        envText: document.getElementById("create-env").value.trim(),
        allowNull: false,
        publicKeys: document.getElementById("create-public-keys").value,
        headersText: document.getElementById("create-headers").value,
        compat: document.getElementById("create-compat").value.trim()
    });

    logOutput("[1/4] Create function entity");
    const created = await gliaFetch(baseUrl + "/functions", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ site_id: siteId, name: name, description: description })
    });
    if (!created.response.ok || !created.data.id) {
        pushFail(batchSummary, name, "Create function");
        throw new Error(apiError(created.response, created.data, "Create function failed."));
    }
    batchSummary.push({ item: name, action: "Create function " + created.data.id, status: "Success" });
    logOutput("   -> Function ID: " + created.data.id);
    if (created.data.invocation_uri) {
        logOutput("   -> Invocation URI: " + created.data.invocation_uri);
    }

    logOutput("[2/4] Create version (starts a job)");
    const task = await gliaFetch(baseUrl + "/functions/" + created.data.id + "/versions", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(versionBody)
    });
    if (task.response.status !== 202 && !task.response.ok) {
        pushFail(batchSummary, created.data.id, "Create version");
        throw new Error(apiError(task.response, task.data, "Create version failed."));
    }
    batchSummary.push({ item: created.data.id, action: "Create version task", status: task.data.status || "processing" });

    logOutput("[3/4] Wait for the version job");
    const versionId = await pollVersionTask(baseUrl, headers, task.data);
    batchSummary.push({ item: versionId, action: "Version ready", status: "Success" });

    logOutput("[4/4] Set version 1 as the current version");
    const deployed = await deployCurrent(baseUrl, headers, created.data.id, versionId);
    batchSummary.push({ item: versionId, action: "Set current version", status: "Success" });
    return deployed.invocation_uri || created.data.invocation_uri || "";
}

// PATCH /versions/{base}, poll, then POST /deployments. The URI does not change.
async function runUpdate(baseUrl, headers, batchSummary) {
    const functionId = document.getElementById("function-id").value.trim();
    const versionId = document.getElementById("version-id").value.trim();
    const code = document.getElementById("update-code").value;
    const envText = document.getElementById("update-env").value.trim();
    if (code.trim()) {
        assertCode(code);
    }

    const versionBody = {};
    if (code.trim()) {
        versionBody.code = code;
    }
    addOptionalVersionFields(versionBody, {
        envText: envText,
        allowNull: true,
        publicKeys: document.getElementById("update-public-keys").value,
        headersText: document.getElementById("update-headers").value,
        compat: document.getElementById("update-compat").value.trim()
    });

    logOutput("[1/3] Create a new version from " + versionId);
    const task = await gliaFetch(baseUrl + "/functions/" + encodeURIComponent(functionId) + "/versions/" + encodeURIComponent(versionId), {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(versionBody)
    });
    if (task.response.status !== 202 && !task.response.ok) {
        pushFail(batchSummary, versionId, "Update version");
        throw new Error(apiError(task.response, task.data, "Update version failed."));
    }
    batchSummary.push({ item: versionId, action: "Update version task", status: task.data.status || "processing" });

    logOutput("[2/3] Wait for the version job");
    const newVersionId = await pollVersionTask(baseUrl, headers, task.data);
    batchSummary.push({ item: newVersionId, action: "Version ready", status: "Success" });

    logOutput("[3/3] Set current version");
    const deployed = await deployCurrent(baseUrl, headers, functionId, newVersionId);
    batchSummary.push({ item: newVersionId, action: "Set current version", status: "Success" });
    logOutput("   -> Invocation URI is unchanged by this swap.");
    return deployed.invocation_uri || "";
}

// POST /functions/{id}/deployments, then read the function back.
// The deploy response only contains invocation_uri. That URI already existed
// from function creation, so it does not prove which version is current.
async function deployCurrent(baseUrl, headers, functionId, versionId) {
    const deployed = await gliaFetch(baseUrl + "/functions/" + encodeURIComponent(functionId) + "/deployments", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ version_id: versionId })
    });
    if (!deployed.response.ok) {
        throw new Error(apiError(deployed.response, deployed.data, "Setting the current version failed."));
    }
    logOutput("   -> Checking that this version is current.");
    const fetched = await gliaFetch(baseUrl + "/functions/" + encodeURIComponent(functionId), {
        method: "GET",
        headers: headers
    });
    if (!fetched.response.ok) {
        throw new Error(apiError(fetched.response, fetched.data, "Could not read the function after deploy."));
    }
    const currentId = currentVersionId(fetched.data);
    // A missing field still counts when the version id is somewhere in the record.
    const bodyNamesVersion = (fetched.raw || "").indexOf(versionId) !== -1;
    if (currentId && currentId !== versionId) {
        throw new Error("The function's current version is " + currentId + ", not " + versionId + ".");
    }
    if (!currentId && !bodyNamesVersion) {
        throw new Error("Deploy returned " + deployed.response.status + " but the function record does not list " + versionId + " as the current version.");
    }
    logOutput("   -> Current version confirmed: " + (currentId || versionId));
    // Outside the console, so the operator sees it without reading the log.
    noteVersionCurrent(currentId || versionId);
    return deployed.data;
}

// Pull a current-version id out of GET /functions/{id}, whatever key Glia used.
function currentVersionId(data) {
    if (!data || typeof data !== "object") {
        return "";
    }
    const directKeys = ["current_version_id", "deployed_version_id", "version_id"];
    for (let i = 0; i < directKeys.length; i++) {
        const value = data[directKeys[i]];
        if (typeof value === "string" && value) {
            return value;
        }
    }
    const nestedKeys = ["current_version", "deployed_version", "version"];
    for (let i = 0; i < nestedKeys.length; i++) {
        const value = data[nestedKeys[i]];
        if (typeof value === "string" && value) {
            return value;
        }
        if (value && typeof value.id === "string") {
            return value.id;
        }
    }
    return "";
}

// Show the warning and block an accidental refresh until the version is current.
function armStayWarning() {
    runActive = true;
    window.addEventListener("beforeunload", keepOnPage);
    const panel = document.getElementById("deploy-status");
    panel.classList.remove("hidden");
    document.getElementById("deploy-status-title").textContent = "Deploy in progress";
    document.getElementById("deploy-version-line").classList.add("hidden");
    document.getElementById("deploy-version-line").textContent = "";
    document.getElementById("deploy-current-line").classList.add("hidden");
    document.getElementById("deploy-current-line").textContent = "";
    document.getElementById("deploy-stay").textContent = stayBase();
}

// The browser shows its own leave dialog. The page text is the part the operator can read.
function keepOnPage(event) {
    if (!runActive) {
        return;
    }
    event.preventDefault();
    event.returnValue = "The version is not deployed yet. Stay on this page.";
}

function disarmStayWarning() {
    runActive = false;
    window.removeEventListener("beforeunload", keepOnPage);
}

function clearDeployStatus() {
    runSerial += 1;
    disarmStayWarning();
    document.getElementById("deploy-status").classList.add("hidden");
    document.getElementById("deploy-version-line").classList.add("hidden");
    document.getElementById("deploy-current-line").classList.add("hidden");
    document.getElementById("deploy-version-line").textContent = "";
    document.getElementById("deploy-current-line").textContent = "";
    document.getElementById("deploy-stay").textContent = "";
}

function stayBase() {
    if (mode === "create") {
        return "Stay on this page until version 1 is deployed. Do not refresh, go back, or close this tab.";
    }
    return "Stay on this page until the new version is deployed. Do not refresh, go back, or close this tab.";
}

// Updates the banner once a second during the opening wait. The console stays quiet.
async function countdownToFirstPoll() {
    const seconds = FIRST_POLL_MS / 1000;
    for (let left = seconds; left > 0; left--) {
        if (!runActive) {
            throw new Error("Deploy stopped before the version was current. Stay on the page and run it again.");
        }
        document.getElementById("deploy-stay").textContent = stayBase() + " First check in " + left + " seconds.";
        await sleep(1000);
    }
}

function setStayCountdown(extra) {
    document.getElementById("deploy-stay").textContent = stayBase() + " " + extra;
}

// Shown above the log as soon as the task returns a version id.
function noteVersionDiscovered(versionId) {
    const line = document.getElementById("deploy-version-line");
    line.classList.remove("hidden");
    line.textContent = "Version discovered: " + versionId + ". It is not live yet.";
    document.getElementById("deploy-stay").textContent = stayBase() + " Setting this version as the current version now.";
}

// Shown above the log only after the function record confirms the current version.
function noteVersionCurrent(versionId) {
    const line = document.getElementById("deploy-current-line");
    line.classList.remove("hidden");
    line.textContent = mode === "create"
        ? "Version 1 is the current version: " + versionId
        : "Set as the current version: " + versionId;
    document.getElementById("deploy-status-title").textContent = "Version deployed";
    document.getElementById("deploy-stay").textContent = "Deployed. You can leave this page.";
    disarmStayWarning();
}

// GET the task URI until it is completed or failed. One request at a time.
async function pollVersionTask(baseUrl, headers, task) {
    let current = task || {};
    const selfPath = current.self;
    if (!selfPath) {
        throw new Error("Version task did not return a self URI to poll.");
    }
    // Use the path exactly as returned. Only the base URL is joined in front.
    const taskUrl = selfPath.indexOf("http") === 0 ? selfPath : baseUrl + selfPath;

    logOutput("   -> Waiting for the version.");
    // One long wait, with a countdown on the banner, instead of eight early checks.
    await countdownToFirstPoll();
    const firstId = await readVersionOnce(baseUrl, headers, taskUrl, selfPath, 1);
    if (firstId) {
        noteVersionDiscovered(firstId);
        return firstId;
    }
    for (let attempt = 1; attempt <= LATER_POLL_LIMIT; attempt++) {
        if (!runActive) {
            throw new Error("Deploy stopped before the version was current. Stay on the page and run it again.");
        }
        setStayCountdown("Next check in 1 second.");
        await sleep(LATER_POLL_MS);
        const versionId = await readVersionOnce(baseUrl, headers, taskUrl, selfPath, attempt + 1);
        if (versionId) {
            noteVersionDiscovered(versionId);
            return versionId;
        }
    }
    throw new Error("Version is still processing. Poll this task later: " + selfPath);
}

// One GET of the task. Returns the version id when the job is done, or "" while it is still processing.
async function readVersionOnce(baseUrl, headers, taskUrl, selfPath, attempt) {
    if (!runActive) {
        throw new Error("Deploy stopped before the version was current. Stay on the page and run it again.");
    }
    const polled = await gliaFetch(taskUrl, { method: "GET", headers: headers });
    // 303 See Other means the job finished. response.ok is false for it.
    if (polled.response.status === 303 || (polled.response.status >= 300 && polled.response.status < 400)) {
        const versionId = await versionIdFrom303(baseUrl, headers, polled, selfPath);
        logOutput("   -> Version ID: " + versionId);
        return versionId;
    }
    if (!polled.response.ok) {
        throw new Error(apiError(polled.response, polled.data, "Could not read the version task."));
    }
    // If the browser followed the 303, this response is the version itself.
    const redirectedId = versionIdFromPath(polled.response.url);
    if (redirectedId && polled.data.status !== "processing" && polled.data.status !== "failed") {
        logOutput("   -> Version ID: " + redirectedId);
        return redirectedId;
    }
    if (polled.data.status === "completed") {
        const versionId = polled.data.entity && polled.data.entity.id;
        if (!versionId) {
            throw new Error("Version task completed without a version id.");
        }
        logOutput("   -> Version ID: " + versionId);
        return versionId;
    }
    if (polled.data.status === "failed") {
        throw new Error("Version creation failed. Task: " + selfPath);
    }
    return "";
}

// A finished version job answers 303. Pull the version id out of that response.
async function versionIdFrom303(baseUrl, headers, polled, selfPath) {
    const data = polled.data || {};
    if (data.status === "failed") {
        throw new Error("Version creation failed. Task: " + selfPath);
    }
    // Completed task JSON riding along in the 303 body.
    if (data.entity && data.entity.id) {
        return data.entity.id;
    }
    // Location is the version URI when the browser is allowed to read it.
    const location = polled.response.headers.get("Location") || polled.response.headers.get("location") || "";
    const fromLocation = versionIdFromPath(location);
    if (fromLocation) {
        return fromLocation;
    }
    const fromHref = versionIdFromPath(data.entity && data.entity.href);
    if (fromHref) {
        return fromHref;
    }
    // The function id is inside the task path. Its newest version is the one
    // this job just created when the 303 body did not name it.
    const functionId = functionIdFromTaskPath(selfPath);
    if (functionId) {
        const listed = await gliaFetch(baseUrl + "/functions/" + encodeURIComponent(functionId) + "/versions", {
            method: "GET",
            headers: headers
        });
        if (listed.response.ok) {
            const versions = listed.data.function_versions || listed.data.versions || [];
            const newest = versions.slice().sort(function (a, b) {
                return String(b.created_at || "").localeCompare(String(a.created_at || ""));
            })[0];
            if (newest && newest.id) {
                logOutput("   -> 303 had no version id. Using the newest listed version.");
                return newest.id;
            }
        }
    }
    throw new Error("Version job finished (303) but no version id was readable. List versions for this function and deploy the newest one. Task: " + selfPath);
}

// "/functions/{functionId}/versions/{versionId}" -> version id.
function versionIdFromPath(path) {
    const match = String(path || "").match(/\/versions\/([0-9a-fA-F-]{36})/);
    return match ? match[1] : "";
}

// "/functions/{functionId}/tasks/{taskId}" -> function id.
function functionIdFromTaskPath(path) {
    const match = String(path || "").match(/\/functions\/([0-9a-fA-F-]{36})\/tasks\//);
    return match ? match[1] : "";
}

// Shared optional fields for both POST /versions and PATCH /versions/{id}.
function addOptionalVersionFields(body, fields) {
    if (fields.envText) {
        body.environment_variables = parseEnv(fields.envText, fields.allowNull);
    }
    const publicKeys = splitList(fields.publicKeys);
    if (publicKeys) {
        body.public_environment_variable_keys = publicKeys;
    }
    const allowlist = parseHeaderAllowlist(fields.headersText);
    if (allowlist) {
        body.header_allowlist = allowlist;
    }
    if (fields.compat) {
        body.compatibility_date = fields.compat;
    }
}

function assertCode(code) {
    if (code.indexOf("onInvoke") === -1) {
        throw new Error("Function code must define onInvoke.");
    }
    if (byteLength(code) > MAX_CODE_BYTES) {
        throw new Error("Function code is over 512,000 bytes.");
    }
}

// Create requires string values. Update also allows null, which deletes a key.
function parseEnv(text, allowNull) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (error) {
        throw new Error("Environment variables are not valid JSON.");
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Environment variables must be a JSON object.");
    }
    Object.keys(parsed).forEach((key) => {
        const value = parsed[key];
        const ok = typeof value === "string" || (allowNull && value === null);
        if (!ok) {
            throw new Error("Environment variable " + key + " must be a string" + (allowNull ? " or null." : "."));
        }
    });
    if (byteLength(JSON.stringify(parsed)) > MAX_ENV_BYTES) {
        throw new Error("Environment variables are over 4,000 bytes.");
    }
    return parsed;
}

// "[]" clears the allowlist on update. A blank field means "do not send it".
function parseHeaderAllowlist(text) {
    const trimmed = text.trim();
    if (!trimmed) {
        return null;
    }
    if (trimmed === "[]") {
        return [];
    }
    const names = splitList(trimmed);
    if (names && names.length > MAX_HEADERS) {
        throw new Error("Header allowlist can have at most 30 headers.");
    }
    return names;
}

function splitList(text) {
    const names = text.split(",").map((part) => part.trim()).filter((part) => part.length > 0);
    return names.length ? names : null;
}

function byteLength(text) {
    return new TextEncoder().encode(text).length;
}

function pushFail(summary, item, action) {
    summary.push({ item: item, action: action, status: "Failed" });
}

async function gliaFetch(url, options) {
    const response = await fetch(url, options);
    // Raw text is kept so a finished deploy can be checked for the version id.
    const raw = await response.text();
    let data = {};
    if (raw) {
        try {
            data = JSON.parse(raw);
        } catch (error) {
            data = { message: raw.slice(0, 180) };
        }
    }
    return { response: response, data: data, raw: raw };
}

async function readJson(response) {
    const text = await response.text();
    if (!text) {
        return {};
    }
    try {
        return JSON.parse(text);
    } catch (error) {
        return { message: text.slice(0, 180) };
    }
}

function apiError(response, data, fallback) {
    const detail = data.message || data.error || data.error_message || fallback;
    return response.status + " " + detail;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function renderSummaryTable(summary) {
    const wrap = document.createElement("div");
    const heading = document.createElement("h4");
    heading.textContent = "Automation Summary Report";
    wrap.appendChild(heading);

    const table = document.createElement("table");
    table.className = "data-table";
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["Item", "Action", "Status"].forEach((label) => {
        const cell = document.createElement("th");
        cell.textContent = label;
        headRow.appendChild(cell);
    });
    head.appendChild(headRow);
    table.appendChild(head);

    const body = document.createElement("tbody");
    summary.forEach((item) => {
        const row = document.createElement("tr");
        ["item", "action", "status"].forEach((key) => {
            const cell = document.createElement("td");
            cell.textContent = item[key] || "";
            row.appendChild(cell);
        });
        body.appendChild(row);
    });
    table.appendChild(body);
    wrap.appendChild(table);
    outputConsole.appendChild(wrap);
    outputConsole.scrollTop = outputConsole.scrollHeight;
    finalReport += "Summary table rendered.\n";
}

function auditAction() {
    return mode === "update" ? "Update Glia Function" : "Create Glia Function";
}

// The invocation path from Glia, or the API base when the run never got that far.
function auditUrl(invocationUri) {
    const base = baseUrlValue() || "https://api.glia.com";
    if (!invocationUri) {
        return base;
    }
    if (invocationUri.indexOf("http") === 0) {
        return invocationUri;
    }
    return base + (invocationUri.charAt(0) === "/" ? invocationUri : "/" + invocationUri);
}

// Console transcript plus one line per summary row. This is finalReport.
function executionReport(summary) {
    const lines = (summary || []).map(function (item) {
        return "Item: " + item.item + " Action: " + item.action + " Status: " + item.status;
    });
    const transcript = (finalReport || sealedReport || "").trim();
    if (!lines.length) {
        return transcript;
    }
    return (transcript ? transcript + "\n" : "") + lines.join("\n");
}

// One DynamoDB row per run. Fields match the demo write_log contract.
// timestamp#id, invokerId, invokerType, createdAt, and expiresAt are added by write_log.
async function writeAuditLog({ action, status, finalReport = "", url = "", durationMs = 0 }) {
    try {
        const glia = await window.getGliaApi({ version: "v1" });
        const headers = await glia.getRequestHeaders();
        headers["Content-Type"] = "application/json";
        const user = await glia.getUser().catch(() => null);
        const res = await fetch(WRITE_LOG_URI, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                siteId: AUDIT_SITE_ID,
                userId: user && user.email ? user.email : "support@glia.com",
                action: action,
                automation: AUTOMATION_NAME,
                status: status,
                url: url,
                finalReport: finalReport,
                durationMs: Number(durationMs)
            })
        });
        const result = await res.json();
        if (!result.success) {
            console.error("Audit log failed:", result.error);
            noteAudit("Audit log failed: " + (result.error || "Unknown error"));
            return;
        }
        noteAudit("Audit log saved.");
    } catch (err) {
        console.error("Could not reach the audit log function", err);
        noteAudit("Audit log skipped. Open this page inside Glia Hub to record the run.");
    }
}

// A reset already cleared the page. Do not write the audit result back onto the choice screen.
function noteAudit(message) {
    if (document.getElementById("workspace").classList.contains("hidden")) {
        return;
    }
    logOutput(message);
}

function logOutput(message, clear) {
    if (clear) {
        outputConsole.textContent = "";
        finalReport = "";
    }
    outputConsole.appendChild(document.createTextNode(message + "\n"));
    outputConsole.scrollTop = outputConsole.scrollHeight;
    finalReport += message + "\n";
    sealedReport = finalReport;
}

function setStatus(text) {
    outputStatus.textContent = text;
}
