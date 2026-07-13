function renderTrading() { 
  showScreen(`${getNavbar()}
    <div class="container">
      
      <div class="card">
        <h3>Live Chart</h3>
        <div id="tradingview_chart" style="height: 500px;"></div>
      </div>

      <div class="card">
        <h3>Balance</h3>
        <div id="balance-ui">Loading...</div>
      </div>

      <div class="card">
        <h3>Trade</h3>
        <button onclick="placeTrade('BUY')" class="btn-buy">BUY</button>
        <button onclick="placeTrade('SELL')" class="btn-sell">SELL</button>
      </div>
    </div>
  `);
  
  loadTradingViewWidget(); 
  updateBalanceUI();
}

function loadTradingViewWidget() {
  new TradingView.widget({
    "width": "100%", 
    "height": 500, 
    "symbol": "BINANCE:BTCUSDT", 
    "interval": "60",
    "timezone": "Asia/Kolkata", 
    "theme": "dark", 
    "style": "1", 
    "locale": "en",
    "toolbar_bg": "#1f2937", 
    "enable_publishing": false, 
    "allow_symbol_change": true,
    "container_id": "tradingview_chart"
  });
}

function updateBalanceUI() {
  document.getElementById('balance-ui').innerHTML = `
    <div>USDT: <b>${tradeBalance.usdt}</b></div>
    <div>INR: <b>₹${tradeBalance.inr.toLocaleString()}</b></div>
  `;
}

function placeTrade(type) {
  alert(`${type} order placed`);
}
