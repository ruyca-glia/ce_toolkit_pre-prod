// Operator Multi-Site Assigner page.
// The operator pastes emails, site ids, and a bearer or API token. This page
// sends those to the Operator Multi-Site Assigner Glia Function. The function
// looks up each operator and merges the site ids one operator at a time.

const outputConsole = document.getElementById("output");
const outputStatus = document.getElementById("output-status");
const triggerButton = document.getElementById("trigger-run");
const confirmBox = document.getElementById("confirm-run");
const previewBox = document.getElementById("preview");
const resultBox = document.getElementById("result-table");
const stayNote = document.getElementById("stay-note");
const resetDialog = document.getElementById("reset-dialog");

// Emails waiting to be assigned. Filled by Parse and preview.
let parsedEmails = [];
// Console text. Reset and Clear can wipe this.
let finalReport = "";
// Full transcript for the audit row. Reset and Clear do not wipe this.
let sealedReport = "";
// True while operators are being updated, so a refresh asks the operator to stay.
let runActive = false;
// Bumped on reset so an in-flight run stops and still writes its audit row.
let runSerial = 0;

// dynamo_write_audittable. Audit Logs reads these rows on its own.
const WRITE_LOG_URI = "https://api.glia.com/integrations/f026a5b6-ba81-4211-99e1-3667bbaf16e9/endpoint";
const AUDIT_SITE_ID = "a5c110f6-a4a5-47d9-bbf1-d03d7a5e5089";
// Must match the Operator Multi-Site Assigner option in src/audit-logs.html.
const AUTOMATION_NAME = "Operator Multi-Site Assigner";

// Invocation URI for the deployed Operator Multi-Site Assigner function.
const SITE_ASSIGNER_URI = "https://api.glia.com/integrations/925a8001-9d41-4b67-b08d-ba3fff4026d7/endpoint";

document.addEventListener("DOMContentLoaded", function () {
    confirmBox.addEventListener("change", function () {
        triggerButton.disabled = !confirmBox.checked;
    });
    document.getElementById("get-bearer").addEventListener("click", fetchBearerViaApiToken);
    document.getElementById("parse-list").addEventListener("click", parseInput);
    document.getElementById("trigger-run").addEventListener("click", runAssignment);
    document.getElementById("clear-output").addEventListener("click", function () {
        finalReport = "";
        outputConsole.textContent = "Console cleared.";
        outputStatus.textContent = "Ready";
    });
    document.getElementById("reset-session").addEventListener("click", openReset);
    document.getElementById("reset-yes").addEventListener("click", resetSession);
    document.getElementById("reset-no").addEventListener("click", closeReset);
    window.addEventListener("beforeunload", function (event) {
        if (!runActive) {
            return;
        }
        event.preventDefault();
        event.returnValue = "Operators are still being updated. Stay on this page.";
    });
});

// Copied as-is from src/js/auth0.js. Do not rewrite the pattern.
function extractEmails(text) {
    if (!text) return [];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:com|org|net|bank)/g;
    return (text.match(emailRegex) || []).map(email => email.toLowerCase().trim());
}

// Base URL and the token the operator typed. The function uses these.
function collectAuth() {
    return {
        baseUrl: document.getElementById("base-url").value.replace(/\/$/, "") || "https://api.glia.com",
        apiToken: document.getElementById("api-token").value.trim(),
        accessToken: document.getElementById("bearer-token").value.trim()
    };
}

// Ask the function to exchange the API token. The bearer comes back into the password field.
async function fetchBearerViaApiToken() {
    const apiToken = document.getElementById("api-token").value.trim();
    if (!apiToken) {
        logOutput("No API token. Paste a bearer token instead.", true);
        setStatus("Ready");
        return;
    }
    const endWait = beginWait("get-bearer", "Getting bearer");
    try {
        const result = await callFunction({ action: "token", baseUrl: collectAuth().baseUrl, apiToken: apiToken });
        document.getElementById("bearer-token").value = result.token || "";
        endWait("Bearer ready: " + String(result.token || "").substring(0, 5) + "...");
        setStatus("Bearer ready");
    } catch (error) {
        endWait("Bearer request failed: " + error.message);
        setStatus("Bearer failed");
    }
}

// "id-one, id-two" becomes a unique list. Blank pieces and repeats are dropped.
function siteIdsValue() {
    const seen = {};
    const ids = [];
    document.getElementById("site-id").value.split(",").forEach(function (part) {
        const id = part.trim();
        if (!id || seen[id]) {
            return;
        }
        seen[id] = true;
        ids.push(id);
    });
    return ids;
}

