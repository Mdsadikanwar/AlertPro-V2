let currentSymbol = "BINANCE:BTCUSDT";

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
        <h3>Balance & Holdings</h3>
        <div id="balance-ui">Loading...</div>
        <div id="holdings-ui">Loading...</div>
      </div>

      <div class="card">
        <h3>Trade - $10 per trade</h3>
        <button onclick="placeTrade('BUY')" class="btn-buy">BUY</button>
        <button onclick="placeTrade('SELL')" class="btn-sell">SELL</button>
      </div>
    </div>
  `);

  loadTradingViewWidget();
  fetchPrices();
  updateBalanceUI();
}

function loadTradingViewWidget() {
  document.getElementById('tradingview_chart').innerHTML = "";
  new TradingView.widget({
    "width": "100%", "height": 500, "symbol": currentSymbol, "interval": "60",
    "timezone": "Asia/Kolkata", "theme": "dark", "style": "1", "locale": "en",
    "toolbar_bg": "#1f2937", "enable_publishing": false, "allow_symbol_change": true,
    "container_id": "tradingview_chart"
  });
}

function changeCoin(symbol) {
  currentSymbol = symbol;
  loadTradingViewWidget();
  updateBalanceUI();
}

async function fetchPrices() {
  try {
    let res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple,dogecoin,cardano,tron,toncoin,shiba-inu&vs_currencies=usdt");
    livePrices = await res.json();
    updateBalanceUI(); // price आने पर UI update
  } catch(e) { console.log("Price fetch error") }
}

function getCoinName() {
  return currentSymbol.split(":")[1].replace("USDT","");
}

function getPrice() {
  let map = {BTC:"bitcoin", ETH:"ethereum", SOL:"solana", BNB:"binancecoin", XRP:"ripple", DOGE:"dogecoin", ADA:"cardano", TRX:"tron", TON:"toncoin", SHIB:"shiba-inu"};
  let coin = getCoinName();
  return livePrices[map[coin]]? livePrices[map[coin]].usdt : 0; // FIXED
}

function placeTrade(type) {
  let coin = getCoinName();
  let price = getPrice();
  let tradeAmount = 10;

  if(price === 0) { alert("Price loading... 2 sec ruko"); return; }

  if(type === "BUY") {
    if(tradeBalance.usdt < tradeAmount) { alert("USDT kam hai"); return; }
    tradeBalance.usdt -= tradeAmount;
    holdings[coin] += tradeAmount / price; // FIXED: holdings[coin]
    alert("Bought " + (tradeAmount/price).toFixed(6) + " + coin);
  }

  if(type === "SELL") {
    let coinAmount = tradeAmount / price;
    if(holdings[coin] < coinAmount) { alert(coin + " kam hai"); return; } // FIXED
    holdings[coin] -= coinAmount;
    tradeBalance.usdt += tradeAmount;
    alert("Sold " + coinAmount.toFixed(6) + " + coin);
  }

  updateBalanceUI();
}

function updateBalanceUI() {
  let coin = getCoinName();
  document.getElementById('balance-ui').innerHTML = `
    <div>USDT: <b>$${tradeBalance.usdt.toFixed(2)}</b></div>
    <div>Current Price: <b>$${getPrice().toFixed(2)}</b></div>
  `;
  document.getElementById('holdings-ui').innerHTML = `
    <div>${coin} Holdings: <b>${holdings[coin].toFixed(6)}</b></div> // FIXED
  `;
}

setInterval(fetchPrices, 10000);
