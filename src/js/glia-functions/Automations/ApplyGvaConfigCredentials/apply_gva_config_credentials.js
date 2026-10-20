import {
  AppConfigClient,
  ListApplicationsCommand,
  ListEnvironmentsCommand,
  ListConfigurationProfilesCommand,
  ListHostedConfigurationVersionsCommand,
  GetHostedConfigurationVersionCommand,
  CreateHostedConfigurationVersionCommand,
  StartDeploymentCommand
} from "@aws-sdk/client-appconfig";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

const APPLICATION_BY_PAYLOAD = {
  coreConfig: "gva-chat-adapter",
  credentials: "gva-core"
};

const CACHE_MS = 10 * 60 * 1000;
let cachedCreds = null;
let cachedAt = 0;

export async function onInvoke(request, env) {
  const started = Date.now();
  try {
    const envelope = await request.json();
    const payload = unwrapPayload(envelope);

    const iamCreds = await getAppConfigCreds(env);
    const appconfig = new AppConfigClient({
      region: readEnvString(env, ["AWS_REGION", "region"]) || "us-east-1",
      credentials: async () => iamCreds
    });

    if (payload.operation === "list") {
      const apps = await listAll(appconfig, ListApplicationsCommand);
      return Response.json({
        success: true,
        result: apps.map((app) => ({ id: app.Id, name: app.Name })),
        durationMs: Date.now() - started
      });
    }

    const { issueKey, botName, coreConfig, credentials } = payload;
    if (coreConfig === undefined && credentials === undefined) {
      return Response.json({ success: false, error: "Provide either coreConfig or credentials" }, { status: 400 });
    }
    if (coreConfig !== undefined && credentials !== undefined) {
      return Response.json({ success: false, error: "Send coreConfig and credentials in separate requests" }, { status: 400 });
    }

    const profileName = String(botName || "").trim();
    if (!profileName) {
      return Response.json({ success: false, error: "botName is required so the configuration profile can be found" }, { status: 400 });
    }

    let content;
    let applicationName;
    if (coreConfig !== undefined) {
      if (!isPlainObject(coreConfig) || Object.keys(coreConfig).length === 0) {
        return Response.json({ success: false, error: "coreConfig must be a non-empty JSON object" }, { status: 400 });
      }
      applicationName = APPLICATION_BY_PAYLOAD.coreConfig;
      content = coreConfig;
    } else {
      if (!credentials?.secrets || !("api_key_id" in credentials.secrets) || !("api_key_secret" in credentials.secrets)) {
        return Response.json({
          success: false,
          error: 'credentials must be { "secrets": { "api_key_id": "", "api_key_secret": "" } }'
        }, { status: 400 });
      }
      applicationName = APPLICATION_BY_PAYLOAD.credentials;
      content = credentials;
    }

    const application = await findNamedItem(
      () => listAll(appconfig, ListApplicationsCommand),
      applicationName,
      "application"
    );
    const environment = await findEnvironment(appconfig, application.Id, env);
    const profile = await findNamedItem(
      () => listAll(appconfig, ListConfigurationProfilesCommand, { ApplicationId: application.Id }),
      profileName,
      "configuration profile"
    );

    const existing = await getLatestHostedContent(appconfig, application.Id, profile.Id);
    const nextContent = existing && isPlainObject(existing) ? deepMerge(existing, content) : content;

    const version = await appconfig.send(new CreateHostedConfigurationVersionCommand({
      ApplicationId: application.Id,
      ConfigurationProfileId: profile.Id,
      Content: new TextEncoder().encode(JSON.stringify(nextContent)),
      ContentType: "application/json"
    }));

    const deployment = await appconfig.send(new StartDeploymentCommand({
      ApplicationId: application.Id,
      EnvironmentId: environment.Id,
      ConfigurationProfileId: profile.Id,
      ConfigurationVersion: String(version.VersionNumber),
      DeploymentStrategyId: env.APPCONFIG_DEPLOYMENT_STRATEGY_ID || "AppConfig.AllAtOnce"
    }));

    const result = {
      application: application.Name,
      environment: environment.Name,
      profile: profile.Name,
      versionNumber: version.VersionNumber,
      deploymentNumber: deployment.DeploymentNumber,
      state: deployment.State
    };

    return Response.json({
      success: true,
      result,
      durationMs: Date.now() - started,
      summary: {
        item: issueKey || profileName,
        action: coreConfig
          ? `Updated ${application.Name} profile ${profile.Name}`
          : `Updated ${application.Name} credentials profile ${profile.Name}`,
        status: "OK",
        logs: [
          `Application ${application.Name}`,
          `Profile ${profile.Name}`,
          `Environment ${environment.Name}`,
          `Hosted version ${version.VersionNumber}`,
          `Deployment ${deployment.DeploymentNumber} (${deployment.State || "started"})`
        ]
      }
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: `${error.name || "Error"}: ${error.message}`,
      durationMs: Date.now() - started
    }, { status: error.statusCode || 500 });
  }
}

