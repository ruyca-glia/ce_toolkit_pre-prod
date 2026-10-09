// Batch Disabler (Client Offboarding).
// The page talks only to the Glia Function and to write_log.
// Listing and deleting operators happens inside the function.
//
// Uploaded Batch Disabler function. The page calls this, not the Glia REST API.
const BATCH_DISABLER_URI = "https://api.glia.com/integrations/2b0f5d77-41bb-4247-a371-3bd9dcd3c4e1/endpoint";

const WRITE_LOG_URI = "https://api.glia.com/integrations/f026a5b6-ba81-4211-99e1-3667bbaf16e9/endpoint";
const AUDIT_SITE_ID = "a5c110f6-a4a5-47d9-bbf1-d03d7a5e5089";
const AUTOMATION_NAME = "Batch Disabler (Client Offboarding)";

// Same pause the extension used between DELETE calls. It lives on the page
// so one function invocation stays short.
const DISABLE_PAUSE_MS = 300;

const confirmBox = document.getElementById("confirm-run");
const triggerButton = document.getElementById("trigger-run");
const outputConsole = document.getElementById("output-console");
const outputStatus = document.getElementById("output-status");
const resultBox = document.getElementById("result-table");
const stayNote = document.getElementById("stay-note");
const listStatus = document.getElementById("list-status");

let operatorsData = [];
let runActive = false;
let runSerial = 0;
let finalReport = "";
let sealedReport = "";
let cachedGlia = null;

confirmBox.addEventListener("change", function () {
    triggerButton.disabled = !confirmBox.checked || runActive;
});

document.getElementById("get-bearer").addEventListener("click", getBearer);
document.getElementById("load-operators").addEventListener("click", loadOperators);
document.getElementById("trigger-run").addEventListener("click", disableSelected);
document.getElementById("reset-session").addEventListener("click", openReset);
document.getElementById("reset-yes").addEventListener("click", resetSession);
document.getElementById("reset-no").addEventListener("click", closeReset);
document.getElementById("select-enabled").addEventListener("click", function () {
    setGroupChecked("enabled-operators", true);
});
document.getElementById("deselect-enabled").addEventListener("click", function () {
    setGroupChecked("enabled-operators", false);
});
document.getElementById("select-disabled").addEventListener("click", function () {
    setGroupChecked("disabled-operators", true);
});
document.getElementById("deselect-disabled").addEventListener("click", function () {
    setGroupChecked("disabled-operators", false);
});
document.getElementById("copy-raw").addEventListener("click", copyRaw);

window.addEventListener("beforeunload", function (event) {
    if (!runActive) {
        return;
    }
    event.preventDefault();
    event.returnValue = "";
});

function logOutput(message) {
    const time = new Date().toLocaleTimeString();
    outputConsole.textContent += "\n[" + time + "] " + message;
    outputConsole.scrollTop = outputConsole.scrollHeight;
}

function setStatus(text) {
    outputStatus.textContent = text;
}

function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

function gliaApi() {
    if (cachedGlia) {
        return Promise.resolve(cachedGlia);
    }
    return window.getGliaApi({ version: "v1" }).then(function (glia) {
        cachedGlia = glia;
        return glia;
    });
}

// Disables the button and ticks the label, the console, and the status
// once a second until the work finishes.
function beginWait(buttonId, label) {
    const button = document.getElementById(buttonId);
    const started = Date.now();
    const original = button.textContent;
    button.disabled = true;
    logOutput(label);
    const lineStart = outputConsole.textContent.length;
    const timer = setInterval(function () {
        const seconds = Math.floor((Date.now() - started) / 1000);
        const text = label + " " + seconds + "s";
        button.textContent = text;
        setStatus(text);
        outputConsole.textContent = outputConsole.textContent.slice(0, lineStart) + " " + seconds + "s";
        outputConsole.scrollTop = outputConsole.scrollHeight;
    }, 1000);
    return {
        finish: function (message) {
            clearInterval(timer);
            button.disabled = false;
            button.textContent = original;
            outputConsole.textContent = outputConsole.textContent.slice(0, lineStart);
            if (message) {
                outputConsole.textContent += "\n[" + new Date().toLocaleTimeString() + "] " + message;
            }
            outputConsole.scrollTop = outputConsole.scrollHeight;
        }
    };
}

function credentials() {
    return {
        baseUrl: document.getElementById("base-url").value.trim() || "https://api.glia.com",
        accessToken: document.getElementById("bearer-token").value.trim(),
        apiToken: document.getElementById("api-token").value.trim()
    };
}

