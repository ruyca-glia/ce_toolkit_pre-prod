/* =========================================================================
 * CE Toolkit — Audit Logs UI
 *
 * Drives the audit-logs view: filtering, rendering, expandable rows,
 * CSV export and pagination.
 *
 * DATA SOURCE: currently served by getMockLogs(). The real implementation
 * will live in fetchLogs() — see the clearly marked stub near the bottom,
 * which is where the DynamoDB query (via Glia Function + SigV4) plugs in.
 * The rest of this file is data-source agnostic: it works on an array of
 * log objects shaped like:
 *
 *   {
 *     userId:     "jane.doe@glia.com",   // who performed the action
 *     timestamp:  "2025-12-31T10:24:00Z", // ISO 8601 (UTC)
 *     action:     "Grant Auth0 access",  // human-readable action
 *     url:        "https://.../api/v2/users",
 *     automation: "Auth0 Automation"     // which tool/automation ran it
 *   }
 *
 * Extra fields are tolerated — they show up automatically in the expanded
 * detail panel without any table changes.
 * ====================================================================== */

(() => {
    'use strict';

    const PAGE_SIZE = 10;

    // ---- UI state ---------------------------------------------------------
    const state = {
        allLogs: [],            // everything fetched from the data source
        filtered: [],           // after applying current filters
        visibleCount: PAGE_SIZE,
        timePreset: '24h',      // '24h' | '7d' | '30d' | 'custom'
        customFrom: null,       // Date | null
        customTo: null,         // Date | null
        user: '',
        automation: 'all',
        expanded: new Set(),    // set of expanded row ids
    };

    // ---- DOM refs ---------------------------------------------------------
    const el = {
        segmented:    document.querySelector('.segmented'),
        customRange:  document.getElementById('custom-range'),
        from:         document.getElementById('filter-from'),
        to:           document.getElementById('filter-to'),
        user:         document.getElementById('filter-user'),
        automation:   document.getElementById('filter-automation'),
        resultCount:  document.getElementById('result-count'),
        clearBtn:     document.getElementById('btn-clear'),
        exportBtn:    document.getElementById('btn-export'),
        retryBtn:     document.getElementById('btn-retry'),
        loadMoreWrap: document.getElementById('load-more-wrap'),
        loadMoreBtn:  document.getElementById('btn-load-more'),
        tableWrap:    document.getElementById('table-wrap'),
        tbody:        document.getElementById('logs-body'),
        loading:      document.getElementById('state-loading'),
        error:        document.getElementById('state-error'),
        errorDetail:  document.getElementById('error-detail'),
        empty:        document.getElementById('state-empty'),
    };

    // ---- Helpers ----------------------------------------------------------
    const show = (node) => node.classList.remove('hidden');
    const hide = (node) => node.classList.add('hidden');

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function formatAbsolute(iso) {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        // 2025-12-31 10:24:00 UTC
        return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
    }

    function formatRelative(iso) {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        const diffSec = Math.round((Date.now() - d.getTime()) / 1000);
        const units = [
            ['year', 31536000], ['month', 2592000], ['day', 86400],
            ['hour', 3600], ['min', 60], ['sec', 1],
        ];
        if (diffSec < 45) return 'just now';
        for (const [name, secs] of units) {
            const value = Math.floor(diffSec / secs);
            if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`;
        }
        return 'just now';
    }

    // Cutoff for the active time preset; null means "no lower bound".
    function presetCutoff() {
        const now = Date.now();
        switch (state.timePreset) {
            case '24h': return new Date(now - 24 * 3600 * 1000);
            case '7d':  return new Date(now - 7 * 86400 * 1000);
            case '30d': return new Date(now - 30 * 86400 * 1000);
            default:    return null; // custom handled separately
        }
    }

    // ---- Filtering --------------------------------------------------------
    function applyFilters() {
        const userQuery = state.user.trim().toLowerCase();
        const cutoff = presetCutoff();

        state.filtered = state.allLogs.filter((log) => {
            const t = new Date(log.timestamp).getTime();

            // Time
            if (state.timePreset === 'custom') {
                if (state.customFrom && t < state.customFrom.getTime()) return false;
                // include the whole "to" day (end of day)
                if (state.customTo && t > state.customTo.getTime() + 86399999) return false;
            } else if (cutoff && t < cutoff.getTime()) {
                return false;
            }

            // User (substring match)
            if (userQuery && !String(log.userId).toLowerCase().includes(userQuery)) return false;

            // Automation (exact match)
            if (state.automation !== 'all' && log.automation !== state.automation) return false;

            return true;
        });

        // Newest first
        state.filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        state.visibleCount = PAGE_SIZE;
        render();
    }

    // ---- Rendering --------------------------------------------------------
    function render() {
        [el.loading, el.error, el.empty, el.tableWrap, el.loadMoreWrap].forEach(hide);

        const total = state.filtered.length;
        el.resultCount.textContent = total === 1 ? '1 execution' : `${total} executions`;

        if (total === 0) {
            show(el.empty);
            return;
        }

        const page = state.filtered.slice(0, state.visibleCount);
        el.tbody.innerHTML = page.map(rowHtml).join('');
        show(el.tableWrap);

        if (state.visibleCount < total) show(el.loadMoreWrap);
    }

    function rowHtml(log) {
        const id = `${log.timestamp}#${log.userId}`;
        const isOpen = state.expanded.has(id);
        const main = `
            <tr class="log-row ${isOpen ? 'is-open' : ''}" data-id="${escapeHtml(id)}">
                <td class="col-expand">
                    <span class="expand-caret" aria-hidden="true">${isOpen ? '▾' : '▸'}</span>
                </td>
                <td class="cell-mono col-time" title="${escapeHtml(formatAbsolute(log.timestamp))}">
                    ${escapeHtml(formatRelative(log.timestamp))}
                </td>
                <td class="col-user">${escapeHtml(log.userId)}</td>
                <td class="col-automation">
                    <span class="badge badge--${slug(log.automation)}">${escapeHtml(log.automation)}</span>
                </td>
                <td class="col-action">${escapeHtml(log.action)}</td>
                <td class="cell-mono col-url" title="${escapeHtml(log.url)}">${escapeHtml(log.url)}</td>
            </tr>`;

        if (!isOpen) return main;

        const fields = Object.entries(log)
            .map(([k, v]) => `
                <div class="detail-key">${escapeHtml(k)}</div>
                <div class="detail-val cell-mono">${escapeHtml(typeof v === 'object' ? JSON.stringify(v) : v)}</div>`)
            .join('');

        return main + `
            <tr class="log-detail-row">
                <td></td>
                <td colspan="5">
                    <div class="detail-grid">${fields}</div>
                </td>
            </tr>`;
    }

    function slug(s) {
        return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    // ---- CSV export -------------------------------------------------------
    // NOTE: this applet runs inside a sandboxed iframe whose `sandbox` attribute
    // lacks `allow-downloads`, so a Blob + <a download> file download is blocked
    // by the browser (and popups can't escape the sandbox to download either).
    // We therefore copy the CSV to the clipboard, with a manual-copy modal as a
    // fallback. For a true downloadable file, generate it server-side in a Glia
    // Function (e.g. write to S3, return a presigned URL the user opens in a
    // normal browser tab) — see the chat notes.
    function buildCsv(logs) {
        const cols = ['timestamp', 'userId', 'automation', 'action', 'url'];
        const esc = (v) => {
            const s = String(v ?? '');
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        return [
            cols.join(','),
            ...logs.map((log) => cols.map((c) => esc(log[c])).join(',')),
        ].join('\n');
    }

    async function exportCsv() {
        if (!state.filtered.length) {
            toast('Nothing to export — no rows match the current filters.');
            return;
        }
        const csv = buildCsv(state.filtered);
        try {
            await navigator.clipboard.writeText(csv);
            toast(`Copied ${state.filtered.length} row(s) as CSV to your clipboard.`);
        } catch (err) {
            // Clipboard API unavailable/blocked — fall back to manual copy.
            showCsvFallback(csv);
        }
    }

    // Lightweight toast confirmation.
    let toastTimer;
    function toast(message) {
        let node = document.getElementById('toast');
        if (!node) {
            node = document.createElement('div');
            node.id = 'toast';
            node.className = 'toast';
            node.setAttribute('role', 'status');
            document.body.appendChild(node);
        }
        node.textContent = message;
        node.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => node.classList.remove('is-visible'), 3200);
    }

    // Fallback modal: read-only textarea the user can select-all and copy.
    function showCsvFallback(csv) {
        const overlay = document.createElement('div');
        overlay.className = 'csv-modal-overlay';
        overlay.innerHTML = `
            <div class="csv-modal" role="dialog" aria-modal="true" aria-label="Copy CSV">
                <p class="csv-modal-title">Copy the CSV below</p>
                <p class="csv-modal-hint">Automatic copy was blocked. Select all (Ctrl/Cmd+A) and copy, then paste into a .csv file or a spreadsheet.</p>
                <textarea class="csv-modal-text" readonly></textarea>
                <div class="csv-modal-actions">
                    <button type="button" class="btn btn-secondary" data-close>Close</button>
                    <button type="button" class="btn btn-primary" data-copy>Select &amp; copy</button>
                </div>
            </div>`;
        const ta = overlay.querySelector('.csv-modal-text');
        ta.value = csv;
        const close = () => overlay.remove();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        overlay.querySelector('[data-close]').addEventListener('click', close);
        overlay.querySelector('[data-copy]').addEventListener('click', () => {
            ta.focus();
            ta.select();
            try { document.execCommand('copy'); toast('Copied to clipboard.'); } catch (_) {}
        });
        document.body.appendChild(overlay);
        ta.focus();
        ta.select();
    }

    // ---- Events -----------------------------------------------------------
    function wireEvents() {
        // Time preset buttons
        el.segmented.addEventListener('click', (e) => {
            const btn = e.target.closest('.segmented-btn');
            if (!btn) return;
            el.segmented.querySelectorAll('.segmented-btn')
                .forEach((b) => b.classList.toggle('is-active', b === btn));
            state.timePreset = btn.dataset.preset;
            el.customRange.classList.toggle('hidden', state.timePreset !== 'custom');
            applyFilters();
        });

        // Custom range
        el.from.addEventListener('change', () => {
            state.customFrom = el.from.value ? new Date(el.from.value) : null;
            applyFilters();
        });
        el.to.addEventListener('change', () => {
            state.customTo = el.to.value ? new Date(el.to.value) : null;
            applyFilters();
        });

        // User search (debounced)
        let userTimer;
        el.user.addEventListener('input', () => {
            clearTimeout(userTimer);
            userTimer = setTimeout(() => {
                state.user = el.user.value;
                applyFilters();
            }, 200);
        });

        // Automation
        el.automation.addEventListener('change', () => {
            state.automation = el.automation.value;
            applyFilters();
        });

        // Expand / collapse rows (delegated)
        el.tbody.addEventListener('click', (e) => {
            const row = e.target.closest('.log-row');
            if (!row) return;
            const id = row.dataset.id;
            if (state.expanded.has(id)) state.expanded.delete(id);
            else state.expanded.add(id);
            render();
        });

        // Clear filters
        el.clearBtn.addEventListener('click', () => {
            state.timePreset = '24h';
            state.customFrom = state.customTo = null;
            state.user = '';
            state.automation = 'all';
            el.user.value = '';
            el.automation.value = 'all';
            el.from.value = el.to.value = '';
            hide(el.customRange);
            el.segmented.querySelectorAll('.segmented-btn')
                .forEach((b) => b.classList.toggle('is-active', b.dataset.preset === '24h'));
            applyFilters();
        });

        el.exportBtn.addEventListener('click', exportCsv);
        el.retryBtn.addEventListener('click', load);
        el.loadMoreBtn.addEventListener('click', () => {
            state.visibleCount += PAGE_SIZE;
            render();
        });
    }

    // ---- Load flow --------------------------------------------------------
    async function load() {
        [el.error, el.empty, el.tableWrap, el.loadMoreWrap].forEach(hide);
        show(el.loading);
        try {
            state.allLogs = await fetchLogs();
            hide(el.loading);
            applyFilters();
        } catch (err) {
            hide(el.loading);
            el.errorDetail.textContent = err?.message || 'Something went wrong while fetching the logs.';
            show(el.error);
        }
    }

    /* =====================================================================
     * fetchLogs() — DATA SOURCE STUB
     * ---------------------------------------------------------------------
     * Replace the body with the real call once IAM/DynamoDB is unblocked.
     * Expected: resolve to an array of log objects (see shape at top of file).
     *
     * Real implementation will roughly be:
     *   const res = await fetch('<glia-function-endpoint>', { ... });
     *   if (!res.ok) throw new Error(`Request failed: ${res.status}`);
     *   return await res.json();
     *
     * Note: time/user/automation filtering is done client-side here for the
     * mock. When wiring DynamoDB, the time window maps naturally to the
     * sort-key (KeyConditionExpression on timestamp#id) and automation/user
     * can go into a FilterExpression — at which point applyFilters() can be
     * slimmed down or kept as a client-side refinement.
     * =================================================================== */
    function fetchLogs() {
        return new Promise((resolve) => {
            setTimeout(() => resolve(getMockLogs()), 400); // simulate latency
        });
    }

    // ---- Mock data (remove once fetchLogs hits the real backend) ----------
    function getMockLogs() {
        const now = Date.now();
        const ago = (mins) => new Date(now - mins * 60000).toISOString();
        return [
            { userId: 'jane.doe@glia.com',    timestamp: ago(12),    action: 'Grant Auth0 access',        url: 'https://glia.auth0.com/api/v2/users/auth0|123/roles', automation: 'Auth0 Automation' },
            { userId: 'mark.li@glia.com',      timestamp: ago(48),    action: 'Revoke Auth0 access',       url: 'https://glia.auth0.com/api/v2/users/auth0|456/roles', automation: 'Auth0 Automation' },
            { userId: 'jane.doe@glia.com',     timestamp: ago(95),    action: 'Create onboarding exercise', url: 'https://api.glia.com/onboarding/exercises',           automation: 'Onboarding' },
            { userId: 'sofia.ramos@glia.com',  timestamp: ago(180),   action: 'Reset exercise progress',   url: 'https://api.glia.com/onboarding/progress/reset',      automation: 'Onboarding' },
            { userId: 'mark.li@glia.com',      timestamp: ago(400),   action: 'Grant Auth0 access',        url: 'https://glia.auth0.com/api/v2/users/auth0|789/roles', automation: 'Auth0 Automation' },
            { userId: 'sofia.ramos@glia.com',  timestamp: ago(1500),  action: 'List onboarding cohorts',   url: 'https://api.glia.com/onboarding/cohorts',             automation: 'Onboarding' },
            { userId: 'jane.doe@glia.com',     timestamp: ago(2600),  action: 'Revoke Auth0 access',       url: 'https://glia.auth0.com/api/v2/users/auth0|321/roles', automation: 'Auth0 Automation' },
            { userId: 'diego.cruz@glia.com',   timestamp: ago(4320),  action: 'Create onboarding exercise', url: 'https://api.glia.com/onboarding/exercises',           automation: 'Onboarding' },
            { userId: 'mark.li@glia.com',      timestamp: ago(7200),  action: 'Grant Auth0 access',        url: 'https://glia.auth0.com/api/v2/users/auth0|654/roles', automation: 'Auth0 Automation' },
            { userId: 'sofia.ramos@glia.com',  timestamp: ago(10080), action: 'Reset exercise progress',   url: 'https://api.glia.com/onboarding/progress/reset',      automation: 'Onboarding' },
            { userId: 'diego.cruz@glia.com',   timestamp: ago(14400), action: 'Revoke Auth0 access',       url: 'https://glia.auth0.com/api/v2/users/auth0|987/roles', automation: 'Auth0 Automation' },
            { userId: 'jane.doe@glia.com',     timestamp: ago(28800), action: 'List onboarding cohorts',   url: 'https://api.glia.com/onboarding/cohorts',             automation: 'Onboarding' },
            { userId: 'mark.li@glia.com',      timestamp: ago(40320), action: 'Grant Auth0 access',        url: 'https://glia.auth0.com/api/v2/users/auth0|111/roles', automation: 'Auth0 Automation' },
            { userId: 'diego.cruz@glia.com',   timestamp: ago(50400), action: 'Create onboarding exercise', url: 'https://api.glia.com/onboarding/exercises',           automation: 'Onboarding' },
        ];
    }

    // ---- Init -------------------------------------------------------------
    wireEvents();
    load();
})();