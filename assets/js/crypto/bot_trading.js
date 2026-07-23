(function () {
    const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

    async function syncBotTradesAndPnL() {
        try {
            const res = await fetch(`${FIREBASE_BASE_URL}/bot_trades.json`);
            if (!res.ok) return;
            const data = await res.json() || {};

            let sumPnl = 0;
            let rowsHtml = "";

            const trades = Object.values(data).reverse();

            trades.forEach(trade => {
                const pnlVal = parseFloat(trade.pnl || 0);
                sumPnl += pnlVal;

                const badgeColor = trade.type === "BUY" ? "bg-success" : "bg-danger";
                const pnlColor = pnlVal >= 0 ? "text-success" : "text-danger";

                rowsHtml += `
                    <tr>
                        <td>${new Date(trade.timestamp).toLocaleTimeString()}</td>
                        <td><b>${trade.strategyName || 'Auto Strategy'}</b></td>
                        <td>${trade.symbol}</td>
                        <td><span class="badge ${badgeColor}">${trade.type}</span></td>
                        <td>$${parseFloat(trade.price).toFixed(2)}</td>
                        <td class="${pnlColor}">$${pnlVal.toFixed(2)}</td>
                    </tr>
                `;
            });

            // Update PnL Display safely
            const pnlBox = document.getElementById("bot-pnl-display") || 
                           document.getElementById("total-pnl") || 
                           document.querySelector(".pnl-display");
            if (pnlBox) pnlBox.innerText = `$${sumPnl.toFixed(2)}`;

            // Update Table safely
            const tableBody = document.getElementById("bot-trades-body") || 
                              document.getElementById("trades-table-body") || 
                              document.querySelector("tbody");
            if (tableBody && rowsHtml !== "") tableBody.innerHTML = rowsHtml;

        } catch (err) {
            console.warn("PnL sync warning:", err);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            syncBotTradesAndPnL();
            setInterval(syncBotTradesAndPnL, 5000);
        });
    } else {
        syncBotTradesAndPnL();
        setInterval(syncBotTradesAndPnL, 5000);
    }
})();
