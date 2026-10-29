const GRAPHQL_ENDPOINT = "https://knowledge-bank.k8s-prod-na.finn.ai/api/v1/graphql";

const DEFAULTS = {
  bearer_token: "",
  user_goal_id: "",
  response_id: "",
};

const GET_USER_GOAL_FROM_RESPONSE = `query GetUserGoalFromResponse($where: ResponseWhereUniqueInput!) {
  response(where: $where) {
    id
    text
    response_guidelines
    mode
    customer {
      id
      code
    }
    user_goal {
      id
      name
      pretty_name
      type
      description
      response_name
      enabled
      system_user_goal
      is_fixed_user_goal
      chat_driver {
        id
        name
      }
    }
    button_order
    buttons {
      id
      type
      label
      destination_utterance
      destination_content_label
      destination_url
      humanQueueId: destination_skill
      destination_response {
        id
        user_goal { id key name }
      }
    }
  }
}`;

const LIST_RESPONSES = `query ($where: ResponseWhereInput!, $skip: Int!) {
  responses(where: $where, take: 100, skip: $skip) {
    id
    user_goal { id key name }
    channel { id }
    locale { id }
    customer_status { id }
    state
    button_order
    buttons {
      id
      type
      label
      destination_utterance
      destination_content_label
      destination_url
      humanQueueId: destination_skill
      destination_response {
        id
        user_goal { id key name }
      }
    }
  }
}`;

const RESPONSE_PAGE_SIZE = 100;

const REQUESTS = {
  fetch: {
    name: "Get User Goal From Response",
    needsId: true,
    query: GET_USER_GOAL_FROM_RESPONSE,
    variables(settings) {
      return { where: { id: settings.response_id.trim() } };
    },
  },
  responses: {
    name: "Responses",
    needsId: false,
  },
};

const fields = {
  bearer_token: document.querySelector("#bearer-token"),
  user_goal_id: document.querySelector("#user-goal-id"),
  response_id: document.querySelector("#response-id"),
};

const statusEl = document.querySelector("#status");
const outputEl = document.querySelector("#output");
const copyBtn = document.querySelector("#copy");
const clearBtn = document.querySelector("#clear");
const buttons = {
  fetch: document.querySelector("#fetch-goal"),
  responses: document.querySelector("#responses"),
};

let latestText = "";
let activeController = null;

init();

function init() {
  chrome.storage.local.get(["settings", "lastResults"], (stored) => {
    const settings = { ...DEFAULTS, ...(stored.settings || {}) };
    fields.bearer_token.value = settings.bearer_token;
    fields.user_goal_id.value = settings.user_goal_id;
    fields.response_id.value = settings.response_id;
    if (Array.isArray(stored.lastResults) && stored.lastResults.length) {
      render(stored.lastResults);
    }
  });

  for (const input of Object.values(fields)) {
    input.addEventListener("change", saveSettings);
    input.addEventListener("input", saveSettings);
  }

  document.querySelector("#settings").addEventListener("submit", (event) => {
    event.preventDefault();
    run(["fetch"]);
  });

  document.querySelector("#toggle-token").addEventListener("click", () => {
    const input = fields.bearer_token;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    document.querySelector("#toggle-token").textContent = show ? "Hide" : "Show";
  });

  buttons.fetch.addEventListener("click", () => run(["fetch"]));
  buttons.responses.addEventListener("click", () => run(["responses"]));
  fields.user_goal_id.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      run(["responses"]);
    }
  });
  fields.response_id.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      run(["fetch"]);
    }
  });

  copyBtn.addEventListener("click", async () => {
    if (!latestText) return;
    await navigator.clipboard.writeText(latestText);
    setStatus("Copied response.");
  });

  clearBtn.addEventListener("click", () => {
    latestText = "";
    outputEl.innerHTML = '<p class="empty">Run a request to see the GraphQL response.</p>';
    copyBtn.disabled = true;
    clearBtn.disabled = true;
    setStatus("");
    chrome.storage.local.remove("lastResults");
  });
}

function saveSettings() {
  chrome.storage.local.set({
    settings: {
      bearer_token: fields.bearer_token.value,
      user_goal_id: fields.user_goal_id.value.trim(),
      response_id: fields.response_id.value.trim(),
    },
  });
}

