// GLOBAL DATA
var orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
var livePrices = { btc: { usdt: 65000 }, eth: { usdt: 3500 }, sol: { usdt: 150 } };
var tradeBalance = { usdt: 10000, inr: 830000 };

// NAVBAR + ROUTER
function getNavbar() {
    return `
    <div class="topbar">
        <div class="logo" onclick="renderDashboard()" style="cursor:pointer;">⚡ ApexTraders</div>
        <div class="navbar">
            <button class="nav-btn" onclick="renderHome()">🏠 Home</button>
            <button class="nav-btn" onclick="renderDashboard()">📊 Dashboard</button>
            <button class="nav-btn" onclick="renderHistory()">💰 PNL & History</button>  <!-- YE NAYA -->
            <button class="nav-btn" onclick="renderTrading()">💵 Trading</button>
            <button class="nav-btn" onclick="renderStrategies()">🤖 Strategies</button>
            <button class="nav-btn" onclick="renderBacktest()">📈 Backtest</button>
            <button class="nav-btn" onclick="renderSettings()">⚙️ Settings</button>
            <button class="nav-btn" onclick="renderLogs()">📝 Logs</button>
            <button class="nav-btn" onclick="renderHub()">🔧 Hub</button>
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
