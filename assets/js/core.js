// GLOBAL DATA
var orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
var livePrices = { btc: { usdt: 65000 }, eth: { usdt: 3500 }, sol: { usdt: 150 } };

// NAVBAR + ROUTER
function getNavbar() {
    return `
    <div class="topbar">
        <div class="logo" onclick="renderDashboard()" style="cursor:pointer;">⚡ ApexTraders</div>
        <div class="nav">
            <button class="nav-item" onclick="renderDashboard()">🏠 Home</button>
            <button class="nav-item" onclick="renderDashboard()">📊 Dashboard</button>
            <button class="nav-item" onclick="renderHistory()">💰 PNL & History</button>
            <button class="nav-item" onclick="renderTrading()">💵 Trading</button>
            <button class="nav-item" onclick="renderStrategies()">🤖 Strategies</button>
            <button class="nav-item" onclick="renderBacktest()">📈 Backtest</button>
            <button class="nav-item" onclick="renderSettings()">⚙️ Settings</button>
            <button class="nav-item" onclick="renderLogs()">📝 Logs</button>
            <button class="nav-item" onclick="renderHub()">🔧 Hub</button>
        </div>
    </div>
    `;
}
function showScreen(html){ document.getElementById('app').innerHTML = html; }

// HISTORY FUNCTIONS
function addToHistory(type, coin, price, amount){
  orderHistory.unshift({type, coin, price, amount, time: new Date().toLocaleString(), pnl: 0});
  localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
}
function clearHistory(){
  if(confirm("Clear All History?")){ 
    orderHistory = []; 
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory)); 
    renderHistory(); 
  }
}
