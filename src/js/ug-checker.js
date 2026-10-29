/**
 * UG Checker · CE Toolkit frontend
 *
 * No secrets, tokens, or Knowledge Bank credentials live here.
 * All external calls go through Glia Functions invoked with Glia SDK headers.
 *
 * After deploying each Glia Function, paste the invocation URI below.
 */

const JIRA_RETRIEVAL_URI = "https://api.glia.com/integrations/<jira-ug-checker-function-uuid>/endpoint";
const UG_CHECKER_URI = "https://api.glia.com/integrations/<ug-checker-function-uuid>/endpoint";
const WRITE_LOG_URI = "https://api.glia.com/integrations/<write-log-function-uuid>/endpoint";

/** CE Test Site — required by the Automations Creation Rulebook until updated. */
const SITE_ID = "a5c110f6-a4a5-47d9-bbf1-d03d7a5e5089";
const AUTOMATION_NAME = "UG Checker";

const els = {
  ticketStatus: document.querySelector("#ticket-status"),
  ticketRows: document.querySelector("#ticket-rows"),
  refresh: document.querySelector("#refresh-tickets"),
  detailPanel: document.querySelector("#detail-panel"),
  detailTitle: document.querySelector("#detail-title"),
  ticketFields: document.querySelector("#ticket-fields"),
  verify: document.querySelector("#verify-check"),
  runFetch: document.querySelector("#run-fetch"),
  runResponses: document.querySelector("#run-responses"),
  console: document.querySelector("#console"),
  runStatus: document.querySelector("#run-status"),
  summaryWrap: document.querySelector("#summary-wrap"),
  summaryRows: document.querySelector("#summary-rows"),
};

let tickets = [];
let selected = null;
let busy = false;

init();

async function init() {
  els.refresh.addEventListener("click", () => loadTickets());
  els.verify.addEventListener("change", syncTriggers);
  els.runFetch.addEventListener("click", () => runAction("fetch"));
  els.runResponses.addEventListener("click", () => runAction("responses"));
  setStatus("Ready", "info");
  log("Waiting…");
  await loadTickets();
}

async function loadTickets() {
  setTicketStatus("Loading tickets…");
  els.detailPanel.classList.add("hidden");
  selected = null;
  syncTriggers();

  try {
    const glia = await window.getGliaApi({ version: "v1" });
    const user = await glia.getUser().catch(() => null);
    const operatorEmail = user?.email || "";
    if (!operatorEmail) {
      setTicketStatus("Could not resolve the logged-in CE email.", true);
      renderTickets([]);
      return;
    }

    const result = await invokeFunction(JIRA_RETRIEVAL_URI, {
      operatorEmail,
    });

    if (!result.success) {
      setTicketStatus(result.error || "Failed to load tickets.", true);
      renderTickets([]);
      return;
    }

    tickets = Array.isArray(result.tickets) ? result.tickets : [];
    renderTickets(tickets);
    setTicketStatus(
      tickets.length
        ? `${tickets.length} open ticket${tickets.length === 1 ? "" : "s"} for ${operatorEmail}.`
        : `No open UG Checker tickets for ${operatorEmail}.`
    );
  } catch (error) {
    setTicketStatus(error.message || "Failed to load tickets.", true);
    renderTickets([]);
  }
}

function renderTickets(items) {
  els.ticketRows.replaceChildren();
  if (!items.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "empty";
    cell.textContent = "No tickets found.";
    row.append(cell);
    els.ticketRows.append(row);
    return;
  }

  for (const ticket of items) {
    const row = document.createElement("tr");
    row.append(
      cell(ticket.key || "—"),
      cell(ticket.summary || "—"),
      cell(ticket.status || "—")
    );
    const action = document.createElement("td");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "linkish";
    button.textContent = "View More";
    button.addEventListener("click", () => selectTicket(ticket));
    action.append(button);
    row.append(action);
    els.ticketRows.append(row);
  }
}

function selectTicket(ticket) {
  selected = ticket;
  els.verify.checked = false;
  els.detailPanel.classList.remove("hidden");
  els.detailTitle.textContent = ticket.key || "Ticket";
  els.ticketFields.replaceChildren();

  const fields = [
    ["Summary", ticket.summary],
    ["Status", ticket.status],
    ["User goal ID", ticket.userGoalId],
    ["Response ID", ticket.responseId],
    ["Description", ticket.description],
  ];
  for (const [label, value] of fields) {
    if (!hasValue(value)) continue;
    const field = document.createElement("div");
    field.className = "field";
    const name = document.createElement("span");
    name.className = "label";
    name.textContent = label;
    const content = document.createElement("span");
    content.className = "value";
    content.textContent = String(value);
    field.append(name, content);
    els.ticketFields.append(field);
  }
  syncTriggers();
}

