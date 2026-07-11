function getNavbar() {
  return `
    <div class="topbar">
      <div class="logo">⚡ ApexTraders</div>
      <div style="color: #94a3b8;">Professional AI</div>
    </div>
    <div class="navbar">
      <button class="nav-btn" onclick="renderHome()">🏠 Home</button>
      <button class="nav-btn" onclick="renderDashboard()">📊 Dashboard</button>
      <button class="nav-btn" onclick="renderTrading()">💰 Trading</button>
      <button class="nav-btn" onclick="renderStrategies()">🤖 Strategies</button>
      <button class="nav-btn" onclick="renderBacktest()">📈 Backtest</button>
      <button class="nav-btn" onclick="renderSettings()">⚙️ Settings</button>
      <button class="nav-btn" onclick="renderLogs()">📝 Logs</button>
      <button class="nav-btn" onclick="renderHub()">🛠️ Hub</button>
    </div>
  `;
}
