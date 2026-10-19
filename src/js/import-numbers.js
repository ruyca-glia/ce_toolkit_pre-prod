// Import Numbers into Glia from Twilio.
// The page keeps the original importer setup: auth, two tabs, bulk paste,
// global settings, one row per number, then a sequential import.
// History is not included.
// Glia and Salemove calls happen inside the function. This file only
// calls that function and write_log.
//
// Uploaded Import Numbers function. The page calls this, not the Glia REST API.
const IMPORT_NUMBERS_URI = "https://api.glia.com/integrations/acb84476-af78-4f66-b6df-1e4c65c56927/endpoint";

const WRITE_LOG_URI = "https://api.glia.com/integrations/f026a5b6-ba81-4211-99e1-3667bbaf16e9/endpoint";
const AUDIT_SITE_ID = "a5c110f6-a4a5-47d9-bbf1-d03d7a5e5089";
const AUTOMATION_NAME = "Import Numbers into Glia from Twilio";
const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

const outputConsole = document.getElementById("output-console");
const outputStatus = document.getElementById("output-status");
const resultBox = document.getElementById("result-table");
const phoneConfirm = document.getElementById("confirm-phone");
const hostedConfirm = document.getElementById("confirm-hosted");
const phoneButton = document.getElementById("import-phone");
const hostedButton = document.getElementById("import-hosted");

let phoneNumbers = [];
let hostedPhoneNumbers = [];
let nextId = 1;
let nextHostedId = 1;
let notifTimer = null;
let clearTarget = "";
let runActive = false;
let runSerial = 0;
let cachedGlia = null;

phoneConfirm.addEventListener("change", function () {
    phoneButton.disabled = !phoneConfirm.checked || runActive;
});
hostedConfirm.addEventListener("change", function () {
    hostedButton.disabled = !hostedConfirm.checked || runActive;
});

document.getElementById("get-bearer").addEventListener("click", getBearer);
document.getElementById("tab-btn-phone").addEventListener("click", function () { switchTab("phone"); });
document.getElementById("tab-btn-hosted").addEventListener("click", function () { switchTab("hosted"); });
document.getElementById("parse-bulk").addEventListener("click", parseBulkNumbers);
document.getElementById("apply-global").addEventListener("click", applyGlobal);
document.getElementById("add-number").addEventListener("click", function () { addNumberRow(); });
document.getElementById("clear-numbers").addEventListener("click", function () { openClear("phone"); });
document.getElementById("import-phone").addEventListener("click", runPhoneImport);
document.getElementById("parse-hosted").addEventListener("click", parseHostedBulkNumbers);
document.getElementById("apply-hosted").addEventListener("click", applyHostedGlobal);
document.getElementById("add-hosted").addEventListener("click", function () { addHostedNumberRow(); });
document.getElementById("clear-hosted").addEventListener("click", function () { openClear("hosted"); });
document.getElementById("import-hosted").addEventListener("click", runHostedImport);
document.getElementById("notif-close").addEventListener("click", clearNotif);
document.getElementById("clear-yes").addEventListener("click", confirmClear);
document.getElementById("clear-no").addEventListener("click", closeClear);
document.getElementById("number-list").addEventListener("click", function (event) {
    const button = event.target.closest("[data-remove-phone]");
    if (button) {
        removeNumber(Number(button.getAttribute("data-remove-phone")));
    }
});
document.getElementById("hosted-list").addEventListener("click", function (event) {
    const button = event.target.closest("[data-remove-hosted]");
    if (button) {
        removeHostedNumber(Number(button.getAttribute("data-remove-hosted")));
    }
});

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

function showNotif(message, type) {
    const el = document.getElementById("notif");
    document.getElementById("notif-msg").textContent = message;
    el.className = "notif visible " + (type || "error");
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (notifTimer) {
        clearTimeout(notifTimer);
    }
    notifTimer = setTimeout(clearNotif, 8000);
}