// Reuse the Glia bridge after the first lookup. A new lookup on every click adds wait.
let gliaApiPromise = null;
function gliaApi() {
    if (!gliaApiPromise) {
        gliaApiPromise = window.getGliaApi({ version: "v1" }).catch(function (error) {
            gliaApiPromise = null;
            throw error;
        });
    }
    return gliaApiPromise;
}

// One call to the deployed Glia Function. The page does not call the operators API itself.
async function callFunction(payload) {
    if (!SITE_ASSIGNER_URI) {
        throw new Error("The Operator Multi-Site Assigner invocation URI is not set yet.");
    }
    const glia = await gliaApi();
    const headers = await glia.getRequestHeaders();
    headers["Content-Type"] = "application/json";
    const response = await fetch(SITE_ASSIGNER_URI, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
    });
    const data = await response.json().catch(function () {
        return {};
    });
    const body = data && data.payload && typeof data.payload === "object" ? data.payload : data;
    if (!response.ok || body.success === false) {
        const error = new Error(body.error || "The site assigner function failed.");
        error.logs = body.logs || [];
        error.summary = body.summary || [];
        error.rows = body.rows || [];
        throw error;
    }
    return body;
}

// Show the unique emails before any operator is changed.
function parseInput() {
    const extracted = uniqueEmails(extractEmails(document.getElementById("user-list").value));
    parsedEmails = extracted;
    resultBox.textContent = "";
    if (!extracted.length) {
        previewBox.textContent = "No emails found. This page keeps addresses ending in .com, .org, .net, or .bank.";
        logOutput("No emails found.", true);
        setStatus("Ready");
        return;
    }
    renderPreview(extracted);
    logOutput("Found " + extracted.length + " unique email(s).", true);
    setStatus("Ready");
}

function uniqueEmails(emails) {
    const seen = {};
    const unique = [];
    emails.forEach(function (email) {
        if (!seen[email]) {
            seen[email] = true;
            unique.push(email);
        }
    });
    return unique;
}

function renderPreview(emails) {
    previewBox.textContent = "";
    const heading = document.createElement("p");
    heading.className = "form-hint";
    heading.textContent = emails.length + " unique email(s) found.";
    previewBox.appendChild(heading);
    previewBox.appendChild(buildTable(["#", "Email"], emails.map(function (email, index) {
        return [String(index + 1), email];
    })));
}

// Look up each operator and add every site id. One operator at a time.
async function runAssignment() {
    const startedAt = Date.now();
    const siteIds = siteIdsValue();
    const siteList = siteIds.join(", ");
    let summary = [];
    let rows = [];
    const runId = ++runSerial;
    finalReport = "";
    sealedReport = "";
    triggerButton.disabled = true;
    runActive = true;
    stayNote.classList.remove("hidden");
    resultBox.textContent = "";
    logOutput("========================================", true);
    logOutput("STARTING OPERATOR MULTI-SITE ASSIGNER");
    logOutput("========================================");
    setStatus("Running");

    try {
        const auth = collectAuth();
        if (!auth.accessToken && !auth.apiToken) {
            throw new Error("Paste a bearer token, or use Get bearer with an API token.");
        }
        if (!siteIds.length) {
            throw new Error("At least one site ID is required.");
        }
        if (!parsedEmails.length) {
            throw new Error("Parse the operator list before assigning.");
        }
        if (auth.accessToken) {
            logOutput("Bearer in use: " + auth.accessToken.substring(0, 5) + "...");
        }
        logOutput("Sites to add: " + siteList);
        logOutput("Operators: " + parsedEmails.length);
        const result = await callFunction(Object.assign(auth, { emails: parsedEmails, siteIds: siteIds }));
        if (runId !== runSerial) {
            throw new Error("Run stopped.");
        }
        rows = result.rows || [];
        summary = result.summary || [];
        (result.logs || []).forEach(function (line) {
            logOutput(line);
        });
        renderResults(rows, siteIds);

        renderSummaryTable(summary);
        logOutput("BATCH JOB FINISHED");
        await writeAuditLog({
            action: "Assign operators to sites " + siteList,
            status: batchStatus(summary),
            finalReport: executionReport(summary),
            url: SITE_ASSIGNER_URI || "https://api.glia.com/operators",
            durationMs: Date.now() - startedAt
        });
        triggerButton.textContent = "Completed";
        setStatus(batchStatus(summary));
    } catch (error) {
        const cancelled = runId !== runSerial;
        if (!cancelled) {
            (error.logs || []).forEach(function (line) {
                logOutput(line);
            });
            if (error.rows && error.rows.length) {
                rows = error.rows;
                renderResults(rows, siteIds);
            }
            if (error.summary && error.summary.length) {
                summary = error.summary;
            }
            logOutput("CRITICAL ERROR: " + error.message);
            if (summary.length) {
                renderSummaryTable(summary);
            }
            triggerButton.textContent = "Retry";
            triggerButton.disabled = !confirmBox.checked;
            setStatus("Failed");
        }
        await writeAuditLog({
            action: "Assign operators to sites " + (siteList || "(missing site)"),
            status: "Failed",
            finalReport: executionReport(summary) || error.message,
            url: SITE_ASSIGNER_URI || "https://api.glia.com/operators",
            durationMs: Date.now() - startedAt
        });
    } finally {
        runActive = false;
        stayNote.classList.add("hidden");
    }
}

