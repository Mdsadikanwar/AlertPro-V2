let currentSymbol = "BINANCE:BTCUSDT"; // default coin

const top10Coins = [
  {symbol: "BINANCE:BTCUSDT", name: "BTC / USDT"},
  {symbol: "BINANCE:ETHUSDT", name: "ETH / USDT"},
  {symbol: "BINANCE:SOLUSDT", name: "SOL / USDT"},
  {symbol: "BINANCE:BNBUSDT", name: "BNB / USDT"},
  {symbol: "BINANCE:XRPUSDT", name: "XRP / USDT"},
  {symbol: "BINANCE:DOGEUSDT", name: "DOGE / USDT"},
  {symbol: "BINANCE:ADAUSDT", name: "ADA / USDT"},
  {symbol: "BINANCE:TRXUSDT", name: "TRX / USDT"},
  {symbol: "BINANCE:TONUSDT", name: "TON / USDT"},
  {symbol: "BINANCE:SHIBUSDT", name: "SHIB / USDT"}
];

function renderTrading() { 
  showScreen(`${getNavbar()}
    <div class="container">
      
      <div class="card">
        <h3>Select Coin - Top 10</h3>
        <select id="coinSelect" onchange="changeCoin(this.value)" style="width:100%; padding:10px; background:#1f2937; color:white; border:1px solid #374151; border-radius:8px; font-size:16px;">
          ${top10Coins.map(coin => `<option value="${coin.symbol}">${coin.name}</option>`).join('')}
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
  alert(`${type} order placed for ${coinName}`);
}
