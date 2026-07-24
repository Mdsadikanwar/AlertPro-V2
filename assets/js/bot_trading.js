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
            const entries = Object.entries(data).reverse();
            let totalLivePnl = 0;

            if (entries.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-4">
                            No active bot trades yet. Signals will trigger trades here automatically.
                        </td>
                    </tr>`;
                if (totalPnlEl) totalPnlEl.innerText = "$0.00";
                return;
            }

            for (const [id, trade] of entries) {
                const coin = (trade.symbol || "BTCUSDT").replace("USDT", "");
                
                // Fetch Realtime Current Price from OKX
                let currentPrice = parseFloat(trade.price || 0);
                try {
                    const okxRes = await fetch(`https://www.okx.com/api/v5/market/ticker?instId=${coin}-USDT`);
                    const okxData = await okxRes.json();
                    if (okxData?.data?.[0]?.last) {
                        currentPrice = parseFloat(okxData.data[0].last);
                    }
                } catch (e) {
                    console.warn("OKX Price Fetch Error", e);
                }

                const entryPrice = parseFloat(trade.price || 0);
                
                // Calculate Dynamic P&L (Assuming standard trade position size of $1000)
                let livePnl = 0;
                if (entryPrice > 0) {
                    const priceDiffPct = ((currentPrice - entryPrice) / entryPrice);
                    livePnl = trade.type === 'BUY' ? (1000 * priceDiffPct) : (-1000 * priceDiffPct);
                }

                totalLivePnl += livePnl;

                const tr = document.createElement('tr');
                const isBuy = (trade.type || 'BUY').toUpperCase() === 'BUY';

                tr.innerHTML = `
                    <td class="text-muted small">${trade.timestamp ? new Date(trade.timestamp).toLocaleTimeString() : 'N/A'}</td>
                    <td><strong class="text-warning">${trade.strategyName || 'Strategy'}</strong></td>
                    <td><span class="badge bg-dark border border-secondary">${coin}/USDT</span></td>
                    <td><span class="badge ${isBuy ? 'bg-success' : 'bg-danger'}">${trade.type}</span></td>
                    <td>
                        <span class="d-block">$${entryPrice.toFixed(2)}</span>
                        <span class="small text-muted">Now: $${currentPrice.toFixed(2)}</span>
                    </td>
                    <td class="${livePnl >= 0 ? 'text-success' : 'text-danger'} fw-bold">
                        ${livePnl >= 0 ? '+' : ''}$${livePnl.toFixed(2)}
                    </td>
                `;
                tableBody.appendChild(tr);
            }

            // Render Master Dynamic P&L on Top Dashboard
            if (totalPnlEl) {
                totalPnlEl.innerText = `${totalLivePnl >= 0 ? '+' : ''}$${totalLivePnl.toFixed(2)}`;
                totalPnlEl.className = totalLivePnl >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
            }

        } catch (err) {
            console.warn("Bot trades fetch error:", err);
        }
    };

    window.loadBotTrades();
    // Refresh Live P&L every 5 Seconds!
    setInterval(window.loadBotTrades, 5000);
});
