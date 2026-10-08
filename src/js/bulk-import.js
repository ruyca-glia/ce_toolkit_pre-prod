// Bulk Import page.
// The operator pastes names, emails, a bearer or API token, and the temp password.
// This page sends those to the Bulk Import Glia Function, which creates each
// operator one at a time. The password is not written to the console.

const outputConsole = document.getElementById("output");
const outputStatus = document.getElementById("output-status");
const triggerButton = document.getElementById("trigger-run");
const confirmBox = document.getElementById("confirm-run");
const previewBox = document.getElementById("preview");
const resultBox = document.getElementById("result-table");
const stayNote = document.getElementById("stay-note");

// The temp password the extension already used. Reset puts this back.
const DEFAULT_PASSWORD = "+qVNXsz6c2YLuu83/slHqluQEtDsd31Y931HIgHdkC8=";

// People waiting to be created. Filled by Parse and preview.
let parsedPeople = [];
// Console text. Clear can wipe this.
let finalReport = "";
// Copy kept for the audit row if the console is cleared mid-run.
let sealedReport = "";
// True while operators are being created, so a refresh asks the operator to stay.
let runActive = false;
// Bumped on reset so an in-flight run stops and still writes its audit row.
let runSerial = 0;

// dynamo_write_audittable. Audit Logs reads these rows on its own.
const WRITE_LOG_URI = "https://api.glia.com/integrations/f026a5b6-ba81-4211-99e1-3667bbaf16e9/endpoint";
const AUDIT_SITE_ID = "a5c110f6-a4a5-47d9-bbf1-d03d7a5e5089";
// Must match the Bulk Import option in src/audit-logs.html.
const AUTOMATION_NAME = "Bulk Import";

// Invocation URI for the deployed Bulk Import function.
const BULK_IMPORT_URI = "https://api.glia.com/integrations/5ddae5f0-3a3c-4856-b09a-bc9f78cdfb3f/endpoint";

document.addEventListener("DOMContentLoaded", function () {
    confirmBox.addEventListener("change", function () {
        triggerButton.disabled = !confirmBox.checked;
    });
    document.getElementById("get-bearer").addEventListener("click", fetchBearerViaApiToken);
    document.getElementById("parse-list").addEventListener("click", parseInput);
    document.getElementById("trigger-run").addEventListener("click", runImport);
    document.getElementById("clear-output").addEventListener("click", function () {
        finalReport = "";
        outputConsole.textContent = "Console cleared.";
        outputStatus.textContent = "Ready";
    });
    document.getElementById("reset-session").addEventListener("click", resetSession);
    window.addEventListener("beforeunload", function (event) {
        if (!runActive) {
            return;
        }
        event.preventDefault();
        event.returnValue = "Operators are still being created. Stay on this page.";
    });
});

function collectAuth() {
    return {
        baseUrl: document.getElementById("base-url").value.replace(/\/$/, "") || "https://api.glia.com",
        apiToken: document.getElementById("api-token").value.trim(),
        accessToken: document.getElementById("bearer-token").value.trim()
    };
}

async function fetchBearerViaApiToken() {
    const apiToken = document.getElementById("api-token").value.trim();
    if (!apiToken) {
        logOutput("No API token. Paste a bearer token instead.", true);
        setStatus("Ready");
        return;
    }
    setStatus("Requesting bearer");
    logOutput("Requesting a bearer.", true);
    try {
        const result = await callFunction({ action: "token", baseUrl: collectAuth().baseUrl, apiToken: apiToken });
        document.getElementById("bearer-token").value = result.token || "";
        logOutput("Bearer ready: " + String(result.token || "").substring(0, 5) + "...");
        setStatus("Bearer ready");
    } catch (error) {
        logOutput("Bearer request failed: " + error.message);
        setStatus("Bearer failed");
    }
}

// One call to the deployed Glia Function. The page does not call the operators API itself.
async function callFunction(payload) {
    if (!BULK_IMPORT_URI) {
        throw new Error("The Bulk Import invocation URI is not set yet.");
    }
    const glia = await window.getGliaApi({ version: "v1" });
    const headers = await glia.getRequestHeaders();
    headers["Content-Type"] = "application/json";
    const response = await fetch(BULK_IMPORT_URI, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
    });
    const data = await response.json().catch(function () {
        return {};
    });
    const body = data && data.payload && typeof data.payload === "object" ? data.payload : data;
    if (!response.ok || body.success === false) {
        const error = new Error(body.error || "The bulk import function failed.");
        error.logs = body.logs || [];
        error.summary = body.summary || [];
        error.rows = body.rows || [];
        throw error;
    }
    return body;
}

// Turn the pasted list into name and email pairs. Does not create anyone yet.
function parseInput() {
    const parsed = parsePeople(document.getElementById("user-list").value);
    resultBox.textContent = "";
    parsedPeople = [];
    if (parsed.error) {
        previewBox.textContent = parsed.error;
        logOutput(parsed.error, true);
        setStatus("Ready");
        return;
    }
    parsedPeople = parsed.people;
    renderPreview(parsed.people);
    logOutput("Found " + parsed.people.length + " operator(s).", true);
    setStatus("Ready");
}