function clearNotif() {
    document.getElementById("notif").classList.remove("visible");
    if (notifTimer) {
        clearTimeout(notifTimer);
        notifTimer = null;
    }
}

function switchTab(tabName) {
    document.getElementById("tab-phone").classList.toggle("hidden", tabName !== "phone");
    document.getElementById("tab-hosted").classList.toggle("hidden", tabName !== "hosted");
    document.getElementById("tab-btn-phone").classList.toggle("active", tabName === "phone");
    document.getElementById("tab-btn-hosted").classList.toggle("active", tabName === "hosted");
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
        accessToken: document.getElementById("bearer-token").value.trim(),
        apiToken: document.getElementById("api-token").value.trim()
    };
}

async function callFunction(action, extra) {
    if (!IMPORT_NUMBERS_URI) {
        throw new Error("The function URI is not set yet. Upload the function, then paste the URI into import-numbers.js.");
    }
    const glia = await gliaApi();
    const headers = await glia.getRequestHeaders();
    headers["Content-Type"] = "application/json";
    const response = await fetch(IMPORT_NUMBERS_URI, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(Object.assign({ action: action }, credentials(), extra || {}))
    });
    const data = await response.json().catch(function () {
        return {};
    });
    if (!response.ok || data.success === false) {
        const error = new Error(data.error || data.message || ("Function returned " + response.status));
        error.logs = data.logs || [];
        throw error;
    }
    return data;
}

async function getBearer() {
    const wait = beginWait("get-bearer", "Getting bearer...");
    try {
        const data = await callFunction("token");
        document.getElementById("bearer-token").value = data.token || "";
        setTokenStatus(true, data.expiresIn);
        wait.finish("Bearer is ready. It stays in the password field and is not written here.");
        setStatus("Ready");
    } catch (error) {
        setTokenStatus(false);
        wait.finish("Bearer failed: " + error.message);
        showNotif(error.message);
        setStatus("Error");
    }
}

function setTokenStatus(active, expiresIn) {
    const el = document.getElementById("token-status");
    if (active) {
        const mins = Math.floor(Number(expiresIn || 0) / 60);
        el.className = "token-status active";
        el.textContent = "";
        el.appendChild(dot());
        el.appendChild(document.createTextNode(mins > 0 ? " Token active (" + mins + " min)" : " Token ready"));
        return;
    }
    el.className = "token-status inactive";
    el.textContent = "";
    el.appendChild(dot());
    el.appendChild(document.createTextNode(" No token"));
}

function dot() {
    const span = document.createElement("span");
    span.className = "dot";
    return span;
}

function parseBulkNumbers() {
    const raw = document.getElementById("bulk-input").value.trim();
    if (!raw) {
        showNotif("Paste some numbers first.");
        return;
    }
    const lines = raw.split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean);
    const existing = {};
    phoneNumbers.forEach(function (item) { existing[item.number] = true; });
    let added = 0;
    let skipped = 0;
    lines.forEach(function (line) {
        const numberMatch = line.match(/^(\+\d{7,15})/);
        if (!numberMatch) {
            return;
        }
        const number = numberMatch[1];
        const remainder = line.slice(number.length).replace(/^[\s,]+/, "");
        let name = "";
        let smsQueueId = "";
        let phoneQueueId = "";
        if (remainder) {
            const queueMatches = [];
            UUID_PATTERN.lastIndex = 0;
            let match = UUID_PATTERN.exec(remainder);
            while (match) {
                queueMatches.push(match);
                match = UUID_PATTERN.exec(remainder);
            }
            const queueIds = queueMatches.map(function (item) { return item[0].trim(); });
            if (queueIds.length >= 2) {
                phoneQueueId = queueIds[queueIds.length - 1];
                smsQueueId = queueIds[queueIds.length - 2];
                name = remainder.slice(0, queueMatches[queueMatches.length - 2].index).replace(/,\s*$/, "").trim();
            } else if (queueIds.length === 1) {
                smsQueueId = queueIds[0];
                phoneQueueId = queueIds[0];
                name = remainder.slice(0, queueMatches[0].index).replace(/,\s*$/, "").trim();
            } else {
                name = remainder.replace(/,\s*$/, "").trim();
            }
        }
        if (existing[number]) {
            skipped += 1;
            return;
        }
        phoneNumbers.push({
            id: nextId++,
            number: number,
            name: name,
            description: "",
            smsQueueId: smsQueueId,
            phoneQueueId: phoneQueueId
        });
        existing[number] = true;
        added += 1;
    });
    if (added === 0 && skipped === 0) {
        showNotif("No valid E.164 numbers found. Each line should start with + followed by digits.");
        return;
    }
    document.getElementById("bulk-input").value = "";
    renderNumberList();
    showNotif("Added " + added + " number(s). " + skipped + " duplicate(s) skipped.", "info");
}

