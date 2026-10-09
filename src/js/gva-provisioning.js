const outputConsole = document.getElementById('output');
let latestIssues = [];
let finalReport = "";
let userMail = "support@glia.com"; // Fallback email

// Set to true ONLY to test this page outside the Glia applet with sample tickets. Must be false in any PR.
const USE_MOCK_DATA = false;

// Glia Function Invoke Endpoints
const jiraIssuesUrl = 'https://api.glia.com/integrations/5307a861-f742-44a4-a806-0e6e0a47187a/endpoint';
const writeLogURL = 'https://api.glia.com/integrations/f026a5b6-ba81-4211-99e1-3667bbaf16e9/endpoint';
// Orchestrator (step 3). While empty, "Trigger" runs as a dry run: no Lambda is invoked.
const provisionGVAUrl = 'https://api.glia.com/integrations/2b3b874a-15d6-4283-a2b7-1632046b565e/endpoint';

// Source of the flag / clone base rules in buildProvisioningParams(). Update the date when the rules are re-checked.
const GUIDE_URL = 'https://glia.atlassian.net/wiki/spaces/ENG/pages/5436702721/GVA+Provisioning+Guide';
const GUIDE_LAST_UPDATED = 'September 17, 2026';

// Jira form ("GVA Setup Ticket New") question labels
const LABELS = {
    botName: "New Bot Name",
    accountId: "Account ID",
    siteId: "Site ID",
    environment: "Environment",
    language: "Language",
    botCategory: "Bot Category",
    gvaType: "GVA Type",
    cmsBase: "cms_base_customer_name",
    cmsBaseSpecific: "Specific cms_base_customer_name",
    atlasBase: "atlas_existing_customer",
    atlasBaseSpecific: "Specific atlas_existing_customer",
    domain: "domain",
    gvaGeneration: "gva_generation"
};

// GVA Type form option (matched by its first word) -> Lambda gva_type + default clone base per language,
// as listed in the GVA Provisioning Guide. EA, SMS and Jumpstart have a single base for every language.
// isChat drives big_enabled. SMS and Jumpstart count as "all other types" (big_enabled = false).
const GVA_TYPES = {
    CHAT: { lambdaType: "CHAT", isChat: true, defaultBase: { "en-US": "banking-digital-en", "es-US": "banking-digital-es" } },
    SMS: { lambdaType: "CHAT", isChat: false, defaultBase: { "en-US": "banking-sms-en", "es-US": "banking-sms-en" } },
    JUMPSTART: { lambdaType: "CHAT", isChat: false, defaultBase: { "en-US": "banking-jumpstart-en", "es-US": "banking-jumpstart-en" } },
    PHONE: { lambdaType: "PHONE", isChat: false, defaultBase: { "en-US": "banking-voice-en", "es-US": "banking-voice-es" } },
    OA: { lambdaType: "OA", isChat: false, defaultBase: { "en-US": "banking-aa-en", "es-US": "banking-aa-es" } },
    EA: { lambdaType: "EA", isChat: false, defaultBase: { "en-US": "banking-digital-en", "es-US": "banking-digital-en" } }
};

// Environment form option -> provision_bot.sh env -> target Lambda.
// Temporary: our AWS credentials only reach the dev space, so "prod & uat" tickets are sent to dev for now.
const ENVIRONMENTS = { "prod & uat": "dev" };
const LAMBDA_CLUSTERS = { dev: "k8s-dev", staging: "k8s-staging", prod: "k8s-prod-na" };

const LANGUAGES = ["en-US", "es-US"];
const BOT_CATEGORIES = ["customer", "design", "release", "internal", "qa"];

document.addEventListener('DOMContentLoaded', () => {
    clearActivePanels();
    document.getElementById('clear-output').addEventListener('click', () => logOutput("", true));
    getJiraTickets();
});