async function callFunction(action, extra) {
    if (!BATCH_DISABLER_URI) {
        throw new Error("The function URI is not set yet. Upload the function, then paste the URI into batch-disabler.js.");
    }
    const glia = await gliaApi();
    const headers = await glia.getRequestHeaders();
    headers["Content-Type"] = "application/json";
    const payload = Object.assign({ action: action }, credentials(), extra || {});
    const res = await fetch(BATCH_DISABLER_URI, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
    });
    const data = await res.json().catch(function () {
        return {};
    });
    if (!res.ok || data.success === false) {
        throw new Error(data.error || data.message || ("Function returned " + res.status));
    }
    return data;
}

async function getBearer() {
    const wait = beginWait("get-bearer", "Getting bearer...");
    try {
        const data = await callFunction("token");
        document.getElementById("bearer-token").value = data.token || "";
        wait.finish("Bearer is ready. It stays in the password field and is not written here.");
        setStatus("Ready");
    } catch (error) {
        wait.finish("Bearer failed: " + error.message);
        setStatus("Error");
    }
}

// Support, Super Manager, a name containing "glia", or an email containing
// "support+omniguide" is protected. Same rules as the extension.
function isProtected(operator) {
    const role = operator.role || "";
    const name = (operator.name || "").toLowerCase();
    const email = (operator.email || "").toLowerCase();
    return role === "super_manager" || role === "support" || name.indexOf("glia") !== -1 || email.indexOf("support+omniguide") !== -1;
}

async function loadOperators() {
    const siteIds = document.getElementById("site-ids").value.trim();
    if (!siteIds) {
        logOutput("Enter at least one site ID.");
        return;
    }
    const creds = credentials();
    if (!creds.accessToken && !creds.apiToken) {
        logOutput("Paste a bearer, or fill the API token.");
        return;
    }
    logOutput(creds.accessToken
        ? "Using the pasted bearer. The token is not written here."
        : "The API token will be exchanged inside the function. The token is not written here.");
    const includeDisabled = document.getElementById("include-disabled").value;
    const serial = ++runSerial;
    runActive = true;
    operatorsData = [];
    const wait = beginWait("load-operators", "Fetching operators...");
    const started = Date.now();
    const pageNotes = [];
    try {
        let pageUrl = "";
        let pages = 0;
        do {
            const data = await callFunction("list", {
                siteIds: siteIds,
                includeDisabled: includeDisabled,
                pageUrl: pageUrl
            });
            if (serial !== runSerial) {
                wait.finish("");
                return;
            }
            const pageCount = (data.operators || []).length;
            operatorsData = operatorsData.concat(data.operators || []);
            pageUrl = data.nextPage || "";
            pages += 1;
            pageNotes.push((data.logs && data.logs[0]) || ("Page " + pages + " returned " + pageCount + " operator(s)."));
            listStatus.textContent = "Fetching operators... (" + operatorsData.length + " found so far)";
            if (serial !== runSerial) {
                wait.finish("");
                return;
            }
        } while (pageUrl);
        renderOperators(operatorsData);
        const included = includeDisabled === "false" ? "Disabled operators were left out." : "Disabled operators were included.";
        listStatus.textContent = "Loaded " + operatorsData.length + " operator(s) across " + pages + " page(s) for " + siteIds + ". " + included;
        wait.finish(listStatus.textContent + "\n" + pageNotes.join("\n"));
        setStatus("Ready");
        await writeAuditLog({
            action: "List operators",
            status: "Success",
            finalReport: listStatus.textContent,
            durationMs: Date.now() - started
        });
    } catch (error) {
        if (serial !== runSerial) {
            return;
        }
        listStatus.textContent = "";
        renderOperators([]);
        wait.finish("Could not load operators: " + error.message);
        setStatus("Error");
        await writeAuditLog({
            action: "List operators",
            status: "Failed",
            finalReport: error.message,
            durationMs: Date.now() - started
        });
    } finally {
        if (serial === runSerial) {
            runActive = false;
            triggerButton.disabled = !confirmBox.checked;
        }
    }
}

function renderOperators(operators) {
    const enabled = operators.filter(function (op) {
        return op.enabled === true && !isProtected(op);
    });
    const disabled = operators.filter(function (op) {
        return op.enabled === false && !isProtected(op);
    });
    const protectedOps = operators.filter(isProtected);
    document.getElementById("total-count").textContent = "(Total: " + operators.length + ")";
    document.getElementById("enabled-heading").textContent = "Enabled operators (" + enabled.length + ")";
    document.getElementById("disabled-heading").textContent = "Disabled operators (" + disabled.length + ")";
    document.getElementById("protected-heading").textContent = "Protected operators (" + protectedOps.length + ")";
    fillList("enabled-operators", enabled, false);
    fillList("disabled-operators", disabled, false);
    fillList("protected-operators", protectedOps, true);
    const raw = document.getElementById("operators-raw");
    raw.textContent = operators.length
        ? JSON.stringify({ operators: operators, note: "Full list of operators fetched via pagination" }, null, 2)
        : "Response will appear here...";
    refreshSelectionNote();
}

