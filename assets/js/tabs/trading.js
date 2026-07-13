let currentSymbol = "BINANCE:BTCUSDT";
let orderType = "BUY";
let orderMode = "Limit";
let amountType = "USDT"; // NAYA: USDT ya BTC

function renderTrading() {
  let coin = currentSymbol.split(":")[1].replace("USDT","");

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

      <!-- CHART -->
      <div class="card">
        <h3>Live Chart</h3>
        <div id="tradingview_chart" style="height: 500px;"></div>
      </div>

      <!-- BINANCE WALA BUY/SELL PANEL -->
      <div class="card" style="padding:15px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <h2 id="panelCoinName" style="margin:0;">${coin}/USDT</h2> <!-- YE DYNAMIC HOGA -->
        </div>

        <!-- BUY/SELL TOGGLE -->
        <div style="display:flex; background:#1f2937; border-radius:10px; padding:4px; margin-bottom:12px;">
          <button id="buyTab" onclick="setOrderType('BUY')" style="flex:1; padding:10px; background:#22c55e; color:white; border:none; border-radius:8px; font-weight:bold;">Buy</button>
          <button id="sellTab" onclick="setOrderType('SELL')" style="flex:1; padding:10px; background:transparent; color:#94a3b8; border:none; border-radius:8px; font-weight:bold;">Sell</button>
        </div>

        <!-- ORDER TYPE -->
        <select id="orderMode" onchange="orderMode=this.value" style="width:100%; padding:12px; background:#1f2937; color:white; border:1px solid #374151; border-radius:8px; margin-bottom:12px;">
          <option value="Limit">Limit</option>
          <option value="Market">Market</option>
        </select>

        <!-- NAYA: AMOUNT TYPE TOGGLE USDT / BTC -->
        <div style="display:flex; background:#1f2937; border-radius:10px; padding:4px; margin-bottom:12px;">
          <button id="usdtTab" onclick="setAmountType('USDT')" style="flex:1; padding:8px; background:#22c55e; color:white; border:none; border-radius:8px; font-size:14px;">USDT</button>
          <button id="btcTab" onclick="setAmountType('BTC')" style="flex:1; padding:8px; background:transparent; color:#94a3b8; border:none; border-radius:8px; font-size:14px;">${coin}</button>
        </div>

        <!-- AMOUNT -->
        <div style="margin-bottom:12px;">
          <label id="amountLabel" style="color:#94a3b8; font-size:12px;">Amount (USDT)</label> <!-- YE DYNAMIC -->
          <input id="orderAmount" type="number" placeholder="0.00" oninput="updateOrderUI()" style="width:100%; padding:12px; background:#1f2937; color:white; border:1px solid #374151; border-radius:8px;">
        </div>

        <!-- TOTAL -->
        <div style="background:#1f2937; padding:12px; border-radius:8px; text-align:center; margin-bottom:12px;">
          <label style="color:#94a3b8; font-size:12px;">Total</label>
          <div id="orderTotal" style="font-size:16px; font-weight:bold;">0.00 USDT</div> <!-- YE DYNAMIC -->
        </div>

        <!-- FINAL BUTTON -->
        <button id="placeOrderBtn" onclick="placeTrade()" style="width:100%; padding:16px; background:#22c55e; color:white; border:none; border-radius:10px; font-size:16px; font-weight:bold;">Buy ${coin}</button>
      </div>

      <div class="card">
        <h3>Balance</h3>
        <div id="balance-ui">Loading...</div>
      </div>

    </div>
  `);

  loadTradingViewWidget();
  updateBalanceUI();
  updateOrderUI();
  setInterval(updateOrderUI, 1000);
}

function setOrderType(type){
  orderType = type;
  let coin = currentSymbol.split(":")[1].replace("USDT","");
  document.getElementById('buyTab').style.background = type == 'BUY'? '#22c55e' : 'transparent';
  document.getElementById('buyTab').style.color = type == 'BUY'? 'white' : '#94a3b8';
  document.getElementById('sellTab').style.background = type == 'SELL'? '#ef4444' : 'transparent';
  document.getElementById('sellTab').style.color = type == 'SELL'? 'white' : '#94a3b8';
  document.getElementById('placeOrderBtn').style.background = type == 'BUY'? '#22c55e' : '#ef4444';
  document.getElementById('placeOrderBtn').innerText = `${type} ${coin}`;
}

// NAYA: AMOUNT TYPE CHANGE
function setAmountType(type){
  amountType = type;
  let coin = currentSymbol.split(":")[1].replace("USDT","");
  document.getElementById('usdtTab').style.background = type == 'USDT'? '#22c55e' : 'transparent';
  document.getElementById('usdtTab').style.color = type == 'USDT'? 'white' : '#94a3b8';
  document.getElementById('btcTab').style.background = type == 'BTC'? '#22c55e' : 'transparent';
  document.getElementById('btcTab').style.color = type == 'BTC'? 'white' : '#94a3b8';
  document.getElementById('amountLabel').innerText = `Amount (${type})`;
  document.getElementById('orderAmount').value = "";
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
  let coin = symbol.split(":")[1].replace("USDT","");
  document.getElementById('panelCoinName').innerText = `${coin}/USDT`; // PANEL KA NAAM BHI CHANGE
  document.getElementById('btcTab').innerText = coin; // BUTTON KA NAAM BHI
  document.getElementById('placeOrderBtn').innerText = `${orderType} ${coin}`;
  loadTradingViewWidget();
  updateOrderUI();
}

function updateBalanceUI() {
  document.getElementById('balance-ui').innerHTML = `
    <div>USDT: <b>${tradeBalance.usdt}</b></div>
    <div>INR: <b>₹${tradeBalance.inr.toLocaleString()}</b></div>
  `;
}

function updateOrderUI(){
  let coin = currentSymbol.split(":")[1].replace("USDT","").toLowerCase();
  let price = livePrices[coin]?.usdt || 0;
  let amount = parseFloat(document.getElementById('orderAmount').value) || 0;
  let total = 0;

  if(amountType == "USDT"){
    total = amount; // USDT daala to total wahi
    document.getElementById('orderTotal').innerText = `${total.toFixed(2)} USDT`;
  } else {
    total = amount * price; // BTC daala to * price
    document.getElementById('orderTotal').innerText = `${total.toFixed(2)} USDT`;
  }
}

function placeTrade() {
  let coinName = currentSymbol.split(":")[1].replace("USDT","");
  let amount = document.getElementById('orderAmount').value || 0;
  let coin = coinName.toLowerCase();
  let price = livePrices[coin]?.usdt || 0;
  
  // AGAR BTC me daala to USDT me convert karke history me bhejo
  let finalAmountUSDT = amountType == "USDT"? amount : amount * price;

  addToHistory(orderType, coin, price, finalAmountUSDT);
  alert(`${orderType} ${orderMode} order placed for ${finalAmountUSDT} USDT of ${coinName}`);
  renderHistory();
}
