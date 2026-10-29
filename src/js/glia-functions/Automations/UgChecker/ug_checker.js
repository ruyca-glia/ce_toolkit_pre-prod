/**
 * UG Checker orchestrator Glia Function
 *
 * Reads the Knowledge Bank GraphQL API with a bearer token from AWS Secrets Manager.
 * Never returns the token. Never logs the full secret (first 5 chars only if verifying).
 *
 * Env (Glia Function settings):
 *   aws:accessKeyId
 *   aws:secretAccessKey
 *   AWS_REGION                  (default us-east-1)
 *   KNOWLEDGE_BANK_SECRET_ID    Secrets Manager id/ARN; secret JSON must include { "bearerToken": "..." }
 *   GRAPHQL_ENDPOINT            optional; defaults to prod Knowledge Bank GraphQL
 *
 * Deploy: npm run build → upload function-out.js → set current version in Glia Hub.
 */

import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const DEFAULT_GRAPHQL_ENDPOINT = "https://knowledge-bank.k8s-prod-na.finn.ai/api/v1/graphql";
const RESPONSE_PAGE_SIZE = 100;
const CACHE_MS = 10 * 60 * 1000;

const GET_USER_GOAL_FROM_RESPONSE = `query GetUserGoalFromResponse($where: ResponseWhereUniqueInput!) {
  response(where: $where) {
    id
    text
    response_guidelines
    mode
    customer { id code }
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
      chat_driver { id name }
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

let cachedToken = null;
let cachedAt = 0;

export async function onInvoke(request, env) {
  const started = Date.now();
  try {
    const data = await readPayload(request);

    const bearer = await getKnowledgeBankToken(env);
    const endpoint = env.GRAPHQL_ENDPOINT || DEFAULT_GRAPHQL_ENDPOINT;

    if (data.operation === "fetch") {
      const responseId = String(data.responseId || "").trim();
      if (!responseId) {
        return Response.json(
          { success: false, error: "responseId is required", durationMs: Date.now() - started },
          { status: 400 }
        );
      }
      const result = await fetchOneResponse(endpoint, bearer, responseId);
      if (!result.ok) {
        return Response.json(
          {
            success: false,
            error: result.error,
            durationMs: Date.now() - started,
          },
          { status: result.status || 502 }
        );
      }
      return Response.json({
        success: true,
        report: formatResponse(result.response),
        result: { id: result.response?.id },
        durationMs: Date.now() - started,
      });
    }

    if (data.operation === "responses") {
      const userGoalId = String(data.userGoalId || "").trim();
      if (!userGoalId) {
        return Response.json(
          { success: false, error: "userGoalId is required", durationMs: Date.now() - started },
          { status: 400 }
        );
      }
      const result = await listResponses(endpoint, bearer, userGoalId);
      if (!result.ok) {
        return Response.json(
          {
            success: false,
            error: result.error,
            durationMs: Date.now() - started,
          },
          { status: result.status || 502 }
        );
      }
      return Response.json({
        success: true,
        report: formatResponseList(result.responses),
        result: { count: result.responses.length },
        durationMs: Date.now() - started,
      });
    }

    return Response.json(
      { success: false, error: "Unknown operation. Use fetch or responses.", durationMs: Date.now() - started },
      { status: 400 }
    );
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: `${err.name || "Error"}: ${err.message || String(err)}`,
        durationMs: Date.now() - started,
      },
      { status: 500 }
    );
  }
}

async function readPayload(request) {
  const envelope = await request.json();
  if (envelope && typeof envelope === "object" && "payload" in envelope) {
    const payload = envelope.payload;
    return typeof payload === "string" ? JSON.parse(payload) : payload ?? {};
  }
  return envelope ?? {};
}

async function getKnowledgeBankToken(env) {
  if (cachedToken && Date.now() - cachedAt < CACHE_MS) return cachedToken;

  const secretId = env.KNOWLEDGE_BANK_SECRET_ID;
  if (!secretId) throw new Error("KNOWLEDGE_BANK_SECRET_ID is not configured");

  const sm = new SecretsManagerClient({
    region: env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: env["aws:accessKeyId"],
      secretAccessKey: env["aws:secretAccessKey"],
    },
  });

  const res = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));
  const secret = JSON.parse(res.SecretString || "{}");
  const token = secret.bearerToken || secret.token || secret.BearerToken;
  if (!token) throw new Error("Knowledge Bank secret is missing bearerToken");

  // Verification only — never log the full token.
  console.log(`KB token loaded: ${String(token).slice(0, 5)}…`);

  cachedToken = token;
  cachedAt = Date.now();
  return cachedToken;
}

async function fetchOneResponse(endpoint, bearer, rawId) {
  let variables = { where: { id: rawId } };
  let response = await postGraphQL(endpoint, bearer, GET_USER_GOAL_FROM_RESPONSE, variables);

  if (/^-?\d+$/.test(rawId) && idMustBeNumber(errorMessages(response.body))) {
    variables = { where: { id: Number(rawId) } };
    response = await postGraphQL(endpoint, bearer, GET_USER_GOAL_FROM_RESPONSE, variables);
  }

  const messages = errorMessages(response.body);
  if (!response.ok || messages.length) {
    return { ok: false, status: response.status, error: messages.join("; ") || `HTTP ${response.status}` };
  }

  const item = response.body?.data?.response;
  if (item == null) {
    return { ok: false, status: 404, error: `No response found for ID ${rawId}.` };
  }
  return { ok: true, response: item };
}

async function listResponses(endpoint, bearer, rawId) {
  let goalId = rawId;
  const responses = [];
  const seen = new Set();
  let skip = 0;
  let status = 200;

  while (skip < RESPONSE_PAGE_SIZE * 50) {
    let response = await postGraphQL(endpoint, bearer, LIST_RESPONSES, {
      where: { user_goal: { id: { equals: goalId } } },
      skip,
    });

    if (
      skip === 0 &&
      goalId === rawId &&
      /^-?\d+$/.test(rawId) &&
      idMustBeNumber(errorMessages(response.body))
    ) {
      goalId = Number(rawId);
      response = await postGraphQL(endpoint, bearer, LIST_RESPONSES, {
        where: { user_goal: { id: { equals: goalId } } },
        skip,
      });
    }

    status = response.status;
    const messages = errorMessages(response.body);
    if (!response.ok || messages.length) {
      return { ok: false, status, error: messages.join("; ") || `HTTP ${status}` };
    }

    const page = Array.isArray(response.body?.data?.responses) ? response.body.data.responses : [];
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

  if (!responses.length) {
    return { ok: false, status: 404, error: `No responses for user goal ID ${rawId}.` };
  }
  return { ok: true, responses };
}

async function postGraphQL(url, token, query, variables) {
  const response = await fetch(url, {
    method: "POST",
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

function errorMessages(body) {
  if (!body || typeof body !== "object") return [];
  const errors = Array.isArray(body.errors) ? body.errors : [];
  return errors.map((error) => error?.message || String(error)).filter(Boolean);
}

function idMustBeNumber(messages) {
  return messages.some((message) => {
    const text = String(message).toLowerCase();
    return (
      text.includes("int cannot represent") ||
      text.includes("expected type int") ||
      text.includes("must be an integer") ||
      text.includes("must be a number") ||
      (text.includes("id") && (text.includes("integer") || text.includes("number")) && text.includes("string"))
    );
  });
}

function formatResponse(response) {
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
    if (hasValue(goal.description)) lines.push("Description", String(goal.description), "");
  } else {
    lines.push("This response has no user goal.", "");
  }
  if (hasValue(response.text)) lines.push("Text", String(response.text), "");
  if (hasValue(response.response_guidelines)) {
    lines.push("Response guidelines", String(response.response_guidelines), "");
  }
  appendButtonText(lines, response);
  return lines.join("\n").trim();
}

function formatResponseList(items) {
  if (!items.length) return "No responses.";
  return items
    .map((item) => {
      const goal = item.user_goal;
      const lines = [`Response: ${goal?.name || goal?.key || ""}`.trim()];
      lines.push(
        [
          hasValue(item.id) ? `User goal ID ${item.id}` : "",
          item.state,
          relationId("Channel", item.channel),
          relationId("Locale", item.locale),
          relationId("Status", item.customer_status),
        ]
          .filter(Boolean)
          .join(" · ")
      );
      appendButtonText(lines, item);
      return lines.filter(Boolean).join("\n");
    })
    .join("\n\n");
}

function appendButtonText(lines, response) {
  for (const group of buttonGroups(response)) {
    if (!group.buttons.length) continue;
    lines.push(group.title);
    for (const button of group.buttons) {
      lines.push(`- ${button.label || button.id || "Button"}`);
      for (const [name, value] of buttonFieldRows(button)) lines.push(`  ${name}: ${value}`);
    }
    lines.push("");
  }
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
    if (key === "type" || key === "label" || key === "humanQueueId" || !hasValue(value) || Array.isArray(value)) {
      continue;
    }
    if (key === "id" && String(button?.type || "").toLowerCase() === "quick reply") continue;
    if (typeof value === "object") rows.push(...flattenFields(value, fieldLabel(key)));
    else rows.push([fieldLabel(key), value]);
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

function pushFields(lines, title, rows) {
  const filled = rows.filter(([, value]) => hasValue(value));
  if (!filled.length) return;
  lines.push(title);
  for (const [label, value] of filled) lines.push(`${label}: ${value}`);
  lines.push("");
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
