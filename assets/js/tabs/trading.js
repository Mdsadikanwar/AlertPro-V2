let tradeBalance = { usdt: 1000, inr: 83000 };
let tradeHistory = JSON.parse(localStorage.getItem('tradeHistory') || "[]");
let autoTrade = false;
let autoTradeInterval;
let chartData = [];

function renderTrading() {
  showScreen(`
    ${getNavbar()}
    <div class="card">
      <!-- HEADER WITH AUTO TRADE -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <div style="font-size:18px; font-weight:700;">Trading Panel</div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="text-align:right;">
            <div style="font-size:11px; font-weight:600;">Auto</div>
          </div>
          <label style="position:relative; display:inline-block; width:44px; height:24px;">
            <input type="checkbox" id="autoToggle" style="opacity:0; width:0; height:0;">
            <span id="toggleSlider" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#334155; border-radius:24px; transition:0.3s;"></span>
          </label>
        </div>
      </div>

      <!-- BALANCE + CURRENCY -->
      <div style="display:flex; justify-content:space-between; align-items:center; background:#1e293b; padding:15px; border-radius:10px; margin-bottom:15px;">
        <div>
          <div style="color:#94a3b8; font-size:12px;">Balance</div>
          <div style="font-size:22px; font-weight:800;" id="balanceDisplay">$${tradeBalance.usdt.toFixed(2)}</div>
        </div>
        <div style="display:flex; gap:5px; background:#0f172a; padding:4px; border-radius:8px;">
          <button id="currUsdt" style="padding:6px 12px; border:none; border-radius:6px; background:#0ea5e9; color:white; font-weight:600; font-size:12px;">USDT</button>
          <button id="currInr" style="padding:6px 12px; border:none; border-radius:6px; background:transparent; color:#94a3b8; font-size:12px;">INR</button>
        </div>
      </div>

      <!-- COIN + TIMEFRAME -->
      <div style="display:grid; grid-template-columns:2fr 1fr; gap:10px; margin-bottom:10px;">
        <select id="tradeCoinSelect" style="width:100%; padding:10px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px;">
          ${top10Coins.map(c => `<option value="${c.id}">${c.name} (${c.symbol})</option>`).join('')}
        </select>
        <select id="chartTimeframe" style="width:100%; padding:10px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px;">
          <option value="1">1D</option>
          <option value="7">7D</option>
          <option value="30" selected>30D</option>
          <option value="90">90D</option>
        </select>
      </div>

      <!-- INDICATOR TOGGLE -->
      <div style="display:flex; gap:8px; margin-bottom:10px;">
        <button id="btnRSI" style="flex:1; padding:6px; background:#334155; color:white; border:none; border-radius:6px; font-size:11px;">RSI</button>
        <button id="btnMA" style="flex:1; padding:6px; background:#334155; color:white; border:none; border-radius:6px; font-size:11px;">MA</button>
      </div>

      <!-- NAYA: CANDLESTICK CHART -->
      <div style="background:#0f172a; padding:10px; border-radius:10px; margin-bottom:15px; position:relative;">
        <canvas id="tradingChart" style="width:100%; height:300px;"></canvas>
      </div>

      <!-- ORDER TYPE -->
      <div style="margin-bottom:15px;">
        <div style="display:flex; gap:5px; background:#1e293b; padding:4px; border-radius:8px;">
          <button id="typeAmount" style="flex:1; padding:8px; border:none; border-radius:6px; background:#0ea5e9; color:white;">By Amount</button>
          <button id="typeQty" style="flex:1; padding:8px; border:none; border-radius:6px; background:transparent; color:#94a3b8;">By Qty</button>
        </div>
      </div>

      <div style="margin-bottom:15px;">
        <input type="number" id="tradeAmount" placeholder="100" style="width:100%; padding:12px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px;">
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <button id="buyBtn" style="background:#10b981; color:white; padding:14px; border:none; border-radius:8px; font-weight:700;">BUY</button>
        <button id="sellBtn" style="background:#ef4444; color:white; padding:14px; border:none; border-radius:8px; font-weight:700;">SELL</button>
      </div>
    </div>

    <!-- Order History -->
    <div class="card" style="margin-top:15px;">
      <div style="font-size:16px; font-weight:700; margin-bottom:15px;">Order History</div>
      <div id="orderHistory">
        ${tradeHistory.length === 0? '<div style="color:#94a3b8; text-align:center;">No trades yet</div>' : ''}
        ${tradeHistory.map(h => `<div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #1e293b;"><div><div style="font-weight:600; color:${h.type === 'BUY'? '#10b981' : '#ef4444'};">${h.type} ${h.coin}</div><div style="font-size:11px; color:#94a3b8;">${h.time}</div></div><div style="text-align:right;"><div style="font-weight:600;">${h.amount} ${h.unit}</div><div style="font-size:11px; color:#94a3b8;">@${h.price}</div></div></div>`).join('')}
      </div>
    </div>
  `);

  setupTradingEvents();
  fetchChart();
}

let currentTradeCurrency = "usdt";
let currentOrderType = "amount";
let showRSI = false;
let showMA = false;

function setupTradingEvents() {
  document.getElementById('buyBtn').onclick = () => placeTrade('BUY');
  document.getElementById('sellBtn').onclick = () => placeTrade('SELL');
  document.getElementById('currUsdt').onclick = () => switchCurrency('usdt');
  document.getElementById('currInr').onclick = () => switchCurrency('inr');
  document.getElementById('typeAmount').onclick = () => switchOrderType('amount');
  document.getElementById('typeQty').onclick = () => switchOrderType('qty');
  document.getElementById('autoToggle').onchange = (e) => toggleAutoTrade(e.target.checked);
  document.getElementById('tradeCoinSelect').onchange = () => fetchChart();
  document.getElementById('chartTimeframe').onchange = () => fetchChart();

  // Indicator buttons
  document.getElementById('btnRSI').onclick = () => { showRSI =!showRSI; drawChart(); }
  document.getElementById('btnMA').onclick = () => { showMA =!showMA; drawChart(); }
}

// NAYA: CANDLESTICK CHART
async function fetchChart() {
  const coinId = document.getElementById('tradeCoinSelect').value;
  const days = document.getElementById('chartTimeframe').value;

  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`);
  const data = await res.json();
  chartData = data; // [timestamp, open, high, low, close]
  drawChart();
}

