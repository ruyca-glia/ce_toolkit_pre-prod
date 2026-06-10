import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

export async function onInvoke(request, env) {
  const email = 'carlos.gomez@glia.com';
  const cloudID = 'e38b3211-6df7-40d9-b425-80bff15a78c8';

  try {
    // Resolve the token from AWS Secrets Manager asynchronously
    const apiToken = await getJiraToken();
    const auth = btoa(`${email}:${apiToken}`);
    
    const commonHeaders = {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    const dynamicJQL = '(project%20%3D%20SSD%20OR%20project%20%3D%20CE)%20AND%20assignee%20%3D%20712020%3Abf85740f-da5e-46d8-a040-3425ec34c379%20AND%20type%20%3D%20GVA%20AND%20status%20NOT%20IN%20(Resolved%2C%20Canceled)%20ORDER%20BY%20created%20DESC%2C%20Status%20DESC%2C%20priority%20ASC';
    const searchUrl = 'https://glia.atlassian.net/rest/api/3/search/jql?jql=' + dynamicJQL;
    
    const searchResponse = await fetch(searchUrl, { 
      method: 'GET', 
      headers: commonHeaders 
    });

    if (!searchResponse.ok) {
      throw new Error(`Error en búsqueda JQL: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const issueList = searchData.issues || [];

    const detailPromises = issueList.map(async (issue) => {
      try {
        const detailUrl = `https://glia.atlassian.net/rest/api/3/issue/${issue.id}`;
        const detailRes = await fetch(detailUrl, { 
          method: 'GET', 
          headers: commonHeaders 
        });

        if (!detailRes.ok) return null;
        const data = await detailRes.json();

        let formAnswers = {};

        const listRes = await fetch(`https://api.atlassian.com/jira/forms/cloud/${cloudID}/issue/${issue.id}/form`, { 
          method: "GET", 
          headers: commonHeaders 
        });
        
        if (listRes.ok) {
          const forms = await listRes.json();
          
          if (forms && forms.length > 0) {
            const formID = forms[0].id;
            
            const answersRes = await fetch(`https://api.atlassian.com/jira/forms/cloud/${cloudID}/issue/${issue.id}/form/${formID}`, { 
              method: "GET", 
              headers: commonHeaders 
            });
            
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
                  } 
                  else if (answerData.adf) {
                    value = extractAdfText(answerData.adf);
                  }
                  else if (answerData.choices && questionInfo.choices) {
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

        return {
          id: issue.id,
          key: data.key,
          summary: data.fields.summary, 
          customField: data.fields.customfield_12005 ? data.fields.customfield_12005.value : 'N/A',
          formData: formAnswers
        };
      } catch (err) {
        console.error(`Error obteniendo detalle de ${issue.id}:`, err);
        return null;
      }
    });

    const results = (await Promise.all(detailPromises)).filter(item => item !== null);

    return Response.json({
      success: true,
      total: results.length,
      issues: results
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

async function getJiraToken() {
    const client = new SecretsManagerClient({ region: "us-east-2" });
    try {
        const command = new GetSecretValueCommand({
            SecretId: "arn:aws:secretsmanager:us-east-2:404410098344:secret:jira_token-QnSBbG"
        });

        const response = await client.send(command);
        const secret = JSON.parse(response.SecretString);
        
        return secret.token || secret.jira_token || secret;
    } catch (error) {
        console.error("Error retrieving secret from AWS:", error);
        throw error;
    }
}

function extractAdfText(adf) {
    if (!adf || !adf.content) return "";
    return adf.content
        .map(node => {
            if (node.text) return node.text;
            if (node.content) return extractAdfText(node);
            return "";
        })
        .join("");
}