document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    const container = document.getElementById('strategies-container');
    const stratForm = document.getElementById('add-strat-form');

    // Mode Toggle Logic
    document.querySelectorAll('input[name="stratMode"]').forEach(elem => {
        elem.addEventListener('change', (e) => {
            const mode = e.target.value;
            const aiSec = document.getElementById('ai-section');
            const pineSec = document.getElementById('pine-section');
            if (mode === 'ai') { aiSec.classList.remove('d-none'); pineSec.classList.add('d-none'); }
            else if (mode === 'template') { aiSec.classList.add('d-none'); pineSec.classList.remove('d-none'); }
            else { aiSec.classList.add('d-none'); pineSec.classList.add('d-none'); }
        });
    });

    // Load Strategies
    window.loadStrategies = async function() {
        if (!container) return;
        try {
            const res = await fetch(`${FIREBASE_URL}/trading_strategies.json`);
            if (!res.ok) return;
            const data = await res.json() || {};
            container.innerHTML = '';
            const entries = Object.entries(data);

            if (entries.length === 0) {
                container.innerHTML = `<div class="col-12 text-center text-muted py-5"><h5>No Active Strategies Deployed</h5></div>`;
                return;
            }

            entries.forEach(([id, strat]) => {
                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4 mb-3';
                card.innerHTML = `
                    <div class="card bg-card text-white p-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="m-0 text-warning fw-bold">${strat.name || 'Strategy'}</h5>
                            <span class="badge ${strat.autoTrade ? 'bg-success' : 'bg-secondary'}">${strat.autoTrade ? 'AUTO ON' : 'AUTO OFF'}</span>
                        </div>
                        <p class="small text-muted mb-1">Pair: <strong>${strat.coin}/USDT</strong> | Leverage: <strong>${strat.leverage}x</strong></p>
                        <p class="small text-muted mb-1">RSI: ≤${strat.rsiBuyLevel} | SL: ${strat.stopLossPct}% | TP: ${strat.takeProfitPct}%</p>
                        <button class="btn btn-sm btn-outline-danger mt-3" onclick="deleteStrategy('${id}')">Delete Strategy</button>
                    </div>`;
                container.appendChild(card);
            });
        } catch (err) { console.warn(err); }
    };

    // Save Strategy Form
    if (stratForm) {
        stratForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newStrat = {
                mode: document.querySelector('input[name="stratMode"]:checked').value,
                name: document.getElementById('strat-name').value,
                coin: document.getElementById('strat-coin').value.toUpperCase().replace("USDT", ""),
                rsiBuyLevel: parseFloat(document.getElementById('strat-rsi').value) || 30,
                emaFast: parseInt(document.getElementById('strat-fast').value) || 9,
                emaSlow: parseInt(document.getElementById('strat-slow').value) || 21,
                stopLossPct: parseFloat(document.getElementById('strat-sl').value) || 1.5,
                takeProfitPct: parseFloat(document.getElementById('strat-tp').value) || 3.0,
                tradeAmount: parseFloat(document.getElementById('strat-amount').value) || 50,
                leverage: parseInt(document.getElementById('strat-leverage').value) || 10,
                autoTrade: document.getElementById('strat-autotrade').checked,
                createdAt: new Date().toISOString()
            };

            await fetch(`${FIREBASE_URL}/trading_strategies.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStrat)
            });

            stratForm.reset();
            bootstrap.Modal.getInstance(document.getElementById('addStratModal')).hide();
            window.loadStrategies();
        });
    }

    window.deleteStrategy = async (id) => {
        if (confirm("Delete this strategy?")) {
            await fetch(`${FIREBASE_URL}/trading_strategies/${id}.json`, { method: 'DELETE' });
            window.loadStrategies();
        }
    };

    window.loadStrategies();
});