async function getAppConfigCreds(env) {
  if (cachedCreds && Date.now() - cachedAt < CACHE_MS) return cachedCreds;

  const bootstrap = normalizeIamCreds({
    accessKeyId: readEnvString(env, ["aws:accessKeyId", "AWS_ACCESS_KEY_ID", "accessKeyId"]),
    secretAccessKey: readEnvString(env, ["aws:secretAccessKey", "AWS_SECRET_ACCESS_KEY", "secretAccessKey"])
  });
  if (!bootstrap) {
    const error = new Error("aws:accessKeyId and aws:secretAccessKey must be set on the Glia Function");
    error.name = "ConfigurationError";
    throw error;
  }

  const secretId = readEnvString(env, ["APPCONFIG_SECRET_ID"]);
  let creds = bootstrap;
  if (secretId) {
    const region = readEnvString(env, ["AWS_REGION", "region"]) || "us-east-1";
    const sm = new SecretsManagerClient({ region, credentials: async () => bootstrap });
    const res = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));
    const secret = parseSecretString(res.SecretString);
    creds = normalizeIamCreds(secret);
    if (!creds) {
      const error = new Error("APPCONFIG_SECRET_ID resolved, but the secret has no accessKeyId/secretAccessKey or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY");
      error.name = "ConfigurationError";
      throw error;
    }
  }

  cachedCreds = creds;
  cachedAt = Date.now();
  return cachedCreds;
}

function readEnvString(env, keys) {
  if (!env) return "";
  for (const key of keys) {
    let value = env[key];
    if (value && typeof value.then === "function") continue;
    if (value == null || value === "") continue;
    if (typeof value === "object" && typeof value.value === "string") value = value.value;
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function parseSecretString(raw) {
  if (!raw) return {};
  if (isPlainObject(raw)) return raw;
  if (typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw);
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeIamCreds(source) {
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return null;
    }
  }
  if (!isPlainObject(source)) return null;
  const accessKeyId = firstString(source, ["accessKeyId", "AWS_ACCESS_KEY_ID", "aws:accessKeyId"]);
  const secretAccessKey = firstString(source, ["secretAccessKey", "AWS_SECRET_ACCESS_KEY", "aws:secretAccessKey"]);
  if (!accessKeyId || !secretAccessKey) return null;
  return { accessKeyId, secretAccessKey };
}

function firstString(source, keys) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

async function listAll(client, Command, extra = {}) {
  const items = [];
  let NextToken;
  do {
    const res = await client.send(new Command({ ...extra, NextToken }));
    items.push(...(res.Items || []));
    NextToken = res.NextToken;
  } while (NextToken);
  return items;
}

async function findNamedItem(loadItems, name, kind) {
  const wanted = name.trim().toLowerCase();
  const items = await loadItems();
  const match = items.find((item) => String(item.Name || "").trim().toLowerCase() === wanted);
  if (match) return match;

  const error = new Error(`${kind} "${name}" was not found. Available: ${items.map((item) => item.Name).filter(Boolean).join(", ") || "(none)"}`);
  error.name = "NotFoundError";
  error.statusCode = 404;
  throw error;
}

async function findEnvironment(client, applicationId, env) {
  const preferred = String(env.APPCONFIG_ENVIRONMENT_NAME || "dev").trim().toLowerCase();
  const items = await listAll(client, ListEnvironmentsCommand, { ApplicationId: applicationId });
  const match = items.find((item) => String(item.Name || "").trim().toLowerCase() === preferred)
    || items.find((item) => String(item.Name || "").trim().toLowerCase() === "gva-dev")
    || items.find((item) => String(item.Name || "").toLowerCase().includes("dev"));
  if (match) return match;

  const error = new Error(`No dev environment found for this application. Available: ${items.map((item) => item.Name).filter(Boolean).join(", ") || "(none)"}`);
  error.name = "NotFoundError";
  error.statusCode = 404;
  throw error;
}

async function getLatestHostedContent(client, applicationId, profileId) {
  const versions = await listAll(client, ListHostedConfigurationVersionsCommand, {
    ApplicationId: applicationId,
    ConfigurationProfileId: profileId
  });
  if (!versions.length) return null;

  const latest = versions.reduce((best, item) => (
    Number(item.VersionNumber) > Number(best.VersionNumber) ? item : best
  ));

  const hosted = await client.send(new GetHostedConfigurationVersionCommand({
    ApplicationId: applicationId,
    ConfigurationProfileId: profileId,
    VersionNumber: latest.VersionNumber
  }));

  try {
    const raw = hosted.Content;
    const text = typeof raw === "string"
      ? raw
      : new TextDecoder().decode(raw);
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function unwrapPayload(envelope) {
  if (!isPlainObject(envelope)) return {};
  if (!("payload" in envelope)) return envelope;
  const raw = envelope.payload;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return isPlainObject(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return isPlainObject(raw) ? raw : {};
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, patch) {
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch;
  const out = { ...base };
  Object.keys(patch).forEach((key) => {
    out[key] = isPlainObject(base[key]) && isPlainObject(patch[key])
      ? deepMerge(base[key], patch[key])
      : patch[key];
  });
  return out;
}
