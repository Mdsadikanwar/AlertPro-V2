function render_hub() {
  const content = document.getElementById('tab-content');
  content.innerHTML = `
    <div class="card" style="text-align:center; padding:40px 20px; background:transparent; border:none;">
      <h1 style="font-size:28px; margin-bottom:5px; color:#10b981;">⚡ ApexTraders</h1>
      <p style="color:#94a3b8; margin-bottom:30px; font-size:14px;">Multi-Coin Paper Trading + Live Signals ☁️ Synced</p>
      
      <button class="btn btn-buy big-btn" onclick="enterMarket('crypto')">🪙 CRYPTO TERMINAL</button>
      <button class="btn big-btn" onclick="alert('Coming Soon')" style="background:#3b82f6; color:white;">📈 STOCK MARKET</button>
      <button class="btn big-btn" onclick="alert('Coming Soon')" style="background:#f59e0b; color:white;">🥇 COMMODITY</button>
    </div>
  `;
}

function enterMarket(market) {
  document.getElementById('top-tabs').classList.remove('hidden');
  document.querySelector('.tab[data-tab="dashboard"]').click();
}