async function getJiraTickets() {
    logOutput("Starting Glia API to fetch Jira tickets...", true);

    if (USE_MOCK_DATA) {
        userMail = "mock.ce@glia.com";
        latestIssues = MOCK_ISSUES;
        populateTicketTable(latestIssues);
        logOutput("MOCK MODE: showing sample tickets, not real Jira data.");
        return;
    }

    if (!jiraIssuesUrl) {
        logOutput("The Jira fetcher endpoint is not configured yet.");
        return;
    }

    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        try {
            const userData = await glia.getUser();
            if (userData && userData.email) {
                userMail = userData.email;
            }
        } catch (error) {
            console.warn("Could not retrieve Glia Operator info. Defaulting to fallback.", error);
        }

        const response = await fetch(jiraIssuesUrl, { method: 'POST', headers: headers, body: JSON.stringify({ userEmail: userMail }) });
        const result = await response.json();
        if (result.success) {
            latestIssues = result.issues;
            populateTicketTable(latestIssues);
            logOutput(`Table successfully updated with Jira data (${result.total} ticket(s)).`);
        } else {
            logOutput(`Could not fetch Jira tickets: ${result.error}`);
        }
    } catch (error) {
        console.error("Critical error communicating with Jira API:", error);
        logOutput(`Critical error communicating with Jira API: ${error.message}`);
    }
}

