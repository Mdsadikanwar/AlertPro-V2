let tradeBalance = { usdt: 1000, inr: 83000 };

function showScreen(html) {
    document.getElementById('app').innerHTML = html;
}

function getNavbar() {
    return `
    <div class="topbar">
        <div class="logo" onclick="renderDashboard()" style="cursor:pointer;">⚡ ApexTraders</div>
        <div class="nav">
            <button class="nav-item" onclick="renderDashboard()">Dashboard</button>
            <button class="nav-item" onclick="renderTrading()">Trading</button>
            <button class="nav-item" onclick="renderStrategies()">Strategies</button>
            <button class="nav-item" onclick="renderBacktest()">Backtest</button>
        </div>
    </div>
    `;
}

function renderDashboard() {
    showScreen(getNavbar() + `<div class="container"><h1>Dashboard</h1></div>`);
}
function renderStrategies() {
    showScreen(getNavbar() + `<div class="container"><h1>Strategies</h1></div>`);
}
function renderBacktest() {
    showScreen(getNavbar() + `<div class="container"><h1>Backtest</h1></div>`);
}

document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
});
