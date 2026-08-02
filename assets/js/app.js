// ApexTraders - Core Application Manager (100% Production Ready)

const STORAGE_KEY = 'apex_master_data';

document.addEventListener('DOMContentLoaded', () => {
    initApexApp();
});

function initApexApp() {
    // 1. Storage setup
    ensureDefaultMasterData();

    // 2. Initial Sync & UI Setup
    syncUIWithMasterData();
    setupGlobalEventListeners();

    // 3. Periodic Background Sync
    setInterval(() => {
        pullLatestFirebaseData();
    }, 15000);
}

function getMasterData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Localstorage access error:", e);
        return {};
    }
}

function saveMasterDataLocally(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Localstorage write error:", e);
    }
}

function ensureDefaultMasterData() {
    const existing = getMasterData();
    if (!existing || Object.keys(existing).length === 0) {
        const defaultData = {
            settings: {
                fbEnable: true,
                firebaseUrl: "https://apextraders-default-rtdb.firebaseio.com/",
                tgEnable: true,
                tgToken: "",
                tgChatId: "",
                cronEnable: true,
                cronProvider: "vercel",
                ruleAutotradeEnable: true,
                rulePaperMode: true,
                ruleSltpGuard: true
            },
            strategies: [
                {
                    id: "STRAT_DEFAULT_1",
                    name: "Default BTC Momentum",
                    coin: "BTCUSDT",
                    sl: 1.5,
                    tp: 3.0,
                    active: true
                }
            ],
            trades: []
        };
        saveMasterDataLocally(defaultData);
    }
}

function syncUIWithMasterData() {
    const master = getMasterData();
    const settings = master.settings || {};

    // Mode Indicators Update
    const modeBadge = document.getElementById('global-mode-badge');
    if (modeBadge) {
        if (settings.rulePaperMode !== false) {
            modeBadge.className = "badge bg-info text-dark";
            modeBadge.innerText = "PAPER MODE";
        } else {
            modeBadge.className = "badge bg-warning text-dark";
            modeBadge.innerText = "LIVE SIGNAL MODE";
        }
    }

    // Auto-Signal Status Badge Update
    const autoBadge = document.getElementById('global-autotrade-badge');
    if (autoBadge) {
        if (settings.ruleAutotradeEnable !== false) {
            autoBadge.className = "badge bg-success";
            autoBadge.innerText = "SIGNALS ON";
        } else {
            autoBadge.className = "badge bg-secondary";
            autoBadge.innerText = "SIGNALS PAUSED";
        }
    }

    // Render Recent Signals/Trades Table
    renderRecentSignalsTable(master.trades || []);
}

function renderRecentSignalsTable(trades) {
    const tableBody = document.getElementById('trades-table-body') || document.getElementById('signals-table-body');
    if (!tableBody) return;

    if (!trades || trades.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    No active signals or trades recorded yet. Cron engine will populate signals automatically.
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    trades.slice(0, 15).forEach(trade => {
        const isBuy = trade.action === 'BUY';
        html += `
            <tr>
                <td><small class="text-muted">${trade.time || '--:--'}</small></td>
                <td><strong>${escapeHtml(trade.strategy || 'Signal Engine')}</strong></td>
                <td><span class="badge bg-light text-dark border">#${escapeHtml(trade.symbol || 'N/A')}</span></td>
                <td>
                    <span class="badge ${isBuy ? 'bg-success' : 'bg-danger'}">
                        ${trade.action || 'SIGNAL'}
                    </span>
                </td>
                <td>$${trade.entryPrice || '0.00'}</td>
                <td>
                    <small class="text-danger">SL: $${trade.sl || '0'}</small><br>
                    <small class="text-success">TP: $${trade.tp || '0'}</small>
                </td>
                <td>
                    <span class="badge bg-primary">${trade.status || 'ACTIVE'}</span>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

function setupGlobalEventListeners() {
    // Global Save Trigger for Child Modules
    window.triggerGlobalSave = function() {
        const master = getMasterData();
        syncUIWithMasterData();
        pushMasterToFirebase(master);
    };

    // Manual Refresh Button Listener
    const refreshBtn = document.getElementById('btn-refresh-signals');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            pullLatestFirebaseData();
        });
    }
}

async function pushMasterToFirebase(masterData) {
    const settings = masterData.settings || {};
    if (settings.fbEnable && settings.firebaseUrl) {
        try {
            const cleanUrl = settings.firebaseUrl.replace(/\/+$/, "");
            await fetch(`${cleanUrl}/app_master_data.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(masterData)
            });
            console.log("Master State synced to Firebase.");
        } catch (err) {
            console.error("Firebase Sync Error:", err);
        }
    }
}

async function pullLatestFirebaseData() {
    const master = getMasterData();
    const settings = master.settings || {};

    if (settings.fbEnable && settings.firebaseUrl) {
        try {
            const cleanUrl = settings.firebaseUrl.replace(/\/+$/, "");
            const res = await fetch(`${cleanUrl}/app_master_data.json`);
            if (res.ok) {
                const cloudData = await res.json();
                if (cloudData && typeof cloudData === 'object') {
                    saveMasterDataLocally(cloudData);
                    syncUIWithMasterData();
                }
            }
        } catch (err) {
            console.error("Error pulling cloud data:", err);
        }
    }
}

function escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