function populateTicketTable(issues) {
    const tableBody = document.getElementById("ticketTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    issues.forEach((issue, index) => {
        const priority = issue.customField !== "N/A" ? issue.customField.split(' - ')[0] : "N/A";
        const jiraLink = `https://glia.atlassian.net/browse/${encodeURIComponent(issue.key)}`;
        const { errors } = buildProvisioningParams(issue.formData || {});
        const statusBadge = errors.length > 0
            ? `<span class="badge badge-warning">Needs fix</span>`
            : `<span class="badge badge-info">Open</span>`;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="${jiraLink}" target="_blank" style="font-weight:bold; color:var(--primary);">${escapeHtml(issue.key)}</a></td>
            <td>${escapeHtml(priority)}</td>
            <td>GVA Provisioning</td>
            <td>${statusBadge}</td>
            <td><button class="btn btn-primary go-button" onclick="handleGoClick(${index})">View More</button></td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Turns the raw Jira form answers into the provision_bot.sh / Lambda parameters,
 * following GVA_Provisioning_Guide.md:
 *   Default base: clone base from GVA_TYPES; CHAT -> big_enabled true, every other type false;
 *                 use_template_content true; copy_instance_usergoals true.
 *   Client base:  clone base from the "Specific ..." fields; CHAT -> big_enabled true, every other type false;
 *                 use_template_content false; copy_instance_usergoals true.
 * Returns { params, lambdaName, errors }. Any error blocks the trigger.
 */
function buildProvisioningParams(formData) {
    const errors = [];

    const text = (label) => {
        const value = formData[label];
        const str = Array.isArray(value) ? value.join(", ") : value;
        return (str === undefined || str === null || str === "N/A") ? "" : String(str).trim();
    };
    const choice = (label) => {
        const value = formData[label];
        const first = Array.isArray(value) ? value[0] : value;
        return (first === undefined || first === null || first === "N/A") ? "" : String(first).trim();
    };
    const required = (label, value) => {
        if (!value) errors.push(`"${label}" is missing on the ticket form.`);
        return value;
    };

    const clientName = required(LABELS.botName, text(LABELS.botName));
    const accountId = required(LABELS.accountId, text(LABELS.accountId));
    const siteId = required(LABELS.siteId, text(LABELS.siteId));
    // A common form mistake: the same ID pasted in both fields breaks the GVA once it is active.
    if (accountId && siteId && accountId.toLowerCase() === siteId.toLowerCase()) {
        errors.push(`"${LABELS.accountId}" and "${LABELS.siteId}" have the same value (${siteId}). Please verify these values on your end and update the ticket form. The automation won't trigger while they are the same.`);
    }
    const domain = required(LABELS.domain, choice(LABELS.domain));
    const gvaGeneration = required(LABELS.gvaGeneration, choice(LABELS.gvaGeneration));

    const envLabel = required(LABELS.environment, choice(LABELS.environment));
    const env = ENVIRONMENTS[envLabel];
    if (envLabel && !env) errors.push(`Unknown Environment option "${envLabel}".`);

    const language = required(LABELS.language, choice(LABELS.language));
    if (language && !LANGUAGES.includes(language)) errors.push(`Unknown Language option "${language}".`);

    const botCategory = required(LABELS.botCategory, choice(LABELS.botCategory));
    if (botCategory && !BOT_CATEGORIES.includes(botCategory)) errors.push(`Unknown Bot Category option "${botCategory}".`);

    const gvaTypeLabel = required(LABELS.gvaType, choice(LABELS.gvaType));
    const gvaType = GVA_TYPES[gvaTypeLabel.split(" ")[0].toUpperCase()];
    if (gvaTypeLabel && !gvaType) errors.push(`Unknown GVA Type option "${gvaTypeLabel}".`);

    // Default vs Other (client base). Both fields must agree, mixed tickets are blocked.
    const baseMode = (label) => {
        const value = required(label, choice(label));
        if (value === "Default") return "default";
        if (value.startsWith("Other")) return "other";
        if (value) errors.push(`Unknown "${label}" option "${value}".`);
        return null;
    };
    const cmsMode = baseMode(LABELS.cmsBase);
    const atlasMode = baseMode(LABELS.atlasBase);
    if (cmsMode && atlasMode && cmsMode !== atlasMode) {
        errors.push(`"${LABELS.cmsBase}" and "${LABELS.atlasBase}" must both be Default or both be Other. Fix the ticket or run provision_bot.sh manually.`);
    }

    const resolveBase = (mode, specificLabel) => {
        if (mode === "other") return required(specificLabel, text(specificLabel));
        if (mode !== "default" || !gvaType || !language) return "";
        return gvaType.defaultBase[language] || "";
    };
    const cmsBaseCustomerName = resolveBase(cmsMode, LABELS.cmsBaseSpecific);
    const atlasExistingCustomer = resolveBase(atlasMode, LABELS.atlasBaseSpecific);

    const useDefaultBase = cmsMode === "default" && atlasMode === "default";
    const isChat = gvaType ? gvaType.isChat : false;

    const params = {
        env: env || "",
        client_name: clientName,
        language_country: language,
        bot_category: botCategory,
        gva_type: gvaType ? gvaType.lambdaType : "",
        cms_base_customer_name: cmsBaseCustomerName,
        atlas_existing_customer: atlasExistingCustomer,
        big_enabled: isChat,
        use_template_content: useDefaultBase,
        copy_instance_usergoals: true,
        domain: domain,
        gva_generation: gvaGeneration,
        account_id: accountId,
        site_id: siteId
    };

    const lambdaName = env ? `${LAMBDA_CLUSTERS[env]}-gva-provisioning-service` : "";
    return { params, lambdaName, errors };
}

function handleGoClick(index) {
    const goButton = document.querySelectorAll('.go-button')[index];
    // Clicking the button of the ticket that is already open just closes it.
    const wasOpen = goButton.classList.contains('btn-active');
    clearActivePanels();
    if (wasOpen) return;
    goButton.textContent = 'View Less';
    goButton.classList.add('btn-active');

    const issue = latestIssues[index];
    const formData = issue.formData || {};
    const { params, lambdaName, errors } = buildProvisioningParams(formData);

    const ticketRow = goButton.closest('tr');
    const collapsibleRow = document.createElement('tr');
    collapsibleRow.className = 'collapsible-row';

    const show = (label) => {
        const value = formData[label];
        const str = Array.isArray(value) ? value.join(", ") : value;
        return escapeHtml(str || "N/A");
    };
    // The "Other (Please specify ...)" option is long; the Specific field holds the actual base.
    const showBase = (label) => choiceStartsWithOther(formData[label]) ? "Other" : show(label);
    const paramsHtml = Object.entries(params)
        .map(([key, value]) => `<dt>${key}</dt><dd><code>${escapeHtml(String(value) || "—")}</code></dd>`)
        .join('');
    const errorsHtml = errors.length > 0
        ? `<div class="gva-alert gva-alert-error">
               <strong>This ticket can't be provisioned until these are fixed:</strong>
               <ul>${errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
           </div>` : "";
    const blocked = errors.length > 0 ? "disabled" : "";

    collapsibleRow.innerHTML = `
        <td colspan="5">
            <div class="details-container">
                <section class="gva-section">
                <h4>Ticket details</h4>
                <dl class="gva-kv">
                    <dt>Summary</dt><dd>${escapeHtml(issue.summary)}</dd>
                    <dt>Bot Name</dt><dd>${show(LABELS.botName)}</dd>
                    <dt>Account ID</dt><dd>${show(LABELS.accountId)}</dd>
                    <dt>Site ID</dt><dd>${show(LABELS.siteId)}</dd>
                    <dt>Environment</dt><dd>${show(LABELS.environment)}</dd>
                    <dt>Language</dt><dd>${show(LABELS.language)}</dd>
                    <dt>Bot Category</dt><dd>${show(LABELS.botCategory)}</dd>
                    <dt>GVA Type</dt><dd>${show(LABELS.gvaType)}</dd>
                    <dt>CMS base</dt><dd>${showBase(LABELS.cmsBase)}</dd>
                    <dt>Atlas base</dt><dd>${showBase(LABELS.atlasBase)}</dd>
                    <dt>Domain</dt><dd>${show(LABELS.domain)}</dd>
                    <dt>GVA Generation</dt><dd>${show(LABELS.gvaGeneration)}</dd>
                </dl>
                </section>
                <section class="gva-section">
                <h4>Parameters to send</h4>
                <dl class="gva-kv">
                    <dt>Target Lambda</dt><dd><code>${escapeHtml(lambdaName || "—")}</code></dd>
                    ${params.env === "dev" ? `<dt></dt><dd>Ticket says ${show(LABELS.environment)}; sending dev until prod credentials are available.</dd>` : ""}
                    ${paramsHtml}
                </dl>
                </section>
                <div class="gva-alert gva-alert-warning">
                    The flags and clone bases above follow the
                    <a href="${GUIDE_URL}" target="_blank" rel="noopener noreferrer">GVA Provisioning Guide</a>
                    as last updated on ${GUIDE_LAST_UPDATED}. If the guide has been updated since then, a flag may be set
                    incorrectly. As the Client Engineer, you are responsible for checking the parameters against the
                    current guide before triggering.
                </div>
                ${errorsHtml}
                <div class="approval-container">
                    <label><input type="checkbox" class="approval-checkbox" ${blocked} onclick="handleApprovalCheck(this)"> Everything looks correct. Proceed.</label>
                </div>
                <div class="trigger-button-container">
                    <button class="pure-button purple-button trigger-button" disabled onclick="handleTriggerClick(this, ${index})">Trigger Provisioning</button>
                </div>
            </div>
        </td>
    `;
    ticketRow.parentNode.insertBefore(collapsibleRow, ticketRow.nextSibling);
}

async function handleTriggerClick(button, index) {
    const issue = latestIssues[index];
    const { params, lambdaName, errors } = buildProvisioningParams(issue.formData || {});
    if (errors.length > 0) return;

    const startTime = Date.now();
    const isDryRun = !provisionGVAUrl;
    button.disabled = true;
    button.innerHTML = 'Processing...';
    finalReport = "";
    document.getElementById('slackNotice').style.display = 'none';

    logOutput(`========================================`, true);
    logOutput(`GVA PROVISIONING${isDryRun ? " (DRY RUN)" : ""}`);
    logOutput(`Ticket: ${issue.key}`);
    logOutput(`Target Lambda: ${lambdaName}`);
    logOutput(`========================================\n`);
    logOutput(`Parameters:\n${JSON.stringify(params, null, 2)}\n`);

    let executionStatus = "Success";
    let headers = {};

    try {
        if (!USE_MOCK_DATA) {
            const glia = await window.getGliaApi({ version: 'v1' });
            headers = await glia.getRequestHeaders();
            headers['Content-Type'] = 'application/json';
        }

        if (isDryRun) {
            logOutput(`DRY RUN: the orchestrator is not deployed yet, so no Lambda was invoked.`);
            executionStatus = "Dry Run";
            button.innerHTML = 'Dry Run Completed';
        } else {
            logOutput(`Invoking orchestrator...`);
            const res = await fetch(provisionGVAUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({ issueKey: issue.key, params })
            });
            const result = await res.json();

            if (!result.success) {
                throw new Error(result.error || "Unknown orchestrator error");
            }

            logOutput(`Provisioning triggered. Job ID: ${result.jobId || "N/A"}`);
            document.getElementById('slackNotice').style.display = 'block';
            button.innerHTML = 'Triggered';
        }
    } catch (error) {
        logOutput(`\nCRITICAL ERROR: ${error.message}`);
        executionStatus = "Failed";
        button.innerHTML = 'Retry';
        button.disabled = false;
    }

    await saveExecutionLog(issue.key, executionStatus, isDryRun, Date.now() - startTime, headers);
}

async function saveExecutionLog(ticketKey, status, isDryRun, durationMs, headers) {
    const payload = {
        siteId: "a5c110f6-a4a5-47d9-bbf1-d03d7a5e5089",
        userId: userMail,
        action: isDryRun ? "Provision GVA (dry run)" : "Provision GVA",
        url: provisionGVAUrl ? provisionGVAUrl.replace("https://", "") : "dry-run",
        automation: "GVA Provisioning",
        status: status,
        ticket: ticketKey,
        finalReport: finalReport,
        durationMs: durationMs
    };

    if (USE_MOCK_DATA) {
        console.log("MOCK MODE: audit log not written. Payload would be:", payload);
        return;
    }

    try {
        const res = await fetch(writeLogURL, { method: 'POST', headers, body: JSON.stringify(payload) });
        const result = await res.json();

        if (result.success) {
            console.log("Log for this execution was saved successfully.", result);
        } else {
            console.error("ERROR saving logs:", result.error);
        }
    } catch (e) {
        console.error("Failed to call Log DB for WRITE action", e);
    }
}

function handleApprovalCheck(checkbox) {
    const container = checkbox.closest('.details-container');
    const triggerButton = container.querySelector('.trigger-button');
    triggerButton.disabled = !checkbox.checked;
}

function clearActivePanels() {
    const existingPanel = document.querySelector('.collapsible-row');
    if (existingPanel) existingPanel.remove();
    document.querySelectorAll('.go-button.btn-active').forEach(button => {
        button.textContent = 'View More';
        button.classList.remove('btn-active');
    });
}

function choiceStartsWithOther(value) {
    const first = Array.isArray(value) ? value[0] : value;
    return typeof first === "string" && first.trim().startsWith("Other");
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

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Sample tickets in the exact shape returned by Jira/GVAProvisioning. Only used when USE_MOCK_DATA = true.
const OTHER_LABEL = "Other (Please specify existing bot name to copy from in the field below)";
const mockForm = (overrides) => Object.assign({
    "New Bot Name": "autothon-test",
    "Account ID": "8b018ccb-9480-4bc9-90e3-ba045d7a0ac9",
    "Site ID": "3184c147-f9c5-4fe7-ada4-46c16bf20ee3",
    "Environment": ["prod & uat"],
    "Language": ["en-US"],
    "Bot Category": ["customer"],
    "GVA Type": ["CHAT"],
    "cms_base_customer_name": ["Default"],
    "atlas_existing_customer": ["Default"],
    "domain": ["banking"],
    "gva_generation": ["GEN-2"]
}, overrides);
const MOCK_ISSUES = [
    { id: "1", key: "CE-1001", summary: "Real ticket: CHAT, client base", customField: "P2 - High",
      formData: mockForm({ "New Bot Name": "autothon-gerardo-test", "cms_base_customer_name": [OTHER_LABEL], "Specific cms_base_customer_name": "test-bot",
                           "atlas_existing_customer": [OTHER_LABEL], "Specific atlas_existing_customer": "test-bot" }) },
    { id: "2", key: "CE-1002", summary: "CHAT Spanish, default base", customField: "P3 - Medium",
      formData: mockForm({ "Language": ["es-US"] }) },
    { id: "3", key: "CE-1003", summary: "PHONE English, default base", customField: "N/A",
      formData: mockForm({ "GVA Type": ["PHONE"] }) },
    { id: "4", key: "CE-1004", summary: "SMS Spanish, default base -> banking-sms-en", customField: "N/A",
      formData: mockForm({ "GVA Type": ["SMS (CHAT)"], "Language": ["es-US"] }) },
    { id: "5", key: "CE-1005", summary: "OA, client base", customField: "N/A",
      formData: mockForm({ "GVA Type": ["OA (stands for Operator Assist/Agent Assist)"], "cms_base_customer_name": [OTHER_LABEL], "Specific cms_base_customer_name": "acme-oa",
                           "atlas_existing_customer": [OTHER_LABEL], "Specific atlas_existing_customer": "acme-oa" }) },
    { id: "6", key: "CE-1006", summary: "Mixed Default/Other (blocked)", customField: "N/A",
      formData: mockForm({ "atlas_existing_customer": [OTHER_LABEL], "Specific atlas_existing_customer": "test-bot" }) },
    { id: "7", key: "CE-1007", summary: "Broken: missing Specific field (long name is allowed)", customField: "N/A",
      formData: mockForm({ "New Bot Name": "this-bot-name-is-way-too-long", "cms_base_customer_name": [OTHER_LABEL], "atlas_existing_customer": [OTHER_LABEL],
                           "Specific atlas_existing_customer": "<b>test-bot</b>" }) }
];