function syncTriggers() {
  const ok = Boolean(selected && els.verify.checked && !busy);
  els.runFetch.disabled = !(ok && hasValue(selected?.userGoalId));
  els.runResponses.disabled = !(ok && hasValue(selected?.responseId));
}

async function runAction(operation) {
  if (!selected || !els.verify.checked || busy) return;

  const payload =
    operation === "fetch"
      ? { operation: "fetch", responseId: String(selected.userGoalId).trim(), ticket: selected.key }
      : { operation: "responses", userGoalId: String(selected.responseId).trim(), ticket: selected.key };

  if (operation === "fetch" && !payload.responseId) {
    setStatus("Missing User goal ID.", "error");
    return;
  }
  if (operation === "responses" && !payload.userGoalId) {
    setStatus("Missing Response ID.", "error");
    return;
  }

  busy = true;
  syncTriggers();
  els.summaryWrap.classList.add("hidden");
  els.summaryRows.replaceChildren();
  setStatus("Running…", "info");
  log(`Starting ${operation} for ${selected.key}…`);

  const started = Date.now();
  let result;
  try {
    result = await invokeFunction(UG_CHECKER_URI, payload);
  } catch (error) {
    result = { success: false, error: error.message || String(error), durationMs: Date.now() - started };
  }

  const durationMs = result.durationMs ?? Date.now() - started;
  if (result.success) {
    setStatus("Success", "success");
    log(result.report || JSON.stringify(result.result ?? result, null, 2));
  } else {
    setStatus("Failed", "error");
    log(`❌ ${result.error || "Request failed."}`);
  }

  renderSummary([
    {
      item: selected.key,
      action: operation === "fetch" ? "Fetch response" : "List responses",
      status: result.success ? "Success" : "Failed",
    },
  ]);

  await writeAuditLog({
    action: `UG Checker ${operation}`,
    status: result.success ? "Success" : "Failed",
    ticket: selected.key,
    finalReport: result.success
      ? truncate(result.report || "ok", 1500)
      : truncate(result.error || "failed", 1500),
    durationMs,
  });

  busy = false;
  syncTriggers();
}

function renderSummary(rows) {
  els.summaryRows.replaceChildren();
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.append(cell(row.item), cell(row.action), cell(row.status));
    els.summaryRows.append(tr);
  }
  els.summaryWrap.classList.remove("hidden");
}

async function invokeFunction(uri, body) {
  const glia = await window.getGliaApi({ version: "v1" });
  const headers = await glia.getRequestHeaders();
  headers["Content-Type"] = "application/json";

  const res = await fetch(uri, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Function returned non-JSON (HTTP ${res.status}).`);
  }
  return data;
}

async function writeAuditLog({ action, status, ticket, finalReport = "", durationMs }) {
  try {
    const glia = await window.getGliaApi({ version: "v1" });
    const headers = await glia.getRequestHeaders();
    headers["Content-Type"] = "application/json";
    const user = await glia.getUser().catch(() => null);

    const res = await fetch(WRITE_LOG_URI, {
      method: "POST",
      headers,
      body: JSON.stringify({
        siteId: SITE_ID,
        userId: user?.email ?? "support@glia.com",
        action,
        automation: AUTOMATION_NAME,
        status,
        ticket,
        url: UG_CHECKER_URI,
        finalReport,
        durationMs,
      }),
    });
    const out = await res.json();
    if (!out.success) console.error("Audit log failed:", out.error);
  } catch (error) {
    console.error("Could not reach the audit log function", error);
  }
}

function setTicketStatus(text, isError = false) {
  els.ticketStatus.textContent = text;
  els.ticketStatus.classList.toggle("error", Boolean(isError));
}

function setStatus(text, kind) {
  els.runStatus.textContent = text;
  els.runStatus.className = `badge badge-${kind}`;
}

function log(text) {
  els.console.textContent = text;
}

function cell(text) {
  const td = document.createElement("td");
  td.textContent = text == null ? "" : String(text);
  return td;
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function truncate(value, max) {
  const text = String(value || "");
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * Extract emails from free-text form answers.
 * Copied from the CE Toolkit auth0 automation pattern — do not rewrite.
 */
function extractEmails(text) {
  if (!text) return [];
  const matches = String(text).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
  return matches ? [...new Set(matches.map((email) => email.toLowerCase()))] : [];
}

void extractEmails;
