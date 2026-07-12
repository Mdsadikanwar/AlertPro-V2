// GLOBAL FUNCTIONS
function showScreen(html) {
    document.getElementById('app').innerHTML = html;
}

function getNavbar() {
    return `
    <div class="topbar">
        <div class="logo" onclick="renderHome()" style="cursor:pointer;">⚡ ApexTraders</div>
        <div class="nav">
            <button class="nav-item" onclick="renderDashboard()">Dashboard</button>
            <button class="nav-item" onclick="renderTrading()">Trading</button>
            <button class="nav-item" onclick="renderStrategies()">Strategies</button>
            <button class="nav-item" onclick="renderBacktest()">Backtest</button>
        </div>
    </div>
    `;
}
