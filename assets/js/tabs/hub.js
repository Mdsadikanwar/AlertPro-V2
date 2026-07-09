function render_hub() {
  document.getElementById('tab-content').innerHTML = `
    <div class="card" style="text-align:center;">
      <h2 style="margin-bottom:20px;">⚡ ApexTraders Hub</h2>
      <p style="color:#94a3b8; margin-bottom:20px;">पहले Market चुनो</p>
      
      <button class="btn btn-blue" onclick="selectMarket('crypto')" style="margin:8px;">🪙 Crypto Terminal</button>
      <button class="btn btn-blue" onclick="selectMarket('stocks')" style="margin:8px; background:#3b82f6;">📈 Stocks Terminal - Coming Soon</button>
      <button class="btn btn-blue" onclick="selectMarket('commodity')" style="margin:8px; background:#f59e0b;">🥇 Commodity Terminal - Coming Soon</button>
    </div>
  `;
}

function selectMarket(market) {
  if(market === 'crypto') {
    loadTab('dashboard'); // Crypto चुना तो सीधा Dashboard
  } else {
    alert(market + ' Coming Soon! Abhi sirf Crypto ready hai');
  }
}
