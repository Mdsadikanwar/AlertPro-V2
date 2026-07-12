function render_trading() {
  // Balance localStorage से लो या 10000 set करो
  if(!localStorage.getItem('balance')) localStorage.setItem('balance', 10000);
  if(!localStorage.getItem('holdings')) localStorage.setItem('holdings', JSON.stringify({}));
  
  let balance = parseFloat(localStorage.getItem('balance'));
  let holdings = JSON.parse(localStorage.getItem('holdings'));
  let coinQty = holdings[STATE.coinId] || 0;

  document.getElementById('tab-content').innerHTML = `
    <div class="card" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
      <div>
        <h3>💰 Portfolio</h3>
        <div class="stat"><div class="stat-label">Cash Balance</div><div class="stat-value green">$${balance.toFixed(2)}</div></div>
        <div class="stat" style="margin-top:10px;"><div class="stat-label">${STATE.coinSymbol} Holdings</div><div class="stat-value">${coinQty.toFixed(6)}</div></div>
      </div>
      <div>
        <h3>💹 Trade ${STATE.coinSymbol}</h3>
        <p style="color:#94a3b8;">Current Price: $${STATE.price.toFixed(2)}</p>
        <input type="number" id="tradeQty" class="input" placeholder="Quantity" style="margin:10px 0; width:100%;">
        <div style="display:flex; gap:10px;">
          <button class="btn btn-buy" style="flex:1;" onclick="paperTrade('buy')">BUY</button>
          <button class="btn btn-sell" style="flex:1;" onclick="paperTrade('sell')">SELL</button>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>📜 Trade History</h3>
      <div class="log" id="tradeLog">${localStorage.getItem('tradeLog') || 'No trades yet'}</div>
    </div>
  `;
}

function paperTrade(type) {
  let qty = parseFloat(document.getElementById('tradeQty').value);
  if(!qty || qty <= 0) return alert('Enter valid quantity');
  
  let balance = parseFloat(localStorage.getItem('balance'));
  let holdings = JSON.parse(localStorage.getItem('holdings'));
  let cost = qty * STATE.price;
  
  if(type === 'buy') {
    if(balance < cost) return alert('Not enough balance!');
    balance -= cost;
    holdings[STATE.coinId] = (holdings[STATE.coinId] || 0) + qty;
    addTradeLog(`✅ BOUGHT ${qty} ${STATE.coinSymbol} @ $${STATE.price.toFixed(2)}`);
  } else {
    if((holdings[STATE.coinId] || 0) < qty) return alert('Not enough coins!');
    balance += cost;
    holdings[STATE.coinId] -= qty;
    addTradeLog(`❌ SOLD ${qty} ${STATE.coinSymbol} @ $${STATE.price.toFixed(2)}`);
  }
  
  localStorage.setItem('balance', balance);
  localStorage.setItem('holdings', JSON.stringify(holdings));
  render_trading(); // Refresh
}

function addTradeLog(msg) {
  let log = localStorage.getItem('tradeLog') || '';
  log = `[${new Date().toLocaleTimeString()}] ${msg}\n` + log;
  localStorage.setItem('tradeLog', log);
}
