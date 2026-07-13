let currentSymbol = "BINANCE:BTCUSDT"; // default coin

function renderTrading() {
  showScreen(`${getNavbar()}
    <div class="container">

      <div class="card">
        <h3>Select Coin - Top 10</h3>
        <select id="coinSelect" onchange="changeCoin(this.value)" style="width:100%; padding:10px; background:#1f2937; color:white; border:1px solid #374151; border-radius:8px; font-size:16px;">
          <option value="BINANCE:BTCUSDT">BTC / USDT</option>
          <option value="BINANCE:ETHUSDT">ETH / USDT</option>
          <option value="BINANCE:SOLUSDT">SOL / USDT</option>
          <option value="BINANCE:BNBUSDT">BNB / USDT</option>
          <option value="BINANCE:XRPUSDT">XRP / USDT</option>
          <option value="BINANCE:DOGEUSDT">DOGE / USDT</option>
          <option value="BINANCE:ADAUSDT">ADA / USDT</option>
          <option value="BINANCE:TRXUSDT">TRX / USDT</option>
          <option value="BINANCE:TONUSDT">TON / USDT</option>
          <option value="BINANCE:SHIBUSDT">SHIB / USDT</option>
        </select>
      </div>

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
  document.getElementById('tradingview_chart').innerHTML = "";

  new TradingView.widget({
    "width": "100%",
    "height": 500,
    "symbol": currentSymbol,
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

function changeCoin(symbol) {
  currentSymbol = symbol;
  loadTradingViewWidget();
}

function updateBalanceUI() {
  document.getElementById('balance-ui').innerHTML = `
    <div>USDT: <b>${tradeBalance.usdt}</b></div>
    <div>INR: <b>₹${tradeBalance.inr.toLocaleString()}</b></div>
  `;
}

function placeTrade(type) {
  let coinName = currentSymbol.split(":")[1].replace("USDT","");
  alert(type + " order placed for " + coinName);
}
