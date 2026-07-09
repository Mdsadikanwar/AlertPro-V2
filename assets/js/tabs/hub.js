function render_hub() {
  document.getElementById('top-tabs').classList.add('hidden'); // Tabs छुपा दो
  document.getElementById('tab-content').innerHTML = `
    <div class="card" style="text-align:center; padding:40px 20px;">
      <h1 style="font-size:32px; margin-bottom:10px;">⚡ ApexTraders</h1>
      <p style="color:#94a3b8; margin-bottom:30px; font-size:16px;">पहले Market चुनो</p>
      
      <button class="btn btn-buy big-btn" onclick="enterMarket('crypto')">🪙 CRYPTO TERMINAL</button>
      <button class="btn big-btn" onclick="enterMarket('stocks')" style="background:#3b82f6; color:white;">📈 STOCK MARKET</button>
      <button class="btn big-btn" onclick="enterMarket('commodity')" style="background:#f59e0b; color:white;">🥇 COMMODITY</button>
    </div>
  `;
}

function enterMarket(market) {
  localStorage.setItem('selectedMarket', market);
  loadMarketTabs(market);
  attachTabEvents(); // Tabs पे click event लगाने के लिए
  loadTab('dashboard'); // Crypto में घुसते ही Dashboard
}

function loadMarketTabs(market) {
  const tabsDiv = document.getElementById('top-tabs');
  tabsDiv.classList.remove('hidden'); // Tabs दिखा दो
  
  let marketName = '';
  if(market === 'crypto') marketName = '🪙 CRYPTO TERMINAL';
  if(market === 'stocks') marketName = '📈 STOCK MARKET';
  if(market === 'commodity') marketName = '🥇 COMMODITY';

  let tabHTML = `
    <div style="width:100%; text-align:center; padding:10px; background:#0f172a; border-radius:10px; margin-bottom:10px; color:#10b981; font-weight:800;">
      You are in: ${marketName}
    </div>
  `;
  
  tabHTML += `<div class="tab" onclick="loadTab('hub')">🏠 Home</div>`;
  
  if(market === 'crypto') {
    tabHTML += `
      <div class="tab" data-tab="dashboard">📊 Dashboard</div>
      <div class="tab" data-tab="trading">💹 Trading</div>
      <div class="tab" data-tab="strategies">🎯 Strategies</div>
      <div class="tab" data-tab="backtest">📈 Backtest</div>
      <div class="tab" data-tab="settings">⚙️ Settings</div>
      <div class="tab" data-tab="logs">📜 Logs</div>
    `;
  }
  if(market === 'stocks') {
    tabHTML += `<div class="tab">📊 Stocks Dashboard - Coming Soon</div>`;
  }
  if(market === 'commodity') {
    tabHTML += `<div class="tab">📊 Commodity Dashboard - Coming Soon</div>`;
  }
  
  tabsDiv.innerHTML = tabHTML;
  attachTabEvents();
}
