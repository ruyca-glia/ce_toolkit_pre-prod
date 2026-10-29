/**
 * Jira ticket fetcher for UG Checker
 *
 * Returns only open tickets assigned to the logged-in CE for this automation type.
 * Jira credentials come from AWS Secrets Manager — never from the browser.
 *
 * Env (Glia Function settings):
 *   aws:accessKeyId
 *   aws:secretAccessKey
 *   AWS_REGION                 (default us-east-1)
 *   JIRA_SECRET_ID             Secrets Manager id/ARN
 *                              secret JSON: { "baseUrl": "https://…atlassian.net", "email": "…", "apiToken": "…" }
 *   JIRA_JQL                   optional override; must keep assignee scoping
 *
 * Expected Proforma / form field labels (adjust FORM_LABELS if your form differs):
 *   "User Goal ID"  → used by Fetch (response lookup; matches Chrome extension label swap)
 *   "Response ID"   → used by Responses (user_goal filter)
 *
 * Deploy: npm run build → upload function-out.js → set current version in Glia Hub.
 */

import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const CACHE_MS = 10 * 60 * 1000;
const FORM_LABELS = {
  userGoalId: ["user goal id", "user goal", "ug id"],
  responseId: ["response id", "kb response id"],
};

/** Default JQL — keep assignee + unresolved. Adjust the label/type with Charlie/Ruy. */
const DEFAULT_JQL =
  'assignee = "{email}" AND resolution = Unresolved AND labels = "ug-checker" ORDER BY updated DESC';

let cachedJira = null;
let cachedAt = 0;

export async function onInvoke(request, env) {
  const started = Date.now();
  try {
    const data = await readPayload(request);
    const operatorEmail = String(data.operatorEmail || "").trim().toLowerCase();
    if (!operatorEmail) {
      return Response.json(
        { success: false, error: "operatorEmail is required", durationMs: Date.now() - started },
        { status: 400 }
      );
    }

    const jira = await getJiraCreds(env);
    const jqlTemplate = env.JIRA_JQL || DEFAULT_JQL;
    const jql = jqlTemplate.replaceAll("{email}", operatorEmail.replaceAll('"', '\\"'));

    const search = await jiraRequest(
      jira,
      `/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,status,description,assignee`
    );

    if (!search.ok) {
      return Response.json(
        {
          success: false,
          error: `Jira search failed: HTTP ${search.status} ${truncate(search.body, 300)}`,
          durationMs: Date.now() - started,
        },
        { status: 502 }
      );
    }

    const issues = Array.isArray(search.json?.issues) ? search.json.issues : [];
    const tickets = [];

    for (const issue of issues) {
      // Sequential per ticket — never Promise.all on external API calls.
      const formFields = await loadFormFields(jira, issue.key);
      tickets.push({
        key: issue.key,
        summary: issue.fields?.summary || "",
        status: issue.fields?.status?.name || "",
        description: extractPlainText(issue.fields?.description),
        userGoalId: formFields.userGoalId || "",
        responseId: formFields.responseId || "",
        form: formFields.raw,
      });
    }

    return Response.json({
      success: true,
      tickets,
      count: tickets.length,
      durationMs: Date.now() - started,
    });
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

async function getJiraCreds(env) {
  if (cachedJira && Date.now() - cachedAt < CACHE_MS) return cachedJira;

  const secretId = env.JIRA_SECRET_ID;
  if (!secretId) throw new Error("JIRA_SECRET_ID is not configured");

  const sm = new SecretsManagerClient({
    region: env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: env["aws:accessKeyId"],
      secretAccessKey: env["aws:secretAccessKey"],
    },
  });

  const res = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));
  const secret = JSON.parse(res.SecretString || "{}");
  const baseUrl = String(secret.baseUrl || secret.jiraBaseUrl || "").replace(/\/$/, "");
  const email = secret.email || secret.username;
  const apiToken = secret.apiToken || secret.token;
  if (!baseUrl || !email || !apiToken) {
    throw new Error("Jira secret must include baseUrl, email, and apiToken");
  }

  console.log(`Jira creds loaded for ${String(email).slice(0, 5)}…`);

  cachedJira = { baseUrl, email, apiToken };
  cachedAt = Date.now();
  return cachedJira;
}

