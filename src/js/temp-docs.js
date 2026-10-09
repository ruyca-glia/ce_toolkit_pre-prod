// Temporary Docs Link page.
// The Glia Function (fern-docs-link) signs a short-lived link to docs.glia.com.
// This page sends name, company, and an optional docs URL, then shows the link it returns.
// The signed URL contains a token, so the console and the audit row never store the full link.

const outputConsole = document.getElementById("output");
const outputStatus = document.getElementById("output-status");
const triggerButton = document.getElementById("trigger-run");
const confirmBox = document.getElementById("confirm-run");
const resultBox = document.getElementById("link-result");

// On-screen console. Clear can wipe this.
let finalReport = "";
// Copy kept for the audit row if the console is cleared mid-run.
let sealedReport = "";

// dynamo_write_audittable. Audit Logs reads these rows on its own.
const WRITE_LOG_URI = "https://api.glia.com/integrations/f026a5b6-ba81-4211-99e1-3667bbaf16e9/endpoint";
const AUDIT_SITE_ID = "a5c110f6-a4a5-47d9-bbf1-d03d7a5e5089";
// Must match the Temporary Docs Link option in src/audit-logs.html.
const AUTOMATION_NAME = "Temporary Docs Link";
// Invocation URI for the deployed fern-docs-link function.
const TEMP_DOCS_URI = "https://api.glia.com/integrations/e13c77f7-cf8d-4971-92e2-25c4fd2db595/endpoint";

document.addEventListener("DOMContentLoaded", function () {
    confirmBox.addEventListener("change", function () {
        triggerButton.disabled = !confirmBox.checked;
    });
    document.getElementById("trigger-run").addEventListener("click", createLink);
    document.getElementById("clear-output").addEventListener("click", function () {
        finalReport = "";
        outputConsole.textContent = "Console cleared.";
        outputStatus.textContent = "Ready";
    });
    document.getElementById("reset-session").addEventListener("click", resetSession);
});

// Call the deployed function once, then write one audit row.
async function createLink() {
    const startedAt = Date.now();
    const name = document.getElementById("person-name").value.trim();
    const company = document.getElementById("company-name").value.trim();
    const docsUrl = document.getElementById("docs-url").value.trim();
    const summary = [];
    finalReport = "";
    sealedReport = "";
    triggerButton.disabled = true;
    resultBox.textContent = "";
    logOutput("========================================", true);
    logOutput("STARTING TEMPORARY DOCS LINK");
    logOutput("========================================");
    setStatus("Running");

    try {
        // Match the checks in the function so a bad form fails here, before the call.
        if (!isValidField(name)) {
            throw new Error("Name is required and must be 1–50 characters.");
        }
        if (!isValidField(company)) {
            throw new Error("Company is required and must be 1–50 characters.");
        }
        if (docsUrl) {
            try {
                const target = new URL(docsUrl);
                if (target.protocol !== "https:") {
                    throw new Error("not https");
                }
            } catch (error) {
                throw new Error("Docs URL must be a full https URL, for example https://docs.glia.com/how-to/installing-glia");
            }
        }

        logOutput("Name: " + name);
        logOutput("Company: " + company);
        logOutput("Docs page: " + (docsUrl || "docs home page"));

        // The function reads these fields. Empty optional ones are left out.
        const payload = { name: name, company: company };
        if (docsUrl) {
            payload.url = docsUrl;
        }

        const glia = await window.getGliaApi({ version: "v1" });
        const headers = await glia.getRequestHeaders();
        headers["Content-Type"] = "application/json";

        const response = await fetch(TEMP_DOCS_URI, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });
        const data = unwrap(await readJson(response));
        if (!response.ok || !data.url) {
            throw new Error(safeError(data.error || data.detail || ("Request failed (" + response.status + ")")));
        }

        // Show the signed link on the page. Do not copy it into the console.
        renderLink(data);
        logOutput("Link created. Open it from the result above.");
        logOutput("Expires: " + readableTime(data.expiresAt));
        summary.push({
            item: name + " · " + company,
            action: "Create temporary docs link",
            status: "Success"
        });
        renderSummaryTable(summary);
        logOutput("FINISHED");
        await writeAuditLog({
            action: "Create temporary docs link for " + name,
            status: "Success",
            finalReport: executionReport(summary),
            url: docsUrl || "https://docs.glia.com/",
            durationMs: Date.now() - startedAt
        });
        triggerButton.textContent = "Completed";
        setStatus("Success");
    } catch (error) {
        logOutput("CRITICAL ERROR: " + safeError(error.message));
        summary.push({
            item: (name || "(missing name)") + " · " + (company || "(missing company)"),
            action: "Create temporary docs link",
            status: "Failed"
        });
        renderSummaryTable(summary);
        await writeAuditLog({
            action: "Create temporary docs link for " + (name || "(missing name)"),
            status: "Failed",
            finalReport: executionReport(summary) || safeError(error.message),
            url: docsUrl || "https://docs.glia.com/",
            durationMs: Date.now() - startedAt
        });
        triggerButton.textContent = "Retry";
        triggerButton.disabled = !confirmBox.checked;
        setStatus("Failed");
    }
}

// The function returns { url, name, company, expiresAt }. url holds the signed token.
function renderLink(data) {
    resultBox.textContent = "";
    const card = document.createElement("article");
    card.className = "docs-link-card";

    const heading = document.createElement("strong");
    heading.textContent = data.name + " · " + data.company;
    card.appendChild(heading);

    const meta = document.createElement("p");
    meta.className = "docs-link-meta";
    meta.textContent = "Expires " + readableTime(data.expiresAt);
    card.appendChild(meta);

    const link = document.createElement("a");
    link.href = data.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = data.url;
    card.appendChild(link);

    const copy = document.createElement("button");
    copy.className = "btn btn-secondary btn-small";
    copy.type = "button";
    copy.style.marginTop = "0.75rem";
    copy.textContent = "Copy link";
    copy.addEventListener("click", function () {
        navigator.clipboard.writeText(data.url).then(function () {
            copy.textContent = "Copied";
        }).catch(function () {
            copy.textContent = "Copy failed";
        });
    });
    card.appendChild(copy);
    resultBox.appendChild(card);
}

// The function allows 1–50 characters for name and company.
function isValidField(value) {
    return typeof value === "string" && value.length >= 1 && value.length <= 50;
}

// expiresAt from the function is unix seconds.
function readableTime(expiresAt) {
    const seconds = Number(expiresAt);
    if (!seconds) {
        return "unknown";
    }
    return new Date(seconds * 1000).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short"
    });
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
    ["person-name", "company-name", "docs-url"].forEach(function (id) {
        document.getElementById(id).value = "";
    });
    confirmBox.checked = false;
    triggerButton.disabled = true;
    triggerButton.textContent = "Create link";
    resultBox.textContent = "";
    finalReport = "";
    sealedReport = "";
    outputConsole.textContent = "Fill in the form, then create the link.";
    setStatus("Ready");
}

// Glia may hand the function body back as { payload: "..." }.
function unwrap(data) {
    if (!data) {
        return {};
    }
    if (typeof data.payload === "string") {
        try {
            return JSON.parse(data.payload);
        } catch (error) {
            return data;
        }
    }
    if (data.payload && typeof data.payload === "object") {
        return data.payload;
    }
    return data;
}

async function readJson(response) {
    const text = await response.text();
    if (!text) {
        return {};
    }
    try {
        return JSON.parse(text);
    } catch (error) {
        return { error: text.slice(0, 180) };
    }
}

function safeError(text) {
    if (!text) {
        return "";
    }
    return String(text).slice(0, 300);
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
