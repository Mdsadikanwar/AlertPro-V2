let tradeBalance = { usdt: 1000, inr: 83000 };
let tradeHistory = JSON.parse(localStorage.getItem('tradeHistory') || "[]");
let autoTrade = false;
let autoTradeInterval;

function renderTrading() {
  showScreen(`
    ${getNavbar()}
    <div class="card">
      <!-- HEADER WITH AUTO TRADE ON TOP RIGHT -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <div style="font-size:18px; font-weight:700;">Smart Trading Panel</div>

        <!-- AUTO TRADE TOGGLE - AB UPAR AA GAYA -->
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="text-align:right;">
            <div style="font-size:11px; font-weight:600;">Auto Trade</div>
            <div style="font-size:9px; color:#94a3b8;">RSI</div>
          </div>
          <label style="position:relative; display:inline-block; width:44px; height:24px;">
            <input type="checkbox" id="autoToggle" style="opacity:0; width:0; height:0;">
            <span id="toggleSlider" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#334155; border-radius:24px; transition:0.3s;"></span>
          </label>
        </div>
      </div>

      <!-- CURRENCY + BALANCE ROW -->
      <div style="display:flex; justify-content:space-between; align-items:center; background:#1e293b; padding:15px; border-radius:10px; margin-bottom:15px;">
        <div>
          <div style="color:#94a3b8; font-size:12px;">Available Balance</div>
          <div style="font-size:22px; font-weight:800;" id="balanceDisplay">$${tradeBalance.usdt.toFixed(2)}</div>
        </div>
        <div style="display:flex; gap:5px; background:#0f172a; padding:4px; border-radius:8px;">
          <button id="currUsdt" style="padding:6px 12px; border:none; border-radius:6px; background:#0ea5e9; color:white; font-weight:600; font-size:12px;">USDT</button>
          <button id="currInr" style="padding:6px 12px; border:none; border-radius:6px; background:transparent; color:#94a3b8; font-size:12px;">INR</button>
        </div>
      </div>

      <div style="margin-bottom:15px;">
        <div style="color:#94a3b8; font-size:12px; margin-bottom:5px;">Coin</div>
        <select id="tradeCoinSelect" style="width:100%; padding:12px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px;">
          ${top10Coins.map(c => `<option value="${c.id}">${c.name} (${c.symbol})</option>`).join('')}
        </select>
      </div>

      <!-- STRATEGY SELECTOR - AUTO KE NICHE -->
      <div style="margin-bottom:15px;">
        <div style="color:#94a3b8; font-size:12px; margin-bottom:5px;">Auto Strategy</div>
        <select id="strategySelect" style="width:100%; padding:10px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px; font-size:12px;">
          <option value="rsi">RSI < 30 Buy, > 70 Sell</option>
          <option value="ma">MA Crossover</option>
        </select>
      </div>

      <!-- ORDER TYPE -->
      <div style="margin-bottom:15px;">
        <div style="color:#94a3b8; font-size:12px; margin-bottom:5px;">Order Type</div>
        <div style="display:flex; gap:5px; background:#1e293b; padding:4px; border-radius:8px;">
          <button id="typeAmount" style="flex:1; padding:8px; border:none; border-radius:6px; background:#0ea5e9; color:white;">By Amount</button>
          <button id="typeQty" style="flex:1; padding:8px; border:none; border-radius:6px; background:transparent; color:#94a3b8;">By Quantity</button>
        </div>
      </div>

      <div style="margin-bottom:15px;">
        <div style="color:#94a3b8; font-size:12px; margin-bottom:5px;" id="amountLabel">Amount in USDT</div>
        <input type="number" id="tradeAmount" placeholder="100" style="width:100%; padding:12px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px;">
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <button id="buyBtn" style="background:#10b981; color:white; padding:14px; border:none; border-radius:8px; font-weight:700; font-size:16px;">BUY</button>
        <button id="sellBtn" style="background:#ef4444; color:white; padding:14px; border:none; border-radius:8px; font-weight:700; font-size:16px;">SELL</button>
      </div>
    </div>

    <!-- Order History -->
    <div class="card" style="margin-top:15px;">
      <div style="font-size:16px; font-weight:700; margin-bottom:15px;">Order History</div>
      <div id="orderHistory">
        ${tradeHistory.length === 0? '<div style="color:#94a3b8; text-align:center;">No trades yet</div>' : ''}
        ${tradeHistory.map(h => `
          <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #1e293b;">
            <div>
              <div style="font-weight:600; color:${h.type === 'BUY'? '#10b981' : '#ef4444'};">${h.type} ${h.coin}</div>
              <div style="font-size:11px; color:#94a3b8;">${h.time}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:600;">${h.amount} ${h.unit}</div>
              <div style="font-size:11px; color:#94a3b8;">@${h.price}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `);

  setupTradingEvents();
}

let currentTradeCurrency = "usdt";
let currentOrderType = "amount";

function setupTradingEvents() {
  document.getElementById('buyBtn').onclick = () => placeTrade('BUY');
  document.getElementById('sellBtn').onclick = () => placeTrade('SELL');

  document.getElementById('currUsdt').onclick = () => switchCurrency('usdt');
  document.getElementById('currInr').onclick = () => switchCurrency('inr');

  document.getElementById('typeAmount').onclick = () => switchOrderType('amount');
  document.getElementById('typeQty').onclick = () => switchOrderType('qty');

  document.getElementById('autoToggle').onchange = (e) => toggleAutoTrade(e.target.checked);
}

function switchCurrency(curr) {
  currentTradeCurrency = curr;
  const symbol = curr === "inr"? "₹" : "$";
  document.getElementById('balanceDisplay').innerText = `${symbol}${tradeBalance[curr].toFixed(2)}`;
  document.getElementById('amountLabel').innerText = `Amount in ${curr.toUpperCase()}`;
  document.getElementById('currUsdt').style.background = curr === "usdt"? "#0ea5e9" : "transparent";
  document.getElementById('currInr').style.background = curr === "inr"? "#0ea5e9" : "transparent";
}

function switchOrderType(type) {
  currentOrderType = type;
  document.getElementById('amountLabel').innerText = type === "amount"? `Amount in ${currentTradeCurrency.toUpperCase()}` : "Coin Quantity";
  document.getElementById('typeAmount').style.background = type === "amount"? "#0ea5e9" : "transparent";
  document.getElementById('typeQty').style.background = type === "qty"? "#0ea5e9" : "transparent";
}

async function placeTrade(type) {
  const coinId = document.getElementById('tradeCoinSelect').value;
  const amount = parseFloat(document.getElementById('tradeAmount').value);
  const coin = top10Coins.find(c => c.id === coinId);
  const symbol = currentTradeCurrency === "inr"? "₹" : "$";

  if(!amount || amount <= 0){ alert("Enter valid amount"); return; }

  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,inr`);
  const data = await res.json();
  const price = currentTradeCurrency === "inr"? data[coinId].inr : data[coinId].usd;

  let tradeAmount = amount;
  if(currentOrderType === "qty") tradeAmount = amount * price;

  if(type === "BUY" && tradeAmount > tradeBalance[currentTradeCurrency]){
    alert("Insufficient Balance"); return;
  }

  if(type === "BUY") tradeBalance[currentTradeCurrency] -= tradeAmount;
  if(type === "SELL") tradeBalance[currentTradeCurrency] += tradeAmount;

  tradeHistory.unshift({
    type: type, coin: coin.symbol,
    amount: currentOrderType === "amount"? tradeAmount.toFixed(2) : amount.toFixed(4),
    unit: currentOrderType === "amount"? currentTradeCurrency.toUpperCase() : coin.symbol,
    price: `${symbol}${price.toFixed(2)}`, time: new Date().toLocaleString()
  });
  tradeHistory = tradeHistory.slice(0, 10);
  localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));

  alert(`${type} Order Placed`);
  renderTrading();
}

async function toggleAutoTrade(status) {
  autoTrade = status;
  const slider = document.getElementById('toggleSlider');
  slider.style.background = status? "#10b981" : "#334155";

  if(status){
    alert("Auto Trade ON - RSI Strategy Active");
    autoTradeInterval = setInterval(runAutoStrategy, 60000);
  } else {
    clearInterval(autoTradeInterval);
    alert("Auto Trade OFF");
  }
}

async function runAutoStrategy() {
  const coinId = document.getElementById('tradeCoinSelect').value;
  const strategy = document.getElementById('strategySelect').value;
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=14`);
  const data = await res.json();
  const prices = data.prices.map(p => p[1]);
  const rsi = calculateRSI(prices);

  if(strategy === "rsi"){
    if(rsi < 30) placeTrade('BUY');
    if(rsi > 70) placeTrade('SELL');
  }
}
