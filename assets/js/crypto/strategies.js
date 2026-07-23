(function () {
    const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

    async function fetchStrategiesSafe() {
        try {
            const res = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`);
            if (!res.ok) return;
            const data = await res.json() || {};
            
            // Multiple fallback elements to prevent breaking JS
            const targetEl = document.getElementById("strategies-list") || 
                             document.getElementById("strategy-list") || 
                             document.querySelector(".strategies-container");

            if (!targetEl) return;

            targetEl.innerHTML = "";
            const entries = Object.entries(data);

            if (entries.length === 0) {
                targetEl.innerHTML = `<div class="p-3 text-muted">No saved strategies found.</div>`;
                return;
            }

            entries.forEach(([id, strat]) => {
                const coinName = (strat.coin || strat.symbol || "BTC").toUpperCase();
                targetEl.innerHTML += `
                    <div class="card bg-dark text-white mb-2 border-secondary">
                        <div class="card-body p-3 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1 fw-bold">${strat.name || "Strategy"} (${coinName})</h6>
                                <small class="text-muted">
                                    RSI Level: <b>${strat.rsiBuyLevel || 45}</b> | Fast/Slow EMA: <b>${strat.emaFast || 9}/${strat.emaSlow || 21}</b>
                                </small>
                            </div>
                            <span class="badge ${strat.status === 'active' || strat.isAutoActive ? 'bg-success' : 'bg-secondary'}">
                                ${strat.status || 'Active'}
                            </span>
                        </div>
                    </div>
                `;
            });
        } catch (err) {
            console.warn("Strategy fetch warning:", err);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fetchStrategiesSafe);
    } else {
        fetchStrategiesSafe();
    }
})();
