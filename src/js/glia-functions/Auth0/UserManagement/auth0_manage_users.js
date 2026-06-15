/**
 * auth0_manage_users.js
 * Refactored to accept pre-calculated metadata from the Applet UI.
 */
async function onInvoke(request, env) {
  // 1a. Parse the outer Glia Envelope
  let envelope = {};
  try {
    envelope = await request.json();
  } catch (e) {
    return Response.json({ error: "Failed to parse request body" }, { status: 400 });
  }

  // 1b. Parse the inner Payload
  let requestBody = {};
  try {
    requestBody = typeof envelope.payload === 'string' 
      ? JSON.parse(envelope.payload) 
      : envelope.payload || {};
  } catch (e) {
    return Response.json({ error: "Failed to parse inner payload string" }, { status: 400 });
  }

  const action = requestBody.action;
  const user = requestBody.user;
  const apiToken = 'request.headers.get("X-Auth0-Token")';
  const baseUrl = 'https://finn-ai-customer-portal.auth0.com/api/v2/users';

  // Basic Validation
  if (!user || !user.email) {
    return Response.json({ success: false, error: "Missing user data or email in request" }, { status: 400 });
  }

  if (action === "add") {
    try {
      const generatedPassword = generateSecurePassword();

      const auth0Body = {
        "email": user.email,
        "user_metadata": user.metadata, // Using pre-calculated metadata from Applet
        "blocked": false,
        "email_verified": false,
        "app_metadata": {},
        "name": user.email,
        "connection": "customer-portal-users",
        "password": generatedPassword,
        "verify_email": false
      };

      const auth0Response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify(auth0Body)
      });

      const result = await auth0Response.json();

      if (!auth0Response.ok) {
        return Response.json({
          success: false,
          error: result.message || "Failed to create user in Auth0",
          details: result
        }, { status: auth0Response.status });
      }

      return Response.json({
        success: true,
        message: `User created successfully for ${user.email}`,
        auth0_user_id: result.user_id,
        generated_password: generatedPassword
      });

    } catch (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  else if (action === "update") {
    try {
      const profile = requestBody.profile; // Current Auth0 profile for ID retrieval
      
      if (!profile || !profile.user_id) {
        throw new Error("Missing Auth0 profile or user_id for update action.");
      }

      const userId = profile.user_id;

      const patchBody = {
        "user_metadata": user.metadata
      };

      const patchResponse = await fetch(`${baseUrl}/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify(patchBody)
      });

      const patchResult = await patchResponse.json();

      if (!patchResponse.ok) {
        return Response.json({
          success: false,
          error: "Failed to update user metadata in Auth0",
          details: patchResult
        }, { status: patchResponse.status });
      }

      return Response.json({
        success: true,
        message: `User ${user.email} metadata updated successfully.`,
        updated_metadata: patchResult.user_metadata
      });

    } catch (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  return Response.json({ success: false, error: "Invalid action provided" }, { status: 400 });
}

/**
 * Helper: Generates a secure password. 15 char long, numbers and letters
 */
function generateSecurePassword() {
  const length = 15;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let retVal = "";
  for (let i = 0; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return retVal;
}

export { onInvoke };