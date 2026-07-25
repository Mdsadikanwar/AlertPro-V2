// Mode Switcher Toggle
document.querySelectorAll('input[name="stratMode"]').forEach(elem => {
    elem.addEventListener('change', (e) => {
        const mode = e.target.value;
        const aiSec = document.getElementById('ai-section');
        const pineSec = document.getElementById('pine-section');

        if (mode === 'ai') {
            aiSec.classList.remove('d-none');
            pineSec.classList.add('d-none');
        } else if (mode === 'template') {
            aiSec.classList.add('d-none');
            pineSec.classList.remove('d-none');
        } else {
            aiSec.classList.add('d-none');
            pineSec.classList.add('d-none');
        }
    });
});

// Auto-Calculate Risk-Reward Ratio (RR)
const slInput = document.getElementById('strat-sl');
const tpInput = document.getElementById('strat-tp');
const rrInput = document.getElementById('strat-rr');

function calcRR() {
    const sl = parseFloat(slInput.value) || 0;
    const tp = parseFloat(tpInput.value) || 0;
    if (sl > 0 && tp > 0) {
        const ratio = (tp / sl).toFixed(1);
        rrInput.value = `1:${ratio}`;
    } else {
        rrInput.value = '1:2 (Auto)';
    }
}
if(slInput && tpInput) {
    slInput.addEventListener('input', calcRR);
    tpInput.addEventListener('input', calcRR);
}

// Strategy Form Submission Data Object
if (stratForm) {
    stratForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedMode = document.querySelector('input[name="stratMode"]:checked').value;
        const submitBtn = document.getElementById('save-strat-btn');
        if(submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> Saving...`;
        }

        const newStrat = {
            mode: selectedMode,
            name: document.getElementById('strat-name').value,
            coin: document.getElementById('strat-coin').value.toUpperCase().replace("USDT", ""),
            // Entry Rules
            rsiBuyLevel: parseFloat(document.getElementById('strat-rsi').value) || 30,
            emaFast: parseInt(document.getElementById('strat-fast').value) || 9,
            emaSlow: parseInt(document.getElementById('strat-slow').value) || 21,
            // Exit Rules
            stopLossPct: parseFloat(document.getElementById('strat-sl').value) || 1.5,
            takeProfitPct: parseFloat(document.getElementById('strat-tp').value) || 3.0,
            riskReward: document.getElementById('strat-rr').value || '1:2',
            // Money Management
            tradeAmount: parseFloat(document.getElementById('strat-amount').value) || 50,
            leverage: parseInt(document.getElementById('strat-leverage').value) || 10,
            // Auto Trade & PineScript
            autoTrade: document.getElementById('strat-autotrade').checked,
            pineCode: document.getElementById('strat-pine') ? document.getElementById('strat-pine').value : "",
            createdAt: new Date().toISOString()
        };

        try {
            const res = await fetch(`${FIREBASE_URL}/trading_strategies.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStrat)
            });

            if (res.ok) {
                stratForm.reset();
                const modalEl = document.getElementById('addStratModal');
                if (modalEl && window.bootstrap) {
                    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    modal.hide();
                }
                window.loadStrategies();
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Save Strategy`;
            }
        }
    });
}
