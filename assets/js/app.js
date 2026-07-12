// ===== GLOBAL SCREEN FUNCTION =====
function showScreen(html) {
    document.getElementById('app').innerHTML = html;
}

// ===== NAVBAR =====
function getNavbar() {
    return `
    <div class="topbar">
        <div class="logo" onclick="renderHome()" style="cursor:pointer;">⚡ ApexTraders</div>
        <div class="nav">
            <button class="nav-item" onclick="renderDashboard()">Dashboard</button>
            <button class="nav-item" onclick="renderTrading()">Trading</button>
            <button class="nav-item" onclick="renderStrategies()">Strategies</button>
            <button class="nav-item" onclick="renderBacktest()">Backtest</button>
            <button class="nav-item" onclick="renderSettings()">Settings</button>
            <button class="nav-item" onclick="renderLogs()">Logs</button>
            <button class="nav-item" onclick="renderHub()">Hub</button>
        </div>
    </div>
    `;
}

// ===== HOME SCREEN =====
function renderHome() {
    showScreen(`
    <div class="topbar">
        <div class="logo">⚡ ApexTraders</div>
        <div style="color: #94a3b8;">Professional AI</div>
    </div>
    <div class="container">
        <h1>⚡ ApexTraders</h1>
        <p style="color:#94a3b8; margin-bottom:30px;">AI Powered Trading Terminal</p>
        <div class="btn-group">
            <button class="main-btn btn-crypto" onclick="renderDashboard()">📊 CRYPTO TERMINAL</button>
            <button class="main-btn btn-stock" onclick="alert('Coming Soon')">📈 STOCK MARKET</button>
            <button class="main-btn btn-commodity" onclick="alert('Coming Soon')">🏭 COMMODITY</button>
        </div>
    </div>
    `);
}

// ===== DASHBOARD TAB =====
function renderDashboard() {
    showScreen(`
        ${getNavbar()}
        <div class="card">
            <h2>📊 Dashboard</h2>
            <p style="color:#94a3b8;">Market Overview and Stats will come here</p>
        </div>
    `);
}

// NOTE: renderTrading yaha NHI HAI. Wo trading.js me hai

// ===== STRATEGIES TAB =====
function renderStrategies() {
    showScreen(`
        ${getNavbar()}
        <div class="card">
            <h2>🎯 Strategies</h2>
            <p style="color:#94a3b8;">Create and manage your trading strategies here</p>
        </div>
    `);
}

// ===== BACKTEST TAB =====
function renderBacktest() {
    showScreen(`
        ${getNavbar()}
        <div class="card">
            <h2>📈 Backtest</h2>
            <p style="color:#94a3b8;">Test your strategies with historical data</p>
        </div>
    `);
}

// ===== SETTINGS TAB =====
function renderSettings() {
    showScreen(`
        ${getNavbar()}
        <div class="card">
            <h2>⚙️ Settings</h2>
            <p style="color:#94a3b8;">API Keys and App Settings</p>
        </div>
    `);
}

// ===== LOGS TAB =====
function renderLogs() {
    showScreen(`
        ${getNavbar()}
        <div class="card">
            <h2>📝 Logs</h2>
            <p style="color:#94a3b8;">Trade and Bot Logs</p>
        </div>
    `);
}

// ===== HUB TAB =====
function renderHub() {
    showScreen(`
        ${getNavbar()}
        <div class="card">
            <h2>🔧 Hub</h2>
            <p style="color:#94a3b8;">Integrations and Tools</p>
        </div>
    `);
}

// ===== START APP =====
renderHome();
