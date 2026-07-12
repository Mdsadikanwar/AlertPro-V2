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

// YE 4 FUNCTION YAHI RAHENGE
function renderDashboard() { showScreen(getNavbar() + '<div class="card"><h2>Dashboard</h2></div>'); }
function renderTrading() { showScreen(getNavbar() + '<div class="card"><h2>Trading</h2><p>Coming Soon</p></div>'); }
function renderStrategies() { showScreen(getNavbar() + '<div class="card"><h2>Strategies</h2></div>'); }
function renderBacktest() { showScreen(getNavbar() + '<div class="card"><h2>Backtest</h2></div>'); }

renderHome();
