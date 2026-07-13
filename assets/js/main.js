function getNavbar() {
  return `
    <div class="topbar">
      <div class="logo">⚡ ApexTraders</div>
      <div style="color: #94a3b8;">Professional AI</div>
    </div>
    <div class="navbar">
      <button class="nav-btn" onclick="renderHome()">🏠 Home</button>
      <button class="nav-btn" onclick="renderDashboard()">📊 Dashboard</button>
      <button class="nav-btn" onclick="renderHistory()">💰 PNL & History</button>  <!-- YE NAYA BUTTON ADD KIYA -->
      <button class="nav-btn" onclick="renderTrading()">💵 Trading</button>
      <button class="nav-btn" onclick="renderStrategies()">🤖 Strategies</button>
      <button class="nav-btn" onclick="renderBacktest()">📈 Backtest</button>
      <button class="nav-btn" onclick="renderSettings()">⚙️ Settings</button>
      <button class="nav-btn" onclick="renderLogs()">📝 Logs</button>
      <button class="nav-btn" onclick="renderHub()">🛠️ Hub</button>
    </div>
  `;
}

function startLivePrices(){
    // Har 2 sec me price update karega
    setInterval(() => {
        livePrices.btc.usdt = 65000 + Math.random() * 1000 - 500;
        livePrices.eth.usdt = 3500 + Math.random() * 100 - 50;
        livePrices.sol.usdt = 150 + Math.random() * 10 - 5;
    }, 2000);
}
