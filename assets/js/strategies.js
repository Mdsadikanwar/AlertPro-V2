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
            const tfBadge = strat.timeframe || '15m';

            // Coin Badge Logic
            let coinDisplayBadge = '';
            if (isTop10) {
                coinDisplayBadge = `<span class="badge bg-warning text-dark me-1 mt-1">🎯 TOP 10 SCAN</span>`;
            } else if (strat.coin && strat.coin.includes(',')) {
                coinDisplayBadge = `<span class="badge bg-primary me-1 mt-1" title="${strat.coin}">🌐 MULTI-COIN (${strat.coin.split(',').length})</span>`;
            } else {
                coinDisplayBadge = `<span class="badge bg-secondary me-1 mt-1">${strat.coin || 'BTCUSDT'}</span>`;
            }

            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="card bg-card p-3 h-100 border ${strat.active ? 'border-success' : 'border-secondary'} position-relative">
                        <!-- HEADER WITH STATUS TOGGLE -->
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h6 class="fw-bold text-accent m-0">${strat.name}</h6>
                                <div class="mt-1">
                                    <span class="badge bg-dark border border-info text-info me-1">${typeBadge}</span>
                                    <span class="badge bg-dark border border-warning text-warning me-1">⏱️ ${tfBadge}</span>
                                    ${coinDisplayBadge}
                                </div>
                            </div>
                            <span class="badge ${strat.active ? 'bg-success' : 'bg-danger'}">${strat.active ? 'RUNNING' : 'PAUSED'}</span>
                        </div>

                        ${strat.aiPrompt ? `<div class="p-2 my-2 bg-dark rounded border border-secondary small text-muted text-truncate" title="${strat.aiPrompt}"><strong>Rule:</strong> ${strat.aiPrompt}</div>` : ''}

                        <!-- RISK & TRADE INFO -->
                        <div class="row g-1 text-sublabel my-2 bg-dark p-2 rounded border border-secondary small">
                            <div class="col-6"><strong>Trade Size:</strong> ${strat.capitalPct || 10}%</div>
                            <div class="col-6"><strong>Leverage:</strong> ${strat.leverage || 10}x</div>
                            <div class="col-6"><strong>R:R Ratio:</strong> ${strat.rrRatio || '1:2'}</div>
                            <div class="col-6 text-danger"><strong>SL:</strong> ${strat.sl}% | <span class="text-success"><strong>TP:</strong> ${strat.tp}%</span></div>
                        </div>

                        <!-- ACTIONS: RUN/PAUSE SWITCH, EDIT & DELETE -->
                        <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-secondary">
                            <div class="form-check form-switch m-0">
                                <input class="form-check-input" type="checkbox" id="auto-${index}" ${strat.active ? 'checked' : ''} onchange="toggleStrategy(${index})">
                                <label class="form-check-label small fw-bold ${strat.active ? 'text-success' : 'text-muted'} ms-1" for="auto-${index}">
                                    ${strat.active ? 'RUNNING' : 'PAUSED'}
                                </label>
                            </div>
                            <div>
                                <button class="btn btn-outline-info btn-sm px-2 py-0 me-1" onclick="editStrategy(${index})">✏️ Edit</button>
                                <button class="btn btn-outline-danger btn-sm px-2 py-0" onclick="deleteStrategy(${index})">🗑️</button>
                            </div>
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
        if (!confirm('Are you sure you want to delete this strategy?')) return;
        let strategies = getStrategies();
        strategies.splice(index, 1);
        saveStrategies(strategies);
    };

    window.openCreateModal = function() {
        document.getElementById('add-strat-form').reset();
        document.getElementById('edit-strat-index').value = "-1";
        document.getElementById('modal-title-text').innerHTML = `<span class="me-2">⚡</span> Advanced Strategy Architect`;
        document.getElementById('btn-submit-strat').innerText = "🚀 Deploy Strategy";

        // Reset toggles & displays
        document.getElementById('strat-top10-switch').checked = false;
        document.getElementById('single-coin-wrapper').classList.remove('d-none');
        document.getElementById('top10-info-badge').classList.add('d-none');
        document.getElementById('strat-type').dispatchEvent(new Event('change'));
    };

    window.editStrategy = function(index) {
        const strategies = getStrategies();
        const strat = strategies[index];
        if (!strat) return;

        document.getElementById('edit-strat-index').value = index;
        document.getElementById('modal-title-text').innerHTML = `<span class="me-2">✏️</span> Edit Strategy: ${strat.name}`;
        document.getElementById('btn-submit-strat').innerText = "💾 Save Changes";

        document.getElementById('strat-name').value = strat.name;
        document.getElementById('strat-type').value = strat.type || 'ai_prompt';
        document.getElementById('strat-timeframe').value = strat.timeframe || '15m';

        // Dynamic Types Fill
        const typeSelect = document.getElementById('strat-type');
        typeSelect.value = strat.type || 'ai_prompt';
        typeSelect.dispatchEvent(new Event('change'));

        if (strat.type === 'ai_prompt') {
            document.getElementById('strat-ai-prompt').value = strat.aiPrompt || '';
        } else if (strat.type === 'candlestick') {
            document.getElementById('strat-candle-pattern').value = (strat.aiPrompt || '').replace('Pattern: ', '');
        } else {
            document.getElementById('strat-indicator-signal').value = (strat.aiPrompt || '').replace('Signal: ', '');
        }

        // Multi Coin or Top 10 Switch Fill
        const top10Switch = document.getElementById('strat-top10-switch');
        if (strat.coin === 'TOP10_SCAN') {
            top10Switch.checked = true;
            document.getElementById('single-coin-wrapper').classList.add('d-none');
            document.getElementById('top10-info-badge').classList.remove('d-none');
        } else {
            top10Switch.checked = false;
            document.getElementById('single-coin-wrapper').classList.remove('d-none');
            document.getElementById('top10-info-badge').classList.add('d-none');
            document.getElementById('strat-coin').value = strat.coin;
        }

        document.getElementById('strat-capital-pct').value = strat.capitalPct || 10;
        document.getElementById('strat-leverage').value = strat.leverage || 10;
        document.getElementById('strat-rr-ratio').value = strat.rrRatio || '1:2';
        document.getElementById('strat-sl').value = strat.sl || 1.5;
        document.getElementById('strat-tp').value = strat.tp || 3.0;

        const modalEl = new bootstrap.Modal(document.getElementById('addStratModal'));
        modalEl.show();
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.loadStrategies();

        // Dynamic Form Dropdown Switcher
        const typeSelect = document.getElementById('strat-type');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                document.getElementById('cfg-ai-box').classList.toggle('d-none', val !== 'ai_prompt');
                document.getElementById('cfg-candle-box').classList.toggle('d-none', val !== 'candlestick');
                document.getElementById('cfg-crossover-box').classList.toggle('d-none', val !== 'crossover');
            });
        }

        // Top 10 Scanner Switch Logic
        const top10Switch = document.getElementById('strat-top10-switch');
        if (top10Switch) {
            top10Switch.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                document.getElementById('single-coin-wrapper').classList.toggle('d-none', isChecked);
                document.getElementById('top10-info-badge').classList.toggle('d-none', !isChecked);
            });
        }

        // Risk-Reward Auto Calculator
        const slInput = document.getElementById('strat-sl');
        const tpInput = document.getElementById('strat-tp');
        const rrSelect = document.getElementById('strat-rr-ratio');

        function updateTpBasedOnRR() {
            if (!slInput || !tpInput || !rrSelect) return;
            const sl = parseFloat(slInput.value) || 0;
            const multiplier = parseFloat(rrSelect.value.split(':')[1]) || 2;
            tpInput.value = (sl * multiplier).toFixed(1);
        }

        if (slInput && rrSelect) {
            slInput.addEventListener('input', updateTpBasedOnRR);
            rrSelect.addEventListener('change', updateTpBasedOnRR);
        }

        // Form Submit Handler (Create OR Update)
        const form = document.getElementById('add-strat-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const editIndex = parseInt(document.getElementById('edit-strat-index').value);
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

                // Format Coins (e.g. "BTCUSDT, ETHUSDT")
                let rawCoins = document.getElementById('strat-coin').value.trim().toUpperCase();
                let finalCoins = isTop10 ? 'TOP10_SCAN' : (rawCoins || 'BTCUSDT');

                const strategies = getStrategies();
                const stratData = {
                    name: document.getElementById('strat-name').value.trim(),
                    type: stratType,
                    timeframe: document.getElementById('strat-timeframe').value,
                    aiPrompt: promptText,
                    coin: finalCoins,
                    capitalPct: parseFloat(document.getElementById('strat-capital-pct').value) || 10,
                    leverage: parseInt(document.getElementById('strat-leverage').value) || 10,
                    rrRatio: document.getElementById('strat-rr-ratio').value,
                    sl: parseFloat(document.getElementById('strat-sl').value) || 1.5,
                    tp: parseFloat(document.getElementById('strat-tp').value) || 3.0,
                    active: editIndex >= 0 ? strategies[editIndex].active : true,
                    updatedAt: new Date().toISOString()
                };

                if (editIndex >= 0) {
                    strategies[editIndex] = stratData; // UPDATE
                } else {
                    strategies.push(stratData); // CREATE NEW
                }

                saveStrategies(strategies);

                // Hide Modal
                const modalEl = document.getElementById('addStratModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            });
        }
    });
})();