function renderResults(rows, siteIds) {
    resultBox.textContent = "";
    const stack = document.createElement("div");
    stack.className = "assign-results";
    rows.forEach(function (row) {
        stack.appendChild(resultCard(row, siteIds));
    });
    resultBox.appendChild(stack);
}

// One card: who was updated, then the site ids before and after in separate stacks.
function resultCard(row, siteIds) {
    const card = document.createElement("article");
    card.className = "assign-result";

    const head = document.createElement("div");
    head.className = "assign-result-head";
    const email = document.createElement("span");
    email.className = "assign-result-email";
    email.textContent = row.email;
    const status = document.createElement("span");
    status.className = "badge " + (row.status === "success" ? "badge-success" : "badge-error");
    status.textContent = row.status === "success" ? "Success" : "Failed";
    head.appendChild(email);
    head.appendChild(status);
    card.appendChild(head);

    const meta = document.createElement("p");
    meta.className = "assign-result-meta";
    meta.textContent = row.operatorId ? "Operator " + row.operatorId : "Operator not found";
    card.appendChild(meta);

    if (row.status !== "success") {
        const error = document.createElement("p");
        error.className = "assign-error";
        error.textContent = row.error || "Update failed.";
        card.appendChild(error);
        return card;
    }

    const sites = document.createElement("div");
    sites.className = "assign-sites";
    sites.appendChild(siteColumn("Sites before", siteIdList(row.sitesBefore)));
    sites.appendChild(siteColumn("Sites after", siteIdList(row.sitesAfter, siteIds, row.sitesBefore)));
    card.appendChild(sites);
    return card;
}

function siteColumn(label, list) {
    const column = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = label;
    column.appendChild(heading);
    column.appendChild(list);
    return column;
}

// Stack each site id in its own chip. targetIds are the ones from this run.
// A target the operator already had is tagged "Already assigned". A new one is "Added".
function siteIdList(ids, targetIds, sitesBefore) {
    const targets = targetIds || [];
    const before = sitesBefore || [];
    const list = document.createElement("div");
    list.className = "site-id-list";
    if (!ids.length) {
        const empty = document.createElement("span");
        empty.className = "site-id-empty";
        empty.textContent = "None";
        list.appendChild(empty);
        return list;
    }
    ids.forEach(function (id) {
        const chip = document.createElement("div");
        chip.className = "site-id-chip";
        const isTarget = targets.indexOf(id) !== -1;
        const alreadyHadSite = before.indexOf(id) !== -1;
        if (isTarget && alreadyHadSite) {
            chip.className += " site-id-chip-already";
        } else if (isTarget) {
            chip.className += " site-id-chip-added";
        }
        if (isTarget) {
            const tag = document.createElement("span");
            tag.className = "site-id-tag";
            tag.textContent = alreadyHadSite ? "Already assigned" : "Added";
            chip.appendChild(tag);
        }
        // Break a uuid only on its hyphens, so the groups stay readable.
        chip.appendChild(siteIdCode(id));
        list.appendChild(chip);
    });
    return list;
}

// Split 11111111-1111-... so a narrow card wraps between groups, not mid-number.
function siteIdCode(id) {
    const code = document.createElement("code");
    const parts = String(id).split("-");
    parts.forEach(function (part, index) {
        const last = index === parts.length - 1;
        code.appendChild(document.createTextNode(last ? part : part + "-"));
        if (!last) {
            code.appendChild(document.createElement("wbr"));
        }
    });
    return code;
}

function batchStatus(summary) {
    const failed = summary.filter(function (item) {
        return item.status === "Failed";
    }).length;
    if (!summary.length || failed === summary.length) {
        return "Failed";
    }
    if (failed > 0) {
        return "Partial Failure";
    }
    return "Success";
}

