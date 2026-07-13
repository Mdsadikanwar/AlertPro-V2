// ===== GLOBAL VARIABLES =====
let tradeBalance = { usdt: 1000, inr: 83000 };
let holdings = { BTC: 0, ETH: 0, SOL: 0, BNB: 0, XRP: 0, DOGE: 0, ADA: 0, TRX: 0, TON: 0, SHIB: 0 };
let livePrices = {};

// ===== GLOBAL FUNCTIONS =====
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

// ===== PLACEHOLDER FUNCTIONS =====
function renderHome() {
    renderDashboard();
}

function renderDashboard() {
    showScreen(`${getNavbar()}
    <div class="container">
        <h1>Welcome to ApexTraders ⚡</h1>
        <div class="card">
            <h3>Total Balance: $${tradeBalance.usdt.toFixed(2)}</h3>
        </div>
    </div>
    `);
}

function renderStrategies() {
    showScreen(`${getNavbar()}<div class="container"><h1>Strategies Page</h1></div>`);
}

function renderBacktest() {
    showScreen(`${getNavbar()}<div class="container"><h1>Backtest Page</h1></div>`);
}

// ===== APP START =====
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard(); // site open होते ही dashboard खुलेगा
});
