const INVOCATION_URI = 'https://api.glia.com/integrations/d64fa03f-e3d1-4b83-9740-da3b2f07a005/endpoint';
const WRITE_LOG_URI = 'https://api.glia.com/integrations/f026a5b6-ba81-4211-99e1-3667bbaf16e9/endpoint';
var gliaApi = null;

window.getGliaApi({ version: 'v1' }).then(function (glia) {
    gliaApi = glia;
}).catch(function (err) {
    document.getElementById('error').textContent = 'Glia SDK unavailable. ' + err.message;
    document.getElementById('error').style.display = 'block';
});

async function clone() {
    // Gather input
    const siteId = document.getElementById('site-id').value.trim();
    const siteName = document.getElementById('site-name').value.trim();
    const address = document.getElementById('site-address').value.trim();
    const bearerToken = document.getElementById('bearer-token').value.trim();
    const baseURL = document.getElementById('base-url').value.trim();

    // console.log("siteId" + siteId);
    // console.log("siteName" + siteName);
    // console.log("address" + address);
    // console.log("baseURL" + baseURL);

    try {
        const glia = await window.getGliaApi({ version: 'v1' });
        var headers = await glia.getRequestHeaders();
        headers['Content-Type'] = 'application/json';
        headers['Authorization'] = bearerToken;

        var res = await fetch(INVOCATION_URI, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                siteId: siteId,
                siteName: siteName,
                address: address,
                baseURL: baseURL
            })
        });

        if (!res.ok) throw new Error('HTTP ' + res.status);

    } catch (err) {
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
                // siteId: 'a5c110f6-a4a5-47d9-bbf1-d03d7a5e5089',
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
    writeAuditLog();
    console.log("clicked");
    clone();
});