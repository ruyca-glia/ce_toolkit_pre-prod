async function onInvoke(request, env) {
  // 1. Parsing estándar de Glia
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
  
  const apiToken = '';
  const baseUrl = 'https://finn-ai-customer-portal.auth0.com/api/v2';

  if (!userId) return Response.json({ success: false, error: "Missing userId" }, { status: 400 });

  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    // PASO 1: Obtener el diccionario maestro de roles de Auth0
    const allRolesRes = await fetch(`${baseUrl}/roles`, { method: 'GET', headers });
    const allAuth0Roles = await allRolesRes.json();

    // PASO 2: Obtener los roles que el usuario tiene ACTUALMENTE
    const currentRolesRes = await fetch(`${baseUrl}/users/${userId}/roles`, { method: 'GET', headers });
    const userCurrentRoles = await currentRolesRes.json();
    const currentRoleIds = userCurrentRoles.map(r => r.id);

    // PASO 3: Mapear los roles de Jira a IDs de Auth0
    const targetRoleIds = jiraRoles.map(jiraLabel => {
      const technicalName = jiraLabel.split(' ')[0].trim();
      const match = allAuth0Roles.find(r => r.name === technicalName);
      return match ? match.id : null;
    }).filter(id => id !== null);

    // PASO 4: LÓGICA DE DIFERENCIA (DETERMINAR ADD vs REMOVE)
    // Roles que están en Jira pero NO tiene el usuario
    const rolesToAdd = targetRoleIds.filter(id => !currentRoleIds.includes(id));
    
    // Roles que el usuario tiene pero NO están en el ticket de Jira
    const rolesToRemove = currentRoleIds.filter(id => !targetRoleIds.includes(id));

    let results = { added: [], removed: [] };

    // PASO 5: Ejecutar ASIGNACIÓN si hay roles nuevos
    if (rolesToAdd.length > 0) {
      const addRes = await fetch(`${baseUrl}/users/${userId}/roles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ roles: rolesToAdd })
      });
      if (addRes.ok) results.added = rolesToAdd;
    }

    // PASO 6: Ejecutar ELIMINACIÓN si sobran roles
    if (rolesToRemove.length > 0) {
      const remRes = await fetch(`${baseUrl}/users/${userId}/roles`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ roles: rolesToRemove })
      });
      if (remRes.ok) results.removed = rolesToRemove;
    }

    // Respuesta final
    return Response.json({
      success: true,
      message: "Role synchronization complete",
      summary: {
        assignedCount: results.added.length,
        removedCount: results.removed.length,
        currentUserRolesAfter: targetRoleIds // El estado final deseado
      },
      details: results
    });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export { onInvoke };