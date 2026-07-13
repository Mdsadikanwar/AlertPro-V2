function getNavbar() {
    return `
    <div class="topbar">
        <div class="logo" onclick="renderDashboard()" style="cursor:pointer;">⚡ ApexTraders</div>
        <div class="nav">
            <button class="nav-item" onclick="renderDashboard()">Dashboard</button>
            <button class="nav-item" onclick="renderHistory()">PNL & History</button> <!-- YE LINE ADD KI -->
            <button class="nav-item" onclick="renderTrading()">Trading</button>
            <button class="assets/js/tabs/strategies.js"></script>
            <button class="nav-item" onclick="renderBacktest()">Backtest</button>
            <button class="nav-item" onclick="renderSettings()">Settings</button>
            <button class="nav-item" onclick="renderLogs()">Logs</button>
            <button class="nav-item" onclick="renderHub()">Hub</button>
        </div>
    </div>
    `;
}
