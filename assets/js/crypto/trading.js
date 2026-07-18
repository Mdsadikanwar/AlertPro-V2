// Global States
let isAutoBotRunning = false;
let autoBotLogs = ["🤖 ApexTraders Automated Engine initialized."];
let accountBalances = { USDT: "0.00", BTC: "0.00" };

// 1. बाइनेंस की जगह सीधे फायरबेस से बैलेंस रीड करना (NO CORS RISK)
function fetchBinanceBalances() {
  if (typeof firebase === 'undefined') return;

  autoBotLogs.unshift("⏳ Reading live balance from Firebase Sync...");
  updateBotLogsUI();

  firebase.database().ref('account_balance').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      accountBalances.USDT = data.usdt || "0.00";
      accountBalances.BTC = data.btc || "0.000000";
      
      const time = data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : "Just now";
      autoBotLogs.unshift(`✅ Balance updated from Firebase (Synced at ${time})`);
      renderCryptoTrading();
    } else {
      autoBotLogs.unshift("⚠️ No balance data found in Firebase. Run GitHub bot once.");
      updateBotLogsUI();
    }
  });
}

// 2. मुख्य रेंडर फंक्शन
function renderCryptoTrading() {
  const root = document.getElementById('app');
  if (!root) return;

  root.innerHTML = `
    ${typeof getMarketNavbar === 'function' ? getMarketNavbar('CRYPTO', '#38bdf8') : ''}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff; max-width: 600px; margin: 0 auto;">
      
      <!-- Live Testnet Balance Wallet -->
      <div style="background: #1e293b; padding: 15px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="color: #94a3b8; font-size: 12px; font-weight: bold;">BINANCE TESTNET BALANCE (FIREBASE SYNC)</span>
          <button onclick="fetchBinanceBalances()" style="background: transparent; border: 1px solid #38bdf8; color: #38bdf8; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">🔄 Refresh</button>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <div>
            <div style="font-size: 20px; font-family: monospace; color: #22c55e; font-weight: bold;">$${accountBalances.USDT} USDT</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 20px; font-family: monospace; color: #38bdf8; font-weight: bold;">${accountBalances.BTC} BTC</div>
          </div>
        </div>
      </div>

      <!-- Auto Trading Master Toggle Switch -->
      <div style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <div>
            <h3 style="margin: 0; font-size: 16px; color: #fff;">🤖 Core Auto Trading Execution</h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">फायरबेस सिग्नल्स पर सीधे एपीआई ऑर्डर मारना</p>
          </div>
          <span style="font-size: 11px; background: ${isAutoBotRunning ? '#22c55e' : '#ef4444'}; color: #fff; padding: 4px 10px; border-radius: 20px; font-weight: bold;">
            ${isAutoBotRunning ? 'RUNNING' : 'OFFLINE'}
          </span>
        </div>

        <button onclick="toggleAutoBotEngine()" style="width: 100%; padding: 12px; background: ${isAutoBotRunning ? '#ef4444' : '#a855f7'}; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">
          ${isAutoBotRunning ? '🔴 Stop Auto Execution Bot' : '⚡ Activate Auto Execution Bot'}
        </button>
      </div>

      <!-- Real-time Live Execution Logs Terminal -->
      <div>
        <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase;">Real API Execution Logs</label>
        <div id="autoBotLogsTerminal" style="background: #090d16; border: 1px solid #1e293b; border-radius: 8px; height: 220px; overflow-y: auto; padding: 12px; font-family: monospace; font-size: 11px; color: #38bdf8; line-height: 1.5; box-sizing: border-box;">
          ${autoBotLogs.map(log => `<div>${log}</div>`).join('')}
        </div>
      </div>

    </div>
  `;
}

// 3. बोट को ऑन/ऑफ करने का लॉजिक
function toggleAutoBotEngine() {
  isAutoBotRunning = !isAutoBotRunning;
  if (isAutoBotRunning) {
    autoBotLogs.unshift(`[${new Date().toLocaleTimeString()}] 🟢 Auto Bot Activated. Listening to Firebase live_signals...`);
    listenToFirebaseSignals();
  } else {
    autoBotLogs.unshift(`[${new Date().toLocaleTimeString()}] 🔴 Auto Bot Deactivated.`);
  }
  renderCryptoTrading();
}

// 4. फायरबेस लाइव सिग्नल्स को सुनना
function listenToFirebaseSignals() {
  if (typeof firebase === 'undefined') return;

  firebase.database().ref('live_signals').limitToLast(1).on('child_added', (snapshot) => {
    if (!isAutoBotRunning) return;

    const signal = snapshot.val();
    const signalTime = new Date(signal.timestamp).getTime();
    if (Date.now() - signalTime > 15000) return; 

    autoBotLogs.unshift(`[${new Date().toLocaleTimeString()}] 📡 Signal Received: ${signal.signalType} for ${signal.pair}`);
    updateBotLogsUI();

    // फ्रंटएंड पर सिर्फ लॉग दिखेगा, एक्चुअल ट्रेड आपका बैकएंड बोट एग्जीक्यूट करेगा
    autoBotLogs.unshift(`⚡ Order instruction processed for ${signal.pair}`);
    updateBotLogsUI();
  });
}

// यूटिलिटी: लॉग्‍स विंडो रिफ्रेश करने के लिए
function updateBotLogsUI() {
  const logTerm = document.getElementById('autoBotLogsTerminal');
  if (logTerm) {
    logTerm.innerHTML = autoBotLogs.map(log => `<div>${log}</div>`).join('');
    logTerm.scrollTop = 0;
  }
}

// Initial Init
document.addEventListener("DOMContentLoaded", () => { 
  setTimeout(() => {
    fetchBinanceBalances();
    renderCryptoTrading(); 
  }, 1000);
});