// Same two formats as the extension: "Name - email" on one line, or name then email on alternating lines.
function parsePeople(rawInput) {
    const lines = String(rawInput || "").split("\n").map(function (line) {
        return line.trim();
    }).filter(function (line) {
        return line.length > 0;
    });
    if (!lines.length) {
        return { error: "Input is empty.", people: [] };
    }
    const emailRe = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    const dashRe = /^(.+?)\s+-\s+([^\s@]+@[^\s@]+\.[^\s@]+)\s*$/;
    const people = [];
    const allInline = lines.every(function (line) {
        return dashRe.test(line);
    });
    if (allInline) {
        lines.forEach(function (line) {
            const match = line.match(dashRe);
            people.push({ name: match[1].trim(), email: match[2].trim() });
        });
        return { error: "", people: people };
    }
    if (lines.length % 2 !== 0) {
        return {
            error: "Got " + lines.length + " non-empty lines. Expected an even number (name then email), or use \"Name - email\".",
            people: []
        };
    }
    for (let i = 0; i < lines.length; i += 2) {
        const name = lines[i];
        const email = lines[i + 1];
        if (!emailRe.test(email)) {
            return { error: "Line " + (i + 2) + " does not look like an email: \"" + email + "\"", people: [] };
        }
        people.push({ name: name, email: email });
    }
    return { error: "", people: people };
}

function renderPreview(people) {
    previewBox.textContent = "";
    const heading = document.createElement("p");
    heading.className = "form-hint";
    heading.textContent = people.length + " operator(s) found.";
    previewBox.appendChild(heading);
    previewBox.appendChild(buildTable(["#", "Name", "Email"], people.map(function (person, index) {
        return [String(index + 1), person.name, person.email];
    })));
}

// Create each operator one at a time. The password is sent to Glia and never written to the console.
async function runImport() {
    const startedAt = Date.now();
    const runId = ++runSerial;
    const siteId = document.getElementById("site-id").value.trim();
    const role = document.getElementById("role").value;
    let summary = [];
    let rows = [];
    finalReport = "";
    sealedReport = "";
    triggerButton.disabled = true;
    runActive = true;
    stayNote.classList.remove("hidden");
    resultBox.textContent = "";
    logOutput("========================================", true);
    logOutput("STARTING BULK IMPORT");
    logOutput("========================================");
    setStatus("Running");

    try {
        const auth = collectAuth();
        const password = document.getElementById("temp-password").value;
        if (!auth.accessToken && !auth.apiToken) {
            throw new Error("Paste a bearer token, or use Get bearer with an API token.");
        }
        if (!siteId) {
            throw new Error("Site ID is required.");
        }
        if (!password) {
            throw new Error("Temp password is required.");
        }
        if (!parsedPeople.length) {
            throw new Error("Parse the operator list before creating.");
        }
        if (auth.accessToken) {
            logOutput("Bearer in use: " + auth.accessToken.substring(0, 5) + "...");
        }
        logOutput("Site: " + siteId);
        logOutput("Role: " + role);
        logOutput("Temp password is set.");
        logOutput("Operators: " + parsedPeople.length);
        const result = await callFunction(Object.assign(auth, {
            siteId: siteId,
            role: role,
            password: password,
            people: parsedPeople
        }));
        if (runId !== runSerial) {
            throw new Error("Run stopped.");
        }
        rows = result.rows || [];
        summary = result.summary || [];
        (result.logs || []).forEach(function (line) {
            logOutput(line);
        });
        renderResults(rows);

        renderSummaryTable(summary);
        logOutput("BATCH JOB FINISHED");
        await writeAuditLog({
            action: "Create operators on site " + siteId,
            status: batchStatus(summary),
            finalReport: executionReport(summary),
            url: BULK_IMPORT_URI || "https://api.glia.com/operators",
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
                renderResults(rows);
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
            action: "Create operators on site " + (siteId || "(missing site)"),
            status: "Failed",
            finalReport: executionReport(summary) || error.message,
            url: BULK_IMPORT_URI || "https://api.glia.com/operators",
            durationMs: Date.now() - startedAt
        });
    } finally {
        runActive = false;
        stayNote.classList.add("hidden");
    }
}

function renderResults(rows) {
    resultBox.textContent = "";
    resultBox.appendChild(buildTable(
        ["Status", "Name", "Email", "Operator ID / Error"],
        rows.map(function (row) {
            return [
                row.status === "success" ? "Success" : "Failed",
                row.name,
                row.email,
                row.status === "success" ? (row.operatorId || "—") : row.error
            ];
        })
    ));
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

function resetSession() {
    if (runActive) {
        runSerial += 1;
    }
    ["api-token", "bearer-token", "site-id", "user-list"].forEach(function (id) {
        document.getElementById(id).value = "";
    });
    document.getElementById("base-url").value = "https://api.glia.com";
    document.getElementById("role").value = "super_manager";
    document.getElementById("temp-password").value = DEFAULT_PASSWORD;
    confirmBox.checked = false;
    triggerButton.disabled = true;
    triggerButton.textContent = "Create operators";
    parsedPeople = [];
    previewBox.textContent = "";
    resultBox.textContent = "";
    finalReport = "";
    sealedReport = "";
    outputConsole.textContent = "Paste a name and email list, then create the operators.";
    setStatus("Ready");
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
            cell.textContent = value;
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
    const line = "Summary table rendered.\n";
    finalReport += line;
    sealedReport += line;
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
