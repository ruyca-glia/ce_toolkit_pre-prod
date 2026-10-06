const outputConsole = document.getElementById('output');
const outputStatus = document.getElementById('outputStatus');
let latestIssues = [];
let finalReport = "";
let userMail = "support@glia.com";
let activeTicketKey = "AD-HOC";

const writeLogURL = 'https://api.glia.com/integrations/f026a5b6-ba81-4211-99e1-3667bbaf16e9/endpoint';
const CE_TEST_SITE_ID = 'a5c110f6-a4a5-47d9-bbf1-d03d7a5e5089';

// Paste Glia Function endpoint URLs here after deploy.
const jiraIssuesUrl = '';
const applyGvaConfigCredentialsUrl = '';

// Per-bot core configuration prefilled into the UI. It doubles as the allow-list
// the submitted JSON is validated against, so a CE can only change keys that
// already exist, and each value must keep the type it has here.
const CORE_CONFIG_REFERENCE = {
    customerSupport__humanQueue: "",
    allowedSiteIds: [],
    gvaType: "PHONE",
    gvaDomain: "BANKING",
    locale: "en-US",
    gvaGeneration: "GEN-2",
    bankIntegration: {
        bankAuth: {
            enabled: true,
            type: "OTP",
            otpIdentifiers: { firstIdType: "SOCIAL_SECURITY_NUMBER", secondIdType: "" },
            maxOtpWrongIdAttempts: 3
        },
        moneyMovement: {
            enabled: true,
            billPaymentMaxAmount: 2000,
            billPaymentMinAmount: 0.01,
            eTransferMaxAmount: 2000,
            eTransferMinAmount: 0.01,
            accountToAccountMax: 1000000,
            accountToAccountMin: 0.01,
            disabledTransferTypes: ["me2bill", "me2u"],
            payeesPaginationLimit: 6,
            accountsPaginationLimit: 6
        },
        transactionHistory: { enabled: true, paginationLimit: 6 },
        getBalance: { enabled: true, paginationLimit: 5 },
        getDepositInfo: { enabled: true, paginationLimit: 10 },
        disableLogoutUtterance: false,
        accounts: { hiddenAccountTypes: [] },
        dateFormat: { utcOffset: -6, pattern: "DD MMM YYYY" },
        dynamicUserGoalAuthentication: false
    },
    smartRouting: { enabled: false },
    phoneGvaEnableInterDigitWaitTime: true,
    allowedAccountIds: [
        "09621cfc-bef7-4311-ad63-6b8398e5e07a",
        "4916832c-fe56-4733-96e7-220683ef1b1c"
    ],
    intelligentFlows__enabled: false,
    intelligentFlows__loginTypeSelectionEnabled: false,
    bankIntegration__useGig: true,
    bankIntegration__gigExternalConfigurationId: "8135d1c9-ad8c-49d8-a390-4916af663bc4",
    debugMode: false,
    textMeResponse__fromNumber: "",
    customerSupport__agentId: "",
    customerSupport__siteId: "",
    contentDispatcherGvaIdOverride: null,
    customerSupport: { enabled: true, sendHandoffToHumanAcknowledgement: false },
    feedback: { enabled: false, ratingLowerRange: 1, ratingUpperRange: 10 },
    bankIntegration__bankAuth__postAuthFunctionUri: "",
    bankIntegration__bankAuth__maxOtpWrongOtpAttempts: 3,
    bankIntegration__useLegacyQ2Integration: false,
    textMeResponse: { enabled: false },
    transferToPhoneDelay: 5000,
    locationFinder__clientId: "",
    locationFinder: { enabled: false },
    analytics: { urlButtonTracking: { enabled: false } },
    internalGva: false,
    brokenUtterances__silenceTimeout: 0,
    nlp__gen_2_killswitch_enabled: false,
    engagementStore__deleteDataOnEngagementEnd: true,
    bankIntegration__disableAccountFilteringByHiddenAccountTypes: false,
    bankIntegration__sendUseCaseQueryParameter: true,
    bankIntegration__disableMoneyMovementAccountTypeFiltering: true,
    delayedResponseNotification__delayInMs: 2000,
    phoneGvaAutoHangUp__timeoutMinutes: 10,
    phoneGvaBlockWelcomeMessageInterruptionsForInbound: false,
    silenceHandling__beforeFirstNudge__delaySeconds: 10,
    silenceHandling__beforeSecondNudge__delaySeconds: 10,
    silenceHandling__beforeFinalHangup__delaySeconds: 10,
    silenceHandling__fallbackTimeoutSeconds: 120,
    responseGeneration__enableStreaming: true,
    intelligentFlows__displayIdentifiersConfirmation: false,
    intelligentFlows__nudge__enabled: false,
    intelligentFlows__nudge__beforeNudge__delaySeconds: 12,
    intelligentFlows__nudge__beforeHangup__delaySeconds: 12,
    nlp__max_utterance_length: 150,
    nlp__max_utterance_length_summarization: 1000,
    nlp__max_auto_number_words: 3,
    nlp__keyword_suggestions_limit: 7,
    nlp__allow_form_escape: true,
    nlp__enable_keyword_suggestions: true,
    nlp__enable_advanced_keyword_suggestions: true,
    nlp__gen_2_max_utterance_length: 1000,
    nlp__gen_2_converse_api_model_id: "us.amazon.nova-2-lite-v1:0",
    nlp__gen_2_converse_api_service_tier: "default",
    nlp__gen_2_use_converse_api: true,
    nlp__include_response_content_into_prompts: true,
    nlp__gen_2_fallback_top_ug_count: 2,
    nlp__gen_2_top_ug_to_choose_fallback_btn_from: 5,
    nlp__debugMode: false
};

