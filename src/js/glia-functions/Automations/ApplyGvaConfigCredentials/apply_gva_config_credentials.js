import {
  AppConfigClient,
  GetApplicationCommand,
  GetConfigurationProfileCommand,
  GetEnvironmentCommand,
  ListApplicationsCommand,
  ListEnvironmentsCommand,
  ListConfigurationProfilesCommand,
  ListHostedConfigurationVersionsCommand,
  GetHostedConfigurationVersionCommand,
  CreateHostedConfigurationVersionCommand,
  StartDeploymentCommand
} from "@aws-sdk/client-appconfig";
import {
  AppConfigDataClient,
  GetLatestConfigurationCommand,
  StartConfigurationSessionCommand
} from "@aws-sdk/client-appconfigdata";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

const APPLICATION_BY_PAYLOAD = {
  coreConfig: "gva-core",
  credentials: "gva-chat-adapter"
};

const CACHE_MS = 10 * 60 * 1000;
let cachedCreds = null;
let cachedAt = 0;

export async function onInvoke(request, env) {
  const started = Date.now();
  const log = (msg) => console.log(`[${Date.now() - started}ms] ${msg}`);
  try {
    log("invoke start");
    const envelope = await request.json();
    const payload = unwrapPayload(envelope);
    if (envelope.invoker) log(`invoker: ${envelope.invoker.email || envelope.invoker.id || "unknown"}`);
    log(`payload keys: ${Object.keys(payload).join(", ") || "(none)"}`);

    const region = readEnvString(env, ["AWS_REGION", "region"]) || "us-west-2";
    log(`region=${region} envKeys=${listPresentEnvKeys(env)}`);
    const iamCreds = await getAppConfigCreds(env, log);
    const appconfig = new AppConfigClient({
      region,
      credentials: async () => iamCreds
    });

    if (payload.operation === "list") {
      log("operation=list: resolve known GVA applications");
      const apps = [];
      for (const name of Object.values(APPLICATION_BY_PAYLOAD)) {
        try {
          const app = await resolveApplication(appconfig, name, env, log);
          apps.push({ id: app.Id, name: app.Name });
        } catch (error) {
          log(`list ${name} failed: ${error.name || "Error"}: ${shortError(error)}`);
          apps.push({ name, error: `${error.name || "Error"}: ${shortError(error)}` });
        }
      }
      return Response.json({
        success: apps.some((app) => app.id),
        result: apps,
        durationMs: Date.now() - started
      });
    }

    if (payload.operation === "get") {
      return getBotConfiguration(appconfig, iamCreds, env, payload, log, started, region);
    }

    const { issueKey, botName, coreConfig, credentials } = payload;
    log(`ticket=${issueKey || "AD-HOC"} botName=${botName || "(missing)"} hasCoreConfig=${coreConfig !== undefined} hasCredentials=${credentials !== undefined}`);
    if (coreConfig === undefined && credentials === undefined) {
      log("reject: neither coreConfig nor credentials");
      return Response.json({ success: false, error: "Provide either coreConfig or credentials" });
    }
    if (coreConfig !== undefined && credentials !== undefined) {
      log("reject: both coreConfig and credentials in one request");
      return Response.json({ success: false, error: "Send coreConfig and credentials in separate requests" });
    }

    const profileName = String(botName || "").trim();
    if (!profileName) {
      log("reject: missing botName");
      return Response.json({ success: false, error: "botName is required so the configuration profile can be found" });
    }

    let content;
    let applicationName;
    if (coreConfig !== undefined) {
      if (!isPlainObject(coreConfig) || Object.keys(coreConfig).length === 0) {
        log("reject: empty coreConfig");
        return Response.json({ success: false, error: "coreConfig must be a non-empty JSON object" });
      }
      applicationName = APPLICATION_BY_PAYLOAD.coreConfig;
      content = coreConfig;
      log(`kind=coreConfig application=${applicationName} keys=${Object.keys(coreConfig).length}`);
    } else {
      if (!credentials?.secrets || !("api_key_id" in credentials.secrets) || !("api_key_secret" in credentials.secrets)) {
        log("reject: credentials missing secrets.api_key_id / secrets.api_key_secret");
        return Response.json({
          success: false,
          error: 'credentials must be { "secrets": { "api_key_id": "", "api_key_secret": "" } }'
        });
      }
      applicationName = APPLICATION_BY_PAYLOAD.credentials;
      content = credentials;
      const id = String(credentials.secrets.api_key_id || "");
      log(`kind=credentials application=${applicationName} api_key_id=${id ? `${id.slice(0, 5)}…` : "(empty)"} api_key_secret=${credentials.secrets.api_key_secret ? "set" : "empty"}`);
    }

    const application = await resolveApplication(appconfig, applicationName, env, log);
    log(`found application ${application.Name} id=${application.Id}`);

    const environment = await resolveEnvironment(appconfig, application.Id, applicationName, env, log);
    log(`found environment ${environment.Name} id=${environment.Id}`);

    const profile = await resolveProfile(appconfig, application.Id, profileName, log);
    log(`found profile ${profile.Name} id=${profile.Id}`);

    log("Get latest hosted configuration version");
    const existing = await getLatestHostedContent(appconfig, application.Id, profile.Id, log);
    const nextContent = existing && isPlainObject(existing) ? deepMerge(existing, content) : content;
    log(`hosted content ${existing ? "merged onto latest version" : "none; creating from submitted JSON"}`);

    log("CreateHostedConfigurationVersion");
    const version = await appconfig.send(new CreateHostedConfigurationVersionCommand({
      ApplicationId: application.Id,
      ConfigurationProfileId: profile.Id,
      Content: new TextEncoder().encode(JSON.stringify(nextContent)),
      ContentType: "application/json"
    }));
    log(`created hosted version ${version.VersionNumber}`);

    const strategy = env.APPCONFIG_DEPLOYMENT_STRATEGY_ID || "AppConfig.AllAtOnce";
    log(`StartDeployment strategy=${strategy}`);
    const deployment = await appconfig.send(new StartDeploymentCommand({
      ApplicationId: application.Id,
      EnvironmentId: environment.Id,
      ConfigurationProfileId: profile.Id,
      ConfigurationVersion: String(version.VersionNumber),
      DeploymentStrategyId: strategy
    }));
    log(`deployment ${deployment.DeploymentNumber} state=${deployment.State || "started"}`);

    const result = {
      application: application.Name,
      environment: environment.Name,
      profile: profile.Name,
      versionNumber: version.VersionNumber,
      deploymentNumber: deployment.DeploymentNumber,
      state: deployment.State
    };

    log(`done ${JSON.stringify(result)}`);
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
    console.error(`[${Date.now() - started}ms] ApplyGvaConfigCredentials failed: ${error.name || "Error"}: ${error.message}`);
    return Response.json({
      success: false,
      error: `${error.name || "Error"}: ${error.message}`,
      durationMs: Date.now() - started
    });
  }
}

