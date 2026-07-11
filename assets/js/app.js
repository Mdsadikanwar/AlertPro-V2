function showScreen(html) {
    document.getElementById('app').innerHTML = html;
}

function renderHome() {
    showScreen(`
    <div class="topbar">
        <div class="logo">⚡ ApexTraders</div>
        <div style="color: #94a3b8;">Professional AI</div>
    </div>
    <div class="container">
        <h1>⚡ ApexTraders</h1>
        <div class="btn-group">
            <button class="main-btn btn-crypto" onclick="renderDashboard()">📊 CRYPTO TERMINAL</button>
            <button class="main-btn btn-stock" onclick="alert('Coming Soon')">📈 STOCK MARKET</button>
            <button class="main-btn btn-commodity" onclick="alert('Coming Soon')">🏭 COMMODITY</button>
        </div>
    </div>
    `);
}

// NAYA: Dashboard se wapas Home aane ke liye
function getNavbar() {
    return `
    <div class="topbar">
        <div class="logo" onclick="renderHome()" style="cursor:pointer;">⚡ ApexTraders</div>
        <div class="nav">
            <button class="nav-item active" data-tab="dashboard" onclick="renderDashboard()">Dashboard</button>
            <button class="nav-item" data-tab="trading" onclick="renderTrading()">Trading</button>
            <button class="nav-item" data-tab="strategies" onclick="renderStrategies()">Strategies</button>
            <button class="nav-item" data-tab="backtest" onclick="renderBacktest()">Backtest</button>
        </div>
    </div>
    `;
}

renderHome();