// Keys the reference allows but that stay out of the payload until a CE picks a
// value, so an unused optional setting is never sent as an empty string.
const OPTIONAL_CORE_CONFIG_PATHS = ['bankIntegration.bankAuth.otpIdentifiers.secondIdType'];

const DEFAULT_CREDENTIALS = {
    secrets: {
        api_key_id: "",
        api_key_secret: ""
    }
};

function coreConfigDefault() {
    const config = JSON.parse(JSON.stringify(CORE_CONFIG_REFERENCE));
    OPTIONAL_CORE_CONFIG_PATHS.forEach((path) => deleteConfigValue(config, path));
    return config;
}

function extractEmails(text) {
    if (!text) return [];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:com|org|net|bank)/g;
    return (text.match(emailRegex) || []).map(email => email.toLowerCase().trim());
}

document.addEventListener('DOMContentLoaded', () => {
    setCoreConfigText(JSON.stringify(coreConfigDefault(), null, 2));
    setCredentialsText(JSON.stringify(DEFAULT_CREDENTIALS, null, 2));

    bindJsonEditor(CORE_CONFIG_EDITOR, {
        onInput: () => {
            clearCoreConfigError();
            syncFeatureControls();
        },
        onFormat: syncFeatureControls
    });
    bindJsonEditor(CREDENTIALS_EDITOR);
    initFeatureControls();
    initThemeToggle();
    document.getElementById('coreConfigExpand').addEventListener('click', toggleCoreConfigExpanded);
    document.getElementById('coreConfigCollapse').addEventListener('click', toggleCoreConfigCollapsed);
    document.getElementById('configApproval').addEventListener('change', (e) => {
        document.getElementById('sendConfigBtn').disabled = !e.target.checked;
    });
    document.getElementById('credentialsApproval').addEventListener('change', (e) => {
        document.getElementById('sendCredentialsBtn').disabled = !e.target.checked;
    });
    document.getElementById('sendConfigBtn').addEventListener('click', () => sendCoreConfig({ ticketKey: activeTicketKey }));
    document.getElementById('sendCredentialsBtn').addEventListener('click', () => sendCredentials({ ticketKey: activeTicketKey }));
    document.getElementById('clear-output').addEventListener('click', () => {
        logOutput('Waiting for script execution. Confirm a payload and click its Send button to begin.', true);
        setStatus('Ready');
    });

    getJiraTickets();
});

async function getGliaHeaders() {
    const glia = await window.getGliaApi({ version: 'v1' });
    const headers = await glia.getRequestHeaders();
    headers['Content-Type'] = 'application/json';
    try {
        const userData = await glia.getUser();
        if (userData && userData.email) userMail = userData.email;
    } catch (error) {
        console.warn('Could not retrieve Glia Operator info. Defaulting to fallback.', error);
    }
    return headers;
}

async function getJiraTickets() {
    if (!jiraIssuesUrl) {
        showTicketTableMessage('Jira fetcher is not deployed yet. Use the ad-hoc payload panels below.');
        logOutput('Jira fetcher URL is not set yet. Ticket table stays empty until that Glia Function is deployed. You can still send an ad-hoc payload to a Word document.', true);
        return;
    }

    logOutput('Starting Glia API to fetch Jira tickets...', true);
    try {
        const headers = await getGliaHeaders();
        const response = await fetch(jiraIssuesUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ userEmail: userMail })
        });
        const result = await response.json();
        if (result.success) {
            latestIssues = result.issues || [];
            populateTicketTable(latestIssues);
            logOutput(`Table updated with ${latestIssues.length} Jira ticket(s).`);
        } else {
            showTicketTableMessage('Could not load your Jira tickets.');
            logOutput(`Jira fetch failed: ${result.error || 'unknown error'}`);
        }
    } catch (error) {
        console.error('Critical error communicating with Jira API:', error);
        showTicketTableMessage('Could not load your Jira tickets.');
        logOutput(`Could not load Jira tickets: ${error.message}`);
    }
}