function copyRaw() {
    const text = document.getElementById("operators-raw").textContent;
    if (!text || text === "Response will appear here...") {
        logOutput("No operator response to copy.");
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        logOutput("Operator response copied.");
    }).catch(function (error) {
        logOutput("Could not copy: " + error.message);
    });
}

function fillList(containerId, operators, protectedGroup) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    if (!operators.length) {
        const empty = document.createElement("p");
        empty.className = "empty-note";
        empty.textContent = protectedGroup ? "No protected operators found." : "No operators in this group.";
        container.appendChild(empty);
        return;
    }
    operators.forEach(function (operator) {
        container.appendChild(operatorCard(operator, protectedGroup));
    });
}

function operatorCard(operator, protectedGroup) {
    const card = document.createElement("div");
    card.className = protectedGroup ? "operator-card protected-card" : "operator-card";
    const header = document.createElement("div");
    header.className = "operator-card-header";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.operatorId = operator.id;
    checkbox.addEventListener("change", function () {
        card.classList.toggle("selected", checkbox.checked);
        refreshSelectionNote();
    });
    const name = document.createElement("span");
    name.textContent = operator.name || "N/A";
    header.appendChild(checkbox);
    header.appendChild(name);
    const details = document.createElement("div");
    details.className = "operator-details";
    details.textContent = "ID: " + (operator.id || "N/A") + " · Role: " + (operator.role || "N/A") + " · Email: " + (operator.email || "N/A");
    card.appendChild(header);
    card.appendChild(details);
    if (protectedGroup) {
        const label = document.createElement("div");
        label.className = "protected-label";
        label.textContent = "PROTECTED USER";
        card.appendChild(label);
    }
    card.addEventListener("click", function (event) {
        if (event.target === checkbox) {
            return;
        }
        checkbox.checked = !checkbox.checked;
        card.classList.toggle("selected", checkbox.checked);
        refreshSelectionNote();
    });
    return card;
}

function setGroupChecked(containerId, checked) {
    document.querySelectorAll("#" + containerId + " input[type='checkbox']").forEach(function (checkbox) {
        checkbox.checked = checked;
        checkbox.closest(".operator-card").classList.toggle("selected", checked);
    });
    refreshSelectionNote();
}

// The applet sandbox blocks window.confirm, so the count and any protected
// warning stay on the page. The checkbox is what enables Disable selected.
function refreshSelectionNote() {
    const note = document.getElementById("selection-note");
    const chosen = selectedOperators();
    if (!chosen.length) {
        note.textContent = "Select operators, then check the box to enable Disable selected.";
        return;
    }
    const protectedCount = chosen.filter(isProtected).length;
    note.textContent = chosen.length + " operator(s) selected." + (protectedCount ? " This includes " + protectedCount + " protected operator(s)." : "");
}

function selectedOperators() {
    const chosen = [];
    document.querySelectorAll(".operator-card input[type='checkbox']:checked").forEach(function (checkbox) {
        const id = checkbox.dataset.operatorId;
        const operator = operatorsData.find(function (item) {
            return item.id === id;
        });
        chosen.push(operator || { id: id, name: id });
    });
    return chosen;
}

