import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// jira_get_gvaprovisioning_ticket.js
// Fetches the logged-in CE's open "GVA Setup Ticket" requests and their Proforma form answers.

let cachedJiraToken = null;

export async function onInvoke(request, env) {
  try {
    console.log("Started");
    //Credentials and Setup
    const email = "carlos.gomez@glia.com"; //This will become an ENV Variable once decided the Jira user
    const apiToken = await getJiraToken(env);
    const auth = btoa(`${email}:${apiToken}`);
    const cloudID = "e38b3211-6df7-40d9-b425-80bff15a78c8";

    const commonHeaders = {
      "Authorization": `Basic ${auth}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    };

    // Print only the first 5 characters to confirm it's a real token without exposing the secret.
    console.log("got Token: " + String(apiToken).substring(0, 5) + "...");

    let envelope = {};
    try {
      envelope = await request.json();
    } catch (e) {
      return Response.json({ success: false, error: "Failed to parse request body" }, { status: 400 });
    }

    let body = {};
    try {
      if (typeof envelope.payload === 'string') {
        body = JSON.parse(envelope.payload);
      } else {
        body = envelope.payload || {};
      }
    } catch (e) {
      return Response.json({ success: false, error: "Failed to parse inner payload string" }, { status: 400 });
    }

    const userEmail = body.userEmail;
    if (!userEmail) {
      return Response.json({ success: false, error: "Missing userEmail" }, { status: 400 });
    }
    console.log(`Filtering Jira tickets for assignee: ${userEmail}`);

    /**
     * Helper to extract plain text from Atlassian Document Format (ADF)
     */
    const extractAdfText = (adf) => {
      if (!adf || !adf.content) return "";
      return adf.content
        .map(node => {
          if (node.text) return node.text;
          if (node.content) return extractAdfText(node);
          return "";
        })
        .join("");
    };

    // 2. SEARCH PHASE (JQL)
    // Only Open / Pending GVA Setup tickets (excluding Done) assigned to the logged-in CE
    const dynamicJQL = encodeURIComponent(
      `"Customer Request Type" = "GVA Setup Ticket (CE)" AND statusCategory != Done AND assignee = "${userEmail}" ORDER BY created DESC, status DESC, priority ASC`
    );

    const searchUrl = `https://glia.atlassian.net/rest/api/3/search/jql?jql=${dynamicJQL}`;

    const searchResponse = await fetch(searchUrl, { method: "GET", headers: commonHeaders });
    if (!searchResponse.ok) throw new Error(`Error JQL: ${searchResponse.status} - ${searchResponse.statusText}`);

    const searchData = await searchResponse.json();
    const issueList = searchData.issues || [];

    // 3. DETAIL PHASE (sequential, one ticket at a time)
    const results = [];
    for (const issue of issueList) {
      try {
        console.log(`getting Ticket: ${issue.key}`);
        // Fetch base Jira issue details
        const detailRes = await fetch(`https://glia.atlassian.net/rest/api/3/issue/${issue.id}`, { method: "GET", headers: commonHeaders });
        if (!detailRes.ok) continue;
        const data = await detailRes.json();

        let formAnswers = {};

        // Fetch associated Proforma forms
        const listRes = await fetch(`https://api.atlassian.com/jira/forms/cloud/${cloudID}/issue/${issue.id}/form`, { method: "GET", headers: commonHeaders });

        if (listRes.ok) {
          const forms = await listRes.json();

          if (forms && forms.length > 0) {
            const formID = forms[0].id;
            // Fetch form design and state (answers)
            const answersRes = await fetch(`https://api.atlassian.com/jira/forms/cloud/${cloudID}/issue/${issue.id}/form/${formID}`, { method: "GET", headers: commonHeaders });

            if (answersRes.ok) {
              const fullFormData = await answersRes.json();
              const rawAnswers = fullFormData.state.answers || {};
              const questions = fullFormData.design.questions || {};

              // MAP DATA: Cross-reference answers with question labels
              formAnswers = Object.keys(rawAnswers).reduce((acc, qId) => {
                const questionInfo = questions[qId];
                const answerData = rawAnswers[qId];

                if (questionInfo && questionInfo.label) {
                  let value = "N/A";

                  // Case 1: Simple Text fields
                  if (answerData.text) {
                    value = answerData.text;
                  }
                  // Case 2: Rich Text / Email fields (ADF)
                  else if (answerData.adf) {
                    value = extractAdfText(answerData.adf);
                  }
                  // Case 3: Choices (Multi-select or Single Choice)
                  else if (answerData.choices && questionInfo.choices) {
                    // MAP TO ARRAY instead of string
                    value = answerData.choices.map(choiceId => {
                      const matchedChoice = questionInfo.choices.find(c => c.id === choiceId);
                      return matchedChoice ? matchedChoice.label : `ID: ${choiceId}`;
                    });
                  }

                  acc[questionInfo.label] = value;
                }
                return acc;
              }, {});
            }
          }
        }

        results.push({
          id: issue.id,
          key: data.key,
          summary: data.fields.summary,
          customField: data.fields.customfield_12005 ? data.fields.customfield_12005.value : "N/A",
          formData: formAnswers
        });

      } catch (err) {
        console.error(`Error processing ticket ${issue.id}:`, err);
      }
    }

    // 4. Final Response
    return Response.json({
      success: true,
      total: results.length,
      issues: results
    });

  } catch (error) {
    console.error("FATAL ERROR IN FLOW:", error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function getJiraToken(env) {
  if (cachedJiraToken) {
    console.log("Using cached Jira token.");
    return cachedJiraToken;
  }

  // Authenticate client using Glia environment variables
  const client = new SecretsManagerClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
  });

  console.log("got the secret credentials");

  try {
    const command = new GetSecretValueCommand({
      SecretId: "arn:aws:secretsmanager:us-east-1:710190935322:secret:jira_token-ARHigW"
    });

    const response = await client.send(command);
    const secret = JSON.parse(response.SecretString);
    console.log("got token parsed");

    // Take the first value of the JSON, whatever the key
    let extractedToken;
    if (typeof secret === 'object' && secret !== null) {
      extractedToken = secret.token || secret.jira_token || Object.values(secret)[0];
    } else {
      extractedToken = secret; // In case it was stored as plain text instead of JSON
    }

    // Jira API token doesn't expire: cache it for the lifetime of the function instance
    cachedJiraToken = extractedToken;

    return cachedJiraToken;
  } catch (error) {
    console.error("Error retrieving secret from AWS:", error);
    throw error;
  }
}
