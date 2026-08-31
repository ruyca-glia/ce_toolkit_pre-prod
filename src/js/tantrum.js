var GATEWAY_URL = 'https://api.glia.com/integrations/1df8f530-35c4-4557-9c1b-a36be5d273a0/endpoint';
const WRITE_LOG_URI = 'https://api.glia.com/integrations/f026a5b6-ba81-4211-99e1-3667bbaf16e9/endpoint';
var sessionLog  = [];
var gliaApi     = null;

window.getGliaApi({ version: 'v1' }).then(function(glia) {
    gliaApi = glia;
}).catch(function(err) {
    document.getElementById('error').textContent   = 'Glia SDK unavailable. ' + err.message;
    document.getElementById('error').style.display = 'block';
});

async function analyze() {
    var message = document.getElementById('messageInput').value.trim();
    var isVip   = document.getElementById('vipToggle').checked;
    var btn     = document.getElementById('analyzeBtn');
    var errorEl = document.getElementById('error');
    var result  = document.getElementById('result');

    errorEl.style.display = 'none';
    result.style.display  = 'none';

    if (!gliaApi) {
        errorEl.textContent   = 'Glia SDK not ready. Please wait a moment and try again.';
        errorEl.style.display = 'block';
        return;
    }

    if (!message) {
        errorEl.textContent   = 'Please enter a visitor message.';
        errorEl.style.display = 'block';
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Analyzing…';

    try {
        var headers = await gliaApi.getRequestHeaders();
        headers['Content-Type'] = 'application/json';

        var res = await fetch(GATEWAY_URL, {
            method:  'POST',
            headers: headers,
            body:    JSON.stringify({ message: message, is_vip: isVip })
        });

        if (!res.ok) throw new Error('HTTP ' + res.status);

        var data  = await res.json();
        var alert = data.alert         || 'No response';
        var level = data.tantrum_level || 0;
        var tier  = getTier(alert);

        showResult(alert, level, tier);
        addLog({ message: message, alert: alert, level: level, tier: tier });

    } catch (err) {
        errorEl.textContent   = 'Error: ' + err.message;
        errorEl.style.display = 'block';
    }

    btn.disabled    = false;
    btn.textContent = 'Analyze';
}

function showResult(alert, level, tier) {
    var result = document.getElementById('result');
    var labels = { 'tier-calm': 'Calm', 'tier-mid': 'Frustration', 'tier-high': 'High Alert', 'tier-vip': 'VIP Alert' };
    document.getElementById('resultTier').textContent  = labels[tier] + ' · Level ' + level + '/10';
    document.getElementById('resultAlert').textContent = alert;
    result.className     = tier;
    result.style.display = 'block';
}

function getTier(alert) {
    if (alert.includes('VIP'))        return 'tier-vip';
    if (alert.includes('complaint'))  return 'tier-high';
    if (alert.includes('frustrated')) return 'tier-mid';
    return 'tier-calm';
}

function addLog(entry) {
    var now = new Date();
    entry.time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    sessionLog.unshift(entry);
    renderLog();

    writeAuditLog({
        action: 'Tantrum Meter Analysis',
        status: 'Completed',
        finalReport: JSON.stringify({
            message: entry.message,
            alert: entry.alert,
            level: entry.level,
            tier: entry.tier
        })
    });
}

function renderLog() {
    var list   = document.getElementById('logList');
    var labels = { 'tier-calm': 'Calm', 'tier-mid': 'Frustration', 'tier-high': 'High Alert', 'tier-vip': 'VIP Alert' };
    list.innerHTML = '';

    if (sessionLog.length === 0) {
        list.innerHTML = '<div class="log-empty">No analyses yet this session.</div>';
        return;
    }

    sessionLog.forEach(function(e) {
        var item = document.createElement('div');
        item.className = 'log-item ' + e.tier;
        item.innerHTML =
            '<div class="log-time">' + e.time + '</div>' +
            '<div class="log-body">' +
                '<div class="log-name">' + labels[e.tier] + '</div>' +
                '<div class="log-msg">'  + escHtml(e.alert) + '</div>' +
            '</div>';
        list.appendChild(item);
    });
}

function clearHistory() { sessionLog = []; renderLog(); }
function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

document.getElementById('messageInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); analyze(); }
});

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
                siteId:     'a5c110f6-a4a5-47d9-bbf1-d03d7a5e5089',
                userId:     user?.email ?? 'support@glia.com',
                action,
                automation: 'Tantrum Analyzer',
                status,
                url:        GATEWAY_URL, 
                finalReport
            })
        });

        const result = await res.json();
        if (!result.success) console.error('Audit log failed:', result.error);

    } catch (err) {
        console.error('Could not reach the audit log function', err);
    }
}