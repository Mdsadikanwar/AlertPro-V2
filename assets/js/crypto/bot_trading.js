const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

async function loadBotTradesAndPNL() {
    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/bot_trades.json`);
        const data = await res.json() || {};

        let totalTrades = 0;
        let totalPnl = 0;
        let htmlContent = "";

        const tradesArray = Object.values(data).reverse(); // Latest Trades First

        tradesArray.forEach(trade => {
            totalTrades++;
            const pnlVal = parseFloat(trade.pnl || 0);
            totalPnl += pnlVal;

            htmlContent += `
                <tr>
                    <td>${new Date(trade.timestamp).toLocaleString()}</td>
                    <td><b>${trade.strategyName}</b></td>
                    <td>${trade.symbol}</td>
                    <td><span class="badge ${trade.type === 'BUY' ? 'bg-success' : 'bg-danger'}">${trade.type}</span></td>
                    <td>$${trade.price}</td>
                    <td>${trade.rsi || 'N/A'}</td>
                    <td class="${pnlVal >= 0 ? 'text-success' : 'text-danger'}">$${pnlVal.toFixed(2)}</td>
                </tr>
            `;
        });

        // Update UI Elements if they exist
        const pnlElement = document.getElementById("total-pnl-display");
        if (pnlElement) pnlElement.innerText = `$${totalPnl.toFixed(2)}`;

        const tradesTable = document.getElementById("bot-trades-table-body");
        if (tradesTable) tradesTable.innerHTML = htmlContent;

    } catch (err) {
        console.error("Error loading P&L and Bot Trades:", err);
    }
}

// Auto Refresh every 5 seconds
setInterval(loadBotTradesAndPNL, 5000);
document.addEventListener("DOMContentLoaded", loadBotTradesAndPNL);
