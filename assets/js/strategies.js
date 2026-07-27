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
            container.innerHTML = `<div class="col-12 text-center text-muted py-5"><p class="m-0">No strategies deployed yet. Click <strong>+ Create Strategy</strong> to build your first AI strategy!</p></div>`;
            return;
        }

        let html = '';
        strategies.forEach((strat, index) => {
            const isTop10 = strat.coin === 'TOP10_SCAN';
            const typeBadge = strat.type === 'ai_prompt' ? '🤖 AI Prompt' : (strat.type === 'candlestick' ? '🕯️ Candlestick' : '📈 Crossover');

            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="card bg-card p-3 h-100 border border-secondary position-relative">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h6 class="fw-bold text-accent m-0">${strat.name}</h6>
                                <span class="badge bg-dark border border-info text-info me-1 mt-1">${typeBadge}</span>
                                <span class="badge ${isTop10 ? 'bg-warning text-dark' : 'bg-secondary'} me-1 mt-1">${isTop10 ? '🎯 TOP 10 COINS' : strat.coin}</span>
                            </div>
                            <span class="badge ${strat.active ? 'bg-success' : 'bg-danger'}">${strat.active ? 'RUNNING' : 'PAUSED'}</span>
                        </div>

                        ${strat.aiPrompt ? `<div class="p-2 my-2 bg-dark rounded border border-secondary small text-muted text-truncate" title="${strat.aiPrompt}"><strong>Prompt:</strong> ${strat.aiPrompt}</div>` : ''}

                        <div class="row g-1 text-sublabel my-2 bg-dark p-2 rounded border border-secondary small">
                            <div class="col-6"><strong>Trade Size:</strong> ${strat.capitalPct || 10}% Balance</div>
                            <div class="col-6"><strong>Leverage:</strong> ${strat.leverage || 10}x</div>
                            <div class="col-6"><strong>R:R Ratio:</strong> ${strat.rrRatio || '1:2'}</div>
                            <div class="col-6 text-danger"><strong>SL:</strong> ${strat.sl}% | <span class="text-success"><strong>TP:</strong> ${strat.tp}%</span></div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-secondary">
                            <div class="form-check form-switch m-0">
                                <input class="form-check-input" type="checkbox" id="auto-${index}" ${strat.active ? 'checked' : ''} onchange="toggleStrategy(${index})">
                                <label class="form-check-label small text-white ms-1" for="auto-${index}">${strat.active ? 'Auto Active' : 'Paused'}</label>
                            </div>
                            <button class="btn btn-outline-danger btn-sm px-2 py-0" onclick="deleteStrategy(${index})">Delete</button>
                        </div>
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

        // 1. Dynamic Form Dropdown Switcher
        const typeSelect = document.getElementById('strat-type');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                document.getElementById('cfg-ai-box').classList.toggle('d-none', val !== 'ai_prompt');
                document.getElementById('cfg-candle-box').classList.toggle('d-none', val !== 'candlestick');
                document.getElementById('cfg-crossover-box').classList.toggle('d-none', val !== 'crossover');
            });
        }

        // 2. Top 10 Scanner Switch Logic
        const top10Switch = document.getElementById('strat-top10-switch');
        if (top10Switch) {
            top10Switch.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                document.getElementById('single-coin-wrapper').classList.toggle('d-none', isChecked);
                document.getElementById('top10-info-badge').classList.toggle('d-none', !isChecked);
            });
        }

        // 3. Risk-Reward Auto Calculator
        const slInput = document.getElementById('strat-sl');
        const tpInput = document.getElementById('strat-tp');
        const rrSelect = document.getElementById('strat-rr-ratio');

        function updateTpBasedOnRR() {
            if (!slInput || !tpInput || !rrSelect) return;
            const sl = parseFloat(slInput.value) || 0;
            const ratioStr = rrSelect.value; // "1:1", "1:1.5", "1:2", "1:3"
            const multiplier = parseFloat(ratioStr.split(':')[1]) || 2;
            tpInput.value = (sl * multiplier).toFixed(1);
        }

        if (slInput && rrSelect) {
            slInput.addEventListener('input', updateTpBasedOnRR);
            rrSelect.addEventListener('change', updateTpBasedOnRR);
        }

        // 4. Form Submit Handler
        const form = document.getElementById('add-strat-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const isTop10 = document.getElementById('strat-top10-switch').checked;
                const stratType = document.getElementById('strat-type').value;

                let promptText = '';
                if (stratType === 'ai_prompt') {
                    promptText = document.getElementById('strat-ai-prompt').value.trim();
                } else if (stratType === 'candlestick') {
                    promptText = "Pattern: " + document.getElementById('strat-candle-pattern').value;
                } else {
                    promptText = "Signal: " + document.getElementById('strat-indicator-signal').value;
                }

                const newStrat = {
                    name: document.getElementById('strat-name').value.trim(),
                    type: stratType,
                    aiPrompt: promptText,
                    coin: isTop10 ? 'TOP10_SCAN' : (document.getElementById('strat-coin').value.trim().toUpperCase() || 'BTCUSDT'),
                    capitalPct: parseFloat(document.getElementById('strat-capital-pct').value) || 10,
                    leverage: parseInt(document.getElementById('strat-leverage').value) || 10,
                    rrRatio: document.getElementById('strat-rr-ratio').value,
                    sl: parseFloat(document.getElementById('strat-sl').value) || 1.5,
                    tp: parseFloat(document.getElementById('strat-tp').value) || 3.0,
                    active: true,
                    createdAt: new Date().toISOString()
                };

                const strategies = getStrategies();
                strategies.push(newStrat);
                saveStrategies(strategies);

                // Close Modal and Reset Form
                const modalEl = document.getElementById('addStratModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
                form.reset();
            });
        }
    });
})();
