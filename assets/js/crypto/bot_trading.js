// ApexTraders V2 - Bot Trading & PnL Engine
(function () {
    const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

    async function fetchBotData() {
        try {
            const res = await fetch(`${FIREBASE_BASE_URL}/bot_trades.json`);
            if (!res.ok) return;
            const data = await res.json() || {};

            let totalPnl = 0;
            let rowsHtml = "";

            const trades = Object.values(data).reverse();

            trades.forEach(trade => {
                const pnl = parseFloat(trade.pnl || 0);
                totalPnl += pnl;

                const badgeClass = trade.type === "BUY" ? "bg-success" : "bg-danger";
                const pnlClass = pnl >= 0 ? "text-success" : "text-danger";

                rowsHtml += `
                    <tr>
                        <td>${new Date(trade.timestamp).toLocaleTimeString()}</td>
                        <td><b>${trade.strategyName || 'Auto Bot'}</b></td>
                        <td>${trade.symbol}</td>
                        <td><span class="badge ${badgeClass}">${trade.type}</span></td>
                        <td>$${parseFloat(trade.price).toFixed(2)}</td>
                        <td class="${pnlClass}">$${pnl.toFixed(2)}</td>
                    </tr>
                `;
            });

            // Update PnL display elements cleanly without crashing
            const pnlDisplay = document.getElementById("bot-pnl-display") || document.getElementById("total-pnl");
            if (pnlDisplay) pnlDisplay.innerText = `$${totalPnl.toFixed(2)}`;

            const tableBody = document.getElementById("bot-trades-body") || document.getElementById("trades-table-body");
            if (tableBody && rowsHtml !== "") tableBody.innerHTML = rowsHtml;

        } catch (err) {
            console.error("Bot Trading Sync Error:", err);
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        fetchBotData();
        setInterval(fetchBotData, 5000); // 5 sec live sync
    });
})();