function addNumberRow(number, name, desc, smsQueue, phoneQueue) {
    phoneNumbers.push({
        id: nextId++,
        number: number || "",
        name: name || "",
        description: desc || "",
        smsQueueId: smsQueue || "",
        phoneQueueId: phoneQueue || ""
    });
    renderNumberList();
}

function removeNumber(id) {
    phoneNumbers = phoneNumbers.filter(function (item) { return item.id !== id; });
    renderNumberList();
}

function applyGlobal() {
    const nameVal = document.getElementById("global-name").value.trim();
    const descVal = document.getElementById("global-desc").value.trim();
    const smsVal = document.getElementById("global-sms").value.trim();
    const phoneVal = document.getElementById("global-phone").value.trim();
    const useNumber = document.getElementById("name-as-number").checked;
    syncFromInputs();
    phoneNumbers.forEach(function (item) {
        if (useNumber) {
            item.name = item.number;
        } else if (nameVal) {
            item.name = nameVal;
        }
        if (descVal) {
            item.description = descVal;
        }
        item.smsQueueId = smsVal;
        item.phoneQueueId = phoneVal;
    });
    renderNumberList();
}

function syncFromInputs() {
    phoneNumbers.forEach(function (item) {
        const numberEl = document.getElementById("num-" + item.id);
        const nameEl = document.getElementById("name-" + item.id);
        const descEl = document.getElementById("desc-" + item.id);
        const smsEl = document.getElementById("sms-" + item.id);
        const phoneEl = document.getElementById("phone-" + item.id);
        if (numberEl) { item.number = numberEl.value.trim(); }
        if (nameEl) { item.name = nameEl.value.trim(); }
        if (descEl) { item.description = descEl.value.trim(); }
        if (smsEl) { item.smsQueueId = smsEl.value.trim(); }
        if (phoneEl) { item.phoneQueueId = phoneEl.value.trim(); }
    });
}

function renderNumberList() {
    const container = document.getElementById("number-list");
    const empty = document.getElementById("empty-state");
    container.textContent = "";
    if (!phoneNumbers.length) {
        empty.classList.remove("hidden");
        return;
    }
    empty.classList.add("hidden");
    phoneNumbers.forEach(function (item) {
        container.appendChild(phoneRow(item));
    });
}

function phoneRow(item) {
    const row = document.createElement("div");
    row.className = "number-row";
    row.appendChild(field("Number", "num-" + item.id, item.number, "+1XXXXXXXXXX"));
    row.appendChild(field("Name", "name-" + item.id, item.name, "Defaults to number"));
    row.appendChild(field("Description", "desc-" + item.id, item.description, "Optional"));
    row.appendChild(field("SMS Queue", "sms-" + item.id, item.smsQueueId, "Optional UUID"));
    row.appendChild(field("Phone Queue", "phone-" + item.id, item.phoneQueueId, "Optional UUID"));
    const remove = document.createElement("button");
    remove.className = "remove-btn";
    remove.type = "button";
    remove.title = "Remove";
    remove.textContent = "×";
    remove.setAttribute("data-remove-phone", String(item.id));
    row.appendChild(remove);
    return row;
}

