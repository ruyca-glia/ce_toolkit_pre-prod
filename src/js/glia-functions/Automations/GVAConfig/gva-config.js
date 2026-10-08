import {
  AppConfigClient,
  CreateHostedConfigurationVersionCommand,
  StartDeploymentCommand,
} from "@aws-sdk/client-appconfig";

export async function onInvoke(request, env) {
  async function createGliaApiKey(operatorId, bearerToken) {
    const endpoint = `https://api.glia.com/operators/${operatorId}/api_keys`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/vnd.salemove.v1+json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken.trim()}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Glia API Error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();

    return {
      apiKeyId: data.id,
      apiSecret: data.secret,
    };
  }

  try {
    const credentials = await createGliaApiKey("", "");
    console.log("ID:", credentials.apiKeyId);
    console.log("Secret:", credentials.apiSecret);
  } catch (error) {
    console.error("Failed to create key:", error.message);
  }

  async function updateGvaAppConfig(env, apiKeyId, apiSecret) {
    const appConfig = new AppConfigClient({
      region: env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Target AppConfig Identifiers (Passed via env)
    const applicationId = env.AWS_APPCONFIG_APPLICATION_ID;
    const profileId = env.AWS_APPCONFIG_PROFILE_ID;
    const environmentId = env.AWS_APPCONFIG_ENVIRONMENT_ID;
    const deploymentStrategyId =
      env.AWS_APPCONFIG_DEPLOYMENT_STRATEGY_ID || "AppConfig.AllAtOnce";

    // Structure required by the GVA Chat Adapter
    const newProfileConfig = {
      secrets: {
        api_key_id: apiKeyId,
        api_key_secret: apiSecret,
      },
    };
    const contentBuffer = Buffer.from(
      JSON.stringify(newProfileConfig, null, 2),
    );

    // 1. Create Hosted Configuration Version
    const versionResponse = await appConfig.send(
      new CreateHostedConfigurationVersionCommand({
        ApplicationId: applicationId,
        ConfigurationProfileId: profileId,
        ContentType: "application/json",
        Content: contentBuffer,
        Description: `GVA Credentials for Site ${siteId} (Ticket: ${issueKey || "Manual"})`,
      }),
    );

    const newVersion = versionResponse.VersionNumber;

    // 2. Deploy Configuration to Environment
    await appConfig.send(
      new StartDeploymentCommand({
        ApplicationId: applicationId,
        EnvironmentId: environmentId,
        ConfigurationProfileId: profileId,
        ConfigurationVersion: String(newVersion),
        DeploymentStrategyId: deploymentStrategyId,
        Description: "<Ticket_Number>",
      }),
    );

    return newVersion;
  }
}

// async function testLocally() {
//   console.log("Starting local test...");
//   await onInvoke();
// }

// testLocally();
