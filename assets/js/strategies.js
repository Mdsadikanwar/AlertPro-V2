(function() {
    function getStrategies() {
        return JSON.parse(localStorage.getItem('apex_strategies') || '[]');
    }

    function saveStrategies(strategies) {
        localStorage.setItem('apex_strategies', JSON.stringify(strategies));

        const masterRaw = localStorage.getItem('apex_master_data');
        let master = masterRaw ? JSON.parse(masterRaw) : {};
        master.strategies = strategies;
        localStorage.setItem('apex_master_data', JSON.stringify(master));

        window.loadStrategies();

        if (window.triggerGlobalSave) {
            window.triggerGlobalSave();
        }
    }

    window.loadStrategies = function() {
        const container = document.getElementById('strategies-container');
        if (!container) return;

        const strategies = getStrategies();
        if (strategies.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-5"><p>No strategies created yet.</p></div>`;
            return;
        }

        let html = '';
        strategies.forEach((strat, index) => {
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="card bg-card p-3 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="fw-bold text-accent m-0">${strat.name}</h6>
                            <span class="badge bg-secondary">${strat.coin}</span>
                        </div>
                        <div class="form-check form-switch mt-3">
                            <input class="form-check-input" type="checkbox" id="auto-${index}" ${strat.active ? 'checked' : ''} onchange="toggleStrategy(${index})">
                            <label class="form-check-label small text-muted" for="auto-${index}">${strat.active ? 'Active' : 'Paused'}</label>
                        </div>
                        <button class="btn btn-outline-danger btn-sm mt-2" onclick="deleteStrategy(${index})">Delete</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    };

    window.toggleStrategy = function(index) {
        const strategies = getStrategies();
        if (strategies[index]) {
            strategies[index].active = !strategies[index].active;
            saveStrategies(strategies);
        }
    };

    window.deleteStrategy = function(index) {
        let strategies = getStrategies();
        strategies.splice(index, 1);
        saveStrategies(strategies);
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.loadStrategies();
    });
})();
