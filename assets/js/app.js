let currentTab = 'home';
let currentMarket = 'crypto';

function initApp() {
  renderNavbar();
  switchTab('home');
}

function renderNavbar() {
  const navbar = document.getElementById('navbar');
  
  if(currentTab === 'home') {
    navbar.innerHTML = `<button class="nav-btn active" onclick="switchTab('home')">🏠 Home</button>`;
  } else {
    navbar.innerHTML = `
      <button class="nav-btn" onclick="switchTab('home')">🏠 Home</button>
      <button class="nav-btn ${currentTab==='dashboard'?'active':''}" onclick="switchTab('dashboard')">📊 Dashboard</button>
      <button class="nav-btn ${currentTab==='trading'?'active':''}" onclick="switchTab('trading')">💰 Trading</button>
      <button class="nav-btn ${currentTab==='strategies'?'active':''}" onclick="switchTab('strategies')">🤖 Strategies</button>
      <button class="nav-btn ${currentTab==='backtest'?'active':''}" onclick="switchTab('backtest')">📈 Backtest</button>
      <button class="nav-btn ${currentTab==='settings'?'active':''}" onclick="switchTab('settings')">⚙️ Settings</button>
      <button class="nav-btn ${currentTab==='logs'?'active':''}" onclick="switchTab('logs')">📝 Logs</button>
    `;
  }
}

function switchTab(tab) {
  currentTab = tab;
  renderNavbar();
  if(window.stopDashboard) stopDashboard();
  
  const content = document.getElementById('tab-content');
  
  if(tab === 'home') { renderHome(); }
  if(tab === 'dashboard') { import('./tabs/dashboard.js').then(()=>render_dashboard()); }
  if(tab === 'trading') { content.innerHTML = '<div class="card"><h2>Trading - Coming Soon</h2></div>'; }
  if(tab === 'strategies') { content.innerHTML = '<div class="card"><h2>Strategies - Coming Soon</h2></div>'; }
  if(tab === 'backtest') { content.innerHTML = '<div class="card"><h2>Backtest - Coming Soon</h2></div>'; }
  if(tab === 'settings') { content.innerHTML = '<div class="card"><h2>Settings - Coming Soon</h2></div>'; }
  if(tab === 'logs') { content.innerHTML = '<div class="card"><h2>Logs - Coming Soon</h2></div>'; }
}

function renderHome() {
  const content = document.getElementById('tab-content');
  content.innerHTML = `
    <div style="text-align:center; padding: 60px 20px;">
      <h1 style="font-size: 42px; color: #10b981; margin-bottom: 10px;">⚡ ApexTraders</h1>
      <p style="color: #94a3b8; margin-bottom: 40px;">Multi-Coin Paper Trading + Live Signals ⚡ Synced</p>
      <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
        <button class="nav-btn" style="padding:20px 40px; font-size:16px;" onclick="switchTab('dashboard')">🪙 CRYPTO TERMINAL</button>
        <button class="nav-btn" style="padding:20px 40px; font-size:16px; opacity:0.5;" onclick="alert('Coming Soon')">📈 STOCK MARKET</button>
        <button class="nav-btn" style="padding:20px 40px; font-size:16px; opacity:0.5;" onclick="alert('Coming Soon')">🛢️ COMMODITY</button>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', initApp);
