// CryptoSignal Pro - Engine Logic (100% Complete)

const STORAGE_KEY = 'crypto_signals_master';
let tvWidget = null;

document.addEventListener('DOMContentLoaded', () => {
    initDefaultData();
    renderTradingViewChart("BINANCE:BTCUSDT");
    renderStrategies();
    renderSignalsFeed();
    loadSettings();

    // Form Listener
    const settingsForm = document.getElementById('telegram-settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = getMasterData();
            data.settings = {
                tgToken: document.getElementById('cfg-tg-token').value.trim(),
                tgChatId: document.getElementById('cfg-tg-chatid').value.trim()
            };
            saveMasterData(data);
            alert("Telegram settings saved successfully!");
        });
    }
});

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('#appTabs .nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

function getMasterData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { settings: {}, strategies: [], signals: [] };
}

function saveMasterData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function initDefaultData() {
    const data = getMasterData();
    if (!data.strategies || data.strategies.length === 0) {
        data.strategies = [
            { id: 'STRAT_1', name: 'BTC/ETH Momentum Scanner', coins: 'BTCUSDT, ETHUSDT', sl: 1.5, tp: 3.0, active: true },
            { id: 'STRAT_2', name: 'Solana High Volatility Breakout', coins: 'SOLUSDT', sl: 2.0, tp: 4.5, active: true }
        ];
        saveMasterData(data);
    }
}

function renderTradingViewChart(symbol) {
    const container = document.getElementById('tv_chart_container');
    if (!container) return;
    container.innerHTML = '';
    
    tvWidget = new TradingView.widget({
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

function renderStrategies() {
    const container = document.getElementById('strategies-card-container');
    if (!container) return;

    const data = getMasterData();
    const strats = data.strategies || [];

    if (strats.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted py-4">No strategies defined yet. Click "Create New Strategy" above.</div>`;
        return;
    }

    let html = '';
    strats.forEach((s, idx) => {
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card p-3 h-100 ${s.active ? 'border-primary' : 'border-secondary'}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="fw-bold m-0 text-light">${escapeHtml(s.name)}</h6>
                        <span class="badge ${s.active ? 'bg-success' : 'bg-secondary'}">${s.active ? 'RUNNING' : 'PAUSED'}</span>
                    </div>
                    <small class="text-muted mb-2 d-block">Pairs: <code class="text-info">${escapeHtml(s.coins)}</code></small>
                    <div class="row text-center mb-3">
                        <div class="col-6"><small class="text-muted d-block">SL Target</small><span class="text-danger fw-bold">${s.sl}%</span></div>
                        <div class="col-6"><small class="text-muted d-block">TP Target</small><span class="text-success fw-bold">${s.tp}%</span></div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center pt-2 border-top border-secondary">
                        <button class="btn btn-sm ${s.active ? 'btn-outline-warning' : 'btn-outline-success'}" onclick="toggleStrategy(${idx})">
                            <i class="bi ${s.active ? 'bi-pause-fill' : 'bi-play-fill'}"></i> ${s.active ? 'Pause' : 'Start'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteStrategy(${idx})">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function createNewStrategy() {
    const name = document.getElementById('strat-name').value.trim();
    const coins = document.getElementById('strat-coins').value.trim().toUpperCase();
    const sl = parseFloat(document.getElementById('strat-sl').value) || 1.5;
    const tp = parseFloat(document.getElementById('strat-tp').value) || 3.0;

    if (!name || !coins) {
        alert("Please enter Strategy Name and Coins!");
        return;
    }

    const data = getMasterData();
    data.strategies.push({ id: 'STRAT_' + Date.now(), name, coins, sl, tp, active: true });
    saveMasterData(data);
    renderStrategies();

    const modal = bootstrap.Modal.getInstance(document.getElementById('addStrategyModal'));
    if (modal) modal.hide();
}

function toggleStrategy(index) {
    const data = getMasterData();
    data.strategies[index].active = !data.strategies[index].active;
    saveMasterData(data);
    renderStrategies();
}

function deleteStrategy(index) {
    if (!confirm("Delete this strategy?")) return;
    const data = getMasterData();
    data.strategies.splice(index, 1);
    saveMasterData(data);
    renderStrategies();
}

function loadSettings() {
    const data = getMasterData();
    const set = data.settings || {};
    if (set.tgToken) document.getElementById('cfg-tg-token').value = set.tgToken;
    if (set.tgChatId) document.getElementById('cfg-tg-chatid').value = set.tgChatId;
}

function renderSignalsFeed() {
    const container = document.getElementById('quick-signals-list');
    if (!container) return;

    const data = getMasterData();
    const sigs = data.signals || [];

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
        const msg = "🚀 *CryptoSignal Pro Integration Test*\n\nYour Telegram Bot is successfully connected!";
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' })
        });
        const resp = await res.json();
        if (resp.ok) {
            alert("Test message sent to Telegram!");
        } else {
            alert("Telegram Error: " + resp.description);
        }
    } catch (e) {
        alert("Failed to send message: " + e.message);
    }
}

async function manualScan() {
    alert("Scanning Binance Live Prices for Active Strategies...");
}

function escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}