async function disableSelected() {
    const chosen = selectedOperators();
    if (!chosen.length) {
        logOutput("Select at least one operator.");
        return;
    }
    const creds = credentials();
    if (!creds.accessToken && !creds.apiToken) {
        logOutput("Paste a bearer, or fill the API token.");
        return;
    }
    const protectedCount = chosen.filter(isProtected).length;
    const serial = ++runSerial;
    runActive = true;
    triggerButton.disabled = true;
    stayNote.classList.remove("hidden");
    resultBox.innerHTML = "";
    finalReport = "";
    sealedReport = "";
    const started = Date.now();
    const summary = [];
    let succeeded = 0;
    let failed = 0;
    logOutput(creds.accessToken
        ? "Using the pasted bearer. The token is not written here."
        : "The API token will be exchanged inside the function. The token is not written here.");
    logOutput("Starting to disable " + chosen.length + " operator(s)." + (protectedCount ? " This includes " + protectedCount + " protected operator(s)." : "") + " Each one is removed with DELETE /operators/{id}.");
    setStatus("Running");
    for (let index = 0; index < chosen.length; index += 1) {
        if (serial !== runSerial) {
            return;
        }
        const operator = chosen[index];
        const who = (operator.name || "Unnamed") + (operator.email ? " (" + operator.email + ")" : "") + ", role " + (operator.role || "unknown") + ", id " + operator.id;
        const label = (operator.name || operator.id) + " (" + operator.id + ")";
        try {
            const data = await callFunction("disable", { operatorId: operator.id });
            succeeded += 1;
            summary.push({ item: label, action: "Disable operator", status: "Disabled" });
            logOutput("[" + (index + 1) + "/" + chosen.length + "] " + who);
            logOutput("   -> " + ((data.logs && data.logs[0]) || "Disable request accepted."));
            const box = document.querySelector("input[data-operator-id='" + cssEscape(operator.id) + "']");
            if (box) {
                box.checked = false;
                box.closest(".operator-card").classList.remove("selected");
            }
        } catch (error) {
            failed += 1;
            summary.push({ item: label, action: "Disable operator", status: "Failed" });
            logOutput("[" + (index + 1) + "/" + chosen.length + "] " + who);
            logOutput("   -> Could not disable that operator. " + error.message);
        }
        if (index < chosen.length - 1) {
            await sleep(DISABLE_PAUSE_MS);
        }
    }
    if (serial !== runSerial) {
        return;
    }
    const status = failed === 0 ? "Success" : (succeeded === 0 ? "Failed" : "Partial Failure");
    logOutput("Completed: " + succeeded + " succeeded, " + failed + " failed out of " + chosen.length + ".");
    if (failed === 0) {
        logOutput("All selected operators were disabled. Load operators again to refresh the lists.");
    }
    renderSummary(summary);
    setStatus(status);
    await writeAuditLog({
        action: "Disable operators",
        status: status,
        finalReport: executionReport(summary),
        durationMs: Date.now() - started
    });
    runActive = false;
    stayNote.classList.add("hidden");
    triggerButton.disabled = !confirmBox.checked;
    triggerButton.textContent = "Disable selected";
}

function cssEscape(value) {
    if (window.CSS && CSS.escape) {
        return CSS.escape(value);
    }
    return String(value).replace(/"/g, "");
}

function renderSummary(rows) {
    const table = document.createElement("table");
    table.className = "data-table";
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["Item", "Action", "Status"].forEach(function (label) {
        const cell = document.createElement("th");
        cell.textContent = label;
        headRow.appendChild(cell);
    });
    head.appendChild(headRow);
    const body = document.createElement("tbody");
    rows.forEach(function (row) {
        const line = document.createElement("tr");
        [row.item, row.action, row.status].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            line.appendChild(cell);
        });
        body.appendChild(line);
    });
    table.appendChild(head);
    table.appendChild(body);
    resultBox.innerHTML = "";
    resultBox.appendChild(table);
}

function executionReport(summary) {
    return summary.map(function (item) {
        return "Item: " + item.item + " Action: " + item.action + " Status: " + item.status;
    }).join("\n");
}

async function writeAuditLog({ action, status, finalReport: report = "", url = "", durationMs = 0 }) {
    try {
        const glia = await gliaApi();
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
            logOutput("Audit log failed: " + (result.error || "Unknown error"));
            return;
        }
        logOutput("Audit log saved.");
    } catch (error) {
        logOutput("Audit log skipped. Open this page inside Glia Hub to record the run.");
    }
}

function openReset() {
    const dialog = document.getElementById("reset-dialog");
    dialog.classList.remove("hidden");
    dialog.style.display = "flex";
}

function closeReset() {
    const dialog = document.getElementById("reset-dialog");
    dialog.classList.add("hidden");
    dialog.style.display = "";
}

function resetSession() {
    closeReset();
    if (runActive) {
        runSerial += 1;
        runActive = false;
    }
    ["api-token", "bearer-token", "site-ids"].forEach(function (id) {
        document.getElementById(id).value = "";
    });
    document.getElementById("base-url").value = "https://api.glia.com";
    document.getElementById("include-disabled").value = "true";
    operatorsData = [];
    confirmBox.checked = false;
    triggerButton.disabled = true;
    triggerButton.textContent = "Disable selected";
    stayNote.classList.add("hidden");
    listStatus.textContent = "";
    resultBox.innerHTML = "";
    renderOperators([]);
    refreshSelectionNote();
    outputConsole.textContent = "Paste a bearer, or exchange an API token, then load operators.";
    setStatus("Ready");
}
