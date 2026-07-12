function renderTrading() { 
  showScreen(`${getNavbar()}
    <div class="container">
      <h2>📈 Trading Terminal</h2>
      
      <div class="card">
        <h3>Balance</h3>
        <div id="balance-ui">Loading...</div>
      </div>

      <div class="card">
        <h3>Trade</h3>
        <p>Coin: <b>${currentCoin.toUpperCase()}</b></p>
        <button onclick="placeTrade('BUY')" class="btn-buy">BUY</button>
        <button onclick="placeTrade('SELL')" class="btn-sell">SELL</button>
      </div>

      <div class="card">
        <h3>Auto Trade</h3>
        <button onclick="toggleAuto()" id="autoBtn">OFF</button>
      </div>
    </div>
  `);
  
  updateBalanceUI();
  setupTradingEvents();
}

function updateBalanceUI() {
  document.getElementById('balance-ui').innerHTML = `
    <div>USDT: <b>${tradeBalance.usdt}</b></div>
    <div>INR: <b>₹${tradeBalance.inr.toLocaleString()}</b></div>
  `;
}

function placeTrade(type) {
  alert(`${type} order placed for ${currentCoin.toUpperCase()}`);
  // yahan apna real trade logic daal dena
}

function toggleAuto() {
  autoTrade = !autoTrade;
  document.getElementById('autoBtn').innerText = autoTrade ? "ON" : "OFF";
}

function setupTradingEvents() {
  // agar coin select dropdown hai to yahan event laga de
}
