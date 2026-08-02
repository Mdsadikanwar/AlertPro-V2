// assets/js/bot_trading.js - Frontend Live Sync & Table Engine

(function() {
    // 1. Storage से ट्रेड्स और सेटिंग्स निकालें
    function getStoredTrades() {
        return JSON.parse(localStorage.getItem('apex_trades') || '[]');
    }

    function getMasterSettings() {
        return JSON.parse(localStorage.getItem('apex_master_settings') || '{}');
    }

    // 2. टेबल और P&L कार्ड्स को लाइव रेंडर (Render) करने का फ़ंक्शन
    window.loadBotLogs = async function() {
        const tableBody = document.getElementById('bot-trades-table');
        if (!tableBody) return;

        // Firebase से लाइव ट्रेड्स fetch करने की कोशिश करें
        let trades = getStoredTrades();
        const settings = getMasterSettings();

        if (settings.cfgFbEnable && settings.cfgFirebase) {
            try {
                const res = await fetch(`${settings.cfgFirebase}/apex_master_data/trades.json`);
                if (res.ok) {
                    const fbTrades = await res.json();
                    if (fbTrades && Array.isArray(fbTrades)) {
                        trades = fbTrades;
                        localStorage.setItem('apex_trades', JSON.stringify(trades));
                    }
                }
            } catch (err) {
                console.warn("Firebase Fetch Warning, using local storage", err);
            }
        }

        if (trades.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        कोई ट्रेड्स/सिग्नल्स उपलब्ध नहीं हैं। Vercel Cron चलने का इंतज़ार करें या टेस्ट डेटा लोड करें।
                    </td>
                </tr>`;
            updatePnLCards([]);
            return;
        }

        let html = '';
        trades.forEach(trade => {
            const isBuy = trade.action === 'BUY';
            const actionBadge = isBuy ? '<span class="badge bg-success">BUY</span>' : '<span class="badge bg-danger">SELL</span>';
            const pnlColor = (trade.pnl >= 0) ? 'text-success' : 'text-danger';
            
            html += `
                <tr>
                    <td><small class="text-muted">${trade.time || '-'}</small></td>
                    <td><strong class="text-accent">${trade.strategy || 'Auto Alpha'}</strong></td>
                    <td><span class="badge bg-secondary">${trade.symbol}</span></td>
                    <td>${actionBadge}</td>
                    <td>$${trade.entryPrice} / <span class="text-info">$${trade.livePrice || trade.entryPrice}</span></td>
                    <td class="${pnlColor} fw-bold">$${(trade.pnl || 0).toFixed(2)}</td>
                    <td><span class="badge bg-dark border border-warning text-warning">${trade.status || 'PAPER_OPEN'}</span></td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        updatePnLCards(trades);
    };

    // 3. P&L Summary Cards कैलकुलेटर
    function updatePnLCards(trades) {
        let totalMargin = 0;
        let unrealizedPnl = 0;
        let realizedPnl = 0;

        trades.forEach(t => {
            if (t.status === 'PAPER_OPEN' || t.status === 'LIVE_OPEN') {
                unrealizedPnl += (t.pnl || 0);
                totalMargin += 100; // डिफ़ॉल्ट मार्जिन गणना
            } else {
                realizedPnl += (t.pnl || 0);
            }
        });

        const elMargin = document.getElementById('pnl-total-margin');
        const elUnrealized = document.getElementById('pnl-unrealized');
        const elRealized = document.getElementById('pnl-realized');

        if (elMargin) elMargin.innerText = `$${totalMargin.toFixed(2)}`;
        if (elUnrealized) {
            const colorClass = unrealizedPnl >= 0 ? 'text-success' : 'text-danger';
            elUnrealized.className = `m-0 fw-bold ${colorClass} mt-1`;
            elUnrealized.innerHTML = `$${unrealizedPnl.toFixed(2)}`;
        }
        if (elRealized) elRealized.innerText = `$${realizedPnl.toFixed(2)}`;
    }

    // 4. Clear Logs बटन इवेंट
    document.addEventListener('DOMContentLoaded', () => {
        const btnClear = document.getElementById('btn-clear-logs');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                if (confirm('क्या आप सभी लाइव ट्रेड्स और लॉग्स साफ़ करना चाहते हैं?')) {
                    localStorage.removeItem('apex_trades');
                    window.loadBotLogs();
                }
            });
        }

        // हर 5 सेकंड में ऑटो-रिफ्रेश टेबल
        setInterval(() => {
            if (!document.getElementById('bot-tab').classList.contains('d-none')) {
                window.loadBotLogs();
            }
        }, 5000);
    });
})();