function field(labelText, id, value, placeholder) {
    const wrap = document.createElement("div");
    wrap.className = "field";
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;
    const input = document.createElement("input");
    input.type = "text";
    input.id = id;
    input.value = value || "";
    input.placeholder = placeholder;
    wrap.appendChild(label);
    wrap.appendChild(input);
    return wrap;
}

function parseHostedBulkNumbers() {
    const raw = document.getElementById("hosted-bulk").value.trim();
    if (!raw) {
        showNotif("Paste some numbers first.");
        return;
    }
    const lines = raw.split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean);
    const existing = {};
    hostedPhoneNumbers.forEach(function (item) { existing[item.number] = true; });
    let added = 0;
    let skipped = 0;
    lines.forEach(function (line) {
        const numberMatch = line.match(/^(\+\d{7,15})/);
        if (!numberMatch) {
            return;
        }
        const number = numberMatch[1];
        const name = line.slice(number.length).replace(/^[\s,]+/, "").replace(/,\s*$/, "").trim();
        if (existing[number]) {
            skipped += 1;
            return;
        }
        hostedPhoneNumbers.push({ id: nextHostedId++, number: number, name: name });
        existing[number] = true;
        added += 1;
    });
    if (added === 0 && skipped === 0) {
        showNotif("No valid E.164 numbers found. Each line should start with + followed by digits.");
        return;
    }
    document.getElementById("hosted-bulk").value = "";
    renderHostedNumberList();
    showNotif("Added " + added + " hosted SMS number(s). " + skipped + " duplicate(s) skipped.", "info");
}

function addHostedNumberRow(number, name) {
    hostedPhoneNumbers.push({ id: nextHostedId++, number: number || "", name: name || "" });
    renderHostedNumberList();
}

function removeHostedNumber(id) {
    hostedPhoneNumbers = hostedPhoneNumbers.filter(function (item) { return item.id !== id; });
    renderHostedNumberList();
}

function applyHostedGlobal() {
    const nameVal = document.getElementById("hosted-global-name").value.trim();
    const useNumber = document.getElementById("hosted-name-as-number").checked;
    syncHostedFromInputs();
    hostedPhoneNumbers.forEach(function (item) {
        if (useNumber) {
            item.name = item.number;
        } else if (nameVal) {
            item.name = nameVal;
        }
    });
    renderHostedNumberList();
}

function syncHostedFromInputs() {
    hostedPhoneNumbers.forEach(function (item) {
        const numberEl = document.getElementById("hosted-num-" + item.id);
        const nameEl = document.getElementById("hosted-name-" + item.id);
        if (numberEl) { item.number = numberEl.value.trim(); }
        if (nameEl) { item.name = nameEl.value.trim(); }
    });
}

function renderHostedNumberList() {
    const container = document.getElementById("hosted-list");
    const empty = document.getElementById("hosted-empty");
    container.textContent = "";
    if (!hostedPhoneNumbers.length) {
        empty.classList.remove("hidden");
        return;
    }
    empty.classList.add("hidden");
    hostedPhoneNumbers.forEach(function (item) {
        const row = document.createElement("div");
        row.className = "number-row simple";
        row.appendChild(field("Number", "hosted-num-" + item.id, item.number, "+372XXXXXXXX"));
        row.appendChild(field("Name", "hosted-name-" + item.id, item.name, "e.g. Hosted Number"));
        const remove = document.createElement("button");
        remove.className = "remove-btn";
        remove.type = "button";
        remove.title = "Remove";
        remove.textContent = "×";
        remove.setAttribute("data-remove-hosted", String(item.id));
        row.appendChild(remove);
        container.appendChild(row);
    });
}

