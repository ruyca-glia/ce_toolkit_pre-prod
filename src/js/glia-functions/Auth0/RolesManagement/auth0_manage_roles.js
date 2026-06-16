async function onInvoke(request, env) {
  let envelope = {};
  try {
    envelope = await request.json();
  } catch (e) {
    return Response.json({ error: "Failed to parse request body" }, { status: 400 });
  }

  let requestBody = {};
  try {
    requestBody = typeof envelope.payload === 'string' ? JSON.parse(envelope.payload) : envelope.payload || {};
  } catch (e) {
    return Response.json({ error: "Failed to parse inner payload string" }, { status: 400 });
  }

  const userId = requestBody.userId; 
  const jiraRoles = requestBody.roles || []; // ["cms_cell (desc)", "external_cms (...)"]
  
  // 0 DRAMA: Sacamos el token directo del payload
  const apiToken = requestBody.auth0Token;

  if (!apiToken) {
    return Response.json({ success: false, error: "Missing Auth0 token in payload" }, { status: 401 });
  }

  const baseUrl = 'https://finn-ai-customer-portal.auth0.com/api/v2';

  if (!userId) return Response.json({ success: false, error: "Missing userId" }, { status: 400 });

  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    const allRolesRes = await fetch(`${baseUrl}/roles`, { method: 'GET', headers });
    const allAuth0Roles = await allRolesRes.json();

    const currentRolesRes = await fetch(`${baseUrl}/users/${userId}/roles`, { method: 'GET', headers });
    const userCurrentRoles = await currentRolesRes.json();
    const currentRoleIds = userCurrentRoles.map(r => r.id);

    const targetRoleIds = jiraRoles.map(jiraLabel => {
      const technicalName = jiraLabel.split(' ')[0].trim();
      const match = allAuth0Roles.find(r => r.name === technicalName);
      return match ? match.id : null;
    }).filter(id => id !== null);

    const rolesToAdd = targetRoleIds.filter(id => !currentRoleIds.includes(id));
    
    const rolesToRemove = currentRoleIds.filter(id => !targetRoleIds.includes(id));

    let results = { added: [], removed: [] };

    if (rolesToAdd.length > 0) {
      const addRes = await fetch(`${baseUrl}/users/${userId}/roles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ roles: rolesToAdd })
      });
      if (addRes.ok) results.added = rolesToAdd;
    }


    if (rolesToRemove.length > 0) {
      const remRes = await fetch(`${baseUrl}/users/${userId}/roles`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ roles: rolesToRemove })
      });
      if (remRes.ok) results.removed = rolesToRemove;
    }

    return Response.json({
      success: true,
      message: "Role synchronization complete",
      summary: {
        assignedCount: results.added.length,
        removedCount: results.removed.length,
        currentUserRolesAfter: targetRoleIds
      },
      details: results
    });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export { onInvoke };