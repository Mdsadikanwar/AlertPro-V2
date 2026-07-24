document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    const container = document.getElementById('strategies-container');

    // 1. Fetch & Render Saved Strategies
    async function loadStrategies() {
        if (!container) return;
        try {
            const res = await fetch(`${FIREBASE_URL}/trading_strategies.json`);
            if (!res.ok) return;
            const data = await res.json() || {};

            container.innerHTML = '';
            const entries = Object.entries(data);

            if (entries.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center text-muted py-5">
                        <i class="fa-solid fa-folder-open fa-3x mb-3"></i>
                        <p>No trading strategies saved yet. Click "Add Strategy" to create one.</p>
                    </div>`;
                return;
            }

            entries.forEach(([id, strat]) => {
                const coin = (strat.coin || strat.symbol || "BTC").toUpperCase();
                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4';
                card.innerHTML = `
                    <div class="card bg-black text-white border-secondary h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title m-0 text-warning fw-bold">${strat.name || 'Strategy'}</h5>
                                <span class="badge ${strat.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                                    ${strat.status || 'active'}
                                </span>
                            </div>
                            <div class="small text-light">
                                <p class="mb-1"><i class="fa-solid fa-coins text-warning me-2"></i><strong>Asset:</strong> ${coin}USDT</p>
                                <p class="mb-1"><i class="fa-solid fa-wave-square text-info me-2"></i><strong>RSI Period / Buy Level:</strong> ${strat.rsiPeriod || 14} / ${strat.rsiBuyLevel || 45}</p>
                                <p class="mb-1"><i class="fa-solid fa-chart-line text-primary me-2"></i><strong>EMA (Fast/Slow):</strong> ${strat.emaFast || 9} / ${strat.emaSlow || 21}</p>
                                <p class="mb-1"><i class="fa-solid fa-bullseye text-success me-2"></i><strong>Buy Target:</strong> $${strat.buyTarget || 'N/A'}</p>
                                <p class="mb-3"><i class="fa-solid fa-arrow-trend-down text-danger me-2"></i><strong>Sell Target:</strong> $${strat.sellTarget || 'N/A'}</p>
                            </div>
                            <button class="btn btn-sm btn-outline-danger w-100 mt-2" onclick="deleteStrategy('${id}')">
                                <i class="fa-solid fa-trash me-1"></i> Delete Strategy
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

            // Update Dashboard Counter if element exists
            const activeCounter = document.getElementById('dash-active-strats');
            if (activeCounter) activeCounter.innerText = entries.length;

        } catch (err) {
            console.warn("Strategies fetch warning:", err);
        }
    }

    // 2. Delete Strategy Function
    window.deleteStrategy = async (id) => {
        if (!confirm("Are you sure you want to delete this strategy?")) return;
        try {
            await fetch(`${FIREBASE_URL}/trading_strategies/${id}.json`, { method: 'DELETE' });
            loadStrategies();
        } catch (err) {
            alert("Error deleting strategy");
        }
    };

    // Auto load on init
    loadStrategies();
});