async function getBotConfiguration(appconfig, iamCreds, env, payload, log, started, region) {
  const profileName = String(payload.botName || "").trim();
  if (!profileName) {
    return Response.json({ success: false, error: "botName is required so the configuration profile can be found" });
  }

  log(`operation=get botName=${profileName}`);
  const dataClient = new AppConfigDataClient({
    region,
    credentials: async () => iamCreds
  });

  const core = await readBotApplication(
    appconfig,
    dataClient,
    APPLICATION_BY_PAYLOAD.coreConfig,
    profileName,
    env,
    log
  );
  const creds = await readBotApplication(
    appconfig,
    dataClient,
    APPLICATION_BY_PAYLOAD.credentials,
    profileName,
    env,
    log
  );

  const loaded = Boolean(core.content) || Boolean(creds.content);
  if (core.content) {
    log(`coreConfig loaded keys=${isPlainObject(core.content) ? Object.keys(core.content).length : "n/a"}`);
  } else {
    log(`coreConfig missing: ${core.error || "empty"}`);
  }
  if (creds.content) {
    const id = creds.content?.secrets?.api_key_id;
    log(`credentials loaded api_key_id=${id ? `${String(id).slice(0, 5)}…` : "(none)"} api_key_secret=${creds.content?.secrets?.api_key_secret ? "set" : "empty"}`);
  } else {
    log(`credentials missing: ${creds.error || "empty"}`);
  }

  return Response.json({
    success: loaded,
    error: loaded ? undefined : (core.error || creds.error || `No AppConfig profile named "${profileName}"`),
    result: {
      botName: profileName,
      coreConfig: core.content,
      credentials: creds.content,
      core: { application: core.application, environment: core.environment, error: core.error || undefined },
      credentialsMeta: { application: creds.application, environment: creds.environment, error: creds.error || undefined }
    },
    durationMs: Date.now() - started
  });
}

