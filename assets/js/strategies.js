(function() {
    let firebaseEventSource = null;

    function getStoredStrategies() {
        return JSON.parse(localStorage.getItem('apex_strategies') || '[]');
    }

    // Dynamic Helper to get Firebase URL from Saved Settings
    function getFirebaseUrl() {
        const settings = JSON.parse(localStorage.getItem('apex_settings') || '{}');
        return settings.firebaseUrl || null;
    }

    function saveStrategies(strategies, skipPush = false) {
        localStorage.setItem('apex_strategies', JSON.stringify(strategies));
        window.loadStrategies();
        if (!skipPush) {
            syncStrategiesToFirebase(strategies);
        }
    }

    // ⚡ PUSH STRATEGIES TO FIREBASE
    async function syncStrategiesToFirebase(strategiesArray) {
        const fbUrl = getFirebaseUrl();
        if (!fbUrl || !fbUrl.startsWith('https://')) return;

        const cleanUrl = fbUrl.replace(/\/$/, "");
        try {
            await fetch(`${cleanUrl}/strategies.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(strategiesArray)
            });
            console.log("⚡ Strategies Push Success!");
        } catch (err) {
            console.error("Firebase Strategy Push Error:", err);
        }
    }

    // 🔄 REALTIME LISTEN TO FIREBASE (Laptop <-> Phone Live Sync)
    function listenToFirebaseRealtime() {
        const fbUrl = getFirebaseUrl();
        if (!fbUrl || !fbUrl.startsWith('https://')) return;

        const cleanUrl = fbUrl.replace(/\/$/, "");

        // Close existing listener if open
        if (firebaseEventSource) {
            firebaseEventSource.close();
        }

        try {
            // Firebase SSE EventSource for Realtime Updates
            firebaseEventSource = new EventSource(`${cleanUrl}/strategies.json`);

            firebaseEventSource.addEventListener('put', (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data && data.data) {
                        let remoteData = data.data;
                        if (!Array.isArray(remoteData) && typeof remoteData === 'object') {
                            remoteData = Object.values(remoteData);
                        }
                        if (Array.isArray(remoteData)) {
                            // Update Local Storage silently without re-pushing back to Firebase
                            saveStrategies(remoteData, true);
                            console.log("🔥 Live Strategy Update Received from Firebase!");
                        }
                    }
                } catch (err) {
                    console.error("Error parsing Realtime Data:", err);
                }
            });

            firebaseEventSource.onerror = (err) => {
                console.warn("Realtime stream reconnecting...");
            };
        } catch (err) {
            console.error("EventSource initialization failed:", err);
        }
    }

    // INITIAL FETCH FROM FIREBASE
    async function fetchStrategiesFromFirebase() {
        const fbUrl = getFirebaseUrl();
        if (!fbUrl || !fbUrl.startsWith('https://')) return;

        const cleanUrl = fbUrl.replace(/\/$/, "");
        try {
            const res = await fetch(`${cleanUrl}/strategies.json`);
            if (res.ok) {
                let remoteStrats = await res.json();
                if (remoteStrats) {
                    if (!Array.isArray(remoteStrats) && typeof remoteStrats === 'object') {
                        remoteStrats = Object.values(remoteStrats);
                    }
                    if (Array.isArray(remoteStrats)) {
                        saveStrategies(remoteStrats, true);
                    }
                }
            }
        } catch (err) {
            console.error("Firebase Strategy Load Error:", err);
        }
    }

    window.loadStrategies = function() {
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
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="fw-bold text-accent m-0">${strat.name}</h6>
                            <span class="badge bg-secondary border border-secondary">${strat.coin}</span>
                        </div>

                        <div class="small text-muted mb-3">
                            <div>Amount: <strong class="text-white">$${strat.amount}</strong> (${strat.leverage}x)</div>
                            <div>Stop Loss: <span class="text-danger fw-bold">${strat.sl}%</span> | Take Profit: <span class="text-success fw-bold">${strat.tp}%</span></div>
                        </div>

                        <div class="d-flex gap-2 mb-3">
                            <button onclick="window.triggerStrategyExecution('${strat.name}', 'BUY')" class="btn btn-sm btn-success fw-bold w-50 py-1">
                                ▶ Run BUY
                            </button>
                            <button onclick="window.triggerStrategyExecution('${strat.name}', 'SELL')" class="btn btn-sm btn-danger fw-bold w-50 py-1">
                                ▶ Run SELL
                            </button>
                        </div>

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
        }
    };

    window.deleteStrategy = function(index) {
        if (confirm("Are you sure you want to delete this strategy?")) {
            let strategies = getStoredStrategies();
            strategies.splice(index, 1);
            saveStrategies(strategies);
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
            });
        }

        // Initial Local Load
        window.loadStrategies();

        // Step 1: Initial Sync
        fetchStrategiesFromFirebase().then(() => {
            // Step 2: Live Realtime Connection Start
            listenToFirebaseRealtime();
        });

        // Fallback retry for empty LocalStorage settings on new devices
        setTimeout(() => {
            fetchStrategiesFromFirebase().then(() => listenToFirebaseRealtime());
        }, 2000);
    });
})();
