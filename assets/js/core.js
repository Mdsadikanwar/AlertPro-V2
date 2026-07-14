// Global State  
const appState = {  
  currentMarket: 'home', // 'home', 'crypto', 'stocks', 'commodities'  
  activeTab: 'dashboard'  // 'dashboard', 'trading', 'strategies', 'backtest', 'settings', 'logs'  
};  
  
// State Transition Engine  
function navigateToMarket(market) {  
  appState.currentMarket = market;  
  appState.activeTab = 'dashboard'; // Switch hone par dashboard default rahega
  renderActiveView();  
}  
  
function navigateToTab(tab) {  
  appState.activeTab = tab;  
  renderActiveView();  
}  
  
// Active market ke hisab se common topbar navigation bar banana  
function getMarketNavbar(title, accentColor) {  
  return `  
    <div class="topbar" style="border-bottom: 2px solid ${accentColor}; background: #111827; padding: 15px; display: flex; justify-content: space-between; align-items: center;">  
      <div class="logo" onclick="navigateToMarket('home')" style="cursor:pointer; font-weight: bold; font-size: 20px; color: #fff;">⚡ ApexTraders V2 (${title})</div>  
      <div class="navbar" style="display: flex; gap: 10px;">  
        <button class="nav-btn" onclick="navigateToMarket('home')" style="padding: 8px 12px; cursor: pointer;">🏠 Home</button>  
        <button class="nav-btn ${appState.activeTab === 'dashboard' ? 'active' : ''}" onclick="navigateToTab('dashboard')" style="padding: 8px 12px; cursor: pointer;">📊 Dashboard</button>  
        <button class="nav-btn ${appState.activeTab === 'trading' ? 'active' : ''}" onclick="navigateToTab('trading')" style="padding: 8px 12px; cursor: pointer;">💵 Trading</button>  
        <button class="nav-btn ${appState.activeTab === 'strategies' ? 'active' : ''}" onclick="navigateToTab('strategies')" style="padding: 8px 12px; cursor: pointer;">🤖 Strategies</button>  
        <button class="nav-btn ${appState.activeTab === 'backtest' ? 'active' : ''}" onclick="navigateToTab('backtest')" style="padding: 8px 12px; cursor: pointer;">📈 Backtest</button>  
        <button class="nav-btn ${appState.activeTab === 'settings' ? 'active' : ''}" onclick="navigateToTab('settings')" style="padding: 8px 12px; cursor: pointer;">⚙️ Settings</button>  
        <button class="nav-btn ${appState.activeTab === 'logs' ? 'active' : ''}" onclick="navigateToTab('logs')" style="padding: 8px 12px; cursor: pointer;">📝 Logs</button>  
      </div>  
    </div>  
  `;  
}  
  
// Global Screen Router
function renderActiveView() {  
  const root = document.getElementById('app');  
    
  if (appState.currentMarket === 'home') {  
    renderLandingPage();  
    return;  
  }  
  
  // Market prefix (crypto, stocks, commodities) aur tab name ko jodkar function name banana  
  const marketPrefix = appState.currentMarket; 
  const tabName = appState.activeTab;         
    
  // Jaise: renderCryptoDashboard() ya renderStocksTrading()  
  const functionName = "render" + marketPrefix.charAt(0).toUpperCase() + marketPrefix.slice(1) + tabName.charAt(0).toUpperCase() + tabName.slice(1);  
    
  if (window[functionName] && typeof window[functionName] === 'function') {  
    window[functionName]();  
  } else {  
    root.innerHTML = `
      ${getMarketNavbar(marketPrefix.toUpperCase(), '#ef4444')}
      <div class="container" style="padding: 20px; text-align: center;">
        <p style="color:#ef4444; font-size: 18px;">Error: Function <b>${functionName}()</b> is not implemented yet!</p>
        <p style="color:#94a3b8;">Hum jald hi is file ko create karenge.</p>
      </div>
    `;  
  }  
}
