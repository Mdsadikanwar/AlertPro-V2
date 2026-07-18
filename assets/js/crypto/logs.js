// Global Logs State (अगर पहले से है, तो इसे केवल रेफरेंस के लिए रखें)
var systemLogs = [
  { timestamp: "2026-07-16 18:30", type: "SYSTEM", message: "System initialized successfully." },
  { timestamp: "2026-07-16 18:32", type: "SUCCESS", message: "Connected to Exchange API." }
];

/**
 * 1. Master Log Injector (छोटा और सीधा नोटिफिकेशन रखने के लिए हेल्पर)
 * यह फंक्शन लंबे मैसेजेस को छोटा (truncate) कर देगा ताकि लॉग स्क्रीन साफ़ रहे।
 */
function addSystemLog(type, message) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  // अगर मैसेज बहुत लंबा है, तो उसे सिर्फ 80 कैरेक्टर्स तक सीमित करके '...' लगा देंगे
  let shortMessage = message;
  if (message.length > 80) {
    shortMessage = message.substring(0, 77) + "...";
  }

  // नए लॉग को सबसे ऊपर रखने के लिए unshift का उपयोग करेंगे
  systemLogs.unshift({
    timestamp: timestamp,
    type: type.toUpperCase(), // SYSTEM, SUCCESS, ERROR, WARNING
    message: shortMessage
  });

  // सिर्फ आखिरी 100 लॉग्स को ही मेमोरी में रखेंगे ताकि ब्राउज़र स्लो न हो
  if (systemLogs.length > 100) {
    systemLogs.pop();
  }

  // अगर अभी यूजर Logs टैब पर ही है, तो तुरंत स्क्रीन को अपडेट कर देंगे
  const activeTab = document.querySelector('[data-active-tab]'); // आपकी नेविगेशन स्टेट के आधार पर
  if (activeTab && activeTab.getAttribute('data-active-tab') === 'LOGS') {
    renderCryptoLogs();
  }
}

/**
 * 2. Crypto Logs Tab Render Function
 * एकदम क्लीन, मॉडर्न और स्पेस-सेविंग नोटिफिकेशन डिज़ाइन
 */
function renderCryptoLogs() {
  const root = document.getElementById('app');
  
  // स्टेटस के हिसाब से रंगों का सेट
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'SUCCESS':
        return { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' };
      case 'ERROR':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
      case 'WARNING':
        return { bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15' };
      default: // SYSTEM
        return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' };
    }
  };

  const logRows = systemLogs.map(log => {
    const badge = getBadgeStyle(log.type);
    return `
      <div style="display: grid; grid-template-columns: 160px 100px 1fr; gap: 15px; padding: 12px 15px; border-bottom: 1px solid #1e293b; align-items: center; font-size: 13.5px; font-family: monospace;">
        <!-- 1. Time & Date -->
        <div style="color: #64748b; white-space: nowrap;">
          [${log.timestamp}]
        </div>
        
        <!-- 2. Status Badge -->
        <div>
          <span style="background: ${badge.bg}; color: ${badge.color}; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; text-align: center; min-width: 70px;">
            ${log.type}
          </span>
        </div>
        
        <!-- 3. Short Clean Notification -->
        <div style="color: #e2e8f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${log.message}">
          ${log.message}
        </div>
      </div>
    `;
  }).join('');

  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <!-- डेटा ट्रैक करने के लिए कि हम अभी LOGS टैब में हैं -->
    <div id="logs-tab-marker" data-active-tab="LOGS" class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
        <div>
          <h2 style="color: #38bdf8; margin: 0;">System Notifications</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Real-time execution alerts and bot operations</p>
        </div>
        <button onclick="clearSystemLogs()" style="background: #374151; color: #f87171; border: 1px solid #ef4444; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🗑️ Clear Logs
        </button>
      </div>

      <!-- Compact Terminal Display -->
      <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        
        <!-- Table Header -->
        <div style="display: grid; grid-template-columns: 160px 100px 1fr; gap: 15px; padding: 12px 15px; background: #111827; border-bottom: 2px solid #1e293b; color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
          <div>Timestamp</div>
          <div>Status</div>
          <div>Notification</div>
        </div>

        <!-- Dynamic Logs List -->
        <div id="logsListContainer" style="max-height: 600px; overflow-y: auto;">
          ${systemLogs.length === 0 ? `
            <div style="padding: 40px; text-align: center; color: #64748b;">
              <span style="font-size: 40px; display: block; margin-bottom: 10px;">📭</span>
              No logs or notifications recorded yet.
            </div>
          ` : logRows}
        </div>

      </div>

    </div>
  `;
}

// Clear all logs helper
function clearSystemLogs() {
  if (confirm("Are you sure you want to clear all notification history?")) {
    systemLogs = [];
    addSystemLog("SYSTEM", "Notification console cleared by user.");
    renderCryptoLogs();
  }
}
// 📊 वेबसाइट पर लाइव ट्रेड हिस्ट्री और पीएनएल रेंडर करने का फंक्शन
async function displayLiveOrderHistory() {
  const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
  const logContainer = document.getElementById('real-api-logs-container'); // आपकी वेबसाइट का लॉग्स बॉक्स आईडी
  
  if (!logContainer) return;

  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/live_trades.json`);
    const trades = await res.json();
    
    if (!trades) {
      logContainer.innerHTML = "<p style='color:#94a3b8;'>No trades executed yet. Engine is waiting...</p>";
      return;
    }

    let html = `<table style="width:100%; color:#fff; border-collapse:collapse;">
                  <tr style="border-bottom:1px solid #334155; text-align:left; color:#38bdf8;">
                    <th>Time</th><th>Type</th><th>Pair</th><th>Price</th><th>Status</th>
                  </tr>`;

    // ट्रेड्स को उल्टे क्रम में दिखाना (ताकि नया ट्रेड सबसे ऊपर दिखे)
    Object.keys(trades).reverse().forEach(key => {
      const t = trades[key];
      const color = t.action === "BUY" ? "#22c55e" : "#ef4444";
      const time = new Date(t.timestamp).toLocaleTimeString();
      
      html += `<tr style="border-bottom:1px solid #1e293b; height:35px;">
                <td style="color:#94a3b8;">${time}</td>
                <td style="color:${color}; font-weight:bold;">${t.action}</td>
                <td>${t.pair}</td>
                <td>$${t.price}</td>
                <td style="color:#eab308;">${t.status}</td>
               </tr>`;
    });

    html += `</table>`;
    logContainer.innerHTML = html;

  } catch (e) {
    console.error("Error loading logs:", e.message);
  }
}

// हर 5 सेकंड में स्क्रीन पर ऑर्डर टेबल को ऑटो-रिफ्रेश करेगा
setInterval(displayLiveOrderHistory, 5000);