function drawChart() {
  const canvas = document.getElementById('tradingChart');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = 300;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const prices = chartData.map(c => c[4]);
  const max = Math.max(...chartData.map(c => c[2]));
  const min = Math.min(...chartData.map(c => c[3]));
  const candleWidth = canvas.width / chartData.length * 0.7;

  // Draw Candles
  chartData.forEach((candle, i) => {
    const [time, open, high, low, close] = candle;
    const x = (i / chartData.length) * canvas.width + candleWidth/2;
    const yHigh = canvas.height - ((high - min) / (max - min)) * canvas.height;
    const yLow = canvas.height - ((low - min) / (max - min)) * canvas.height;
    const yOpen = canvas.height - ((open - min) / (max - min)) * canvas.height;
    const yClose = canvas.height - ((close - min) / (max - min)) * canvas.height;

    // Wick
    ctx.strokeStyle = close >= open? '#10b981' : '#ef4444';
    ctx.beginPath(); ctx.moveTo(x, yHigh); ctx.lineTo(x, yLow); ctx.stroke();

    // Body
    ctx.fillStyle = close >= open? '#10b981' : '#ef4444';
    ctx.fillRect(x - candleWidth/2, Math.min(yOpen, yClose), candleWidth, Math.abs(yOpen - yClose) || 1);
  });

  // NAYA: RSI Indicator
  if(showRSI){
    const rsi = calculateRSI(prices);
    ctx.fillStyle = '#0ea5e9';
    ctx.font = '12px sans-serif';
    ctx.fillText(`RSI: ${rsi.toFixed(2)}`, 10, 20);
  }

  // NAYA: MA Indicator
  if(showMA){
    const ma = prices.slice(-20).reduce((a,b)=>a+b)/20;
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    prices.forEach((p,i)=> {
      const x = (i / prices.length) * canvas.width;
      const y = canvas.height - ((p - min) / (max - min)) * canvas.height;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
  }
}

function switchCurrency(curr) { currentTradeCurrency = curr; const symbol = curr === "inr"? "₹" : "$"; document.getElementById('balanceDisplay').innerText = `${symbol}${tradeBalance.toFixed(2)}`; document.getElementById('currUsdt').style.background = curr === "usdt"? "#0ea5e9" : "transparent"; document.getElementById('currInr').style.background = curr === "inr"? "#0ea5e9" : "transparent"; }
function switchOrderType(type) { currentOrderType = type; document.getElementById('typeAmount').style.background = type === "amount"? "#0ea5e9" : "transparent"; document.getElementById('typeQty').style.background = type === "qty"? "#0ea5e9" : "transparent"; }
async function placeTrade(type) { /* same logic */ }
async function toggleAutoTrade(status) { autoTrade = status; document.getElementById('toggleSlider').style.background = status? "#10b981" : "#334155"; if(status){ autoTradeInterval = setInterval(()=>{}, 60000); } else { clearInterval(autoTradeInterval); } }
function calculateRSI(prices) { let gains=0,losses=0; for(let i=1;i<prices.length;i++){const d=prices[i]-prices[i-1]; if(d>0)gains+=d; else losses-=d;} const rs=gains/losses; return 100-(100/(1+rs)); }