function readSettings() {
  return {
    bearer_token: fields.bearer_token.value.trim(),
    user_goal_id: fields.user_goal_id.value.trim(),
    response_id: fields.response_id.value.trim(),
  };
}

async function run(keys) {
  const settings = readSettings();
  if (!settings.bearer_token) {
    setStatus("Add a bearer token.", true);
    return;
  }
  if (keys.includes("fetch") && !settings.response_id) {
    setStatus("Add a user goal ID.", true);
    return;
  }
  if (keys.includes("responses") && !settings.user_goal_id) {
    setStatus("Add a response ID.", true);
    return;
  }

  const url = GRAPHQL_ENDPOINT;

  saveSettings();
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  setBusy(true);
  setStatus(`Running ${REQUESTS[keys[0]].name}…`);

  const results = [];
  try {
    for (const key of keys) {
      const result =
        key === "responses"
          ? await fetchResponses(settings, controller.signal)
          : await execute(REQUESTS[key], settings, url, controller.signal);
      results.push(result);
      render(results);
    }
    const failed = results.filter((result) => !result.ok);
    if (failed.length === 1 && failed[0].empty) {
      setStatus(
        failed[0].name === "Responses"
          ? `No responses for response ID ${settings.user_goal_id.trim()}.`
          : `No user goal found for ID ${settings.response_id.trim()}.`,
        true
      );
    } else {
      setStatus(
        failed.length
          ? `${failed.length} of ${results.length} request${results.length === 1 ? "" : "s"} failed.`
          : `${results.length} request${results.length === 1 ? "" : "s"} finished.`
        ,
        failed.length > 0
      );
    }
    chrome.storage.local.set({ lastResults: results });
  } catch (error) {
    if (error.name === "AbortError") return;
    setStatus(error.message || "Request failed.", true);
  } finally {
    if (activeController === controller) {
      activeController = null;
      setBusy(false);
    }
  }
}

async function execute(request, settings, url, signal) {
  const started = performance.now();
  const query = typeof request.query === "function" ? request.query(settings) : request.query;
  const rawId = settings.response_id.trim();
  let variables = request.variables(settings);
  let response;
  try {
    response = await postGraphQL(url, settings.bearer_token, query, variables, signal);
    if (request.needsId && /^-?\d+$/.test(rawId) && idMustBeNumber(errorMessages(response.body))) {
      variables = { where: { id: Number(rawId) } };
      response = await postGraphQL(url, settings.bearer_token, query, variables, signal);
    }
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return networkFailure(url, started, error, request.name);
  }

  const graphqlErrors = errorMessages(response.body).length > 0;
  const empty = response.body?.data?.response == null && response.body?.data && "response" in response.body.data;
  return {
    name: request.name,
    url,
    ok: response.ok && !graphqlErrors && !empty,
    empty,
    status: response.status,
    ms: elapsed(started),
    queriedId: request.needsId ? rawId : "",
    body: response.body,
  };
}

