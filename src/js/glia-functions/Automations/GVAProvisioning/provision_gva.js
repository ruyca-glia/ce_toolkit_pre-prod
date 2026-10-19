import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

// provision_gva.js
// Triggers GVA bot provisioning for one Jira ticket by invoking the gva-provisioning-service Lambda asynchronously.
// The Lambda takes 5-10 minutes and reports progress and the final result to the #gva-success Slack channel,
// so this function only confirms that the invoke was accepted and returns a job_id.

// env -> Lambda name + region (same mapping as provision_bot.sh).
// Only dev is allowed while our credentials are dev-only. Adding staging/prod later = one entry here.
const LAMBDA_TARGETS = {
  dev: { name: "k8s-dev-gva-provisioning-service", region: "us-west-2" }
};

const GVA_TYPES = ["CHAT", "PHONE", "OA", "EA"];
const REQUIRED_STRINGS = [
  "env", "client_name", "language_country", "bot_category", "gva_type", "cms_base_customer_name",
  "atlas_existing_customer", "domain", "gva_generation", "account_id", "site_id"
];
const BOOLEAN_FLAGS = ["big_enabled", "use_template_content", "copy_instance_usergoals"];

let cachedCreds = null;
let cachedAt = 0;
const CACHE_MS = 10 * 60 * 1000; // 10 min

export async function onInvoke(request, env) {
  const started = Date.now();
  try {
    let envelope = {};
    try {
      envelope = await request.json();
    } catch (e) {
      return Response.json({ success: false, error: "Failed to parse request body" });
    }

    let payload = {};
    try {
      payload = typeof envelope.payload === 'string' ? JSON.parse(envelope.payload) : (envelope.payload || {});
    } catch (e) {
      return Response.json({ success: false, error: "Failed to parse inner payload string" });
    }

    const { issueKey, params } = payload;
    if (envelope.invoker) console.log("Invoked by:", JSON.stringify(envelope.invoker));
    console.log(`Provisioning request for ticket: ${issueKey}`);

    const validationError = validateParams(issueKey, params);
    if (validationError) {
      return Response.json({ success: false, error: validationError, durationMs: Date.now() - started });
    }

    const target = LAMBDA_TARGETS[params.env];
    const jobId = crypto.randomUUID();
    const lambdaPayload = buildLambdaPayload(params, issueKey, jobId);
    console.log(`Job ${jobId}: invoking ${target.name} (${target.region}) with`, JSON.stringify(lambdaPayload));

    const credentials = await getProvisioningCreds(env);
    const lambda = new LambdaClient({ region: target.region, credentials });
    const result = await lambda.send(new InvokeCommand({
      FunctionName: target.name,
      InvocationType: "Event",
      Payload: new TextEncoder().encode(JSON.stringify(lambdaPayload))
    }));

    // An async (Event) invoke answers 202 once the Lambda has accepted the event.
    if (result.StatusCode !== 202) {
      throw new Error(`Unexpected Lambda status code ${result.StatusCode}`);
    }

    console.log(`Job ${jobId}: accepted by ${target.name}`);
    return Response.json({
      success: true,
      jobId,
      lambda: target.name,
      statusCode: result.StatusCode,
      durationMs: Date.now() - started
    });

  } catch (error) {
    // Return the AWS error name, not a stack trace. Default 200 status on purpose: a non-2xx status makes Glia
    // replace this JSON with its own 502, and the frontend would never see the error.
    console.error("Orchestrator Error:", error);
    return Response.json({
      success: false,
      error: `${error.name}: ${error.message}`,
      durationMs: Date.now() - started
    });
  }
}

// Checks the params built by the frontend (buildProvisioningParams). The flag rules live there; this only
// checks the payload shape. Returns an error message, or null when everything is valid.
function validateParams(issueKey, params) {
  if (!issueKey || typeof issueKey !== 'string') return "Missing issueKey";
  if (!params || typeof params !== 'object') return "Missing params";

  for (const field of REQUIRED_STRINGS) {
    if (typeof params[field] !== 'string' || !params[field].trim()) return `Missing or empty param "${field}"`;
  }
  for (const flag of BOOLEAN_FLAGS) {
    if (typeof params[flag] !== 'boolean') return `Param "${flag}" must be true or false`;
  }
  if (!LAMBDA_TARGETS[params.env]) {
    return `Environment "${params.env}" is not allowed. Allowed: ${Object.keys(LAMBDA_TARGETS).join(", ")}`;
  }
  if (!GVA_TYPES.includes(params.gva_type)) return `Invalid gva_type "${params.gva_type}"`;
  return null;
}

// Builds the event exactly like provision_bot.sh does. Only known params are forwarded (no extra fields from the
// request). big_enabled goes as the string "true"/"false": provisioning.py passes it straight into a subprocess
// argument list, where a boolean would fail. job_id and ticket are only for matching the Lambda's logs.
function buildLambdaPayload(params, issueKey, jobId) {
  const payload = {};
  for (const field of REQUIRED_STRINGS) {
    if (field !== "env") payload[field] = params[field].trim();
  }
  payload.big_enabled = params.big_enabled ? "true" : "false";
  payload.use_template_content = params.use_template_content;
  payload.copy_instance_usergoals = params.copy_instance_usergoals;
  payload.job_id = jobId;
  payload.ticket = issueKey;
  return payload;
}

// Reads the gva-dev credentials from Secrets Manager, using the bootstrap IAM keys from the env vars
// (see UsingIAMCredentialsForGVA.md). Never log these values.
async function getProvisioningCreds(env) {
  if (cachedCreds && Date.now() - cachedAt < CACHE_MS) {
    console.log("Using cached provisioning credentials.");
    return cachedCreds;
  }

  for (const key of ["aws:accessKeyId", "aws:secretAccessKey", "AWS_REGION", "GVA_DEV_SECRET_ID"]) {
    if (!env[key]) throw new Error(`Missing env var ${key}`);
  }

  console.log("Fetching provisioning credentials from AWS Secrets Manager...");
  const sm = new SecretsManagerClient({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env["aws:accessKeyId"],
      secretAccessKey: env["aws:secretAccessKey"]
    }
  });

  const res = await sm.send(new GetSecretValueCommand({ SecretId: env.GVA_DEV_SECRET_ID }));
  const secret = JSON.parse(res.SecretString);
  if (!secret.AWS_ACCESS_KEY_ID || !secret.AWS_SECRET_ACCESS_KEY) {
    throw new Error("The provisioning secret does not contain AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY");
  }

  cachedCreds = {
    accessKeyId: secret.AWS_ACCESS_KEY_ID,
    secretAccessKey: secret.AWS_SECRET_ACCESS_KEY
  };
  cachedAt = Date.now();
  return cachedCreds;
}
