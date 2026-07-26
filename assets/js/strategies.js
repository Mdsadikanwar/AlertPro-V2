(function() {
    function getStoredStrategies() {
        return JSON.parse(localStorage.getItem('apex_strategies') || '[]');
    }

    function saveStrategies(strategies) {
        localStorage.setItem('apex_strategies', JSON.stringify(strategies));
        syncStrategiesToFirebase(strategies);
    }

    // ⚡ FIREBASE STRATEGY SYNC FUNCTIONS
    async function syncStrategiesToFirebase(strategiesArray) {
        const settings = JSON.parse(localStorage.getItem('apex_settings') || '{}');
        const fbUrl = settings.firebaseUrl;

        if (settings.fbEnable === false || !fbUrl || !fbUrl.startsWith('https://')) return;

        const cleanUrl = fbUrl.replace(/\/$/, "");
        try {
            await fetch(`${cleanUrl}/strategies.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(strategiesArray)
            });
            console.log("⚡ Strategies Synced to Firebase!");
        } catch (err) {
            console.error("Firebase Strategy Push Error:", err);
        }
    }

    async function fetchStrategiesFromFirebase() {
        const settings = JSON.parse(localStorage.getItem('apex_settings') || '{}');
        const fbUrl = settings.firebaseUrl;

        if (!fbUrl || !fbUrl.startsWith('https://')) return;

        const cleanUrl = fbUrl.replace(/\/$/, "");
        try {
            const res = await fetch(`${cleanUrl}/strategies.json`);
            if (res.ok) {
                const remoteStrats = await res.json();
                if (Array.isArray(remoteStrats)) {
                    localStorage.setItem('apex_strategies', JSON.stringify(remoteStrats));
                    console.log("🔥 Remote Strategies Loaded from Firebase!");
                    window.loadStrategies();
                }
            }
        } catch (err) {
            console.error("Firebase Strategy Load Error:", err);
        }
    }

    window.loadStrategies = function() {
        console.log("Loading Strategies...");
        const container = document.getElementById('strategies-container');
        if (!container) return;

        const strategies = getStoredStrategies();

        if (strategies.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center text-muted py-5">
                    <p class="mb-0">No strategies created yet.</p>
                    <small>Click "+ Create Strategy" to build your first strategy.</small>
                </div>
            `;
            return;
        }

        let html = '';
        strategies.forEach((strat, index) => {
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="card bg-card p-3 h-100 position-relative">
                        <!-- HEADER & COIN BADGE -->
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="fw-bold text-accent m-0">${strat.name}</h6>
                            <span class="badge bg-secondary border border-secondary">${strat.coin}</span>
                        </div>

                        <!-- RISK CONFIG INFO -->
                        <div class="small text-muted mb-3">
                            <div>Amount: <strong class="text-white">$${strat.amount}</strong> (${strat.leverage}x)</div>
                            <div>Stop Loss: <span class="text-danger fw-bold">${strat.sl}%</span> | Take Profit: <span class="text-success fw-bold">${strat.tp}%</span></div>
                        </div>

                        <!-- MANUAL EXECUTION BUTTONS (BUY / SELL) -->
                        <div class="d-flex gap-2 mb-3">
                            <button onclick="window.triggerStrategyExecution('${strat.name}', 'BUY')" class="btn btn-sm btn-success fw-bold w-50 py-1">
                                ▶ Run BUY
                            </button>
                            <button onclick="window.triggerStrategyExecution('${strat.name}', 'SELL')" class="btn btn-sm btn-danger fw-bold w-50 py-1">
                                ▶ Run SELL
                            </button>
                        </div>

                        <!-- ACTIVE SWITCH & DELETE BUTTON -->
                        <div class="d-flex justify-content-between align-items-center pt-2 border-top border-secondary mt-auto">
                            <div class="form-check form-switch m-0">
                                <input class="form-check-input" type="checkbox" role="switch" id="auto-${index}" ${strat.active ? 'checked' : ''} onchange="toggleStrategy(${index})">
                                <label class="form-check-label small text-muted ms-1" for="auto-${index}">${strat.active ? 'Active' : 'Paused'}</label>
                            </div>
                            <button class="btn btn-outline-danger btn-sm py-0 px-2" onclick="deleteStrategy(${index})">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    };

    window.toggleStrategy = function(index) {
        const strategies = getStoredStrategies();
        if (strategies[index]) {
            strategies[index].active = !strategies[index].active;
            saveStrategies(strategies);
            window.loadStrategies();
        }
    };

    window.deleteStrategy = function(index) {
        if (confirm("Are you sure you want to delete this strategy?")) {
            let strategies = getStoredStrategies();
            strategies.splice(index, 1);
            saveStrategies(strategies);
            window.loadStrategies();
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('add-strat-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const newStrat = {
                    name: document.getElementById('strat-name').value,
                    coin: document.getElementById('strat-coin').value.toUpperCase(),
                    amount: document.getElementById('strat-amount').value,
                    leverage: document.getElementById('strat-leverage').value,
                    sl: document.getElementById('strat-sl').value,
                    tp: document.getElementById('strat-tp').value,
                    active: true
                };

                const strategies = getStoredStrategies();
                strategies.push(newStrat);
                saveStrategies(strategies);

                form.reset();
                const modalElement = document.getElementById('addStratModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();

                window.loadStrategies();
            });
        }

        window.loadStrategies();
        fetchStrategiesFromFirebase();
    });
})();
