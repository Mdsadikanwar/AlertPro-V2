let currentSymbol = "BINANCE:BTCUSDT";
let holdings = { BTC: 0, ETH: 0, SOL: 0 }; // सिर्फ 3 coin रखे अभी, बाकी बाद में
let livePrices = {};

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
        <div id="tradingview_chart" style="height: 400px;"></div>
      </div>

      <div class="card">
        <h3>Balance & Holdings</h3>
        <div id="balance-ui">Loading...</div>
        <div id="holdings-ui">Loading...</div>
      </div>

      <div class="card">
        <h3>Trade - $10 per trade</h3>
        <button onclick="placeTrade('BUY')" style="width:49%; padding:12px; background:#10b981; color:white; border:none; border-radius:8px; font-weight:bold;">BUY</button>
        <button onclick="placeTrade('SELL')" style="width:49%; padding:12px; background:#ef4444; color:white; border:none; border-radius:8px; font-weight:bold;">SELL</button>
      </div>
    </div>
  `);
  
  loadTradingViewWidget();
  fetchPrice();
  updateUI();
}

function loadTradingViewWidget() {
  document.getElementById('tradingview_chart').innerHTML = "";
  new TradingView.widget({
    "width": "100%", "height": 400, "symbol": currentSymbol, "interval": "60",
    "theme": "dark", "container_id": "tradingview_chart"
  });
}

function changeCoin(symbol) {
  currentSymbol = symbol;
  loadTradingViewWidget();
  updateUI();
}

async function fetchPrice() {
  let coin = currentSymbol.split(":")[1].replace("USDT","").toLowerCase();
  let idMap = {btc:"bitcoin", eth:"ethereum", sol:"solana"};
  try {
    let res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idMap[coin]}&vs_currencies=usdt`);
    let data = await res.json();
    livePrices = data;
    updateUI();
  } catch(e) {}
}

function getPrice() {
  let coin = currentSymbol.split(":")[1].replace("USDT","").toLowerCase();
  let idMap = {btc:"bitcoin", eth:"ethereum", sol:"solana"};
  return livePrices[idMap]? livePrices[idMap].usdt : 0;
}

function placeTrade(type) {
  let coin = currentSymbol.split(":")[1].replace("USDT","");
  let price = getPrice();
  let tradeAmount = 10;

  if(price === 0) { alert("Price loading..."); return; }

  if(type === "BUY") {
    if(tradeBalance.usdt < tradeAmount) { alert("USDT कम है"); return; }
    tradeBalance.usdt -= tradeAmount;
    holdings += tradeAmount / price;
    alert("Bought " + (tradeAmount/price).toFixed(6) + " + coin);
  }

  if(type === "SELL") {
    let coinAmount = tradeAmount / price;
    if(holdings < coinAmount) { alert(coin + " कम है"); return; }
    holdings -= coinAmount;
    tradeBalance.usdt += tradeAmount;
    alert("Sold " + coinAmount.toFixed(6) + " " + coin);
  }
  updateUI();
}

function updateUI() {
  let coin = currentSymbol.split(":")[1].replace("USDT","");
  document.getElementById('balance-ui').innerHTML = `
    <div>USDT: <b>$${tradeBalance.usdt.toFixed(2)}</b></div>
    <div>Price: <b>$${getPrice().toFixed(2)}</b></div>
  `;
  document.getElementById('holdings-ui').innerHTML = `
    <div>${coin} Holdings: <b>${holdings.toFixed(6)}</b></div>
  `;
}

setInterval(fetchPrice, 10000); // 10 sec में price update
