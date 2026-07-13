let currentSymbol = "BINANCE:BTCUSDT";

function renderTrading() {
  showScreen(getNavbar() + `
    <div class="container">
      <div class="card">
        <h3>Select Coin</h3>
        <select id="coinSelect" onchange="changeCoin(this.value)" style="width:100%; padding:10px; background:#1f2937; color:white; border:1px solid #374151; border-radius:8px;">
          <option value="BINANCE:BTCUSDT">BTC / USDT</option>
          <option value="BINANCE:ETHUSDT">ETH / USDT</option>
          <option value="BINANCE:SOLUSDT">SOL / USDT</option>
        </select>
      </div>
      <div class="card">
        <h3>Live Chart</h3>
        <div id="tradingview_chart" style="height: 500px;"></div>
      </div>
      <div class="card">
        <h3>Balance: $${tradeBalance.usdt}</h3>
      </div>
    </div>
  `);
  loadTradingViewWidget();
}

function loadTradingViewWidget() {
  document.getElementById('tradingview_chart').innerHTML = "";
  new TradingView.widget({
    "width": "100%", "height": 500, "symbol": currentSymbol, "interval": "60",
    "theme": "dark", "container_id": "tradingview_chart"
  });
}

function changeCoin(symbol) {
  currentSymbol = symbol;
  loadTradingViewWidget();
}
