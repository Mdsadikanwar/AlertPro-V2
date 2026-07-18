// Global Logs State
var systemLogs = [
  { timestamp: "2026-07-16 18:30", type: "SYSTEM", message: "System initialized successfully." },
  { timestamp: "2026-07-16 18:32", type: "SUCCESS", message: "Connected to Exchange API." }
];

/**
 * 1. Master Log Injector
 * यह फंक्शन मैसेजेस को मैनेज करता है और स्क्रीन को बिना हैंग किए तुरंत अपडेट करता है।
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

  let shortMessage = message;
  if (message.length > 80) {
    shortMessage = message.substring(0, 77) + "...";
  }

  systemLogs.unshift({
    timestamp: timestamp,
    type: type.toUpperCase(), // SYSTEM, SUCCESS, ERROR, WARNING
    message: shortMessage
  });

  if (systemLogs.length > 100) {
    systemLogs.pop();
  }

  // अगर यूजर LOGS टैब पर है, तो तुरंत लिस्ट को रिफ्रेश करो
  const marker = document.getElementById('logs-tab-marker');
  if (marker && marker.getAttribute('data-active-tab') === 'LOGS') {
    const listContainer = document.getElementById('logsListContainer');
    if (listContainer) {
      listContainer.innerHTML = systemLogs.map(log => {
        const badge = log.type === 'SUCCESS' ? { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' } :
                      log.type === 'ERROR' ? { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' } :
                      log.type === 'WARNING' ? { bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15' } :
                      { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' };
        return `
          <div style="display: grid; grid-template-columns: 160px 100px 1fr; gap: 15px; padding: 12px 15px; border-bottom: 1px solid #1e293b; align-items: center; font-size: 13.5px; font-family: monospace;">
            <div style="color: #64748b; white-space: nowrap;">[${log.timestamp}]</div>
            <div>
              <span style="background: ${badge.bg}; color: ${badge.color}; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; text-align: center; min-width: 70px;">
                ${log.type}
              </span>
            </div>
            <div style="color: #e2e8f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${log.message}">
              ${log.message}
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

/**
 * 2. Crypto Logs Tab Render Function
 */