async function jiraRequest(jira, path, init = {}) {
  const auth = btoa(`${jira.email}:${jira.apiToken}`);
  const response = await fetch(`${jira.baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const body = await response.text();
  let json = null;
  try {
    json = body ? JSON.parse(body) : null;
  } catch {
    json = null;
  }
  return { ok: response.ok, status: response.status, body, json };
}

async function loadFormFields(jira, issueKey) {
  const raw = {};
  let userGoalId = "";
  let responseId = "";

  // Proforma / Forms for Jira — issue property. If absent, fall back to empty IDs.
  const forms = await jiraRequest(jira, `/rest/proforma/1/issue/${encodeURIComponent(issueKey)}/form`);
  if (!forms.ok || !forms.json) return { userGoalId, responseId, raw };

  const documents = Array.isArray(forms.json) ? forms.json : [forms.json];
  for (const doc of documents) {
    const questions = collectQuestions(doc);
    const answers = collectAnswers(doc);
    for (const [answerId, answer] of Object.entries(answers)) {
      const question = questions[answerId];
      const label = normalizeLabel(question?.label || question?.question || answerId);
      const value = stringifyAnswer(answer);
      if (!value) continue;
      raw[label || answerId] = value;
      if (!userGoalId && matchesLabel(label, FORM_LABELS.userGoalId)) userGoalId = firstToken(value);
      if (!responseId && matchesLabel(label, FORM_LABELS.responseId)) responseId = firstToken(value);
    }
  }

  return { userGoalId, responseId, raw };
}

function collectQuestions(doc) {
  const out = {};
  const design = doc?.design || doc?.schema || doc;
  const questions = design?.questions || design?.questionMap || {};
  if (Array.isArray(questions)) {
    for (const question of questions) {
      const id = String(question.id ?? question.key ?? "");
      if (id) out[id] = question;
    }
    return out;
  }
  for (const [id, question] of Object.entries(questions)) out[String(id)] = question;
  return out;
}

function collectAnswers(doc) {
  const state = doc?.state || doc?.answers || doc;
  const answers = state?.answers || state?.answerMap || {};
  if (Array.isArray(answers)) {
    const out = {};
    for (const answer of answers) {
      const id = String(answer.questionId ?? answer.id ?? "");
      if (id) out[id] = answer;
    }
    return out;
  }
  return answers;
}

function stringifyAnswer(answer) {
  if (answer == null) return "";
  if (typeof answer === "string" || typeof answer === "number") return String(answer);
  if (typeof answer.text === "string") return answer.text;
  if (typeof answer.value === "string" || typeof answer.value === "number") return String(answer.value);
  if (Array.isArray(answer.choices)) return answer.choices.map(stringifyAnswer).filter(Boolean).join(", ");
  if (Array.isArray(answer)) return answer.map(stringifyAnswer).filter(Boolean).join(", ");
  try {
    return JSON.stringify(answer);
  } catch {
    return "";
  }
}

function extractPlainText(adf) {
  if (!adf) return "";
  if (typeof adf === "string") return adf;
  const chunks = [];
  walkAdf(adf, chunks);
  return chunks.join(" ").trim();
}

function walkAdf(node, chunks) {
  if (!node) return;
  if (typeof node === "string") {
    chunks.push(node);
    return;
  }
  if (typeof node.text === "string") chunks.push(node.text);
  if (Array.isArray(node.content)) {
    for (const child of node.content) walkAdf(child, chunks);
  }
}

function normalizeLabel(label) {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/[_:]+/g, " ")
    .replace(/\s+/g, " ");
}

function matchesLabel(label, candidates) {
  return candidates.some((candidate) => label === candidate || label.includes(candidate));
}

function firstToken(value) {
  return String(value).trim().split(/\s+/)[0] || "";
}

function truncate(value, max) {
  const text = String(value || "");
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