function executionReport(summary) {
    const lines = (summary || []).map(function (item) {
        return "Item: " + item.item + " Action: " + item.action + " Status: " + item.status;
    });
    const transcript = (sealedReport || finalReport || "").trim();
    if (!lines.length) {
        return transcript;
    }
    return (transcript ? transcript + "\n" : "") + lines.join("\n");
}

// One DynamoDB row per run. write_log adds timestamp#id, invokerId, invokerType, createdAt, and expiresAt.
async function writeAuditLog({ action, status, finalReport: report = "", url = "", durationMs = 0 }) {
    try {
        const glia = await window.getGliaApi({ version: "v1" });
        const headers = await glia.getRequestHeaders();
        headers["Content-Type"] = "application/json";
        const user = await glia.getUser().catch(function () {
            return null;
        });
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
                finalReport: report,
                durationMs: Number(durationMs)
            })
        });
        const result = await res.json();
        if (!result.success) {
            console.error("Audit log failed:", result.error);
            logOutput("Audit log failed: " + (result.error || "Unknown error"));
            return;
        }
        logOutput("Audit log saved.");
    } catch (err) {
        console.error("Could not reach the audit log function", err);
        logOutput("Audit log skipped. Open this page inside Glia Hub to record the run.");
    }
}

function openReset() {
    resetDialog.classList.remove("hidden");
    resetDialog.style.display = "flex";
}

function closeReset() {
    resetDialog.classList.add("hidden");
    resetDialog.style.display = "";
}

function resetSession() {
    ["api-token", "bearer-token", "site-id", "user-list"].forEach(function (id) {
        document.getElementById(id).value = "";
    });
    document.getElementById("base-url").value = "https://api.glia.com";
    confirmBox.checked = false;
    triggerButton.disabled = true;
    triggerButton.textContent = "Assign sites";
    parsedEmails = [];
    previewBox.textContent = "";
    resultBox.textContent = "";
    if (runActive) {
        runSerial += 1;
    }
    finalReport = "";
    outputConsole.textContent = "Paste operators, then assign the site.";
    setStatus("Ready");
    closeReset();
}

function buildTable(headers, rows) {
    const table = document.createElement("table");
    table.className = "data-table";
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    headers.forEach(function (label) {
        const cell = document.createElement("th");
        cell.textContent = label;
        headRow.appendChild(cell);
    });
    head.appendChild(headRow);
    table.appendChild(head);
    const body = document.createElement("tbody");
    rows.forEach(function (row) {
        const tr = document.createElement("tr");
        row.forEach(function (value) {
            const cell = document.createElement("td");
            // Site lists are elements. Plain columns stay text.
            if (value instanceof Node) {
                cell.appendChild(value);
            } else {
                cell.textContent = value;
            }
            tr.appendChild(cell);
        });
        body.appendChild(tr);
    });
    table.appendChild(body);
    return table;
}

function renderSummaryTable(summary) {
    const wrap = document.createElement("div");
    const heading = document.createElement("h4");
    heading.textContent = "Automation Summary Report";
    wrap.appendChild(heading);
    wrap.appendChild(buildTable(["Item", "Action", "Status"], summary.map(function (item) {
        return [item.item, item.action, item.status];
    })));
    outputConsole.appendChild(wrap);
    outputConsole.scrollTop = outputConsole.scrollHeight;
    finalReport += "Summary table rendered.\n";
    sealedReport += "Summary table rendered.\n";
}

function logOutput(message, clear) {
    if (clear) {
        outputConsole.textContent = "";
        finalReport = "";
    }
    outputConsole.appendChild(document.createTextNode(message + "\n"));
    outputConsole.scrollTop = outputConsole.scrollHeight;
    finalReport += message + "\n";
    sealedReport += message + "\n";
}

function setStatus(text) {
    outputStatus.textContent = text;
}

// The button and the console tick each second until the function answers.
function beginWait(buttonId, label) {
    const button = document.getElementById(buttonId);
    const original = button.textContent;
    button.disabled = true;
    let seconds = 0;
    logOutput(label + "...", true);
    const line = outputConsole.lastChild;
    setStatus(label);
    const timer = setInterval(function () {
        seconds += 1;
        const text = label + "... " + seconds + "s";
        if (line) {
            line.textContent = text + "\n";
        }
        button.textContent = text;
        setStatus(text);
    }, 1000);
    return function endWait(finalLine) {
        clearInterval(timer);
        button.disabled = false;
        button.textContent = original;
        if (finalLine && line) {
            line.textContent = finalLine + "\n";
            finalReport += finalLine + "\n";
            sealedReport = finalReport;
        }
    };
}
