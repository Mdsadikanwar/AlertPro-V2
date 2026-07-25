document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    const container = document.getElementById('strategies-container');
    const stratForm = document.getElementById('add-strat-form');
    const modeSelect = document.getElementById('strat-mode-select');

    // 1. Mode Switcher (Dropdown Change Event)
    if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
            const mode = e.target.value;
            const aiSec = document.getElementById('ai-section');
            const pineSec = document.getElementById('pine-section');

            if (mode === 'ai') {
                aiSec.classList.remove('d-none');
                pineSec.classList.add('d-none');
            } else if (mode === 'pinescript') {
                aiSec.classList.add('d-none');
                pineSec.classList.remove('d-none');
            } else {
                aiSec.classList.add('d-none');
                pineSec.classList.add('d-none');
            }
        });
    }

    // 2. Risk-Reward Ratio Dynamic Auto-Calculator
    const slInput = document.getElementById('strat-sl');
    const tpInput = document.getElementById('strat-tp');
    const rrInput = document.getElementById('strat-rr');

    function calcRR() {
        const sl = parseFloat(slInput.value) || 0;
        const tp = parseFloat(tpInput.value) || 0;
        if (sl > 0 && tp > 0) {
            rrInput.value = `1:${(tp / sl).toFixed(1)}`;
        } else {
            rrInput.value = '1:2.0';
        }
    }
    if (slInput && tpInput) {
        slInput.addEventListener('input', calcRR);
        tpInput.addEventListener('input', calcRR);
    }

    // 3. Load Strategies and Render Cards
    window.loadStrategies = async function() {
        if (!container) return;
        try {
            const res = await fetch(`${FIREBASE_URL}/trading_strategies.json`);
            if (!res.ok) return;
            const data = await res.json() || {};
            container.innerHTML = '';
            const entries = Object.entries(data);

            if (entries.length === 0) {
                container.innerHTML = `<div class="col-12 text-center text-muted py-5">
                    <h5>No Active Strategies Saved</h5>
                    <small>Click 'Create Strategy' button above to add your first strategy.</small>
                </div>`;
                return;
            }

            entries.forEach(([id, strat]) => {
                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4 mb-3';
                card.innerHTML = `
                    <div class="card bg-card text-white p-3 border-secondary shadow-sm">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="m-0 text-warning fw-bold">${strat.name || 'Strategy'}</h5>
                            <div class="form-check form-switch">
                                <input class="form-check-input bg-warning border-0" type="checkbox" ${strat.autoTrade ? 'checked' : ''} onchange="toggleAutoTrade('${id}', this.checked)">
                            </div>
                        </div>

                        <div class="badge bg-secondary mb-2">${(strat.mode || 'AI').toUpperCase()} MODE</div>

                        <div class="small text-muted mb-1">Pair: <strong class="text-white">${strat.coin}/USDT</strong> | Leverage: <strong class="text-white">${strat.leverage}x</strong></div>
                        <div class="small text-muted mb-1">Trade Size: <strong class="text-warning">${strat.tradeAmountPct}% Balance</strong></div>
                        <div class="small text-muted mb-1">RSI Threshold: <strong>≤${strat.rsiBuyLevel}</strong> | EMAs: <strong>${strat.emaFast}/${strat.emaSlow}</strong></div>
                        <div class="small text-muted mb-3">Risk-Reward: <strong class="text-success">${strat.riskReward || '1:2'}</strong> (SL: ${strat.stopLossPct}% | TP: ${strat.takeProfitPct}%)</div>

                        <div class="d-flex gap-2 pt-2 border-top border-secondary">
                            <button class="btn btn-sm btn-outline-warning flex-fill" onclick="testStrategy('${id}')"><i class="fa-solid fa-vial me-1"></i> Test</button>
                            <button class="btn btn-sm btn-outline-info flex-fill" onclick="editStrategy('${id}')"><i class="fa-solid fa-pen me-1"></i> Edit</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteStrategy('${id}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>`;
                container.appendChild(card);
            });
        } catch (err) {
            console.error("Strategy Loading Error:", err);
        }
    };

    // 4. Save / Update Strategy
    if (stratForm) {
        stratForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = document.getElementById('strat-edit-id').value;

            const newStrat = {
                mode: modeSelect.value,
                name: document.getElementById('strat-name').value,
                coin: document.getElementById('strat-coin').value.toUpperCase().replace("USDT", ""),
                rsiBuyLevel: parseFloat(document.getElementById('strat-rsi').value) || 30,
                emaFast: parseInt(document.getElementById('strat-fast').value) || 9,
                emaSlow: parseInt(document.getElementById('strat-slow').value) || 21,
                tradeAmountPct: parseFloat(document.getElementById('strat-amount-pct').value) || 5,
                leverage: parseInt(document.getElementById('strat-leverage').value) || 10,
                stopLossPct: parseFloat(document.getElementById('strat-sl').value) || 1.5,
                takeProfitPct: parseFloat(document.getElementById('strat-tp').value) || 3.0,
                riskReward: document.getElementById('strat-rr').value,
                pineCode: document.getElementById('strat-pine').value || '',
                autoTrade: document.getElementById('strat-autotrade').checked,
                updatedAt: new Date().toISOString()
            };

            const endpoint = editId ? `${FIREBASE_URL}/trading_strategies/${editId}.json` : `${FIREBASE_URL}/trading_strategies.json`;
            const method = editId ? 'PUT' : 'POST';

            await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStrat)
            });

            stratForm.reset();
            document.getElementById('strat-edit-id').value = '';
            bootstrap.Modal.getInstance(document.getElementById('addStratModal')).hide();
            window.loadStrategies();
        });
    }

    // 5. Quick Actions (Toggle Auto-Trade, Test, Edit, Delete)
    window.toggleAutoTrade = async (id, status) => {
        await fetch(`${FIREBASE_URL}/trading_strategies/${id}/autoTrade.json`, {
            method: 'PUT',
            body: JSON.stringify(status)
        });
    };

    window.testStrategy = (id) => {
        alert(`Backtest initiated for Strategy ID: ${id}. Switching to Backtest Tab...`);
        document.querySelector('.nav-link[data-tab="backtest"]')?.click();
    };

    window.editStrategy = async (id) => {
        const res = await fetch(`${FIREBASE_URL}/trading_strategies/${id}.json`);
        const strat = await res.json();
        if (!strat) return;

        document.getElementById('strat-edit-id').value = id;
        modeSelect.value = strat.mode || 'ai';
        modeSelect.dispatchEvent(new Event('change'));

        document.getElementById('strat-name').value = strat.name;
        document.getElementById('strat-coin').value = strat.coin;
        document.getElementById('strat-rsi').value = strat.rsiBuyLevel;
        document.getElementById('strat-fast').value = strat.emaFast;
        document.getElementById('strat-slow').value = strat.emaSlow;
        document.getElementById('strat-amount-pct').value = strat.tradeAmountPct;
        document.getElementById('strat-leverage').value = strat.leverage;
        document.getElementById('strat-sl').value = strat.stopLossPct;
        document.getElementById('strat-tp').value = strat.takeProfitPct;
        document.getElementById('strat-rr').value = strat.riskReward || '1:2.0';
        document.getElementById('strat-pine').value = strat.pineCode || '';
        document.getElementById('strat-autotrade').checked = strat.autoTrade;

        const modal = new bootstrap.Modal(document.getElementById('addStratModal'));
        modal.show();
    };

    window.deleteStrategy = async (id) => {
        if (confirm("Are you sure you want to delete this strategy?")) {
            await fetch(`${FIREBASE_URL}/trading_strategies/${id}.json`, { method: 'DELETE' });
            window.loadStrategies();
        }
    };

    window.loadStrategies();
});
