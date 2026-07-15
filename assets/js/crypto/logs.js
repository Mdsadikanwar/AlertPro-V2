// System Logs State (इसे भी ग्लोबल रख सकते हैं)
var systemLogs = [
  { time: "2026-07-15 10:00:05", type: "SYSTEM", message: "ApexTraders [CRYPTO] System Booted Successfully." },
  { time: "2026-07-15 10:00:08", type: "SUCCESS", message: "Connected to Binance Live Websocket Streams." },
  { time: "2026-07-15 10:00:12", type: "TELEGRAM", message: "Telegram Bot Status: Listening for signals..." }
];

// नया लॉग जोड़ने के लिए हेल्पर फंक्शन
function addSystemLog(type, message) {
  const now = new Date();
  const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);
  systemLogs.unshift({ time: timeStr, type: type, message: message });
}

function renderCryptoLogs() {
  const root = document.getElementById('app');
  
  const logRows = systemLogs.map(log => {
    let tagColor = "#cbd5e1";
    if (log.type === "SUCCESS") tagColor = "#22c55e";
    if (log.type === "ERROR") tagColor = "#ef4444";
    if (log.type === "TELEGRAM") tagColor = "#38bdf8";
    if (log.type === "SYSTEM") tagColor = "#a855f7";

    return `
      <div style="display: flex; gap: 15px; font-family: monospace; font-size: 13px; line-height: 1.6; border-bottom: 1px solid #1e293b; padding: 6px 0;">
        <span style="color: #64748b; min-width: 140px;">[${log.time}]</span>
        <span style="color: ${tagColor}; font-weight: bold; min-width: 90px;">[${log.type}]</span>
        <span style="color: #cbd5e1; flex: 1;">${log.message}</span>
      </div>
    `;
  }).join('');

  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
        <div>
          <h2 style="color: #38bdf8; margin: 0;">Live System Logs</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Track background processes, bot operations, and execution alerts</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="simulateMockAlertLog()" style="padding: 10px 15px; background: #1e293b; color: #38bdf8; border: 1px solid #38bdf8; border-radius: 6px; font-weight: bold; cursor: pointer;">Simulate Signal</button>
          <button onclick="clearCryptoLogs()" style="padding: 10px 15px; background: #ef4444; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Clear Logs</button>
        </div>
      </div>

      <!-- Black Terminal Console -->
      <div style="background: #090d16; border: 1px solid #334155; border-radius: 12px; padding: 20px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.8);">
        
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 12px;">
          <div style="display: flex; gap: 6px;">
            <span style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%; display: inline-block;"></span>
            <span style="width: 12px; height: 12px; background: #eab308; border-radius: 50%; display: inline-block;"></span>
            <span style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%; display: inline-block;"></span>
          </div>
          <span style="font-size: 11px; color: #64748b; font-family: monospace;">bash - apex-bot-console.sh</span>
        </div>

        <div style="max-height: 450px; overflow-y: auto; display: flex; flex-direction: column;">
          ${logRows.length > 0 ? logRows : '<div style="color: #64748b; text-align: center; padding: 40px; font-family: monospace;">-- Terminal Empty: No logs recorded --</div>'}
        </div>

      </div>

    </div>
  `;
}

function clearCryptoLogs() {
  if (confirm("Are you sure you want to clear the logs history?")) {
    systemLogs = [];
    renderCryptoLogs();
  }
}

function simulateMockAlertLog() {
  const assets = ["BTC", "ETH", "SOL"];
  const directions = ["BUY", "SELL"];
  const randomAsset = assets[Math.floor(Math.random() * assets.length)];
  const randomDir = directions[Math.floor(Math.random() * directions.length)];
  const mockPrice = randomAsset === "BTC" ? "64,520" : (randomAsset === "ETH" ? "3,410" : "142.50");

  addSystemLog("TELEGRAM", `Received incoming signal from channel: ${randomDir} ${randomAsset}USDT`);
  
  setTimeout(() => {
    addSystemLog("SYSTEM", `Executing automated trade order: ${randomDir} 0.05 ${randomAsset} at limit $${mockPrice}`);
  }, 400);

  setTimeout(() => {
    addSystemLog("SUCCESS", `Position opened successfully on Exchange with Leverage ${appSettings.defaultLeverage}!`);
    renderCryptoLogs();
  }, 1000);

  renderCryptoLogs();
}
