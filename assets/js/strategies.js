document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    const container = document.getElementById('strategies-container');
    const stratForm = document.getElementById('add-strat-form');

    // 1. Fetch & Render Saved Strategies
    window.loadStrategies = async function() {
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
                        <i class="fa-solid fa-folder-open fa-3x mb-3 text-secondary"></i>
                        <p class="m-0">No active trading strategies found. Click "Add Strategy" to create one.</p>
                    </div>`;
                updateDashboardCount(0);
                return;
            }

            entries.forEach(([id, strat]) => {
                const coin = (strat.coin || strat.symbol || "BTC").toUpperCase().replace("USDT", "");
                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4';
                card.innerHTML = `
                    <div class="card bg-black text-white border-secondary h-100 shadow-sm">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h5 class="card-title m-0 text-warning fw-bold">${strat.name || 'Strategy'}</h5>
                                    <span class="badge ${strat.status === 'active' || strat.enabled ? 'bg-success' : 'bg-secondary'}">
                                        ${strat.status || 'Active'}
                                    </span>
                                </div>
                                <div class="small text-light">
                                    <p class="mb-2"><i class="fa-solid fa-coins text-warning me-2"></i><strong>Asset:</strong> ${coin}/USDT</p>
                                    <p class="mb-2"><i class="fa-solid fa-wave-square text-info me-2"></i><strong>RSI Buy Level:</strong> ≤ ${strat.rsiBuyLevel || 45}</p>
                                    <p class="mb-2"><i class="fa-solid fa-chart-line text-primary me-2"></i><strong>EMA (Fast/Slow):</strong> ${strat.emaFast || 9} / ${strat.emaSlow || 21}</p>
                                    <p class="mb-2"><i class="fa-solid fa-bullseye text-success me-2"></i><strong>Buy Target:</strong> ${strat.buyTarget ? '$' + strat.buyTarget : 'N/A'}</p>
                                    <p class="mb-3"><i class="fa-solid fa-arrow-trend-down text-danger me-2"></i><strong>Sell Target:</strong> ${strat.sellTarget ? '$' + strat.sellTarget : 'N/A'}</p>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline-danger w-100 mt-2" onclick="deleteStrategy('${id}')">
                                <i class="fa-solid fa-trash me-1"></i> Delete Strategy
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

            updateDashboardCount(entries.length);

        } catch (err) {
            console.warn("Strategies fetch error:", err);
        }
    };

    // Helper: Dashboard Strategy Counter Update
    function updateDashboardCount(count) {
        const counter = document.getElementById('dash-active-strats');
        if (counter) counter.innerText = count;
    }

    // 2. Add Strategy Form Handler
    if (stratForm) {
        stratForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                name: document.getElementById('strat-name')?.value?.trim() || 'Custom Strategy',
                coin: document.getElementById('strat-coin')?.value?.trim().toUpperCase() || 'BTC',
                rsiBuyLevel: parseFloat(document.getElementById('strat-rsi')?.value) || 45,
                emaFast: parseInt(document.getElementById('strat-fast')?.value) || 9,
                emaSlow: parseInt(document.getElementById('strat-slow')?.value) || 21,
                buyTarget: document.getElementById('strat-buy-target')?.value?.trim() || '',
                sellTarget: document.getElementById('strat-sell-target')?.value?.trim() || '',
                status: 'active',
                createdAt: new Date().toISOString()
            };

            try {
                const res = await fetch(`${FIREBASE_URL}/trading_strategies.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    stratForm.reset();
                    
                    // Close Bootstrap Modal
                    const modalEl = document.getElementById('addStratModal');
                    if (window.bootstrap && modalEl) {
                        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                        modal.hide();
                    }

                    // Refresh List
                    window.loadStrategies();
                } else {
                    alert("Failed to save strategy to database.");
                }
            } catch (err) {
                console.error("Save error:", err);
                alert("Error saving strategy.");
            }
        });
    }

    // 3. Delete Strategy Function
    window.deleteStrategy = async (id) => {
        if (!confirm("Are you sure you want to delete this strategy?")) return;
        try {
            await fetch(`${FIREBASE_URL}/trading_strategies/${id}.json`, { method: 'DELETE' });
            window.loadStrategies();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Error deleting strategy.");
        }
    };

    // Auto-run on page load
    window.loadStrategies();
});
