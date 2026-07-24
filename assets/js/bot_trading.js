document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    const tableBody = document.getElementById('bot-trades-table');
    const totalPnlEl = document.getElementById('dash-total-pnl');

    window.loadBotTrades = async function() {
        if (!tableBody) return;

        try {
            const res = await fetch(`${FIREBASE_URL}/bot_trades.json`);
            if (!res.ok) return;
            const data = await res.json() || {};

            tableBody.innerHTML = '';
            const entries = Object.entries(data).reverse(); // Latest trades first
            let totalPnl = 0;

            if (entries.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-4">
                            <i class="fa-solid fa-robot fa-2x mb-2 d-block text-secondary"></i>
                            No auto-trades executed yet. Active strategies will trigger trades here.
                        </td>
                    </tr>`;
                if (totalPnlEl) totalPnlEl.innerText = "$0.00";
                return;
            }

            entries.forEach(([id, trade]) => {
                const pnl = parseFloat(trade.pnl || 0);
                totalPnl += pnl;

                const tr = document.createElement('tr');
                const timeStr = trade.timestamp ? new Date(trade.timestamp).toLocaleTimeString() : 'N/A';
                const isBuy = (trade.type || 'BUY').toUpperCase() === 'BUY';

                tr.innerHTML = `
                    <td class="text-light small">${timeStr}</td>
                    <td><strong class="text-warning">${trade.strategyName || 'Auto Strategy'}</strong></td>
                    <td><span class="badge bg-dark border border-secondary">${trade.symbol || 'BTCUSDT'}</span></td>
                    <td><span class="badge ${isBuy ? 'bg-success' : 'bg-danger'}">${trade.type || 'BUY'}</span></td>
                    <td class="fw-bold">$${parseFloat(trade.price || 0).toFixed(2)}</td>
                    <td class="${pnl >= 0 ? 'text-success' : 'text-danger'} fw-bold">
                        ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Update Dashboard Total P&L
            if (totalPnlEl) {
                totalPnlEl.innerText = `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
                totalPnlEl.className = totalPnl >= 0 ? 'text-success' : 'text-danger';
            }

        } catch (err) {
            console.warn("Bot trades fetch error:", err);
        }
    };

    // Auto-run & auto-refresh every 10 seconds
    window.loadBotTrades();
    setInterval(window.loadBotTrades, 10000);
});
