// Simulated Log Messages State
var cryptoLogs = [
  { timestamp: "2026-07-14 20:45:12", type: "INFO", message: "ApexTraders Crypto Engine initialized successfully." },
  { timestamp: "2026-07-14 20:46:05", type: "SUCCESS", message: "Binance API Handshake verified." },
  { timestamp: "2026-07-14 20:48:30", type: "SIGNAL", message: "ORB Strategy triggered BUY signal on BTCUSDT at $65,000." },
  { timestamp: "2026-07-14 20:48:32", type: "TELEGRAM", message: "Telegram Alert sent successfully to Chat ID." },
  { timestamp: "2026-07-14 21:00:15", type: "INFO", message: "Listening for new price tickers..." }
];

// Crypto Logs tab render function
function renderCryptoLogs() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
        <div>
          <h2 style="color: #38bdf8; margin: 0;">System Logs</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Real-time execution activity and diagnostic logs</p>
        </div>
        <button onclick="clearCryptoLogs()" style="background: #ef4444; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer;">Clear Logs</button>
      </div>

      <!-- Logs Console Window -->
      <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; font-family: monospace; min-height: 400px; max-height: 600px; overflow-y: auto;">
        <div id="logsConsole" style="display: flex; flex-direction: column; gap: 10px;">
          ${cryptoLogs.map(log => {
            let color = "#cbd5e1"; // Default Gray
            if (log.type === "SUCCESS") color = "#22c55e"; // Green
            if (log.type === "SIGNAL") color = "#eab308";  // Yellow
            if (log.type === "TELEGRAM") color = "#38bdf8"; // Blue
            if (log.type === "ERROR") color = "#ef4444";    // Red

            return `
              <div style="display: flex; gap: 15px; border-bottom: 1px solid #0f172a; padding-bottom: 5px;">
                <span style="color: #64748b; min-width: 150px;">[${log.timestamp}]</span>
                <span style="color: ${color}; font-weight: bold; min-width: 90px;">[${log.type}]</span>
                <span style="color: #e2e8f0;">${log.message}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;
}

// Clear logs simulator
function clearCryptoLogs() {
  cryptoLogs = [];
  renderCryptoLogs();
}
