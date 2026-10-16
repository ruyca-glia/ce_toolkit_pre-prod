const INVOCATION_URI = 'https://api.glia.com/integrations/58903b6c-b724-4f14-b75e-e4d924b3db65/endpoint';
const WRITE_LOG_URI = 'https://api.glia.com/integrations/f026a5b6-ba81-4211-99e1-3667bbaf16e9/endpoint';

function appendOutput(text) {
    const outputElem = document.getElementById('output');
    if (outputElem.textContent === 'Waiting…') {
        outputElem.textContent = text + '\n';
    } else {
        outputElem.textContent += text + '\n';
    }
}

async function clone() {
    const outputElem = document.getElementById('output');
    const statusElem = document.querySelector('.output-status');

    // Reset output console state
    outputElem.textContent = 'Running cloning process...\n';
    if (statusElem) {
        statusElem.textContent = 'In Progress';
    }

    const siteId = document.getElementById('site-id').value.trim();
    const siteName = document.getElementById('site-name').value.trim();
    const address = document.getElementById('site-address').value.trim();
    const bearerToken = document.getElementById('bearer-token').value.trim();
    const baseURL = document.getElementById('base-url').value.trim();

    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        var headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        var res = await fetch(INVOCATION_URI, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                siteId: siteId,
                siteName: siteName,
                address: address,
                baseURL: baseURL,
                bearer: bearerToken
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error('HTTP ' + res.status);
        }

        writeAuditLog({
            action: 'Site Cloning',
            status: 'Completed',
            finalReport: JSON.stringify({
                data: data
            })
        });

        // Render returned logs to the output box
        if (data.logs && data.logs.length > 0) {
            data.logs.forEach(line => appendOutput(line));
        }

        appendOutput('✓ ' + data.message);
        if (statusElem) {
            statusElem.textContent = 'Completed';
        }

    } catch (err) {
        appendOutput('Error: ' + err.message);
        if (statusElem) {
            statusElem.textContent = 'Failed';
        }
        console.log("Error: " + err.message);    
    }
}

async function writeAuditLog({ action, status, finalReport = '' }) {
    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        const headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        const user = await glia.getUser().catch(() => null);

        const res = await fetch(WRITE_LOG_URI, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                siteId: 'a5c110f6-a4a5-47d9-bbf1-d03d7a5e5089', // CE toolkit testing
                userId: user?.email ?? 'support@glia.com',
                action,
                automation: 'Site Cloning',
                status,
                url: INVOCATION_URI,
                finalReport
            })
        });

        const result = await res.json();
        if (!result.success) console.error('Audit log failed:', result.error);

    } catch (err) {
        console.error('Could not reach the audit log function', err);
    }
}

// Trigger on "Run Cloning" clicked
document.getElementById('cloning-form').addEventListener('submit', function (e) {
    e.preventDefault();
    clone();
});

// Clear Output Button Listener
document.getElementById('clear-output')?.addEventListener('click', function () {
    const outputElem = document.getElementById('output');
    const statusElem = document.querySelector('.output-status');
    outputElem.textContent = 'Waiting…';
    if (statusElem) statusElem.textContent = 'Ready';
});