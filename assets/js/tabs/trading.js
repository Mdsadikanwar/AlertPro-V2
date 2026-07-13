let currentSymbol = "BINANCE:BTCUSDT";
let holdings = { BTC: 0, ETH: 0, SOL: 0 };
let livePrices = { bitcoin: 0, ethereum: 0, solana: 0 };
let tradeHistory = []; // NEW: सारे trade यहाँ save होंगे

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
        <h3>Balance</h3>
        <div>USDT: $<span id="usdtBal">${tradeBalance.usdt.toFixed(2)}</span></div>
        <div><span id="coinName">BTC</span>: <span id="coinHold">0.000</span></div>
        <div>Price: $<span id="coinPrice">0</span></div>
      </div>

      <div class="card">
        <h3>Trade - $10 per order</h3>
        <button onclick="placeTrade('BUY')" style="width:49%; padding:12px; background:#10b981; color:white; border:none; border-radius:8px;">BUY</button>
        <button onclick="placeTrade('SELL')" style="width:49%; padding:12px; background:#ef4444; color:white; border:none; border-radius:8px;">SELL</button>
      </div>

      <!-- NEW: ORDER HISTORY TABLE -->
      <div class="card">
        <h3>Order History</h3>
        <div id="historyTable" style="overflow-x:auto;">
          <table style="width:100%; color:white; font-size:12px;">
            <thead>
              <tr style="border-bottom:1px solid #374151;">
                <th style="padding:8px; text-align:left;">Time</th>
                <th style="padding:8px;">Type</th>
                <th style="padding:8px;">Coin</th>
                <th style="padding:8px;">Amount</th>
                <th style="padding:8px;">Price</th>
              </tr>
            </thead>
            <tbody id="historyBody"></tbody>
          </table>
        </div>
      </div>

    </div>
  `);
  loadTradingViewWidget();
  fetchPrice();
  updateUI();
  setInterval(fetchPrice, 10000);
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
  let time = new Date().toLocaleTimeString();

  if(price === 0) return alert("Price loading...");

  if(type === "BUY") {
    if(tradeBalance.usdt < amount) return alert("USDT कम है");
    tradeBalance.usdt -= amount;
    holdings += amount / price;
    // NEW: history में add करो
    tradeHistory.unshift({time, type:"BUY", coin, amount: (amount/price).toFixed(6), price: price.toFixed(2)});
    alert("Bought " + (amount/price).toFixed(6) + " " + coin);
  }
  if(type === "SELL") {
    let coinAmt = amount / price;
    if(holdings < coinAmt) return alert(coin + " कम है");
    holdings -= coinAmt;
    tradeBalance.usdt += amount;
    // NEW: history में add करो
    tradeHistory.unshift({time, type:"SELL", coin, amount: coinAmt.toFixed(6), price: price.toFixed(2)});
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

  // NEW: History table update
  let rows = "";
  tradeHistory.slice(0,10).forEach(t => { // सिर्फ last 10 trade
    let color = t.type === "BUY"? "#10b981" : "#ef4444";
    rows += `<tr>
      <td style="padding:8px;">${t.time}</td>
      <td style="padding:8px; color:${color}; font-weight:bold;">${t.type}</td>
      <td style="padding:8px;">${t.coin}</td>
      <td style="padding:8px;">${t.amount}</td>
      <td style="padding:8px;">$${t.price}</td>
    </tr>`;
  });
  document.getElementById('historyBody').innerHTML = rows;
}