function renderCryptoLogs() {
  const root = document.getElementById('app');
  if (!root) return;
  
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'SUCCESS': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' };
      case 'ERROR': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
      case 'WARNING': return { bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15' };
      default: return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' };
    }
  };

  const logRows = systemLogs.map(log => {
    const badge = getBadgeStyle(log.type);
    return `
      <div style="display: grid; grid-template-columns: 160px 100px 1fr; gap: 15px; padding: 12px 15px; border-bottom: 1px solid #1e293b; align-items: center; font-size: 13.5px; font-family: monospace;">
        <div style="color: #64748b; white-space: nowrap;">[${log.timestamp}]</div>
        <div>
          <span style="background: ${badge.bg}; color: ${badge.color}; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; text-align: center; min-width: 70px;">
            ${log.type}
          </span>
        </div>
        <div style="color: #e2e8f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${log.message}">
          ${log.message}
        </div>
      </div>
    `;
  }).join('');

  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
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

      <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        <div style="display: grid; grid-template-columns: 160px 100px 1fr; gap: 15px; padding: 12px 15px; background: #111827; border-bottom: 2px solid #1e293b; color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
          <div>Timestamp</div>
          <div>Status</div>
          <div>Notification</div>
        </div>
        <div id="logsListContainer" style="max-height: 600px; overflow-y: auto;">
          ${systemLogs.length === 0 ? `
            <div style="padding: 40px; text-align: center; color: #64748b;">
              <span style="font-size: 40px; display: block; margin-bottom: 10px;">📭</span>
              No logs or notifications recorded yet.
            </div>
          ` : logRows}
        </div>
      </div>
      
      <!-- 📦 लाइव ट्रेड्स के लिए एक अलग कंटेनर नीचे बना दिया है ताकि स्क्रीन ना बिगड़े -->
      <div style="margin-top: 30px; background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; padding: 20px;">
        <h3 style="color: #22c55e; margin-top: 0;">Live Executed Orders</h3>
        <div id="real-api-logs-container">
          <p style="color:#94a3b8;">Loading live trades...</p>
        </div>
      </div>
    </div>
  `;

  // टैब रेंडर होते ही तुरंत एक बार लाइव ट्रेड्स लोड कर लो (कोई लूप नहीं)
  fetchLiveOrderHistory();
}

function clearSystemLogs() {
  if (confirm("Are you sure you want to clear all notification history?")) {
    systemLogs = [];
    addSystemLog("SYSTEM", "Notification console cleared by user.");
    renderCryptoLogs();
  }
}

// 📊 हैंग-फ्री लाइव ट्रेड फैचर फंक्शन
async function fetchLiveOrderHistory() {
  const logContainer = document.getElementById('real-api-logs-container');
  if (!logContainer) return;

  try {
    const res = await fetch("https://alertpro-bot-default-rtdb.firebaseio.com/live_trades.json");
    const trades = await res.json();
    
    if (!trades) {
      logContainer.innerHTML = "<p style='color:#94a3b8;'>No trades executed yet. Engine is waiting...</p>";
      return;
    }

    let html = `<table style="width:100%; color:#fff; border-collapse:collapse;">
                  <tr style="border-bottom:1px solid #334155; text-align:left; color:#38bdf8; height:30px;">
                    <th>Time</th><th>Type</th><th>Pair</th><th>Price</th><th>Status</th>
                  </tr>`;

    Object.keys(trades).reverse().slice(0, 10).forEach(key => { // सिर्फ आखरी 10 ट्रेड्स दिखाएंगे लोड कम रखने के लिए
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

// 🔄 वेबसाइट को हैंग होने से बचाने के लिए केवल 30 सेकंड में एक बार डेटा फ्रेश करेगा
setInterval(() => {
  const marker = document.getElementById('logs-tab-marker');
  if (marker && marker.getAttribute('data-active-tab') === 'LOGS') {
    fetchLiveOrderHistory();
  }
}, 30000);

// Global Core State Config
var currentMarket = 'home'; 
var activeTab = 'dashboard';

function navigateToMarket(market) {
  currentMarket = market;
  localStorage.setItem('last_active_market', market);
  if (market === 'home') {
    localStorage.removeItem('last_active_market');
    localStorage.removeItem('last_active_tab');
    renderLandingPage();
  } else {
    if (market === 'crypto') activeTab = 'dashboard';
    localStorage.setItem('last_active_tab', activeTab);
    loadMarketInterface();
  }
}

function switchTab(tabId) {
  activeTab = tabId;
  localStorage.setItem('last_active_tab', tabId);
  executeTabRender();
}

function executeTabRender() {
  const marketPrefix = currentMarket.toLowerCase();
  if (marketPrefix === 'crypto') {
    if (activeTab === 'dashboard') typeof renderCryptoDashboard === 'function' && renderCryptoDashboard();
    if (activeTab === 'trading') typeof renderCryptoTrading === 'function' && renderCryptoTrading();
    if (activeTab === 'strategies') typeof renderCryptoStrategies === 'function' && renderCryptoStrategies();
    if (activeTab === 'backtest') typeof renderCryptoBacktest === 'function' && renderCryptoBacktest();
    if (activeTab === 'settings') typeof renderCryptoSettings === 'function' && renderCryptoSettings();
    if (activeTab === 'logs') renderCryptoLogs();
  }
}

function getMarketNavbar(marketName, colorCode) {
  const tabs = ['dashboard', 'trading', 'strategies', 'backtest', 'settings', 'logs'];
  return `
    <div style="background: #1e293b; padding: 15px 20px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; font-family: sans-serif;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span onclick="navigateToMarket('home')" style="cursor: pointer; font-size: 20px; color: #94a3b8;" title="Go Home">🏠</span>
        <h2 style="color: ${colorCode}; margin: 0; font-size: 20px;">ApexTraders [${marketName}]</h2>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        ${tabs.map(tab => {
          const isActive = tab === activeTab;
          return `
            <button class="nav-tab" 
                    onclick="switchTab('${tab}')" 
                    style="background: none; border: none; padding: 8px 12px; color: ${isActive ? '#fff' : '#94a3b8'}; border-bottom: ${isActive ? `3px solid ${colorCode}` : 'none'}; cursor: pointer; font-weight: bold; font-size: 14px; text-transform: capitalize; opacity: ${isActive ? '1' : '0.7'};">
              ${tab}
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function loadMarketInterface() {
  executeTabRender();
}
