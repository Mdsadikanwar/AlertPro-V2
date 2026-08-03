// Exact logic integration based on your custom script

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
        renderTradingViewChart("BINANCE:BTCUSDT");
        loadSettings();
        renderSignalsFeed();

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
            const ratioStr = rrSelect.value;
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

        // Settings Save Handler
        const settingsForm = document.getElementById('telegram-settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const masterRaw = localStorage.getItem('apex_master_data');
                let master = masterRaw ? JSON.parse(masterRaw) : {};
                master.settings = {
                    tgToken: document.getElementById('cfg-tg-token').value.trim(),
                    tgChatId: document.getElementById('cfg-tg-chatid').value.trim()
                };
                localStorage.setItem('apex_master_data', JSON.stringify(master));
                alert("Telegram settings saved!");
            });
        }
    });
})();

// Navigation & Global UI Functions
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('#appTabs .nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

function renderTradingViewChart(symbol) {
    const container = document.getElementById('tv_chart_container');
    if (!container) return;
    container.innerHTML = '';
    
    new TradingView.widget({
        "autosize": true,
        "symbol": symbol,
        "interval": "15",
        "timezone": "Asia/Kolkata",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tv_chart_container"
    });
}

function updateChartPair(symbol) {
    renderTradingViewChart(symbol);
}

function loadSettings() {
    const masterRaw = localStorage.getItem('apex_master_data');
    if (!masterRaw) return;
    const master = JSON.parse(masterRaw);
    const set = master.settings || {};
    if (set.tgToken) document.getElementById('cfg-tg-token').value = set.tgToken;
    if (set.tgChatId) document.getElementById('cfg-tg-chatid').value = set.tgChatId;
}

function renderSignalsFeed() {
    const container = document.getElementById('quick-signals-list');
    if (!container) return;

    const masterRaw = localStorage.getItem('apex_master_data');
    const master = masterRaw ? JSON.parse(masterRaw) : {};
    const sigs = master.signals || [];

    if (sigs.length === 0) return;

    let html = '';
    sigs.slice(0, 10).forEach(sig => {
        const isBuy = sig.action === 'BUY';
        html += `
            <div class="p-2 mb-2 rounded bg-dark border border-secondary">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold">${sig.coin}</span>
                    <span class="badge ${isBuy ? 'badge-buy' : 'badge-sell'}">${sig.action}</span>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span>Entry: $${sig.price}</span>
                    <span>${sig.time}</span>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

async function testTelegramAlert() {
    const token = document.getElementById('cfg-tg-token').value.trim();
    const chatId = document.getElementById('cfg-tg-chatid').value.trim();

    if (!token || !chatId) {
        alert("Enter Bot Token and Chat ID first!");
        return;
    }

    try {
        const msg = "🚀 *ApexSignal Pro Test Alert*\n\nYour Telegram Bot is live & connected!";
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' })
        });
        const resp = await res.json();
        if (resp.ok) alert("Test Alert sent!");
        else alert("Telegram Error: " + resp.description);
    } catch (e) {
        alert("Error sending message: " + e.message);
    }
}

function manualScan() {
    alert("Triggering scan sequence...");
}
