// ग्लोबल एक्टिव टैब स्टेट (डिफ़ॉल्ट: Dashboard)
var activeTab = localStorage.getItem('apex_active_tab') || 'dashboard';
const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

// पेज लोड होते ही करंट एक्टिव टैब को स्क्रीन पर दिखाओ
window.onload = function() {
    executeTabRender();
};

// टैब बदलने का फंक्शन
function switchTab(tabId) {
    activeTab = tabId;
    localStorage.setItem('apex_active_tab', tabId);
    executeTabRender();
}

// राउटर: जो टैब एक्टिव होगा, सिर्फ उसी फाइल का फंक्शन रेंडर होगा
function executeTabRender() {
    if (activeTab === 'dashboard') typeof renderCryptoDashboard === 'function' ? renderCryptoDashboard() : showLoading('Dashboard');
    if (activeTab === 'trading') typeof renderCryptoTrading === 'function' ? renderCryptoTrading() : showLoading('Trading');
    if (activeTab === 'strategies') typeof renderCryptoStrategies === 'function' ? renderCryptoStrategies() : showLoading('Strategies');
    if (activeTab === 'backtest') typeof renderCryptoBacktest === 'function' ? renderCryptoBacktest() : showLoading('Backtest');
    if (activeTab === 'settings') typeof renderCryptoSettings === 'function' ? renderCryptoSettings() : showLoading('Settings');
    if (activeTab === 'logs') typeof renderCryptoLogs === 'function' ? renderCryptoLogs() : showLoading('Logs');
}

// जब तक दूसरी फाइलें खाली हैं, तब तक स्क्रीन पर यह दिखेगा
function showLoading(tabName) {
    const root = document.getElementById('app');
    if (root) {
        root.innerHTML = `
            ${getMarketNavbar()}
            <div style="padding: 50px; text-align: center; color: #64748b; font-family: sans-serif;">
                <h2>⚙️ Setting up ${tabName} Tab...</h2>
                <p>Waiting for the code injection.</p>
            </div>
        `;
    }
}

// मास्टर नेविगेशन बार (सिर्फ क्रिप्टो के 6 टैब्स)
function getMarketNavbar() {
    const tabs = ['dashboard', 'trading', 'strategies', 'backtest', 'settings', 'logs'];
    return `
      <div style="background: #1e293b; padding: 15px 20px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; box-sizing: border-box; width: 100%;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <h2 style="color: #38bdf8; margin: 0; font-size: 20px; letter-spacing: 0.5px;">⚡ ApexTraders <span style="font-size: 12px; background: rgba(56, 189, 248, 0.15); padding: 3px 8px; border-radius: 4px; margin-left: 5px;">CRYPTO ONLY</span></h2>
        </div>
        <div style="display: flex; gap: 5px;">
          ${tabs.map(tab => {
            const isActive = tab === activeTab;
            return `
              <button onclick="switchTab('${tab}')" 
                      style="background: none; border: none; padding: 8px 16px; color: ${isActive ? '#38bdf8' : '#94a3b8'}; border-bottom: ${isActive ? '3px solid #38bdf8' : 'none'}; cursor: pointer; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; opacity: ${isActive ? '1' : '0.75'}; transition: all 0.2s ease;">
                ${tab}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
}
