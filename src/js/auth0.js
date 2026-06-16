const outputConsole = document.getElementById('output');
let latestIssues = [];
let finalReport = "";

// Glia Function Invoke Endpoints
const jiraIssuesUrl = 'https://api.glia.com/integrations/0f9dd445-cc46-4fd0-8aac-02bab77cd0e3/endpoint';
const kvStoreUrl = 'https://api.glia.com/integrations/51a7d532-f34b-4f41-afea-9b966f64a9c6/endpoint';

// NUEVO: Un solo endpoint maestro para Auth0
const grantGVAPortalAccessUrl = 'https://api.glia.com/integrations/52ac5cc9-cfbc-4255-9142-41f280858384/endpoint'; 

function extractEmails(text) {
    if (!text) return [];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:com|org|net|bank)/g;
    return (text.match(emailRegex) || []).map(email => email.toLowerCase().trim());
}

document.addEventListener('DOMContentLoaded', () => {
    clearActivePanels();
    getJiraTickets();
    fetchRecentExecutions(); // Load the KV Store table on load
});

async function getJiraTickets() {
    logOutput("Starting Glia API to fetch Jira tickets...", true);
    try {
        let userMail = "support@glia.com"; // Fallback email
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        try {
            const gliaApi = await window.getGliaApi({ version: 'v1' });
            const userData = await gliaApi.getUser();

            if (userData && userData.email) {
                userMail = userData.email;
            }
        } catch (error) {
            console.warn("Could not retrieve Glia Operator info. Defaulting to fallback.", error);
        }

        const payload = {
            userEmail: userMail
        };

        const response = await fetch(jiraIssuesUrl, { method: 'POST', headers: headers, body: JSON.stringify(payload) });
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
        const priority = issue.customField !== "N/A" ? issue.customField.split(' - ')[0] : "N/A";
        const jiraLink = `https://glia.atlassian.net/browse/${issue.key}`;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="${jiraLink}" target="_blank" style="font-weight:bold; color:var(--primary);">${issue.key}</a></td>
            <td>${priority}</td>
            <td>Grant GVA Access</td> 
            <td><span class="badge badge-info">Open</span></td>
            <td><button class="btn btn-primary go-button" onclick="handleGoClick(${index})">View More</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function handleGoClick(index) {
    const issue = latestIssues[index];
    const formData = issue.formData || {};
    clearActivePanels();

    const allButtons = document.querySelectorAll('.go-button');
    const ticketRow = allButtons[index].closest('tr');
    const collapsibleRow = document.createElement('tr');
    collapsibleRow.className = 'collapsible-row';

    const usersList = extractEmails(formData["User’s Full Name + User Email"]);
    const usersHtml = usersList.length > 0 ? `<ul>${usersList.map(email => `<li>${email}</li>`).join('')}</ul>` : "N/A";
    const rolesHtml = Array.isArray(formData["Roles needed to be added for Auth0"])
        ? `<ul>${formData["Roles needed to be added for Auth0"].map(r => `<li>${r}</li>`).join('')}</ul>` : "N/A";
    const timezoneDisplay = (Array.isArray(formData["Timezone"]) ? formData["Timezone"][0] : formData["Timezone"]) || "N/A";

    collapsibleRow.innerHTML = `
        <td colspan="5">
            <div class="details-container">
                <div class="details-grid">
                    <dt>Summary</dt><dd>${issue.summary}</dd>
                    <dt>Bot Code</dt><dd><code>${formData["Bot Code"] || 'N/A'}</code></dd>
                    <dt>Users Found</dt><dd>${usersHtml}</dd>
                    <dt>Roles</dt><dd>${rolesHtml}</dd>
                    <dt>Timezone</dt><dd>${timezoneDisplay}</dd>
                </div>
                <div class="approval-container">
                    <label><input type="checkbox" class="approval-checkbox" onclick="handleApprovalCheck(this)"> Everything looks correct. Proceed.</label>
                </div>
                <div class="trigger-button-container">
                    <button class="pure-button purple-button trigger-button" disabled onclick="handleTriggerClick(this, ${index})">Trigger Automation</button>
                </div>
            </div>
        </td>
    `;
    ticketRow.parentNode.insertBefore(collapsibleRow, ticketRow.nextSibling);
}

async function handleTriggerClick(button, index) {
    const issue = latestIssues[index];
    const formData = issue.formData || {};
    
    // Empaquetamos toda la data cruda para el backend
    const payload = {
        issueKey: issue.key,
        masterEmails: extractEmails(formData["User’s Full Name + User Email"]),
        uatEmails: extractEmails(formData["Users who should be able to export to UAT"]),
        prodEmails: extractEmails(formData["Users who should be able to publish to prod"]),
        baseRoles: formData["Roles needed to be added for Auth0"] || [],
        botCodes: formData["Bot Code"] || "",
        timezone: (Array.isArray(formData["Timezone"]) ? formData["Timezone"][0] : "UTC").split(" for ")[0]
    };

    button.disabled = true;
    finalReport = ""; 

    logOutput(`========================================`, true);
    logOutput(`🚀 STARTING BATCH PROCESS FOR ${payload.masterEmails.length} USERS`);
    logOutput(`Ticket: ${issue.key}`);
    logOutput(`========================================\n`);
    button.innerHTML = `Processing with Auth0...`;

    let executionStatus = "Success";
    let batchSummary = [];

    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        // 1 sola llamada al Backend Orquestador
        const res = await fetch(grantGVAPortalAccessUrl, { 
            method: 'POST', 
            headers, 
            body: JSON.stringify(payload) 
        });
        
        const result = await res.json();
        
        if (!result.success) {
            throw new Error(result.error || "Unknown error from Provisioning function");
        }

        batchSummary = result.summary;

        // Imprimimos los logs que el backend generó para conservar la UI en tiempo real
        batchSummary.forEach((item, i) => {
            logOutput(`[User ${i + 1}/${payload.masterEmails.length}] 📧 Email: ${item.email}`);
            item.logs.forEach(msg => logOutput(`   -> ${msg}`));
            logOutput(`   -> ✅ Process completed!`);
            logOutput(`----------------------------------------`);
        });

        logOutput(`\nBATCH JOB FINISHED`);
        renderSummaryTable(batchSummary);

        // Trigger KV Store Save Event
        await saveExecutionLog(issue.key, executionStatus, headers);

    } catch (error) {
        logOutput(`\n❌ CRITICAL ERROR: ${error.message}`);
        button.innerHTML = 'Retry';
        button.disabled = false;
        executionStatus = "Failed";

        try {
            const glia = await window.getGliaApi({ version: 'v1' });
            const headers = await glia.getRequestHeaders();
            headers['Content-Type'] = 'application/json';
            await saveExecutionLog(issue.key, executionStatus, headers);
        } catch (e) { console.error("Could not save failed log:", e); }
    }
}

function renderSummaryTable(summary) {
    let tableHtml = `
    <div style="margin-top: 20px; border-top: 2px solid #fff; padding-top: 10px;">
        <h4 style="color: #00d1b2;">Automation Summary Report</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px;">
            <thead>
                <tr style="border-bottom: 1px solid #555; text-align: left;">
                    <th style="padding: 5px;">User</th><th style="padding: 5px;">Action</th><th style="padding: 5px;">Status</th>
                </tr>
            </thead>
            <tbody>`;
    summary.forEach(item => {
        tableHtml += `<tr style="border-bottom: 1px solid #333;"><td style="padding: 5px;">${item.email}</td><td style="padding: 5px;">${item.action}</td><td style="padding: 5px; text-align: center;">${item.status}</td></tr>`;
    });
    tableHtml += `</tbody></table></div>`;
    const summaryDiv = document.createElement('div');
    summaryDiv.innerHTML = tableHtml;
    outputConsole.appendChild(summaryDiv);
    outputConsole.scrollTop = outputConsole.scrollHeight;
    concatTexts("Summary table rendered internally.");
}

async function saveExecutionLog(ticketKey, status, headers) {
    let operatorName = "Client Engineer"; 

    try {
        const gliaApi = await window.getGliaApi({ version: 'v1' });
        const operatorData = await gliaApi.getUser();
        if (operatorData && operatorData.name) operatorName = operatorData.name;
    } catch (error) {
        console.warn("Could not retrieve Glia Operator info. Defaulting to fallback.", error);
    }

    try {
        const payload = {
            action: "save_log",
            logData: {
                ticket: ticketKey,
                user: operatorName, 
                status: status,
                output: finalReport
            }
        };

        const res = await fetch(kvStoreUrl, { method: 'POST', headers, body: JSON.stringify(payload) });
        const result = await res.json();

        if (result.success) {
            console.log("KV Store: Log saved successfully.", result.logId);
            fetchRecentExecutions();
        } else {
            console.error("KV Store Save Error:", result.error);
        }
    } catch (e) {
        console.error("Failed to call KV Store save:", e);
    }
}

async function fetchRecentExecutions() {
    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        const res = await fetch(kvStoreUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ action: "get_recent" })
        });

        const data = await res.json();
        if (data.logs) {
            renderRecentExecutionsTable(data.logs);
        }
    } catch (e) {
        console.error("Failed to fetch recent executions:", e);
    }
}

