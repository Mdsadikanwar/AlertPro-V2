// Main Router: Market selection handler
function navigateToMarket(market) {
  currentMarket = market;
  
  // Browser state save karein taaki refresh par yaad rahe
  localStorage.setItem('last_active_market', market);

  if (market === 'home') {
    localStorage.removeItem('last_active_market');
    localStorage.removeItem('last_active_tab');
    renderLandingPage();
  } else {
    // Default tabs configuration for different markets
    if (market === 'crypto') activeTab = 'dashboard';
    if (market === 'stocks') activeTab = 'dashboard';
    if (market === 'commodities') activeTab = 'dashboard';
    
    localStorage.setItem('last_active_tab', activeTab);
    loadMarketInterface();
  }
}

// Global Core State Config
var currentMarket = 'home'; 
var activeTab = 'dashboard';

// Active tab switcher
function switchTab(tabId) {
  activeTab = tabId;
  localStorage.setItem('last_active_tab', tabId); // Tab memory state save
  
  // Clear any active interval (like live crypto prices) if switching tabs
  if (typeof priceIntervalId !== 'undefined' && priceIntervalId) {
    clearInterval(priceIntervalId);
  }

  // UI Tabs update highlights
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    if (tab.getAttribute('onclick').includes(`'${tabId}'`)) {
      tab.style.borderBottom = `3px solid ${tab.dataset.color || '#fff'}`;
      tab.style.color = '#fff';
      tab.style.opacity = '1';
    } else {
      tab.style.borderBottom = 'none';
      tab.style.color = '#94a3b8';
      tab.style.opacity = '0.7';
    }
  });

  // Render correct panel
  executeTabRender();
}

// Router for specific UI views
function executeTabRender() {
  const marketPrefix = currentMarket.toLowerCase();
  
  if (marketPrefix === 'crypto') {
    if (activeTab === 'dashboard') renderCryptoDashboard();
    if (activeTab === 'trading') renderCryptoTrading();
    if (activeTab === 'strategies') renderCryptoStrategies();
    if (activeTab === 'backtest') renderCryptoBacktest();
    if (activeTab === 'settings') renderCryptoSettings();
    if (activeTab === 'logs') renderCryptoLogs();
  } else if (marketPrefix === 'stocks') {
    if (activeTab === 'dashboard') renderStocksDashboard();
    // baaki tabs ko hum aage chalkar render karenge
  }
}

// Universal Navigation Head Bar Template generator
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
                    data-color="${colorCode}"
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

// Load current ecosystem setup
function loadMarketInterface() {
  executeTabRender();
}
