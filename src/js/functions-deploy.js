// Functions Deploy page.
// The operator picks "make a new one" or "update an existing one".
// This page sends the form, including the typed API key or bearer, to the
// Functions Deploy Glia Function. That function exchanges the key, creates
// the version, polls the job, and sets the finished version as current.

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

// Invocation URI for the deployed Functions Deploy function.
const FUNCTIONS_DEPLOY_URI = "https://api.glia.com/integrations/456c63b0-61b9-4171-8f7c-73b24a7dd4fa/endpoint";

const MAX_CODE_BYTES = 512000;

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
            const result = await callFunction("token", collectAuth());
            tokenField.value = result.accessToken || "";
            logOutput("Site token loaded: " + String(result.accessToken || "").substring(0, 5) + "...", true);
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

// One call to the deployed Glia Function. The page does not call api.glia.com for this tool.
async function callFunction(action, payload) {
    if (!FUNCTIONS_DEPLOY_URI) {
        throw new Error("The Functions Deploy invocation URI is not set yet.");
    }
    const glia = await window.getGliaApi({ version: "v1" });
    const headers = await glia.getRequestHeaders();
    headers["Content-Type"] = "application/json";
    const response = await fetch(FUNCTIONS_DEPLOY_URI, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(Object.assign({ action: action }, payload || {}))
    });
    const data = await readJson(response);
    const body = data && data.payload && typeof data.payload === "object" ? data.payload : data;
    if (!response.ok || body.success === false) {
        const error = new Error(body.error || "The Functions Deploy function failed.");
        error.logs = body.logs || [];
        error.summary = body.summary || [];
        throw error;
    }
    return body;
}

// Base URL and the key or bearer the operator typed. The function uses these.
function collectAuth() {
    return {
        baseUrl: document.getElementById("base-url").value.replace(/\/$/, ""),
        apiKeyId: document.getElementById("api-key-id").value.trim(),
        apiKeySecret: document.getElementById("api-key-secret").value,
        accessToken: tokenField.value.trim()
    };
}

// Form fields for the function, including the typed credentials.
function collectPayload() {
    const auth = collectAuth();
    if (mode === "create") {
        return Object.assign(auth, {
            name: document.getElementById("function-name").value.trim(),
            description: document.getElementById("function-desc").value.trim(),
            siteId: document.getElementById("create-site-id").value.trim(),
            code: document.getElementById("create-code").value,
            envText: document.getElementById("create-env").value.trim(),
            publicKeys: document.getElementById("create-public-keys").value,
            headersText: document.getElementById("create-headers").value,
            compat: document.getElementById("create-compat").value.trim()
        });
    }
    return Object.assign(auth, {
        functionId: document.getElementById("function-id").value.trim(),
        versionId: document.getElementById("version-id").value.trim(),
        code: document.getElementById("update-code").value,
        envText: document.getElementById("update-env").value.trim(),
        publicKeys: document.getElementById("update-public-keys").value,
        headersText: document.getElementById("update-headers").value,
        compat: document.getElementById("update-compat").value.trim()
    });
}

// Ask the Glia Function to list functions on the site so the operator can pick one.
async function listFunctions() {
    try {
        setStatus("Listing functions");
        const siteId = document.getElementById("update-site-id").value.trim();
        if (!siteId) {
            throw new Error("Site ID is required to list functions.");
        }
        const result = await callFunction("listFunctions", Object.assign(collectAuth(), { siteId: siteId }));
        renderFunctionChoices(result.functions || []);
        logOutput("Listed " + (result.functions || []).length + " function(s).");
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

// Ask the Glia Function to list versions so the operator can pick the base version.
async function listVersions() {
    try {
        setStatus("Listing versions");
        const functionId = document.getElementById("function-id").value.trim();
        if (!functionId) {
            throw new Error("Function ID is required to list versions.");
        }
        const result = await callFunction("listVersions", Object.assign(collectAuth(), { functionId: functionId }));
        renderVersionChoices(result.versions || [], result.activeId || "");
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
        validateMode();
        document.getElementById("deploy-stay").textContent = stayBase() + " The Glia Function is creating the version and setting it current. Stay on this page.";
        const result = await callFunction(mode, collectPayload());
        (result.logs || []).forEach(function (line) {
            logOutput(line);
        });
        (result.summary || []).forEach(function (row) {
            batchSummary.push(row);
        });
        invocationUri = result.invocationUri || "";
        if (result.versionId) {
            noteVersionDiscovered(result.versionId);
            noteVersionCurrent(result.versionId);
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
            (error.logs || []).forEach(function (line) {
                logOutput(line);
            });
            (error.summary || []).forEach(function (row) {
                batchSummary.push(row);
            });
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

function assertCode(code) {
    if (code.indexOf("onInvoke") === -1) {
        throw new Error("Function code must define onInvoke.");
    }
    if (byteLength(code) > MAX_CODE_BYTES) {
        throw new Error("Function code is over 512,000 bytes.");
    }
}

function byteLength(text) {
    return new TextEncoder().encode(text).length;
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
    if (invocationUri && invocationUri.indexOf("http") === 0) {
        return invocationUri;
    }
    return FUNCTIONS_DEPLOY_URI || "https://api.glia.com";
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