async function runPhoneImport() {
    syncFromInputs();
    const creds = credentials();
    const siteId = document.getElementById("site-id").value.trim();
    if (!creds.accessToken && !creds.apiToken) { showNotif("Paste a support bearer, or fill the site support API token."); return; }
    if (!siteId) { showNotif("Site ID is required."); return; }
    if (!phoneNumbers.length) { showNotif("Add at least one phone number."); return; }
    for (let i = 0; i < phoneNumbers.length; i += 1) {
        if (!phoneNumbers[i].number) { showNotif("All rows must have a phone number."); return; }
        if (!phoneNumbers[i].name) { phoneNumbers[i].name = phoneNumbers[i].number; }
    }
    await runBatch({
        mode: "phone",
        button: phoneButton,
        confirmBox: phoneConfirm,
        stay: document.getElementById("stay-phone"),
        progressWrap: document.getElementById("progress-wrap"),
        progressFill: document.getElementById("progress-fill"),
        results: document.getElementById("results-list"),
        items: phoneNumbers.slice(),
        siteId: siteId,
        action: "Import phone number",
        label: "Import All Numbers"
    });
}

async function runHostedImport() {
    syncHostedFromInputs();
    const creds = credentials();
    const siteId = document.getElementById("hosted-site-id").value.trim();
    if (!creds.accessToken && !creds.apiToken) { showNotif("Paste a support bearer, or fill the site support API token."); return; }
    if (!siteId) { showNotif("Site ID is required."); return; }
    if (!hostedPhoneNumbers.length) { showNotif("Add at least one hosted SMS number."); return; }
    for (let i = 0; i < hostedPhoneNumbers.length; i += 1) {
        if (!hostedPhoneNumbers[i].number) { showNotif("All rows must have a phone number."); return; }
        if (!hostedPhoneNumbers[i].name) { hostedPhoneNumbers[i].name = hostedPhoneNumbers[i].number; }
    }
    await runBatch({
        mode: "hosted",
        button: hostedButton,
        confirmBox: hostedConfirm,
        stay: document.getElementById("stay-hosted"),
        progressWrap: document.getElementById("hosted-progress-wrap"),
        progressFill: document.getElementById("hosted-progress-fill"),
        results: document.getElementById("hosted-results"),
        items: hostedPhoneNumbers.slice(),
        siteId: siteId,
        action: "Import hosted SMS",
        label: "Import All Hosted SMS Numbers"
    });
}

async function runBatch(job) {
    const serial = ++runSerial;
    runActive = true;
    job.button.disabled = true;
    job.stay.classList.remove("hidden");
    job.progressWrap.classList.add("active");
    job.progressFill.style.width = "0%";
    job.results.textContent = "";
    resultBox.textContent = "";
    const started = Date.now();
    const summary = [];
    let succeeded = 0;
    let failed = 0;
    const creds = credentials();
    logOutput(creds.accessToken
        ? "Using the pasted support bearer. The token is not written here."
        : "The site support API token will be exchanged inside the function. The token is not written here.");
    logOutput("Starting " + job.items.length + " number(s) for " + job.action + " on site " + job.siteId + ".");
    setStatus("Running");
    for (let index = 0; index < job.items.length; index += 1) {
        if (serial !== runSerial) {
            return;
        }
        const item = job.items[index];
        appendResult(job.results, item.number, "pending", "Importing...");
        try {
            const data = await callFunction("import", {
                mode: job.mode,
                siteId: job.siteId,
                phoneNumber: item.number,
                name: item.name,
                description: item.description || "",
                smsQueueId: item.smsQueueId || "",
                phoneQueueId: item.phoneQueueId || ""
            });
            succeeded += 1;
            summary.push({ item: item.number, action: job.action, status: "Imported" });
            replaceLastResult(job.results, item.number, "success", "ok");
            (data.logs || ["Configured " + item.number + "."]).forEach(logOutput);
        } catch (error) {
            failed += 1;
            summary.push({ item: item.number, action: job.action, status: "Failed" });
            replaceLastResult(job.results, item.number, "error", error.message);
            logOutput("Could not configure " + item.number + ". " + error.message);
        }
        job.progressFill.style.width = Math.round(((index + 1) / job.items.length) * 100) + "%";
    }
    if (serial !== runSerial) {
        return;
    }
    const status = failed === 0 ? "Success" : (succeeded === 0 ? "Failed" : "Partial Failure");
    logOutput("Completed: " + succeeded + " imported, " + failed + " failed out of " + job.items.length + ".");
    renderSummary(summary);
    setStatus(status);
    await writeAuditLog({
        action: job.action + " on site " + job.siteId,
        status: status,
        finalReport: summary.map(function (row) {
            return "Item: " + row.item + " Action: " + row.action + " Status: " + row.status;
        }).join("\n"),
        durationMs: Date.now() - started
    });
    runActive = false;
    job.stay.classList.add("hidden");
    job.button.disabled = !job.confirmBox.checked;
    job.button.textContent = job.label;
}

