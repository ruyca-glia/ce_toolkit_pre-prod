const outputConsole = document.getElementById("output");
let latestIssues = [];
let userMail = "support@glia.com"; // Fallback email

// Glia Function Invoke Endpoints
const jiraApiKeyIssuesUrl =
  "https://api.glia.com/integrations/78ca5851-68e6-4058-8ec8-681535e7d6c5/endpoint";
const kvStoreUrl =
  "https://api.glia.com/integrations/51a7d532-f34b-4f41-afea-9b966f64a9c6/endpoint";

document.addEventListener("DOMContentLoaded", () => {
  clearActivePanels();
  getJiraTickets();
  fetchRecentExecutions(); // Load the KV Store table on load
});

async function getJiraTickets() {
  logOutput("Starting Glia API to fetch Jira tickets...", true);
  try {
    const glia = await window.getGliaApi({ version: "v1" });
    const headers = await glia.getRequestHeaders();
    headers["Content-Type"] = "application/json";

    try {
      const gliaApi = await window.getGliaApi({ version: "v1" });
      const userData = await gliaApi.getUser();

      if (userData && userData.email) {
        userMail = userData.email;
      }
    } catch (error) {
      console.warn(
        "Could not retrieve Glia Operator info. Defaulting to fallback.",
        error,
      );
    }

    const payload = {
      userEmail: userMail,
    };

    const response = await fetch(jiraApiKeyIssuesUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (result.success) {
      latestIssues = result.issues;
      populateTicketTable(latestIssues);
      logOutput("Table successfully updated with Jira data.");
    }
  } catch (error) {
    console.error("Critical error communicating with Jira API:", error);
  }
}

function populateTicketTable(issues) {
  const tableBody = document.getElementById("ticketTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  issues.forEach((issue, index) => {
    // Format priority from custom field string (e.g. "P2 - High" -> "P2")
    const priority =
      issue.customField !== "N/A" ? issue.customField.split(" - ")[0] : "N/A";
    const jiraLink = `https://glia.atlassian.net/browse/${issue.key}`;

    const row = document.createElement("tr");
    row.innerHTML = `
            <td><a href="${jiraLink}" target="_blank" style="font-weight:bold; color:var(--primary);">${issue.key}</a></td>
            <td>${priority}</td>
            <td>GVA API Key ID + Secret & Handover Queue</td>
            <td><span class="badge badge-info">Open</span></td>
            <td><button class="btn btn-primary go-button" onclick="handleGoClick(${index})">View Details</button></td>
        `;
    tableBody.appendChild(row);
  });
}

function clearActivePanels() {
  const existingPanel = document.querySelector(".collapsible-row");
  if (existingPanel) existingPanel.remove();
}

function logOutput(msg, clear = false) {
  if (!outputConsole) return;
  if (clear) outputConsole.innerText = "";
  outputConsole.innerText += msg + "\n";
  outputConsole.scrollTop = outputConsole.scrollHeight;
}

// async function fetchRecentExecutions() {
//   // Stub for history log fetching (will populate when building history table section)
// }
