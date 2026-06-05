// auth0_retrieveuser.js
async function onInvoke(request, env) {
  // 1. Credentials and Setup
  // It is highly recommended to use env.AUTH0_TOKEN instead of hardcoding
  const email = request.input.email || "carlos.gomez@glia.com";
  const apiToken = '';
  const baseUrl = 'https://finn-ai-customer-portal.auth0.com/api/v2/users';

  const commonHeaders = {
    'Authorization': `Bearer ${apiToken}`,
    'Accept': 'application/json',
  };

  try {
    // --- STEP 1: Search User by Email ---
    // In fetch, we manually append the query string
    const searchUrl = `${baseUrl}?q=${encodeURIComponent(email)}`;
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: commonHeaders
    });

    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.statusText}`);
    }

    const users = await searchResponse.json();

    // Check if user exists
    if (!users || users.length === 0) {
      return {
        notFound: true,
        message: `No user found for email: ${email}`
      };
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

    // Return the final profile data to the bot flow
    return {
      success: true,
      profile: fullProfile
    };

  } catch (error) {
    console.error('Error in Auth0 Glia Function:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export { onInvoke };