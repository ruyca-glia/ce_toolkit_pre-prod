// auth0_retrieveuser.js
async function onInvoke(request, env) {

  let envelope = {};
  try {
    envelope = await request.json();
  } catch (e) {
    return Response.json({ error: "Failed to parse request body" }, { status: 400 });
  }

  let body = {};
  try {
    if (typeof envelope.payload === 'string') {
      body = JSON.parse(envelope.payload);
    } else {
      body = envelope.payload || {};
    }
  } catch (e) {
    return Response.json({ error: "Failed to parse inner payload string" }, { status: 400 });
  }

  const email = body.userEmail || "";
  
  // 0 DRAMA: Sacamos el token directo de la "maleta" que nos mandó el Orquestador
  const apiToken = body.auth0Token;

  if (!apiToken) {
    return Response.json({ success: false, error: "Missing Auth0 token in payload" }, { status: 401 });
  }
  
  const baseUrl = 'https://finn-ai-customer-portal.auth0.com/api/v2/users';

  const commonHeaders = {
    "Authorization": `Bearer ${apiToken}`,
    "Accept": "application/json"
  };

  try {
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

    if (!users || users.length === 0) {
      return Response.json({
        success: true, // Corregido un pequeño typo que tenías aquí ("sucess")
        found: false,
        message: `No user found for email: ${email}`
      });
    }

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

    return Response.json({
      success: true,
      count: users.length,
      found: true,
      profile: fullProfile // Devolvemos el primer match
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.name,
      message: error.message
    });
  }
}

export { onInvoke };