// ApexTraders Safe Load - Bot Trading
(function() {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
        const tradesContainer = document.getElementById('botTradesTableBody') || document.getElementById('bot-trades-body');
        const totalPnlEl = document.getElementById('totalBotPnl') || document.getElementById('total-pnl');

        async function loadBotTrades() {
            if (!tradesContainer && !totalPnlEl) return;
            try {
                const res = await fetch(`${FIREBASE_BASE_URL}/bot_trades.json`);
                if (!res.ok) return;
                const data = await res.json() || {};
                renderTrades(data);
            } catch (e) {
                console.warn("Bot trades sync issue:", e);
            }
        }

        function renderTrades(data) {
            let totalPnl = 0;
            const entries = Object.entries(data).reverse();

            if (tradesContainer) {
                tradesContainer.innerHTML = '';
                if (entries.length === 0) {
                    tradesContainer.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No trade logs available</td></tr>`;
                } else {
                    entries.forEach(([id, trade]) => {
                        const pnl = parseFloat(trade.pnl || 0);
                        totalPnl += pnl;
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${new Date(trade.timestamp).toLocaleTimeString()}</td>
                            <td><strong>${trade.strategyName || 'Auto Strategy'}</strong></td>
                            <td><span class="badge badge-soft-info">${trade.symbol}</span></td>
                            <td><span class="badge badge-${trade.type === 'BUY' ? 'success' : 'danger'}">${trade.type}</span></td>
                            <td>$${parseFloat(trade.price).toFixed(2)}</td>
                            <td class="${pnl >= 0 ? 'text-success' : 'text-danger'} font-weight-bold">$${pnl.toFixed(2)}</td>
                        `;
                        tradesContainer.appendChild(tr);
                    });
                }
            }

            if (totalPnlEl) {
                totalPnlEl.innerText = `$${totalPnl.toFixed(2)}`;
                totalPnlEl.className = totalPnl >= 0 ? 'text-success font-weight-bold' : 'text-danger font-weight-bold';
            }
        }

        loadBotTrades();
        setInterval(loadBotTrades, 5000);
    });
})();