async function fetchResponses(settings, signal) {
  const started = performance.now();
  const rawId = settings.user_goal_id.trim();
  let goalId = rawId;
  const responses = [];
  const seen = new Set();
  let status = 0;
  let skip = 0;

  try {
    while (skip < RESPONSE_PAGE_SIZE * 50) {
      let response = await postGraphQL(GRAPHQL_ENDPOINT, settings.bearer_token, LIST_RESPONSES, responseVariables(goalId, skip), signal);
      if (skip === 0 && goalId === rawId && /^-?\d+$/.test(rawId) && idMustBeNumber(errorMessages(response.body))) {
        goalId = Number(rawId);
        response = await postGraphQL(GRAPHQL_ENDPOINT, settings.bearer_token, LIST_RESPONSES, responseVariables(goalId, skip), signal);
      }
      status = response.status;
      if (!response.ok || errorMessages(response.body).length) {
        return {
          name: "Responses",
          url: GRAPHQL_ENDPOINT,
          ok: false,
          empty: false,
          status,
          ms: elapsed(started),
          queriedId: rawId,
          body: response.body,
        };
      }
      const page = listItems(response.body) || [];
      const fresh = page.filter((item) => {
        const key = String(item?.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      responses.push(...fresh);
      if (page.length < RESPONSE_PAGE_SIZE || fresh.length === 0) break;
      skip += RESPONSE_PAGE_SIZE;
    }
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return networkFailure(GRAPHQL_ENDPOINT, started, error, "Responses");
  }

  return {
    name: "Responses",
    url: GRAPHQL_ENDPOINT,
    ok: responses.length > 0,
    empty: responses.length === 0,
    status: status || 200,
    ms: elapsed(started),
    queriedId: rawId,
    body: { data: { responses } },
  };
}

function responseVariables(goalId, skip) {
  return {
    where: { user_goal: { id: { equals: goalId } } },
    skip,
  };
}

async function postGraphQL(url, token, query, variables, signal) {
  const response = await fetch(url, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const raw = await response.text();
  let body;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = raw;
  }
  return { status: response.status, ok: response.ok, body };
}

function idMustBeNumber(messages) {
  return messages.some((message) => {
    const text = message.toLowerCase();
    return (
      text.includes("int cannot represent") ||
      text.includes("expected type int") ||
      text.includes("must be an integer") ||
      text.includes("must be a number") ||
      (text.includes("id") && /integer|number/.test(text) && text.includes("string"))
    );
  });
}

function errorMessages(body) {
  if (!body || typeof body !== "object" || !Array.isArray(body.errors)) return [];
  return body.errors.map((error) => error?.message).filter(Boolean);
}

function elapsed(started) {
  return Math.round(performance.now() - started);
}

function networkFailure(url, started, error, name = "Get User Goal From Response") {
  return {
    name,
    url,
    ok: false,
    status: 0,
    ms: elapsed(started),
    body: {
      error: error.message || "Network request failed.",
      hint: "Confirm the host resolves on this network and the extension was reloaded after install.",
    },
  };
}

function render(results) {
  outputEl.replaceChildren();
  const blocks = [];

  for (const result of results) {
    const card = document.createElement("article");
    card.className = `card ${result.ok ? "ok" : "bad"}`;

    const header = document.createElement("header");
    const titles = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = result.name;
    const meta = document.createElement("p");
    meta.className = "meta";
    const statusLabel = result.status ? String(result.status) : "network";
    meta.textContent = [statusLabel, result.ms != null ? `${result.ms} ms` : "", result.queriedId ? `id ${result.queriedId}` : ""]
      .filter(Boolean)
      .join(" · ");
    titles.append(heading, meta);

    const badge = document.createElement("span");
    badge.className = `badge ${result.ok ? "ok" : "bad"}`;
    badge.textContent = result.ok ? "OK" : result.status === 200 ? "Not found" : "Error";
    header.append(titles, badge);

    const rendered = renderResultBody(result.body);
    const body = rendered.node;
    const text = rendered.text;
    card.append(header, body);
    outputEl.append(card);
    blocks.push(`${result.name}\n${meta.textContent}\n${text}`);
  }

  latestText = blocks.join("\n\n");
  copyBtn.disabled = false;
  clearBtn.disabled = false;
}

function renderResultBody(body) {
  if (errorMessages(body).length) {
    return { node: renderProblem(body), text: problemText(body) };
  }
  const response = body?.data?.response;
  if (response) return { node: renderResponse(response), text: responseText(response) };
  if (isResponseRecord(body)) return { node: renderResponse(body), text: responseText(body) };
  const items = listItems(body);
  if (items) return { node: renderResponseList(items), text: responseListText(items) };
  return { node: renderProblem(body), text: problemText(body) };
}

function listItems(body) {
  const sources = [body, body?.data].filter((source) => source && typeof source === "object");
  for (const source of sources) {
    if (Array.isArray(source)) return source;
    for (const key of ["responses", "items", "results"]) {
      if (Array.isArray(source[key])) return source[key];
    }
  }
  return null;
}

function isResponseRecord(body) {
  return Boolean(body && typeof body === "object" && !Array.isArray(body) && (body.user_goal || body.text || body.response_guidelines));
}

function renderResponseList(items) {
  const detail = document.createElement("div");
  detail.className = "detail";
  const count = document.createElement("p");
  count.className = "goal-sub";
  count.textContent = items.length ? `${items.length} response${items.length === 1 ? "" : "s"}` : "No responses.";
  detail.append(count);
  for (const item of items) detail.append(renderResponseSummary(item));
  return detail;
}

function renderResponseSummary(item) {
  const section = document.createElement("section");
  section.className = "block";
  if (!item || typeof item !== "object") {
    const value = document.createElement("p");
    value.className = "prose";
    value.textContent = typeof item === "string" ? item : JSON.stringify(item);
    section.append(value);
    return section;
  }
  const goal = item.user_goal;
  const nameLabel = document.createElement("span");
  nameLabel.className = "label";
  nameLabel.textContent = "Response";
  const title = document.createElement("p");
  title.className = "goal-title";
  title.textContent = goal?.name || goal?.key || `Response ${item.id ?? ""}`.trim();
  section.append(nameLabel, title);
  const meta = [
    hasValue(item.id) ? `User goal ID ${item.id}` : "",
    hasValue(item.state) ? item.state : "",
    relationId("Channel", item.channel),
    relationId("Locale", item.locale),
    relationId("Status", item.customer_status),
  ].filter(Boolean).join(" · ");
  if (meta) {
    const sub = document.createElement("p");
    sub.className = "goal-sub";
    sub.textContent = meta;
    section.append(sub);
  }
  for (const group of buttonGroups(item)) {
    if (!group.buttons.length) continue;
    const heading = document.createElement("h4");
    heading.textContent = group.title;
    const list = document.createElement("ul");
    list.className = "button-list";
    for (const button of group.buttons) list.append(renderButton(button));
    section.append(heading, list);
  }
  return section;
}

function renderButton(button) {
  const item = document.createElement("li");
  item.className = "button-item";
  const label = document.createElement("p");
  label.className = "button-label";
  label.textContent = button.label || button.id || "Button";
  item.append(label);
  const fields = document.createElement("div");
  fields.className = "fields";
  for (const [name, value] of buttonFieldRows(button)) {
    const field = document.createElement("div");
    field.className = "field";
    const fieldName = document.createElement("span");
    fieldName.className = "label";
    fieldName.textContent = name;
    const content = document.createElement("span");
    content.className = "value";
    content.textContent = String(value);
    field.append(fieldName, content);
    fields.append(field);
  }
  if (fields.childNodes.length) item.append(fields);
  return item;
}

function isQuickReply(button) {
  return String(button?.type || "").toLowerCase() === "quick reply";
}

function buttonActionType(button) {
  const goalName = button.destination_response?.user_goal?.name;
  if (hasValue(button.humanQueueId)) return "Customer Service Team";
  if (hasValue(goalName)) return "Fixed";
  if (hasValue(button.destination_utterance)) return "Flex";
  return button.type;
}

function buttonFieldRows(button) {
  const rows = [];
  const type = buttonActionType(button);
  if (hasValue(type)) rows.push(["Type", type]);
  if (hasValue(button.humanQueueId)) rows.push(["Human Queue ID", button.humanQueueId]);
  for (const [key, value] of Object.entries(button)) {
    if (key === "type" || key === "label" || key === "humanQueueId" || !hasValue(value) || Array.isArray(value)) continue;
    if (key === "id" && isQuickReply(button)) continue;
    if (typeof value === "object") {
      rows.push(...flattenFields(value, fieldLabel(key)));
    } else {
      rows.push([fieldLabel(key), value]);
    }
  }
  return rows;
}

function flattenFields(value, prefix) {
  const rows = [];
  for (const [key, field] of Object.entries(value)) {
    if (!hasValue(field) || Array.isArray(field)) continue;
    const label = nestedLabel(prefix, key);
    if (typeof field === "object") rows.push(...flattenFields(field, label));
    else rows.push([label, field]);
  }
  return rows;
}

function nestedLabel(prefix, key) {
  if (prefix === "Destination Response" && key === "id") return "Destination Response User Goal Id";
  if (prefix === "Destination Response User Goal" && key === "id") return "Destination Response Id";
  return `${prefix} ${fieldLabel(key)}`;
}

function fieldLabel(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function responseListText(items) {
  if (!items.length) return "No responses.";
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return String(item);
      const goal = item.user_goal;
      const lines = [`Response: ${goal?.name || goal?.key || ""}`.trim()];
      lines.push(
        [
          hasValue(item.id) ? `User goal ID ${item.id}` : "",
          item.state,
          relationId("Channel", item.channel),
          relationId("Locale", item.locale),
          relationId("Status", item.customer_status),
        ].filter(Boolean).join(" · ")
      );
      for (const group of buttonGroups(item)) {
        if (!group.buttons.length) continue;
        lines.push(group.title);
        for (const button of group.buttons) {
          lines.push(`- ${button.label || button.id || "Button"}`);
          for (const [name, value] of buttonFieldRows(button)) lines.push(`  ${name}: ${value}`);
        }
      }
      return lines.filter(Boolean).join("\n");
    })
    .join("\n\n");
}

function renderResponse(response) {
  const goal = response.user_goal;
  const detail = document.createElement("div");
  detail.className = "detail";

  const head = document.createElement("div");
  head.className = "goal-head";
  const nameLabel = document.createElement("span");
  nameLabel.className = "label";
  nameLabel.textContent = "Name";
  const title = document.createElement("p");
  title.className = "goal-title";
  title.textContent = goal?.pretty_name || goal?.name || `Response ${response.id ?? ""}`.trim();
  head.append(nameLabel, title);
  const subtitle = [goal?.name && goal.name !== title.textContent ? goal.name : "", goal?.type]
    .filter(Boolean)
    .join(" · ");
  if (subtitle) {
    const sub = document.createElement("p");
    sub.className = "goal-sub";
    sub.textContent = subtitle;
    head.append(sub);
  }
  if (goal) {
    const chips = document.createElement("div");
    chips.className = "chips";
    chips.append(
      chip(goal.enabled ? "Enabled" : "Disabled", Boolean(goal.enabled)),
      chip(goal.system_user_goal ? "System" : "Not system", Boolean(goal.system_user_goal)),
      chip(goal.is_fixed_user_goal ? "Fixed" : "Not fixed", Boolean(goal.is_fixed_user_goal))
    );
    head.append(chips);
  }
  detail.append(head);

  appendSection(detail, "Response", [
    ["User goal ID", response.id],
    ["Mode", response.mode],
    ["Customer", customerLabel(response.customer)],
  ]);

  if (goal) {
    appendSection(detail, "User goal", [
      ["Response ID", goal.id],
      ["Response name", goal.response_name],
      ["Chat driver", driverLabel(goal.chat_driver)],
    ]);
    appendProse(detail, "Description", goal.description);
  } else {
    const missing = document.createElement("p");
    missing.className = "goal-sub";
    missing.textContent = "This response has no user goal.";
    detail.append(missing);
  }

  appendProse(detail, "Text", response.text);
  appendProse(detail, "Response guidelines", response.response_guidelines);
  appendButtons(detail, response);
  return detail;
}

function appendButtons(parent, response) {
  for (const group of buttonGroups(response)) {
    if (!group.buttons.length) continue;
    const section = document.createElement("section");
    section.className = "block";
    const heading = document.createElement("h4");
    heading.textContent = group.title;
    const list = document.createElement("ul");
    list.className = "button-list";
    for (const button of group.buttons) list.append(renderButton(button));
    section.append(heading, list);
    parent.append(section);
  }
}

function appendSection(parent, title, rows) {
  const filled = rows.filter(([, value]) => hasValue(value));
  if (!filled.length) return;
  const section = document.createElement("section");
  section.className = "block";
  const heading = document.createElement("h4");
  heading.textContent = title;
  const fields = document.createElement("div");
  fields.className = "fields";
  for (const [label, value] of filled) {
    const field = document.createElement("div");
    field.className = "field";
    const name = document.createElement("span");
    name.className = "label";
    name.textContent = label;
    const content = document.createElement("span");
    content.className = "value";
    content.textContent = String(value);
    field.append(name, content);
    fields.append(field);
  }
  section.append(heading, fields);
  parent.append(section);
}

function appendProse(parent, title, value) {
  if (!hasValue(value)) return;
  const section = document.createElement("section");
  section.className = "block";
  const heading = document.createElement("h4");
  heading.textContent = title;
  const prose = document.createElement("p");
  prose.className = "prose";
  prose.textContent = String(value);
  section.append(heading, prose);
  parent.append(section);
}

function chip(text, on) {
  const node = document.createElement("span");
  node.className = `chip ${on ? "on" : "off"}`;
  node.textContent = text;
  return node;
}

function buttonGroups(response) {
  const buttons = Array.isArray(response?.buttons) ? response.buttons : [];
  const byId = new Map(buttons.map((button) => [String(button.id), button]));
  const order = parseButtonOrder(response?.button_order);
  if (!order) return [{ title: "Buttons", buttons }];

  const used = new Set();
  const groups = [];
  const entries = Array.isArray(order) ? [["Buttons", order]] : Object.entries(order);
  for (const [title, ids] of entries) {
    const ordered = (Array.isArray(ids) ? ids : []).map((entry) => {
      const id = entry && typeof entry === "object" ? entry.id : entry;
      used.add(String(id));
      return byId.get(String(id)) || { id, label: String(id) };
    });
    groups.push({ title, buttons: ordered });
  }
  const rest = buttons.filter((button) => !used.has(String(button.id)));
  if (rest.length) groups.push({ title: "Other", buttons: rest });
  return groups.filter((group) => group.buttons.length);
}

function parseButtonOrder(value) {
  if (!hasValue(value)) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function relationId(label, relation) {
  return hasValue(relation?.id) ? `${label} ${relation.id}` : "";
}

function customerLabel(customer) {
  if (!customer) return "";
  return [customer.code, customer.id].filter(hasValue).join(" · ");
}

function driverLabel(driver) {
  if (!driver) return "";
  return [driver.name, driver.id].filter(hasValue).join(" · ");
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function responseText(response) {
  const goal = response.user_goal;
  const lines = [];
  lines.push(`Name: ${goal?.pretty_name || goal?.name || `Response ${response.id ?? ""}`.trim()}`);
  const subtitle = [goal?.name, goal?.type].filter(Boolean).join(" · ");
  if (subtitle && subtitle !== lines[0]) lines.push(subtitle);
  if (goal) {
    lines.push(
      [
        goal.enabled ? "Enabled" : "Disabled",
        goal.system_user_goal ? "System" : "Not system",
        goal.is_fixed_user_goal ? "Fixed" : "Not fixed",
      ].join(" · ")
    );
  }
  lines.push("");
  pushFields(lines, "Response", [
    ["User goal ID", response.id],
    ["Mode", response.mode],
    ["Customer", customerLabel(response.customer)],
  ]);
  if (goal) {
    pushFields(lines, "User goal", [
      ["Response ID", goal.id],
      ["Response name", goal.response_name],
      ["Chat driver", driverLabel(goal.chat_driver)],
    ]);
    if (hasValue(goal.description)) {
      lines.push("Description", String(goal.description), "");
    }
  } else {
    lines.push("This response has no user goal.", "");
  }
  if (hasValue(response.text)) lines.push("Text", String(response.text), "");
  if (hasValue(response.response_guidelines)) {
    lines.push("Response guidelines", String(response.response_guidelines), "");
  }
  for (const group of buttonGroups(response)) {
    if (!group.buttons.length) continue;
    lines.push(group.title);
    for (const button of group.buttons) {
      lines.push(`- ${button.label || button.id || "Button"}`);
      for (const [name, value] of buttonFieldRows(button)) lines.push(`  ${name}: ${value}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

function pushFields(lines, title, rows) {
  const filled = rows.filter(([, value]) => hasValue(value));
  if (!filled.length) return;
  lines.push(title);
  for (const [label, value] of filled) lines.push(`${label}: ${value}`);
  lines.push("");
}

function renderProblem(body) {
  const messages = errorMessages(body);
  if (messages.length) {
    const list = document.createElement("ul");
    list.className = "problems";
    for (const message of messages) {
      const item = document.createElement("li");
      item.textContent = message;
      list.append(item);
    }
    return list;
  }
  const pre = document.createElement("pre");
  pre.textContent = typeof body === "string" ? body : JSON.stringify(body, null, 2) || "(empty response)";
  return pre;
}

function problemText(body) {
  const messages = errorMessages(body);
  if (messages.length) return messages.join("\n");
  return typeof body === "string" ? body : JSON.stringify(body, null, 2) || "(empty response)";
}

function setBusy(busy) {
  for (const button of Object.values(buttons)) button.disabled = busy;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", Boolean(isError));
}
