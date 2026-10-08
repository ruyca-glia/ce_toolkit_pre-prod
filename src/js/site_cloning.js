const functionURL = 'https://api.glia.com/integrations/d64fa03f-e3d1-4b83-9740-da3b2f07a005/endpoint';
var gliaApi = null;

window.getGliaApi({ version: 'v1' }).then(function (glia) {
    gliaApi = glia;
}).catch(function (err) {
    document.getElementById('error').textContent = 'Glia SDK unavailable. ' + err.message;
    document.getElementById('error').style.display = 'block';
});

// TODO add error logic if inputs are missing 
async function clone() {
    // Gather input
    const siteId = document.getElementById('site-id').value.trim();
    const siteName = document.getElementById('site-name').value.trim();
    const address = document.getElementById('site-address').value.trim();
    const bearerToken = document.getElementById('bearer-token').value.trim();
    const baseURL = document.getElementById('base-url').value.trim();

    if (!gliaApi) {
        return;
    }t

    try {
        var headers = await gliaApi.getRequestHeaders();
        headers['Content-Type'] = 'application/json';
        headers['Authorization'] = bearerToken;

        var res = await fetch(functionURL, {
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
    }

}

// Trigger on "Run Cloning" clicked
document.getElementById('run-query').addEventListener('click', function () {
    clone();
});

// Gets the logged in operator
// const glia = await window.getGliaApi({ version: 'v1' });
// const user = await glia.getUser();   // { name, email, … }
// const userEmail = user?.email ?? 'support@glia.com';   // always keep a fallback