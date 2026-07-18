// 🔐 बाइनेंस टेस्टनेट एपीआई क्रेडेंशियल्स (यहाँ अपनी असली टेस्टनेट कीज़ डालें)
const BINANCE_TESTNET_API_KEY = "RCRepECibH55AWM1NveNAelr8SYqFEMZpTiqwerLf9A1PBn6YVYyEh1biT7EW06Y";
const BINANCE_TESTNET_SECRET_KEY = "gK1LlAKuYItxdbiRIp8wS9cvXBwedMqRFjfgKe7xWlAwnAtinal1O8ShQTEfg1ja";
const BINANCE_BASE_URL = "https://testnet.binance.vision"; // Testnet Endpoint

// Global States
let isAutoBotRunning = false;
let autoBotLogs = ["🤖 ApexTraders Automated Engine initialized."];
let accountBalances = { USDT: "0.00", BTC: "0.00" };

// 1. बाइनेंस टेस्टनेट से असली बैलेंस लाना
async function fetchBinanceBalances() {
  if (BINANCE_TESTNET_API_KEY === "YOUR_BINANCE_TESTNET_API_KEY") {
    autoBotLogs.unshift("⚠️ [API] बाइनेंस टेस्टनेट API कीज़ ऊपर कोड में सेट करें!");
    updateBotLogsUI();
    return;
  }

  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  
  // SHA256 सिग्नेचर जनरेट करना (क्रिप्टो लाइब्रेरी की मदद से)
  const signature = crypto.createHmac('sha256', BINANCE_TESTNET_SECRET_KEY).update(queryString).digest('hex');

  try {
    const response = await fetch(`${BINANCE_BASE_URL}/api/v3/account?${queryString}&signature=${signature}`, {
      method: "GET",
      headers: { "X-MBX-APIKEY": BINANCE_TESTNET_API_KEY }
    });
    const data = await response.json();
    
    if (data.balances) {
      const usdtAsset = data.balances.find(b => b.asset === "USDT");
      const btcAsset = data.balances.find(b => b.asset === "BTC");
      accountBalances.USDT = usdtAsset ? parseFloat(usdtAsset.free).toFixed(2) : "0.00";
      accountBalances.BTC = btcAsset ? parseFloat(btcAsset.free).toFixed(6) : "0.00";
      renderCryptoTrading();
    }
  } catch (err) {
    console.error("Balance fetch failed:", err);
  }
}

// 2. मुख्य रेंडर फंक्शन (सिर्फ काम का ऑटो-पैनल)
function renderCryptoTrading() {
  const root = document.getElementById('app');
  if (!root) return;

  root.innerHTML = `
    ${typeof getMarketNavbar === 'function' ? getMarketNavbar('CRYPTO', '#38bdf8') : ''}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff; max-width: 600px; margin: 0 auto;">
      
      <!-- Live Testnet Balance Wallet -->
      <div style="background: #1e293b; padding: 15px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="color: #94a3b8; font-size: 12px; font-weight: bold;">BINANCE TESTNET BALANCE</span>
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
    autoBotLogs.unshift(`[${new Date().toLocaleTimeString()}] 🟢 Auto Bot Activated. Listening to Firebase live_signals node...`);
    listenToFirebaseSignals(); // फायरबेस को सुनना शुरू करें
  } else {
    autoBotLogs.unshift(`[${new Date().toLocaleTimeString()}] 🔴 Auto Bot Deactivated.`);
  }
  renderCryptoTrading();
}

// 4. 🔥 फायरबेस लाइव सिग्नल्स को सुनना (Real Integration)
function listenToFirebaseSignals() {
  if (typeof firebase === 'undefined') return;

  // सिग्नल्स नोड पर जैसे ही नया चाइल्ड डेटा जुड़ेगा, यह ट्रिगर होगा
  firebase.database().ref('live_signals').limitToLast(1).on('child_added', (snapshot) => {
    if (!isAutoBotRunning) return;

    const signal = snapshot.val();
    
    // यह चेक करने के लिए कि सिग्नल बिल्कुल नया है या पुराना लोड हो रहा है
    const signalTime = new Date(signal.timestamp).getTime();
    if (Date.now() - signalTime > 10000) return; // 10 सेकंड से पुराना सिग्नल इग्नोर करें

    autoBotLogs.unshift(`[${new Date().toLocaleTimeString()}] 📡 Signal Received: ${signal.signalType} for ${signal.pair}`);
    updateBotLogsUI();

    // बाइनेंस एपीआई को आर्डर भेजने का फैसला
    const side = signal.signalType.includes("BUY") ? "BUY" : "SELL";
    executeBinanceTestnetOrder(signal.pair, side, "0.002"); // टेस्ट के लिए 0.002 Qty फिक्स की है
  });
}

// 5. ⚡ बाइनेंस टेस्टनेट पर असली आर्डर मारना (Axios / Fetch)
async function executeBinanceTestnetOrder(pair, side, quantity) {
  if (BINANCE_TESTNET_API_KEY === "YOUR_BINANCE_TESTNET_API_KEY") {
    autoBotLogs.unshift("❌ [ERROR] Order Skipped. API Keys are empty.");
    updateBotLogsUI();
    return;
  }

  const timestamp = Date.now();
  const queryString = `symbol=${pair}&side=${side}&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', BINANCE_TESTNET_SECRET_KEY).update(queryString).digest('hex');

  autoBotLogs.unshift(`⏳ Sending Market ${side} order to Binance Testnet for ${quantity} ${pair}...`);
  updateBotLogsUI();

  try {
    const response = await fetch(`${BINANCE_BASE_URL}/api/v3/order?${queryString}&signature=${signature}`, {
      method: "POST",
      headers: { "X-MBX-APIKEY": BINANCE_TESTNET_API_KEY }
    });
    const result = await response.json();

    if (result.orderId) {
      autoBotLogs.unshift(`✅ [ORDER SUCCESS] ID: ${result.orderId} | Status: ${result.status}`);
      fetchBinanceBalances(); // आर्डर के तुरंत बाद बैलेंस अपडेट करें
    } else {
      autoBotLogs.unshift(`❌ [API ERR] ${result.msg || 'Execution Failed'}`);
    }
  } catch (error) {
    autoBotLogs.unshift(`❌ [FETCH FAILED] Network or API Endpoint issue.`);
    console.error(error);
  }
  updateBotLogsUI();
}

// यूटिलिटी: सिर्फ लॉग्‍स विंडो रिफ्रेश करने के लिए
function updateBotLogsUI() {
  const logTerm = document.getElementById('autoBotLogsTerminal');
  if (logTerm) {
    logTerm.innerHTML = autoBotLogs.map(log => `<div>${log}</div>`).join('');
    logTerm.scrollTop = 0;
  }
}

// Initial Init
document.addEventListener("DOMContentLoaded", () => { 
  fetchBinanceBalances();
  renderCryptoTrading(); 
});
