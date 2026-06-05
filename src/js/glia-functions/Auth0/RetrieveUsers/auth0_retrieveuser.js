// auth0_retrieveuser.js
async function onInvoke(request, env) {
  // 1. Credentials and Setup
  //const email = "carlos.gomez@glia.com";

  // 1a. Parse the outer Glia Envelope
  let envelope = {};
  try {
    envelope = await request.json();
  } catch (e) {
    return Response.json({ error: "Failed to parse request body" }, { status: 400 });
  }

  // 1b. Parse the inner Payload String
  let body = {};
  try {
    if (typeof envelope.payload === 'string') {
      body = JSON.parse(envelope.payload);
    } else {
      // Fallback in case Glia sometimes passes it as an object
      body = envelope.payload || {};
    }
  } catch (e) {
    return Response.json({ error: "Failed to parse inner payload string" }, { status: 400 });
  }

  const email = body.userEmail || "";
  const apiToken = '..'
  
  const baseUrl = 'https://finn-ai-customer-portal.auth0.com/api/v2/users';

  const commonHeaders = {
    "Authorization": `Bearer ${apiToken}`,
    "Accept": "application/json"
  };

  try {
    // 2. Búsqueda por email
    const query = encodeURIComponent(`email:"${email}"`);
    const searchUrl = `${baseUrl}?q=${query}`;

    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: commonHeaders
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      return Response.json({
        success: false,
        status: searchResponse.status,
        error: errorText
      });
    }

    const users = await searchResponse.json();

    // Check if user exists
    if (!users || users.length === 0) {
      return Response.json({
        sucess: true,
        found: false,
        message: `No user found for email: ${email}`
      });
    }

    // Extract the user_id from the first result
    const userId = users[0].user_id;

    // --- STEP 2: Get Full User Auth0 Profile ---
    const profileUrl = `${baseUrl}/${encodeURIComponent(userId)}`;
    const profileResponse = await fetch(profileUrl, {
      method: 'GET',
      headers: commonHeaders
    });

    if (!profileResponse.ok) {
      throw new Error(`Profile fetch failed: ${profileResponse.statusText}`);
    }

    const fullProfile = await profileResponse.json();

    // 3. Respuesta Final usando Response.json()
    return Response.json({
      success: true,
      count: users.length,
      found: true,
      profile: fullProfile // Devolvemos el primer match
    });

  } catch (error) {
    // Manejo de errores de red o ejecución
    return Response.json({
      success: false,
      error: error.name,
      message: error.message
    });
  }
}

export { onInvoke };