import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const auth0LookupUrl = 'https://api.glia.com/integrations/fd8376f1-25d0-4c68-bf48-9e280e01210b/endpoint';
const auth0UserMgmtUrl = 'https://api.glia.com/integrations/f1a01947-9818-49da-9e31-7f6557c2a3d8/endpoint';
const auth0RoleSyncUrl = 'https://api.glia.com/integrations/60b1e6c7-467c-4bf8-bab1-0e8f5783a333/endpoint';

let cachedAuth0Token = null;
let tokenExpirationTime = 0;

let cachedGliaToken = null;
let gliaTokenExpirationTime = 0;

export async function onInvoke(request, env) {
  try {
    const envelope = await request.json();
    const payload = typeof envelope.payload === 'string' ? JSON.parse(envelope.payload) : envelope.payload;

    // CAMBIO QUIRÚRGICO 1: Recibimos 'userEmail' en lugar del arreglo 'masterEmails'
    const { issueKey, userEmail, uatEmails, prodEmails, baseRoles, botCodes, timezone } = payload;

    const token = await getAuth0Token(env);
    const gliaBearerToken = await getGliaToken(env);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${gliaBearerToken}`
    };

    const mockIssue = { key: issueKey };

    // CAMBIO QUIRÚRGICO 2: Quitamos el 'for loop' y procesamos directamente el 'userEmail'
    let resultEntry = { email: userEmail, action: "", status: "⌛", logs: [] };

    const logOutput = (msg) => { resultEntry.logs.push(msg); };

    // Como ahora el applet lleva el control de qué número de usuario es, solo imprimimos el correo
    console.log("Getting user..." + userEmail);
    
    // Inyectamos auth0Token en la maleta
    const lookupRes = await fetch(auth0LookupUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userEmail: userEmail, auth0Token: token })
    });
    const lookupData = await lookupRes.json();

    const userRoles = calculateUserRoles(userEmail, baseRoles, uatEmails, prodEmails);
    const userMetadata = calculateUserMetadata(userEmail, botCodes, timezone, lookupData.found ? lookupData.profile : null);
    const userPackage = { email: userEmail, roles: userRoles, metadata: userMetadata, timezone };
    
    console.log("data got: ", JSON.stringify(lookupData));
    
    if (lookupData.found) {
      logOutput(`   -> User already exists. Merging metadata...`);
      resultEntry.action = "Update";
      await triggerUserUpdate(userPackage, lookupData.profile, mockIssue, headers, token, logOutput);
    } else {
      logOutput(`   -> User does not exist. Creating profile...`);
      resultEntry.action = "Creation";
      await triggerUserCreation(userPackage, mockIssue, headers, token, logOutput);
    }

    resultEntry.status = "✅";
    logOutput(`   -> ✅ Process completed!`);
    
    // CAMBIO QUIRÚRGICO 3: Devolvemos el resultado de este único usuario
    return Response.json({ success: true, summary: resultEntry });

  } catch (error) {
    console.error("Orchestrator Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ============================================================================
// LAS FUNCIONES DE ABAJO ESTÁN 100% INTACTAS - NO SE TOCÓ NI UNA SOLA COMA
// ============================================================================

async function triggerUserUpdate(user, profile, issue, headers, token, logOutput) {
  // Inyectamos auth0Token en la maleta
  const mgmtRes = await fetch(auth0UserMgmtUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: "update", user, profile, issue, auth0Token: token })
  });
  await mgmtRes.json();
  logOutput(`   -> Metadata merged: ${user.metadata.portal.cms.length} bot(s) total.`);
}

async function triggerUserCreation(user, issue, headers, token, logOutput) {
  // Inyectamos auth0Token en la maleta
  const mgmtRes = await fetch(auth0UserMgmtUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: "add", user, issue, auth0Token: token })
  });
  const mgmtData = await mgmtRes.json();
  logOutput(`   -> Metadata applied: ${user.metadata.portal.cms.join(', ')}`);
  logOutput(`   -> Syncing roles...`);

  // Inyectamos auth0Token en la maleta
  const roleRes = await fetch(auth0RoleSyncUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId: mgmtData.auth0_user_id, roles: user.roles, auth0Token: token })
  });
  if (roleRes.ok) logOutput(`   -> Roles assigned successfully`);
}

function calculateUserRoles(email, baseRoles, uatEmails, prodEmails) {
  let finalRoles = [...baseRoles];
  const isGlia = email.endsWith('@glia.com');

  if (!isGlia) {
    finalRoles = finalRoles.filter(role =>
      !role.includes("internal_customer_success") &&
      !role.includes("internal_engineering_product")
    );
  }
  if (!uatEmails.includes(email)) finalRoles = finalRoles.filter(role => !role.includes("cms_exporter"));
  if (!prodEmails.includes(email)) finalRoles = finalRoles.filter(role => !role.includes("cms_publisher"));

  return finalRoles;
}

function calculateUserMetadata(email, botCodesRaw, timezone, existingProfile = null) {
  const isGlia = email.endsWith('@glia.com');
  const newCodes = botCodesRaw.split(',').map(s => s.trim()).filter(s => s !== "");

  const existingClientIds = existingProfile?.user_metadata?.clientIds || [];
  const existingCmsIds = existingProfile?.user_metadata?.portal?.cms || [];

  const mergedClientIds = [...new Set([...existingClientIds, ...newCodes])];
  const mergedCmsIds = [...new Set([...existingCmsIds, ...newCodes])];

  return {
    clientIds: isGlia ? [] : mergedClientIds,
    portal: { cms: mergedCmsIds },
    timezone: timezone
  };
}

async function getGliaToken(env) {
  const now = Date.now();
  if (cachedGliaToken && now < gliaTokenExpirationTime) {
    console.log("Using cached Glia token.");
    return cachedGliaToken;
  }

  console.log("Fetching new Glia Bearer token...");
  const res = await fetch('https://api.glia.com/operator_authentication/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key_id: env.GLIA_API_KEY_ID,
      api_key_secret: env.GLIA_API_KEY_SECRET
    })
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Glia token: ${res.status} - ${res.statusText}`);
  }

  const data = await res.json();
  cachedGliaToken = data.token; 
  
  // Aprox 55 minutes before refreshing token
  gliaTokenExpirationTime = now + (3300 * 1000);
  
  return cachedGliaToken;
}

async function getAuth0Token(env) {
  const now = Date.now();
  if (cachedAuth0Token && now < tokenExpirationTime) {
    console.log("Using cached Auth0 token.");
    return cachedAuth0Token;
  }

  console.log("Fetching new Auth0 credentials from AWS...");
  const client = new SecretsManagerClient({
    region: "us-east-2",
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
  });

  const command = new GetSecretValueCommand({
    SecretId: "arn:aws:secretsmanager:us-east-2:404410098344:secret:auth0_m2m_credentials-jcy3Kj"
  });

  const response = await client.send(command);
  const secrets = JSON.parse(response.SecretString);

  const tokenRes = await fetch(`https://finn-ai-customer-portal.auth0.com/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: secrets.AUTH0_ACCESS_KEY_ID, 
      client_secret: secrets.AUTH0_SECRET_ACCESS_KEY,
      audience: "https://finn-ai-customer-portal.auth0.com/api/v2/",
      grant_type: "client_credentials"
    })
  });

  const tokenData = await tokenRes.json();
  cachedAuth0Token = tokenData.access_token;
  tokenExpirationTime = now + ((tokenData.expires_in - 300) * 1000);

  return cachedAuth0Token;
}