import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

export async function onInvoke(request, env) {
  const email = "carlos.gomez@glia.com";
  const apiToken = await getJiraToken(env);
  const auth = btoa(`${email}:${apiToken}`);
  const cloudID = "e38b3211-6df7-40d9-b425-80bff15a78c8";

  console.log("got Token: " + String(apiToken).substring(0, 5) + "...");

  const commonHeaders = {
    Authorization: `Basic ${auth}`,
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  let envelope = {};
  try {
    envelope = await request.json();
  } catch (e) {
    return Response.json({ error: "Failed to parse request body" }, { status: 400 });
  }

  let body = {};
  try {
    if (typeof envelope.payload === "string") {
      body = JSON.parse(envelope.payload);
    } else {
      body = envelope.payload || {};
    }
  } catch (e) {
    return Response.json({ error: "Failed to parse inner payload string" }, { status: 400 });
  }

  const userEmail = body.userEmail;
  console.log(`Filtering Jira tickets for assignee: ${userEmail}`);

  const extractAdfText = (adf) => {
    if (!adf || !adf.content) return "";
    return adf.content
      .map((node) => {
        if (node.text) return node.text;
        if (node.content) return extractAdfText(node);
        return "";
      })
      .join("");
  };

  try {
    const encodedEmail = encodeURIComponent(userEmail);
    const dynamicJQL = `project%20%3D%20CE%20AND%20(text%20~%20%22Glia%20Banker%22%20OR%20text%20~%20%22Voice%20Banker%22)%20AND%20assignee%20%3D%20%22${encodedEmail}%22%20AND%20status%20NOT%20IN%20(Resolved%2C%20Canceled)%20ORDER%20BY%20created%20DESC%2C%20status%20DESC%2C%20priority%20ASC`;
    const searchUrl = `https://glia.atlassian.net/rest/api/3/search/jql?jql=${dynamicJQL}`;

    const searchResponse = await fetch(searchUrl, { method: "GET", headers: commonHeaders });
    if (!searchResponse.ok) throw new Error(`Error JQL: ${searchResponse.status} - ${searchResponse.statusText}`);

    const searchData = await searchResponse.json();
    const issueList = searchData.issues || [];
    const results = [];

    for (let i = 0; i < issueList.length; i++) {
      const issue = issueList[i];
      try {
        console.log(`getting Ticket: ${issue.key}`);
        const detailRes = await fetch(`https://glia.atlassian.net/rest/api/3/issue/${issue.id}`, {
          method: "GET",
          headers: commonHeaders
        });
        if (!detailRes.ok) continue;
        const data = await detailRes.json();

        let formAnswers = {};
        const listRes = await fetch(
          `https://api.atlassian.com/jira/forms/cloud/${cloudID}/issue/${issue.id}/form`,
          { method: "GET", headers: commonHeaders }
        );

        if (listRes.ok) {
          const forms = await listRes.json();
          if (forms && forms.length > 0) {
            const formID = forms[0].id;
            const answersRes = await fetch(
              `https://api.atlassian.com/jira/forms/cloud/${cloudID}/issue/${issue.id}/form/${formID}`,
              { method: "GET", headers: commonHeaders }
            );

            if (answersRes.ok) {
              const fullFormData = await answersRes.json();
              const rawAnswers = fullFormData.state.answers || {};
              const questions = fullFormData.design.questions || {};

              formAnswers = Object.keys(rawAnswers).reduce((acc, qId) => {
                const questionInfo = questions[qId];
                const answerData = rawAnswers[qId];
                if (questionInfo && questionInfo.label) {
                  let value = "N/A";
                  if (answerData.text) {
                    value = answerData.text;
                  } else if (answerData.adf) {
                    value = extractAdfText(answerData.adf);
                  } else if (answerData.choices && questionInfo.choices) {
                    value = answerData.choices.map((choiceId) => {
                      const matchedChoice = questionInfo.choices.find((c) => c.id === choiceId);
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
  const client = new SecretsManagerClient({
    region: "us-east-2",
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
  });

  const command = new GetSecretValueCommand({
    SecretId: "arn:aws:secretsmanager:us-east-2:404410098344:secret:jira_token_w_full_access-fzCtJS"
  });

  const response = await client.send(command);
  const secret = JSON.parse(response.SecretString);

  if (typeof secret === "object" && secret !== null) {
    return secret.token || secret.jira_token || Object.values(secret)[0];
  }
  return secret;
}