async function readBotApplication(appconfig, dataClient, applicationName, profileName, env, log) {
  try {
    const application = await resolveApplication(appconfig, applicationName, env, log);
    const environment = await resolveEnvironment(appconfig, application.Id, applicationName, env, log);
    try {
      const content = await getDeployedContent(dataClient, [
        { application: applicationName, environment: environment.Name || readEnvString(env, ["APPCONFIG_ENVIRONMENT_NAME"]) || "dev", profile: profileName },
        { application: application.Id, environment: environment.Id, profile: profileName },
        { application: applicationName, environment: environment.Id, profile: profileName }
      ], log);
      return { application: application.Name || applicationName, environment: environment.Name, content };
    } catch (error) {
      log(`deployed ${applicationName}/${profileName} failed: ${error.name || "Error"}: ${shortError(error)}`);
      const hosted = await getLatestHostedContent(appconfig, application.Id, profileName, log);
      if (hosted) return { application: application.Name, environment: environment.Name, content: hosted };
      return {
        application: application.Name,
        environment: environment.Name,
        content: null,
        error: `${error.name || "Error"}: ${shortError(error)}`
      };
    }
  } catch (error) {
    return {
      application: applicationName,
      content: null,
      error: `${error.name || "Error"}: ${shortError(error)}`
    };
  }
}

async function getDeployedContent(client, attempts, log = () => {}) {
  let lastError;
  const seen = new Set();
  for (const attempt of attempts) {
    const application = String(attempt.application || "").trim();
    const environment = String(attempt.environment || "").trim();
    const profile = String(attempt.profile || "").trim();
    if (!application || !environment || !profile) continue;
    const key = `${application}|${environment}|${profile}`;
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      log(`StartConfigurationSession application=${application} environment=${environment} profile=${profile}`);
      const session = await client.send(new StartConfigurationSessionCommand({
        ApplicationIdentifier: application,
        EnvironmentIdentifier: environment,
        ConfigurationProfileIdentifier: profile
      }));
      const latest = await client.send(new GetLatestConfigurationCommand({
        ConfigurationToken: session.InitialConfigurationToken
      }));
      const raw = latest.Configuration;
      if (raw == null) return null;
      const text = typeof raw === "string" ? raw : new TextDecoder().decode(raw);
      if (!text.trim()) return null;
      try {
        return JSON.parse(text);
      } catch {
        log("deployed configuration was not JSON");
        return null;
      }
    } catch (error) {
      lastError = error;
      log(`StartConfigurationSession ${application}/${environment}/${profile} failed: ${error.name || "Error"}: ${shortError(error)}`);
    }
  }
  if (lastError) throw lastError;
  return null;
}

