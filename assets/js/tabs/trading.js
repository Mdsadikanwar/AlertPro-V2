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

      <!-- YE NAYA BUY/SELL SECTION HAI -->
      <div class="card">
        <h3>Place Order</h3>
        
        <!-- BUY/SELL TOGGLE -->
        <div style="display:flex; gap:10px; margin-bottom:15px;">
          <button id="buyTab" onclick="setOrderType('BUY')" style="flex:1; padding:12px; background:#22c55e; color:white; border:none; border-radius:8px; font-weight:bold;">BUY</button>
          <button id="sellTab" onclick="setOrderType('SELL')" style="flex:1; padding:12px; background:#374151; color:white; border:none; border-radius:8px; font-weight:bold;">SELL</button>
        </div>

        <!-- AMOUNT INPUT -->
        <label style="color:#94a3b8; font-size:14px;">Amount (USDT)</label>
        <input id="tradeAmount" type="number" placeholder="100" value="100" style="width:100%; padding:12px; margin:8px 0 15px 0; background:#1f2937; color:white; border:1px solid #374151; border-radius:8px;">

        <!-- LIVE PRICE -->
        <div style="margin-bottom:15px;">
          <span style="color:#94a3b8;">Price: </span>
          <span id="orderPrice" style="font-weight:bold; font-size:18px;">$0.00</span>
        </div>

        <!-- TOTAL -->
        <div style="margin-bottom:15px;">
          <span style="color:#94a3b8;">Total: </span>
          <span id="orderTotal" style="font-weight:bold;">0.00 USDT</span>
        </div>

        <!-- FINAL BUTTON -->
        <button id="placeOrderBtn" onclick="placeTrade()" style="width:100%; padding:14px; background:#22c55e; color:white; border:none; border-radius:8px; font-size:16px; font-weight:bold;">BUY BTC</button>
      </div>

    </div>
  `);

  loadTradingViewWidget();
  updateBalanceUI();
  updateOrderUI();
  setInterval(updateOrderUI, 1000); // har 1 sec price update
}

let orderType = "BUY"; // default

function setOrderType(type){
  orderType = type;
  document.getElementById('buyTab').style.background = type == 'BUY'? '#22c55e' : '#374151';
  document.getElementById('sellTab').style.background = type == 'SELL'? '#ef4444' : '#374151';
  document.getElementById('placeOrderBtn').style.background = type == 'BUY'? '#22c55e' : '#ef4444';
  document.getElementById('placeOrderBtn').innerText = `${type} ${currentSymbol.split(":")[1].replace("USDT","")}`;
  updateOrderUI();
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
  document.getElementById('placeOrderBtn').innerText = `${orderType} ${symbol.split(":")[1].replace("USDT","")}`;
  updateOrderUI();
}

function updateBalanceUI() {
  document.getElementById('balance-ui').innerHTML = `
    <div>USDT: <b>${tradeBalance.usdt}</b></div>
    <div>INR: <b>₹${tradeBalance.inr.toLocaleString()}</b></div>
  `;
}

// NAYA: ORDER UI UPDATE
function updateOrderUI(){
  let coinName = currentSymbol.split(":")[1].replace("USDT","").toLowerCase();
  let price = livePrices[coinName]?.usdt || 0;
  let amount = document.getElementById('tradeAmount').value || 0;
  
  document.getElementById('orderPrice').innerText = `$${price.toFixed(2)}`;
  document.getElementById('orderTotal').innerText = `${amount} USDT`;
}

function placeTrade() {
  let coinName = currentSymbol.split(":")[1].replace("USDT","");
  let amount = document.getElementById('tradeAmount').value || 100;
  let price = livePrices[coinName.toLowerCase()]?.usdt || 0;

  // HISTORY ME SAVE
  addToHistory(orderType, coinName.toLowerCase(), price, amount);

  alert(`${orderType} order placed for ${amount} USDT of ${coinName}`);
  renderHistory();
}
