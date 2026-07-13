let currentSymbol = "BINANCE:BTCUSDT";
let orderType = "BUY";
let orderMode = "Limit";

function renderTrading() {
  let coin = currentSymbol.split(":")[1].replace("USDT","");
  let change = "-2.14%"; // abhi dummy hai, baad me live karenge

  showScreen(`${getNavbar()}
    <div class="container">

      <!-- COIN HEADER -->
      <div class="card" style="padding:15px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <h2 style="margin:0;">${coin}/USDT</h2>
          <span>▼</span>
        </div>
        <div style="color:#ef4444; font-size:14px; margin-top:4px;">${change}</div>
      </div>

      <!-- BUY/SELL TOGGLE -->
      <div class="card" style="padding:10px;">
        <div style="display:flex; background:#1f2937; border-radius:10px; padding:4px;">
          <button id="buyTab" onclick="setOrderType('BUY')" style="flex:1; padding:10px; background:#22c55e; color:white; border:none; border-radius:8px; font-weight:bold;">Buy</button>
          <button id="sellTab" onclick="setOrderType('SELL')" style="flex:1; padding:10px; background:transparent; color:#94a3b8; border:none; border-radius:8px; font-weight:bold;">Sell</button>
        </div>
      </div>

      <!-- ORDER FORM -->
      <div class="card">
        <!-- ORDER TYPE -->
        <select id="orderMode" onchange="orderMode=this.value" style="width:100%; padding:12px; background:#1f2937; color:white; border:1px solid #374151; border-radius:8px; margin-bottom:12px;">
          <option value="Limit">Limit</option>
          <option value="Market">Market</option>
        </select>

        <!-- PRICE -->
        <div style="margin-bottom:12px;">
          <label style="color:#94a3b8; font-size:12px;">Price (USDT)</label>
          <div style="display:flex; align-items:center; background:#1f2937; border:1px solid #374151; border-radius:8px; padding:0 12px;">
            <button onclick="changePrice(-1)" style="background:none; border:none; color:#94a3b8; font-size:20px;">−</button>
            <input id="orderPrice" type="number" value="0" style="flex:1; text-align:center; padding:12px; background:transparent; color:white; border:none; font-size:18px; font-weight:bold;">
            <button onclick="changePrice(1)" style="background:none; border:none; color:#94a3b8; font-size:20px;">+</button>
          </div>
        </div>

        <!-- AMOUNT -->
        <div style="margin-bottom:12px;">
          <label style="color:#94a3b8; font-size:12px;">Amount (${coin})</label>
          <div style="display:flex; align-items:center; background:#1f2937; border:1px solid #374151; border-radius:8px; padding:0 12px;">
            <button onclick="changeAmount(-0.001)" style="background:none; border:none; color:#94a3b8; font-size:20px;">−</button>
            <input id="orderAmount" type="number" placeholder="0.00" style="flex:1; text-align:center; padding:12px; background:transparent; color:white; border:none; font-size:16px;">
            <button onclick="changeAmount(0.001)" style="background:none; border:none; color:#94a3b8; font-size:20px;">+</button>
          </div>
        </div>

        <!-- SLIDER -->
        <input type="range" id="amountSlider" min="0" max="100" value="0" oninput="setAmountBySlider(this.value)" style="width:100%; margin:10px 0;">

        <!-- TOTAL -->
        <div style="background:#1f2937; padding:12px; border-radius:8px; text-align:center; margin-bottom:12px;">
          <label style="color:#94a3b8; font-size:12px;">Total (USDT)</label>
          <div id="orderTotal" style="font-size:16px; font-weight:bold;">0.00</div>
        </div>

        <!-- TP/SL CHECKBOX -->
        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input type="checkbox" id="tpSlCheck"> <span>TP/SL</span>
        </label>

        <!-- BALANCE INFO -->
        <div style="font-size:14px; color:#94a3b8;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span>Avbl</span>
            <span id="avblBalance">${tradeBalance.usdt} USDT</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span>Max Buy</span>
            <span id="maxBuy">0 ${coin}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Est. Fee</span>
            <span>-- ${coin}</span>
          </div>
        </div>
      </div>

      <!-- FINAL BUTTON -->
      <div class="card" style="padding:10px;">
        <button id="placeOrderBtn" onclick="placeTrade()" style="width:100%; padding:16px; background:#22c55e; color:white; border:none; border-radius:10px; font-size:16px; font-weight:bold;">Buy ${coin}</button>
      </div>

      <!-- OPEN ORDERS / HOLDINGS TABS -->
      <div style="display:flex; gap:20px; padding:0 10px;">
        <span style="color:#94a3b8;">Open Orders (0)</span>
        <span style="color:white; border-bottom:2px solid #22c55e; padding-bottom:4px;">Holdings (0)</span>
      </div>

    </div>
  `);

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

function changePrice(dir){
  let el = document.getElementById('orderPrice');
  el.value = (parseFloat(el.value) + dir).toFixed(2);
  updateOrderUI();
}
function changeAmount(dir){
  let el = document.getElementById('orderAmount');
  el.value = (parseFloat(el.value || 0) + dir).toFixed(4);
  updateOrderUI();
}
function setAmountBySlider(val){
  let max = tradeBalance.usdt;
  let price = parseFloat(document.getElementById('orderPrice').value) || 1;
  document.getElementById('orderAmount').value = ((max * val/100) / price).toFixed(4);
  updateOrderUI();
}

function updateOrderUI(){
  let coin = currentSymbol.split(":")[1].replace("USDT","").toLowerCase();
  let price = livePrices[coin]?.usdt || 0;
  let amount = parseFloat(document.getElementById('orderAmount').value) || 0;
  
  document.getElementById('orderPrice').value = price.toFixed(2);
  document.getElementById('orderTotal').innerText = (price * amount).toFixed(2);
  document.getElementById('maxBuy').innerText = (tradeBalance.usdt / price).toFixed(4) + ` ${coin.toUpperCase()}`;
}

function placeTrade() {
  let coinName = currentSymbol.split(":")[1].replace("USDT","");
  let amount = document.getElementById('orderAmount').value || 0;
  let price = document.getElementById('orderPrice').value || 0;

  addToHistory(orderType, coinName.toLowerCase(), price, amount);
  alert(`${orderType} ${orderMode} order placed for ${amount} ${coinName}`);
  renderHistory();
}