async function getAppConfigCreds(env, log = () => {}) {
  if (cachedCreds && Date.now() - cachedAt < CACHE_MS) {
    log(`using cached IAM creds accessKeyId=${prefixKey(cachedCreds.accessKeyId)}`);
    return cachedCreds;
  }

  const bootstrap = normalizeIamCreds({
    accessKeyId: readEnvString(env, ["aws:accessKeyId", "AWS_ACCESS_KEY_ID", "accessKeyId"]),
    secretAccessKey: readEnvString(env, ["aws:secretAccessKey", "AWS_SECRET_ACCESS_KEY", "secretAccessKey"])
  });
  if (!bootstrap) {
    const error = new Error("aws:accessKeyId and aws:secretAccessKey must be set on the Glia Function");
    error.name = "ConfigurationError";
    throw error;
  }
  log(`bootstrap IAM accessKeyId=${prefixKey(bootstrap.accessKeyId)} secretAccessKey=${bootstrap.secretAccessKey ? "set" : "missing"}`);

  const secretId = readEnvString(env, ["APPCONFIG_SECRET_ID"]);
  let creds = bootstrap;
  if (secretId) {
    const smRegion = readEnvString(env, ["AWS_SECRETS_REGION", "SECRETS_MANAGER_REGION"]) || "us-east-1";
    log(`GetSecretValue APPCONFIG_SECRET_ID=${secretId} region=${smRegion}`);
    const sm = new SecretsManagerClient({ region: smRegion, credentials: async () => bootstrap });
    const res = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));
    const secret = parseSecretString(res.SecretString);
    log(`secret keys=${Object.keys(secret).join(", ") || "(none)"}`);
    creds = normalizeIamCreds(secret);
    if (!creds) {
      const error = new Error("APPCONFIG_SECRET_ID resolved, but the secret has no accessKeyId/secretAccessKey or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY");
      error.name = "ConfigurationError";
      throw error;
    }
    log(`AppConfig IAM from secret accessKeyId=${prefixKey(creds.accessKeyId)}`);
  } else {
    log("APPCONFIG_SECRET_ID unset; using Hub IAM keys against AppConfig");
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

async function resolveApplication(client, applicationName, env, log = () => {}) {
  const configuredId = readEnvString(env, applicationIdEnvKeys(applicationName));
  if (configuredId) {
    try {
      log(`GetApplication ApplicationId=${configuredId}`);
      const app = await client.send(new GetApplicationCommand({ ApplicationId: configuredId }));
      log(`GetApplication ok name=${app.Name} id=${app.Id}`);
      return app;
    } catch (error) {
      log(`GetApplication ${configuredId} failed: ${error.name || "Error"}: ${shortError(error)}; using configured id`);
      return { Id: configuredId, Name: applicationName };
    }
  }

  try {
    log(`GetApplication ApplicationId=${applicationName}`);
    const app = await client.send(new GetApplicationCommand({ ApplicationId: applicationName }));
    log(`GetApplication ok name=${app.Name} id=${app.Id}`);
    return app;
  } catch (error) {
    log(`GetApplication ${applicationName} failed: ${error.name || "Error"}: ${shortError(error)}`);
  }

  try {
    log(`ListApplications looking for "${applicationName}"`);
    return await findNamedItem(
      () => listAll(client, ListApplicationsCommand),
      applicationName,
      "application"
    );
  } catch (error) {
    const wrapped = new Error(
      `Could not resolve application "${applicationName}". IAM user ce-toolkit-appconfig-k8s-dev cannot ListApplications or GetApplication by name. Set APPCONFIG_GVA_CHAT_ADAPTER_ID / APPCONFIG_GVA_CORE_ID (the gva-dev AppConfig IDs) or ask Ruy/Charlie to allow appconfig:ListApplications. Last error: ${error.name || "Error"}: ${shortError(error)}`
    );
    wrapped.name = error.name || "NotFoundError";
    throw wrapped;
  }
}

function applicationIdEnvKeys(applicationName) {
  if (applicationName === "gva-chat-adapter") {
    return ["APPCONFIG_GVA_CHAT_ADAPTER_ID", "APPCONFIG_APPLICATION_ID"];
  }
  if (applicationName === "gva-core") {
    return ["APPCONFIG_GVA_CORE_ID", "APPCONFIG_APPLICATION_ID"];
  }
  return ["APPCONFIG_APPLICATION_ID"];
}

function environmentIdEnvKeys(applicationName) {
  if (applicationName === "gva-chat-adapter") {
    return ["APPCONFIG_GVA_CHAT_ADAPTER_ENVIRONMENT_ID", "APPCONFIG_ENVIRONMENT_ID"];
  }
  if (applicationName === "gva-core") {
    return ["APPCONFIG_GVA_CORE_ENVIRONMENT_ID", "APPCONFIG_ENVIRONMENT_ID"];
  }
  return ["APPCONFIG_ENVIRONMENT_ID"];
}

async function resolveEnvironment(client, applicationId, applicationName, env, log = () => {}) {
  const preferred = readEnvString(env, ["APPCONFIG_ENVIRONMENT_NAME"]) || "dev";
  const configuredId = readEnvString(env, environmentIdEnvKeys(applicationName));
  if (configuredId) {
    try {
      log(`GetEnvironment ApplicationId=${applicationId} EnvironmentId=${configuredId}`);
      const item = await client.send(new GetEnvironmentCommand({
        ApplicationId: applicationId,
        EnvironmentId: configuredId
      }));
      log(`GetEnvironment ok name=${item.Name} id=${item.Id}`);
      return item;
    } catch (error) {
      log(`GetEnvironment ${configuredId} failed: ${error.name || "Error"}: ${shortError(error)}; using configured id`);
      return { Id: configuredId, Name: preferred };
    }
  }

  const candidates = uniqueStrings([preferred, "gva-dev", "dev"]);
  for (const id of candidates) {
    try {
      log(`GetEnvironment ApplicationId=${applicationId} EnvironmentId=${id}`);
      const item = await client.send(new GetEnvironmentCommand({
        ApplicationId: applicationId,
        EnvironmentId: id
      }));
      log(`GetEnvironment ok name=${item.Name} id=${item.Id}`);
      return item;
    } catch (error) {
      log(`GetEnvironment ${id} failed: ${error.name || "Error"}: ${shortError(error)}`);
    }
  }

  log("ListEnvironments");
  return findEnvironment(client, applicationId, env);
}

async function resolveProfile(client, applicationId, profileName, log = () => {}) {
  try {
    log(`GetConfigurationProfile ApplicationId=${applicationId} ConfigurationProfileId=${profileName}`);
    const profile = await client.send(new GetConfigurationProfileCommand({
      ApplicationId: applicationId,
      ConfigurationProfileId: profileName
    }));
    log(`GetConfigurationProfile ok name=${profile.Name} id=${profile.Id}`);
    return profile;
  } catch (error) {
    log(`GetConfigurationProfile failed: ${error.name || "Error"}: ${shortError(error)}; using bot name as profile id`);
    return { Id: profileName, Name: profileName };
  }
}

async function findNamedItem(loadItems, name, kind) {
  const wanted = name.trim().toLowerCase();
  const items = await loadItems();
  const names = items.map((item) => item.Name).filter(Boolean);
  console.log(`  ${kind} candidates (${items.length}): ${names.join(", ") || "(none)"}`);
  const match = items.find((item) => String(item.Name || "").trim().toLowerCase() === wanted);
  if (match) return match;

  const error = new Error(`${kind} "${name}" was not found. Available: ${names.join(", ") || "(none)"}`);
  error.name = "NotFoundError";
  error.statusCode = 404;
  throw error;
}

async function findEnvironment(client, applicationId, env) {
  const preferred = String(env.APPCONFIG_ENVIRONMENT_NAME || "dev").trim().toLowerCase();
  const items = await listAll(client, ListEnvironmentsCommand, { ApplicationId: applicationId });
  const names = items.map((item) => item.Name).filter(Boolean);
  console.log(`  environment candidates (${items.length}), preferred=${preferred}: ${names.join(", ") || "(none)"}`);
  const match = items.find((item) => String(item.Name || "").trim().toLowerCase() === preferred)
    || items.find((item) => String(item.Name || "").trim().toLowerCase() === "gva-dev")
    || items.find((item) => String(item.Name || "").toLowerCase().includes("dev"));
  if (match) return match;

  const error = new Error(`No dev environment found for this application. Available: ${items.map((item) => item.Name).filter(Boolean).join(", ") || "(none)"}`);
  error.name = "NotFoundError";
  error.statusCode = 404;
  throw error;
}

function uniqueStrings(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const text = String(value || "").trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

function shortError(error) {
  return String(error?.message || error || "").split("\n")[0];
}

async function getLatestHostedContent(client, applicationId, profileId, log = () => {}) {
  let versions;
  try {
    versions = await listAll(client, ListHostedConfigurationVersionsCommand, {
      ApplicationId: applicationId,
      ConfigurationProfileId: profileId
    });
  } catch (error) {
    log(`ListHostedConfigurationVersions failed: ${error.name || "Error"}: ${shortError(error)}; creating from submitted JSON`);
    return null;
  }
  log(`hosted versions=${versions.length}`);
  if (!versions.length) return null;

  const latest = versions.reduce((best, item) => (
    Number(item.VersionNumber) > Number(best.VersionNumber) ? item : best
  ));

  log(`latest hosted version=${latest.VersionNumber}`);
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
    log("latest hosted version was not JSON; treating as empty");
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

function prefixKey(value) {
  const text = String(value || "");
  return text ? `${text.slice(0, 5)}…` : "(missing)";
}

function listPresentEnvKeys(env) {
  const keys = [
    "aws:accessKeyId",
    "aws:secretAccessKey",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "accessKeyId",
    "secretAccessKey",
    "AWS_REGION",
    "region",
    "AWS_SECRETS_REGION",
    "APPCONFIG_SECRET_ID",
    "APPCONFIG_ENVIRONMENT_NAME",
    "APPCONFIG_ENVIRONMENT_ID",
    "APPCONFIG_GVA_CHAT_ADAPTER_ENVIRONMENT_ID",
    "APPCONFIG_GVA_CORE_ENVIRONMENT_ID",
    "APPCONFIG_GVA_CHAT_ADAPTER_ID",
    "APPCONFIG_GVA_CORE_ID",
    "APPCONFIG_APPLICATION_ID",
    "APPCONFIG_DEPLOYMENT_STRATEGY_ID"
  ];
  return keys.filter((key) => Boolean(readEnvString(env, [key]))).join(",") || "(none of the expected keys)";
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