function showTicketTableMessage(message) {
    const tableBody = document.getElementById('ticketTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="5">${escapeHtml(message)}</td></tr>`;
}

function populateTicketTable(issues) {
    const tableBody = document.getElementById('ticketTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (!issues.length) {
        showTicketTableMessage('No open GVA config tickets assigned to you.');
        return;
    }
    issues.forEach((issue, index) => {
        const priority = issue.customField !== 'N/A' && issue.customField
            ? String(issue.customField).split(' - ')[0]
            : 'N/A';
        const jiraLink = `https://glia.atlassian.net/browse/${issue.key}`;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="${jiraLink}" target="_blank" style="font-weight:bold; color:var(--primary);">${issue.key}</a></td>
            <td>${priority}</td>
            <td>GVA config change</td>
            <td><span class="badge badge-info">Open</span></td>
            <td><button class="btn btn-primary go-button" type="button">View More</button></td>
        `;
        row.querySelector('.go-button').addEventListener('click', () => handleGoClick(index));
        tableBody.appendChild(row);
    });
}

function handleGoClick(index) {
    const issue = latestIssues[index];
    const formData = issue.formData || {};
    clearActivePanels();
    activeTicketKey = issue.key;

    const allButtons = document.querySelectorAll('.go-button');
    const ticketRow = allButtons[index].closest('tr');
    const collapsibleRow = document.createElement('tr');
    collapsibleRow.className = 'collapsible-row';

    const botCode = formData['Bot Code'] || formData['botCode'] || 'N/A';
    const loaded = applyFormPayloadToEditors(formData);

    collapsibleRow.innerHTML = `
        <td colspan="5">
            <div class="details-container">
                <div class="details-grid">
                    <dt>Summary</dt><dd>${escapeHtml(issue.summary || '')}</dd>
                    <dt>Bot Code</dt><dd><code>${escapeHtml(String(botCode))}</code></dd>
                    <dt>Form emails</dt><dd>${extractEmails(JSON.stringify(formData)).join(', ') || 'N/A'}</dd>
                    <dt>Editors</dt><dd>${loaded ? 'Ticket JSON loaded into the payload editors below.' : 'No JSON fields on this ticket. Edit the payload panel below.'}</dd>
                </div>
                <div class="approval-container">
                    <label><input type="checkbox" class="approval-checkbox"> Everything looks correct. Proceed.</label>
                </div>
                <div class="trigger-button-container">
                    <button class="pure-button purple-button trigger-button" type="button" data-send="config" disabled>Send configuration</button>
                    <button class="pure-button purple-button trigger-button" type="button" data-send="credentials" disabled>Send credentials</button>
                </div>
            </div>
        </td>
    `;
    ticketRow.parentNode.insertBefore(collapsibleRow, ticketRow.nextSibling);

    const checkbox = collapsibleRow.querySelector('.approval-checkbox');
    const triggers = collapsibleRow.querySelectorAll('.trigger-button');
    checkbox.addEventListener('click', () => {
        triggers.forEach((btn) => { btn.disabled = !checkbox.checked; });
    });

    const configBtn = collapsibleRow.querySelector('[data-send="config"]');
    const credentialsBtn = collapsibleRow.querySelector('[data-send="credentials"]');
    configBtn.addEventListener('click', () => sendCoreConfig({ ticketKey: issue.key, button: configBtn, approval: checkbox }));
    credentialsBtn.addEventListener('click', () => sendCredentials({ ticketKey: issue.key, button: credentialsBtn, approval: checkbox }));
}

function applyFormPayloadToEditors(formData) {
    const coreRaw = firstFormValue(formData, [
        'Core configuration',
        'Core Configuration',
        'gva-core configuration',
        'AppConfig',
        'Configuration JSON'
    ]);
    const credsRaw = firstFormValue(formData, [
        'Credentials',
        'API credentials',
        'Secrets'
    ]);

    let loaded = false;
    if (coreRaw) {
        const parsed = tryParseJson(coreRaw);
        if (parsed) {
            setCoreConfigText(JSON.stringify(parsed, null, 2));
            loaded = true;
        }
    }
    if (credsRaw) {
        const parsed = tryParseJson(credsRaw);
        if (parsed) {
            setCredentialsText(JSON.stringify(parsed, null, 2));
            loaded = true;
        }
    }
    return loaded;
}

function firstFormValue(formData, labels) {
    for (const label of labels) {
        if (formData[label] != null && formData[label] !== '' && formData[label] !== 'N/A') {
            return Array.isArray(formData[label]) ? formData[label].join('\n') : formData[label];
        }
    }
    return null;
}

function tryParseJson(value) {
    if (typeof value === 'object') return value;
    try { return JSON.parse(value); } catch (e) { return null; }
}

async function sendCoreConfig({ ticketKey, button, approval }) {
    const sendBtn = button || document.getElementById('sendConfigBtn');
    const approvalBox = approval || document.getElementById('configApproval');
    let coreConfig;

    try {
        coreConfig = JSON.parse(document.getElementById('coreConfigInput').value);
    } catch (error) {
        showCoreConfigError();
        logOutput(`Core configuration JSON parse error: ${error.message}`, true);
        setStatus('Invalid JSON');
        return;
    }

    const coreConfigError = validateCoreConfig(coreConfig);
    if (coreConfigError) {
        showCoreConfigError();
        logOutput(coreConfigError, true);
        setStatus('Invalid payload');
        return;
    }
    clearCoreConfigError();

    const keyPaths = listKeyPaths(coreConfig);
    await runSend({
        ticketKey,
        sendBtn,
        approvalBox,
        headerLines: [
            'STARTING CORE CONFIGURATION SEND',
            `Ticket: ${ticketKey}`,
            `Core configuration keys: ${keyPaths.length}`
        ],
        payload: { issueKey: ticketKey, coreConfig },
        action: 'GVA core configuration change'
    });
}

async function sendCredentials({ ticketKey, button, approval }) {
    const sendBtn = button || document.getElementById('sendCredentialsBtn');
    const approvalBox = approval || document.getElementById('credentialsApproval');
    let credentials;

    try {
        credentials = JSON.parse(document.getElementById('credentialsInput').value);
    } catch (error) {
        logOutput(`Credentials JSON parse error: ${error.message}`, true);
        setStatus('Invalid JSON');
        return;
    }

    const credentialsError = validateCredentials(credentials);
    if (credentialsError) {
        logOutput(credentialsError, true);
        setStatus('Invalid payload');
        return;
    }

    await runSend({
        ticketKey,
        sendBtn,
        approvalBox,
        headerLines: [
            'STARTING CREDENTIALS SEND',
            `Ticket: ${ticketKey}`,
            `Credentials: ${JSON.stringify(redactCredentials(credentials))}`
        ],
        payload: { issueKey: ticketKey, credentials },
        action: 'GVA credentials update'
    });
}

async function runSend({ ticketKey, sendBtn, approvalBox, headerLines, payload, action }) {
    sendBtn.disabled = true;
    finalReport = '';
    const originalLabel = sendBtn.innerHTML;
    sendBtn.innerHTML = 'Sending…';
    setStatus('Running');

    logOutput('========================================', true);
    headerLines.forEach((line) => logOutput(line));
    logOutput('========================================\n');

    let executionStatus = 'Success';
    const batchSummary = [];

    try {
        let result;

        if (applyGvaConfigCredentialsUrl) {
            const headers = await getGliaHeaders();
            logOutput('Calling ApplyGvaConfigCredentials Glia Function…');
            const res = await fetch(applyGvaConfigCredentialsUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            result = await res.json();
            if (!result.success) throw new Error(result.error || 'Glia Function returned success: false');
            if (result.docBase64 && result.filename) {
                downloadBase64Docx(result.filename, result.docBase64);
            }
        } else {
            logOutput('ApplyGvaConfigCredentials URL is not set. Building the Word stand-in in the browser.');
            const doc = buildGvaConfigDocx(payload);
            downloadBytes(doc.filename, doc.bytes);
            result = {
                success: true,
                summary: {
                    item: ticketKey,
                    action: 'Wrote Word stand-in',
                    status: 'OK',
                    logs: [`Downloaded ${doc.filename}`],
                    filename: doc.filename
                }
            };
        }

        const summary = result.summary || {
            item: ticketKey,
            action: 'Wrote Word stand-in',
            status: 'OK'
        };
        (summary.logs || []).forEach((msg) => logOutput(`   -> ${msg}`));
        batchSummary.push(summary);
        logOutput('\nSEND FINISHED');
        renderSummaryTable(batchSummary);
        await saveExecutionLog(ticketKey, executionStatus, batchSummary, action);
        sendBtn.innerHTML = 'Completed';
        setStatus('Completed');
    } catch (error) {
        logOutput(`\nFAILED: ${error.message}`);
        executionStatus = 'Failed';
        batchSummary.push({ item: ticketKey, action: 'Error', status: 'Failed' });
        renderSummaryTable(batchSummary);
        try { await saveExecutionLog(ticketKey, executionStatus, batchSummary, action); } catch (e) { console.error(e); }
        sendBtn.innerHTML = 'Retry';
        sendBtn.disabled = false;
        setStatus('Failed');
        return;
    }

    setTimeout(() => {
        sendBtn.innerHTML = originalLabel;
        sendBtn.disabled = approvalBox ? !approvalBox.checked : false;
    }, 1500);
}

function validateCoreConfig(coreConfig) {
    if (!isPlainObject(coreConfig)) {
        return 'Core configuration must be a JSON object.';
    }
    if (Object.keys(coreConfig).length === 0) {
        return 'Core configuration is empty. Add only the keys you want to change.';
    }

    const issues = collectCoreConfigIssues(coreConfig, CORE_CONFIG_REFERENCE);
    if (issues.length) {
        const shown = issues.slice(0, 12).map((issue) => `  - ${issue}`);
        if (issues.length > shown.length) shown.push(`  …and ${issues.length - shown.length} more`);
        return ['Core configuration rejected. Existing keys can be altered, nothing new can be added:', ...shown].join('\n');
    }

    const firstIdType = getConfigValue(coreConfig, 'bankIntegration.bankAuth.otpIdentifiers.firstIdType');
    const secondIdType = getConfigValue(coreConfig, 'bankIntegration.bankAuth.otpIdentifiers.secondIdType');
    if (secondIdType && secondIdType === firstIdType) {
        return `Core configuration rejected. firstIdType and secondIdType must differ, both are ${firstIdType}.`;
    }

    return null;
}

function validateCredentials(credentials) {
    if (!credentials || !credentials.secrets) {
        return 'Credentials must follow { "secrets": { "api_key_id": "", "api_key_secret": "" } }.';
    }
    if (!('api_key_id' in credentials.secrets) || !('api_key_secret' in credentials.secrets)) {
        return 'credentials.secrets must include api_key_id and api_key_secret.';
    }
    return null;
}

function showCoreConfigError() {
    document.getElementById('coreConfigError').classList.remove('hidden');
    document.getElementById('coreConfigEditor').classList.add('has-error');
}

function clearCoreConfigError() {
    document.getElementById('coreConfigError').classList.add('hidden');
    document.getElementById('coreConfigEditor').classList.remove('has-error');
}

// Grows the core configuration field to fit the whole JSON so a CE can read it
// without scrolling, and collapses it back to the default height.
function toggleCoreConfigExpanded() {
    const input = document.getElementById('coreConfigInput');
    const button = document.getElementById('coreConfigExpand');
    const expanded = button.getAttribute('aria-expanded') === 'true';

    // scrollHeight reads 0 while the box is collapsed, which would pin the
    // field to its min-height once the box is shown again.
    if (!input.offsetParent) return;

    input.style.height = expanded ? '' : `${input.scrollHeight}px`;
    button.setAttribute('aria-expanded', String(!expanded));
    button.innerHTML = expanded ? 'Expand' : 'Collapse';
    renderCoreConfigHighlight();
}

// The theme is already applied by the inline script in the page head. This only
// keeps the button label in step and remembers the choice.
function initThemeToggle() {
    const button = document.getElementById('themeToggle');
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark');

    button.addEventListener('click', () => {
        const dark = document.documentElement.getAttribute('data-theme') !== 'dark';
        applyTheme(dark);
        try {
            localStorage.setItem('gvaConfigTheme', dark ? 'dark' : 'light');
        } catch (error) {
            console.warn('Could not persist the theme choice.', error);
        }
    });
}

function applyTheme(dark) {
    const button = document.getElementById('themeToggle');
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    button.setAttribute('aria-pressed', String(dark));
    button.innerHTML = dark ? '☀️ Light' : '🌙 Dark';
}

// Strings (optionally followed by a colon, which makes them keys), booleans,
// null, numbers, and structural punctuation. Anything else is left in the
// default text colour. This is a tokenizer, not a parser: it has to colour
// text while a CE is still mid-edit, so it can never assume the input parses.
const JSON_TOKEN_PATTERN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}\[\],])/g;

function highlightJson(text) {
    let html = '';
    let lastIndex = 0;
    let match;

    JSON_TOKEN_PATTERN.lastIndex = 0;
    while ((match = JSON_TOKEN_PATTERN.exec(text)) !== null) {
        const [raw, str, colon, bool, nul, num, punct] = match;
        html += escapeHtml(text.slice(lastIndex, match.index));

        if (str !== undefined) {
            html += `<span class="${colon ? 'tok-key' : 'tok-string'}">${escapeHtml(str)}</span>`;
            if (colon) html += `<span class="tok-punct">${escapeHtml(colon)}</span>`;
        } else if (bool !== undefined) {
            html += `<span class="tok-boolean">${escapeHtml(bool)}</span>`;
        } else if (nul !== undefined) {
            html += `<span class="tok-null">${escapeHtml(nul)}</span>`;
        } else if (num !== undefined) {
            html += `<span class="tok-number">${escapeHtml(num)}</span>`;
        } else {
            html += `<span class="tok-punct">${escapeHtml(punct)}</span>`;
        }

        lastIndex = match.index + raw.length;
    }

    return html + escapeHtml(text.slice(lastIndex));
}

const CORE_CONFIG_EDITOR = { inputId: 'coreConfigInput', highlightId: 'coreConfigHighlight' };
const CREDENTIALS_EDITOR = { inputId: 'credentialsInput', highlightId: 'credentialsHighlight' };

function bindJsonEditor(editor, { onInput, onFormat } = {}) {
    const input = document.getElementById(editor.inputId);
    input.addEventListener('input', () => {
        if (onInput) onInput();
        renderJsonHighlight(editor);
    });
    input.addEventListener('scroll', () => {
        const highlight = document.getElementById(editor.highlightId);
        highlight.scrollTop = input.scrollTop;
        highlight.scrollLeft = input.scrollLeft;
    });
    input.addEventListener('blur', () => formatJsonEditorIfValid(editor, onFormat));
}

function renderJsonHighlight(editor) {
    const input = document.getElementById(editor.inputId);
    const highlight = document.getElementById(editor.highlightId);
    // The trailing newline keeps a line box for a text that ends in Enter,
    // which <pre> would otherwise collapse.
    highlight.innerHTML = `${highlightJson(input.value)}\n`;
    highlight.scrollTop = input.scrollTop;
    highlight.scrollLeft = input.scrollLeft;
}

function setJsonEditorText(editor, text) {
    document.getElementById(editor.inputId).value = text;
    renderJsonHighlight(editor);
}

// Prettier's JSON default is 2-space indent with no trailing commas. We get
// that from JSON.stringify rather than shipping the Prettier bundle into the
// applet. Invalid JSON is left alone so a mid-edit blur does not wipe the field.
function formatJsonEditorIfValid(editor, afterFormat) {
    const input = document.getElementById(editor.inputId);
    let parsed;
    try {
        parsed = JSON.parse(input.value);
    } catch (error) {
        return;
    }
    const pretty = JSON.stringify(parsed, null, 2);
    if (pretty === input.value) return;
    setJsonEditorText(editor, pretty);
    if (afterFormat) afterFormat();
}

function renderCoreConfigHighlight() {
    renderJsonHighlight(CORE_CONFIG_EDITOR);
}

function setCoreConfigText(text) {
    setJsonEditorText(CORE_CONFIG_EDITOR, text);
}

function setCredentialsText(text) {
    setJsonEditorText(CREDENTIALS_EDITOR, text);
}

function initFeatureControls() {
    document.querySelectorAll('[data-config-path]').forEach((control) => {
        control.addEventListener('change', () => writeControlToConfig(control));
    });
    syncFeatureControls();
}

function controlValue(control) {
    return control.type === 'checkbox' ? control.checked : control.value;
}

function writeControlToConfig(control) {
    const path = control.dataset.configPath;
    let config;

    try {
        config = JSON.parse(document.getElementById('coreConfigInput').value);
    } catch (error) {
        showCoreConfigError();
        logOutput(`Core configuration JSON parse error: ${error.message}`, true);
        setStatus('Invalid JSON');
        return;
    }

    const value = controlValue(control);
    const omit = value === '' && OPTIONAL_CORE_CONFIG_PATHS.includes(path);
    const applied = omit ? deleteConfigValue(config, path) : setConfigValue(config, path, value);

    if (!applied) {
        logOutput(`${path} is missing from the core configuration, so the control was not applied.`, true);
        syncFeatureControls();
        return;
    }

    setCoreConfigText(JSON.stringify(config, null, 2));
    clearCoreConfigError();
    refreshCoreConfigHeight();
    syncIdTypeOptions();
}

// Mirrors the JSON back onto the controls so the two can never disagree, which
// also covers a CE editing the JSON by hand.
function syncFeatureControls() {
    let config;

    try {
        config = JSON.parse(document.getElementById('coreConfigInput').value);
    } catch (error) {
        return;
    }

    document.querySelectorAll('[data-config-path]').forEach((control) => {
        const value = getConfigValue(config, control.dataset.configPath);
        if (control.type === 'checkbox') {
            // An indeterminate box means the key is not in the JSON at all.
            control.indeterminate = value === undefined;
            control.checked = value === true;
            return;
        }
        control.value = value === undefined ? '' : String(value);
    });
    syncIdTypeOptions();
}

function getConfigValue(config, path) {
    return path.split('.').reduce((node, key) => (isPlainObject(node) ? node[key] : undefined), config);
}

function setConfigValue(config, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const parent = configParent(config, keys);
    if (!parent) return false;
    parent[lastKey] = value;
    return true;
}

function deleteConfigValue(config, path) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const parent = configParent(config, keys);
    if (!parent) return false;
    delete parent[lastKey];
    return true;
}

function configParent(config, keys) {
    const parent = keys.reduce((node, key) => (isPlainObject(node) ? node[key] : undefined), config);
    return isPlainObject(parent) ? parent : null;
}

// The two identifiers have to differ, so each dropdown greys out whatever the
// other one is already using.
function syncIdTypeOptions() {
    const first = document.getElementById('firstIdType');
    const second = document.getElementById('secondIdType');

    [[first, second.value], [second, first.value]].forEach(([select, taken]) => {
        Array.from(select.options).forEach((option) => {
            option.disabled = option.value !== '' && option.value === taken;
        });
    });
}

// Keeps an expanded field fitted to its content after the JSON is rewritten.
function refreshCoreConfigHeight() {
    const input = document.getElementById('coreConfigInput');
    if (document.getElementById('coreConfigExpand').getAttribute('aria-expanded') !== 'true') return;
    if (!input.offsetParent) return;
    input.style.height = '';
    input.style.height = `${input.scrollHeight}px`;
}

// Hides the whole Core Configuration box, so a CE working only on credentials
// does not have to scroll past the long JSON to reach the panel below.
function toggleCoreConfigCollapsed() {
    const body = document.getElementById('coreConfigBody');
    const header = document.getElementById('coreConfigHeader');
    const button = document.getElementById('coreConfigCollapse');
    const expandButton = document.getElementById('coreConfigExpand');
    const expanded = button.getAttribute('aria-expanded') === 'true';

    body.classList.toggle('hidden', expanded);
    header.classList.toggle('is-collapsed', expanded);
    // Nothing to resize while the field is out of view.
    expandButton.classList.toggle('hidden', expanded);
    button.setAttribute('aria-expanded', String(!expanded));
    button.innerHTML = expanded ? 'Show' : 'Hide';
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function describeType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'an array';
    if (isPlainObject(value)) return 'an object';
    return `a ${typeof value}`;
}

// Walks the submitted config against the reference: rejects keys that do not
// already exist and values whose type differs from the reference value.
function collectCoreConfigIssues(input, reference, path = '') {
    const issues = [];

    Object.keys(input).forEach((key) => {
        const keyPath = path ? `${path}.${key}` : key;

        if (!Object.prototype.hasOwnProperty.call(reference, key)) {
            issues.push(`${keyPath} is not a core configuration key`);
            return;
        }

        const expected = reference[key];
        const value = input[key];

        if (isPlainObject(expected)) {
            if (!isPlainObject(value)) {
                issues.push(`${keyPath} must be an object, got ${describeType(value)}`);
                return;
            }
            issues.push(...collectCoreConfigIssues(value, expected, keyPath));
            return;
        }

        // The reference value is null, so it carries no type to compare against.
        if (expected === null) return;

        if (describeType(expected) !== describeType(value)) {
            issues.push(`${keyPath} must be ${describeType(expected)}, got ${describeType(value)}`);
        }
    });

    return issues;
}

function listKeyPaths(obj, path = '') {
    return Object.keys(obj).flatMap((key) => {
        const keyPath = path ? `${path}.${key}` : key;
        return isPlainObject(obj[key]) ? listKeyPaths(obj[key], keyPath) : [keyPath];
    });
}

function redactCredentials(credentials) {
    const id = credentials?.secrets?.api_key_id || '';
    const secret = credentials?.secrets?.api_key_secret || '';
    return {
        secrets: {
            api_key_id: id ? `${String(id).slice(0, 5)}…` : '(empty)',
            api_key_secret: secret ? `provided (${String(secret).length} chars)` : '(empty)'
        }
    };
}

function renderSummaryTable(summary) {
    let tableHtml = `
    <div style="margin-top: 20px; border-top: 2px solid #fff; padding-top: 10px;">
        <h4 style="color: #00d1b2;">Automation Summary Report</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px;">
            <thead>
                <tr style="border-bottom: 1px solid #555; text-align: left;">
                    <th style="padding: 5px;">Item</th><th style="padding: 5px;">Action</th><th style="padding: 5px;">Status</th>
                </tr>
            </thead>
            <tbody>`;
    summary.forEach((item) => {
        tableHtml += `<tr style="border-bottom: 1px solid #333;"><td style="padding: 5px;">${item.item || item.email || ''}</td><td style="padding: 5px;">${item.action}</td><td style="padding: 5px; text-align: center;">${item.status}</td></tr>`;
    });
    tableHtml += `</tbody></table></div>`;
    const summaryDiv = document.createElement('div');
    summaryDiv.innerHTML = tableHtml;
    outputConsole.appendChild(summaryDiv);
    outputConsole.scrollTop = outputConsole.scrollHeight;
    concatTexts('Summary table rendered internally.');
}

async function saveExecutionLog(ticketKey, status, executionSummaryReport, action) {
    try {
        const headers = await getGliaHeaders();
        const payload = {
            siteId: CE_TEST_SITE_ID,
            userId: userMail,
            action: action || 'GVA configuration change',
            automation: 'GB Configs',
            status,
            ticket: ticketKey,
            url: applyGvaConfigCredentialsUrl || 'local-word-standin',
            finalReport: executionSummaryReport
                .map((item) => `Item: ${item.item || ticketKey} Action: ${item.action} Status: ${item.status}`)
                .join('\n')
        };
        const res = await fetch(writeLogURL, { method: 'POST', headers, body: JSON.stringify(payload) });
        const result = await res.json();
        if (result.success) logOutput('Audit log saved.');
        else logOutput(`Audit log failed: ${result.error || 'unknown error'}`);
    } catch (e) {
        console.error('Failed to call Log DB for WRITE action', e);
        logOutput('Audit log skipped (Glia SDK or write_log unavailable).');
    }
}

function clearActivePanels() {
    const existingPanel = document.querySelector('.collapsible-row');
    if (existingPanel) existingPanel.remove();
}

function setStatus(text) {
    if (outputStatus) outputStatus.textContent = text;
}

function logOutput(msg, clear = false) {
    if (clear) outputConsole.innerText = '';
    outputConsole.innerText += msg + '\n';
    outputConsole.scrollTop = outputConsole.scrollHeight;
    concatTexts(msg);
}

function concatTexts(text) {
    finalReport += text + '\n';
    return true;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function downloadBytes(filename, bytes) {
    const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function downloadBase64Docx(filename, base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    downloadBytes(filename, bytes);
}

/* ---- Minimal .docx (ZIP STORE) for the AppConfig stand-in ---- */

function buildGvaConfigDocx({ issueKey, coreConfig, credentials }) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `gva-${coreConfig ? 'core-config' : 'credentials'}-${issueKey}-${stamp}.docx`;

    // The document carries the payload only: no title, ticket or timestamp.
    const bodyXml = wordDocumentXml([
        [JSON.stringify(coreConfig || credentials, null, 2), false]
    ]);

    const files = {
        '[Content_Types].xml': contentTypesXml(),
        '_rels/.rels': relsXml(),
        'word/document.xml': bodyXml,
        'word/_rels/document.xml.rels': documentRelsXml()
    };
    return { filename, bytes: zipStore(files) };
}

function contentTypesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
}

function relsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

function documentRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;
}

function wordDocumentXml(blocks) {
    const paragraphs = blocks.flatMap(([text, heading]) => {
        return String(text).split('\n').map((line) => {
            const runProps = heading ? '<w:rPr><w:b/><w:sz w:val="28"/></w:rPr>' : '';
            return `<w:p><w:r>${runProps}<w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>`;
        });
    }).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphs}<w:sectPr/></w:body>
</w:document>`;
}

function xmlEscape(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function concatBytes(parts) {
    const total = parts.reduce((n, p) => n + p.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    parts.forEach((p) => { out.set(p, offset); offset += p.length; });
    return out;
}

function u16(n) {
    const b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, n, true);
    return b;
}

function u32(n) {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, n, true);
    return b;
}

function zipStore(fileMap) {
    const encoder = new TextEncoder();
    const locals = [];
    const centrals = [];
    let offset = 0;

    Object.entries(fileMap).forEach(([name, text]) => {
        const nameBytes = encoder.encode(name);
        const data = encoder.encode(text);
        const crc = crc32(data);
        const local = concatBytes([
            encoder.encode('PK\u0003\u0004'),
            u16(20), u16(0), u16(0), u16(0), u16(0),
            u32(crc), u32(data.length), u32(data.length),
            u16(nameBytes.length), u16(0),
            nameBytes, data
        ]);
        const central = concatBytes([
            encoder.encode('PK\u0001\u0002'),
            u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
            u32(crc), u32(data.length), u32(data.length),
            u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0),
            u32(0), u32(offset),
            nameBytes
        ]);
        locals.push(local);
        centrals.push(central);
        offset += local.length;
    });

    const centralDir = concatBytes(centrals);
    const end = concatBytes([
        new TextEncoder().encode('PK\u0005\u0006'),
        u16(0), u16(0),
        u16(centrals.length), u16(centrals.length),
        u32(centralDir.length), u32(offset),
        u16(0)
    ]);
    return concatBytes([...locals, centralDir, end]);
}