function appendResult(container, number, status, message) {
    container.appendChild(resultRow(number, status, message));
}

function replaceLastResult(container, number, status, message) {
    const last = container.lastElementChild;
    if (last) {
        last.replaceWith(resultRow(number, status, message));
    }
}

function resultRow(number, status, message) {
    const row = document.createElement("div");
    row.className = "result-item " + status;
    const icon = document.createElement("span");
    icon.className = "result-icon";
    icon.textContent = status === "success" ? "✓" : (status === "error" ? "✗" : "●");
    const body = document.createElement("div");
    const title = document.createElement("div");
    title.className = "result-number";
    title.textContent = number;
    const msg = document.createElement("div");
    msg.className = "result-msg";
    msg.textContent = message;
    body.appendChild(title);
    body.appendChild(msg);
    row.appendChild(icon);
    row.appendChild(body);
    return row;
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
    resultBox.textContent = "";
    resultBox.appendChild(table);
}

async function writeAuditLog({ action, status, finalReport, durationMs }) {
    try {
        const glia = await gliaApi();
        const headers = await glia.getRequestHeaders();
        headers["Content-Type"] = "application/json";
        const user = await glia.getUser().catch(function () { return null; });
        const response = await fetch(WRITE_LOG_URI, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                siteId: AUDIT_SITE_ID,
                userId: user && user.email ? user.email : "support@glia.com",
                action: action,
                automation: AUTOMATION_NAME,
                status: status,
                url: "",
                finalReport: finalReport || "",
                durationMs: Number(durationMs)
            })
        });
        const result = await response.json();
        if (!result.success) {
            logOutput("Audit log failed: " + (result.error || "Unknown error"));
            return;
        }
        logOutput("Audit log saved.");
    } catch (error) {
        logOutput("Audit log skipped. Open this page inside Glia Hub to record the run.");
    }
}

function openClear(target) {
    if (target === "phone" && !phoneNumbers.length) { return; }
    if (target === "hosted" && !hostedPhoneNumbers.length) { return; }
    clearTarget = target;
    document.getElementById("clear-title").textContent = target === "hosted" ? "Remove all hosted SMS numbers?" : "Remove all numbers?";
    const dialog = document.getElementById("clear-dialog");
    dialog.classList.remove("hidden");
    dialog.style.display = "flex";
}

function closeClear() {
    const dialog = document.getElementById("clear-dialog");
    dialog.classList.add("hidden");
    dialog.style.display = "";
    clearTarget = "";
}

function confirmClear() {
    if (clearTarget === "phone") {
        phoneNumbers = [];
        renderNumberList();
    }
    if (clearTarget === "hosted") {
        hostedPhoneNumbers = [];
        renderHostedNumberList();
    }
    closeClear();
}
