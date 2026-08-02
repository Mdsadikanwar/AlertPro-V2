// assets/js/bot_trading.js - ApexTraders Live Engine Sync

(function() {
    console.log("⚡ Bot Engine Loaded");

    // LocalStorage से डेटा निकालना
    function getStoredTrades() {
        try {
            return JSON.parse(localStorage.getItem('apex_trades') || '[]');
        } catch(e) {
            return [];
        }
    }

    function getMasterSettings() {
        try {
            return JSON.parse(localStorage.getItem('apex_master_settings') || '{}');
        } catch(e) {
            return {};
        }
    }

    // UI में Table और Cards को रेंडर करना
    window.loadBotLogs = async function() {
        const tableBody = document.getElementById('bot-trades-table');
        if (!tableBody) return;

        let trades = getStoredTrades();
        const settings = getMasterSettings();

        // अगर Firebase ON है तो लाइव सिंक करें
        if (settings.cfgFbEnable && settings.cfgFirebase) {
            try {
                const cleanUrl = settings.cfgFirebase.replace(/\/+$/, "");
                const res = await fetch(`${cleanUrl}/apex_master_data/trades.json`);
                if (res.ok) {
                    const fbTrades = await res.json();
                    if (fbTrades && Array.isArray(fbTrades)) {
                        trades = fbTrades;
                        localStorage.setItem('apex_trades', JSON.stringify(trades));
                    }
                }
            } catch (err) {
                console.warn("Firebase sync fallback to local storage:", err);
            }
        }

        // खाली टेबल हैंडलर
        if (!trades || trades.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        कोई ट्रेड्स/सिग्नल्स उपलब्ध नहीं हैं। Vercel Cron चलने का इंतज़ार करें।
                    </td>
                </tr>`;
            updatePnLCards([]);
            return;
        }

        // टेबल HTML बनाना
        let html = '';
        trades.forEach(trade => {
            const isBuy = trade.action === 'BUY';
            const actionBadge = isBuy ? '<span class="badge bg-success">BUY</span>' : '<span class="badge bg-danger">SELL</span>';
            const pnlVal = parseFloat(trade.pnl || 0);
            const pnlColor = pnlVal >= 0 ? 'text-success' : 'text-danger';

            html += `
                <tr>
                    <td><small class="text-muted">${trade.time || '-'}</small></td>
                    <td><strong class="text-info">${trade.strategy || 'Auto Strategy'}</strong></td>
                    <td><span class="badge bg-secondary">${trade.symbol}</span></td>
                    <td>${actionBadge}</td>
                    <td>$${trade.entryPrice} / <span class="text-warning">$${trade.livePrice || trade.entryPrice}</span></td>
                    <td class="${pnlColor} fw-bold">$${pnlVal.toFixed(2)}</td>
                    <td><span class="badge bg-dark border border-warning text-warning">${trade.status || 'SIGNAL_ACTIVE'}</span></td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        updatePnLCards(trades);
    };

    // P&L Summary Cards अपडेटर
    function updatePnLCards(trades) {
        let totalMargin = 0;
        let unrealizedPnl = 0;
        let realizedPnl = 0;

        trades.forEach(t => {
            const pnl = parseFloat(t.pnl || 0);
            if (t.status === 'PAPER_OPEN' || t.status === 'LIVE_OPEN' || t.status === 'SIGNAL_ACTIVE') {
                unrealizedPnl += pnl;
                totalMargin += 100; // Stand-in trade margin
            } else {
                realizedPnl += pnl;
            }
        });

        const elMargin = document.getElementById('pnl-total-margin');
        const elUnrealized = document.getElementById('pnl-unrealized');
        const elRealized = document.getElementById('pnl-realized');

        if (elMargin) elMargin.innerText = `$${totalMargin.toFixed(2)}`;
        if (elUnrealized) {
            elUnrealized.className = `m-0 fw-bold ${unrealizedPnl >= 0 ? 'text-success' : 'text-danger'} mt-1`;
            elUnrealized.innerText = `$${unrealizedPnl.toFixed(2)}`;
        }
        if (elRealized) elRealized.innerText = `$${realizedPnl.toFixed(2)}`;
    }

    // Clear Logs Button & Initial Setup
    document.addEventListener('DOMContentLoaded', () => {
        const btnClear = document.getElementById('btn-clear-logs');
        if (btnClear) {
            btnClear.onclick = function() {
                if (confirm('क्या आप सभी सिग्नल्स और ट्रेड्स साफ़ करना चाहते हैं?')) {
                    localStorage.removeItem('apex_trades');
                    window.loadBotLogs();
                }
            };
        }
        window.loadBotLogs();
    });
})();
