// ApexTraders V2 - Strategies Engine
(function () {
    const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

    async function loadStrategies() {
        try {
            const res = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`);
            if (!res.ok) return;
            const data = await res.json() || {};
            
            const listEl = document.getElementById("strategies-list") || document.getElementById("strategy-list");
            if (!listEl) return;

            listEl.innerHTML = "";
            const entries = Object.entries(data);

            if (entries.length === 0) {
                listEl.innerHTML = `<div class="alert alert-info">No active strategies saved yet.</div>`;
                return;
            }

            entries.forEach(([id, strat]) => {
                const coin = strat.coin || strat.symbol || "BTC";
                const statusClass = (strat.status === "active" || strat.isAutoActive) ? "bg-success" : "bg-secondary";
                
                listEl.innerHTML += `
                    <div class="card bg-dark text-white mb-2 border-secondary">
                        <div class="card-body p-3 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1 fw-bold">${strat.name || "Custom Strategy"} (${coin.toUpperCase()})</h6>
                                <small class="text-muted">
                                    RSI Level: <b>${strat.rsiBuyLevel || 45}</b> | Fast/Slow EMA: <b>${strat.emaFast || 9}/${strat.emaSlow || 21}</b>
                                </small>
                            </div>
                            <span class="badge ${statusClass}">${strat.status || "Active"}</span>
                        </div>
                    </div>
                `;
            });
        } catch (err) {
            console.error("Strategies loading error:", err);
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        loadStrategies();
    });
})();