function renderRecentExecutionsTable(logs) {
    const tbody = document.getElementById('recentExecutionsBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    logs.forEach(log => {
        const dateObj = new Date(log.timestamp);
        const formattedDate = dateObj.toLocaleString();
        const badgeClass = log.status.toLowerCase() === 'success' ? 'badge-success' : 'badge-error';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${log.ticket}</strong></td>
            <td>${log.user}</td>
            <td><span class="badge ${badgeClass}">${log.status}</span></td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn btn-small view-toggle-btn" onclick="toggleDetails(this)">View More</button>
            </td>
        `;
        tbody.appendChild(tr);

        const detailsTr = document.createElement('tr');
        detailsTr.className = 'ticket-details-row';
        detailsTr.style.display = 'none';
        detailsTr.innerHTML = `
            <td colspan="5" style="background-color: #1e1e1e; padding: 0;">
                <div style="padding: 15px;">
                    <span style="color: #4cd137; font-family: monospace; font-size: 12px; margin-bottom: 10px; display: block;">
                        Execution ID: ${log.id}
                    </span>
                    <pre style="margin: 0; padding: 15px; background-color: #000; color: #f8f8f2; font-family: 'Courier New', Courier, monospace; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; font-size: 13px;">${log.output}</pre>
                </div>
            </td>
        `;
        tbody.appendChild(detailsTr);
    });
}

function handleApprovalCheck(checkbox) {
    const container = checkbox.closest('.details-container');
    const triggerButton = container.querySelector('.trigger-button');
    triggerButton.disabled = !checkbox.checked;
}

function clearActivePanels() {
    const existingPanel = document.querySelector('.collapsible-row');
    if (existingPanel) existingPanel.remove();
}

function logOutput(msg, clear = false) {
    if (clear) outputConsole.innerText = '';
    outputConsole.innerText += msg + "\n";
    outputConsole.scrollTop = outputConsole.scrollHeight;
    concatTexts(msg);
}

async function concatTexts(text) {
    try {
        finalReport += text + "\n";
        return true;
    } catch (err) {
        console.error("Failed to concat text: ", err);
        return false;
    }
}

window.toggleDetails = function (button) {
    const currentRow = button.closest('tr');
    const detailsRow = currentRow.nextElementSibling;

    if (detailsRow.style.display === 'none') {
        detailsRow.style.display = 'table-row';
        button.textContent = 'View Less';
        button.classList.add('btn-active');
    } else {
        detailsRow.style.display = 'none';
        button.textContent = 'View More';
        button.classList.remove('btn-active');
    }
};