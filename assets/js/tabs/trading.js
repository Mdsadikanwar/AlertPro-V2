let currentSymbol = "BINANCE:BTCUSDT";
let holdings = { BTC: 0, ETH: 0, SOL: 0 }; // तेरे पास कितना coin है
let livePrices = { bitcoin: 0, ethereum: 0, solana: 0 };

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

      <!-- NEW: BALANCE CARD -->
      <div class="card">
        <h3>Balance</h3>
        <div>USDT: $<span id="usdtBal">${tradeBalance.usdt.toFixed(2)}</span></div>
        <div><span id="coinName">BTC</span>: <span id="coinHold">0.000000</span></div>
        <div>Price: $<span id="coinPrice">0</span></div>
      </div>

      <!-- NEW: TRADE CARD -->
      <div class="card">
        <h3>Trade - $10 per order</h3>
        <button onclick="placeTrade('BUY')" style="width:49%; padding:12px; background:#10b981; color:white; border:none; border-radius:8px;">BUY</button>
        <button onclick="placeTrade('SELL')" style="width:49%; padding:12px; background:#ef4444; color:white; border:none; border-radius:8px;">SELL</button>
      </div>
    </div>
  `);
  loadTradingViewWidget();
  fetchPrice();
  updateUI();
  setInterval(fetchPrice, 10000); // 10sec में price update
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
  updateUI();
}

async function fetchPrice() {
  try {
    let res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usdt");
    livePrices = await res.json();
    updateUI();
  } catch(e) {}
}

function placeTrade(type) {
  let coin = currentSymbol.split(":")[1].replace("USDT","");
  let key = {BTC:"bitcoin", ETH:"ethereum", SOL:"solana"};
  let price = livePrices[key]?.usdt || 0;
  let amount = 10;

  if(price === 0) return alert("Price loading...");

  if(type === "BUY") {
    if(tradeBalance.usdt < amount) return alert("USDT कम है");
    tradeBalance.usdt -= amount;
    holdings += amount / price;
    alert("Bought " + (amount/price).toFixed(6) + " " + coin);
  }
  if(type === "SELL") {
    let coinAmt = amount / price;
    if(holdings < coinAmt) return alert(coin + " कम है");
    holdings -= coinAmt;
    tradeBalance.usdt += amount;
    alert("Sold " + coinAmt.toFixed(6) + " " + coin);
  }
  updateUI();
}

function updateUI() {
  let coin = currentSymbol.split(":")[1].replace("USDT","");
  let key = {BTC:"bitcoin", ETH:"ethereum", SOL:"solana"};
  document.getElementById('usdtBal').innerText = tradeBalance.usdt.toFixed(2);
  document.getElementById('coinName').innerText = coin;
  document.getElementById('coinHold').innerText = holdings.toFixed(6);
  document.getElementById('coinPrice').innerText = (livePrices[key]?.usdt || 0).toFixed(2);
}
