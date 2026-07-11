let tradeBalance = { usdt: 1000, inr: 83000 };
let tradeHistory = JSON.parse(localStorage.getItem('tradeHistory') || "[]");
let autoTrade = false;
let autoTradeInterval;
let chartData = [];
let currentStrategy = JSON.parse(localStorage.getItem('activeStrategy') || "null"); // Strategy tab से आएगा

function renderTrading() {
  showScreen(`
    ${getNavbar()}
    <div class="card">
      <!-- HEADER -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <div>
          <div style="font-size:18px; font-weight:700;">Trading</div>
          <div style="font-size:10px; color:#94a3b8;">${currentStrategy? `Strategy: ${currentStrategy.name}` : 'No Strategy Active'}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="text-align:right;">
            <div style="font-size:11px; font-weight:600;">Auto</div>
          </div>
          <label style="position:relative; display:inline-block; width:44px; height:24px;">
            <input type="checkbox" id="autoToggle" ${autoTrade? 'checked' : ''} style="opacity:0; width:0; height:0;">
            <span id="toggleSlider" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:${autoTrade? '#10b981' : '#334155'}; border-radius:24px; transition:0.3s;"></span>
          </label>
        </div>
      </div>

      <!-- BALANCE -->
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

      <!-- COIN + TIMEFRAME BUTTONS -->
      <div style="margin-bottom:10px;">
        <select id="tradeCoinSelect" style="width:100%; padding:10px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px; margin-bottom:10px;">
          ${top10Coins.map(c => `<option value="${c.symbol.toLowerCase()}">${c.name} (${c.symbol})</option>`).join('')}
        </select>
        <!-- NAYA: TIMEFRAME BUTTONS -->
        <div style="display:flex; gap:5px; overflow-x:auto;">
          ${['1m','15m','1h','4h','1d'].map(tf => `<button class="tfBtn" data-tf="${tf}" style="padding:6px 10px; background:#334155; color:white; border:none; border-radius:6px; font-size:11px;">${tf}</button>`).join('')}
        </div>
      </div>

      <!-- CANDLESTICK CHART -->
      <div style="background:#0f172a; padding:10px; border-radius:10px; margin-bottom:15px;">
        <canvas id="tradingChart" style="width:100%; height:320px;"></canvas>
      </div>

      <!-- ORDER PANEL -->
      <div style="margin-bottom:15px;">
        <div style="display:flex; gap:5px; background:#1e293b; padding:4px; border-radius:8px; margin-bottom:10px;">
          <button id="typeAmount" style="flex:1; padding:8px; border:none; border-radius:6px; background:#0ea5e9; color:white;">By Amount</button>
          <button id="typeQty" style="flex:1; padding:8px; border:none; border-radius:6px; background:transparent; color:#94a3b8;">By Qty</button>
        </div>
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
      <div id="orderHistory">${tradeHistory.map(h => `<div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #1e293b;"><div><div style="font-weight:600; color:${h.type === 'BUY'? '#10b981' : '#ef4444'};">${h.type} ${h.coin}</div><div style="font-size:11px; color:#94a3b8;">${h.time}</div></div><div style="text-align:right;"><div style="font-weight:600;">${h.amount} ${h.unit}</div><div style="font-size:11px; color:#94a3b8;">@${h.price}</div></div></div>`).join('')}</div>
    </div>
  `);

  setupTradingEvents();
  fetchChart('1d'); // Default 1d
}

let currentTradeCurrency = "usdt";
let currentOrderType = "amount";
let currentTimeframe = "1d";

function setupTradingEvents() {
  document.getElementById('buyBtn').onclick = () => placeTrade('BUY');
  document.getElementById('sellBtn').onclick = () => placeTrade('SELL');
  document.getElementById('currUsdt').onclick = () => switchCurrency('usdt');
  document.getElementById('currInr').onclick = () => switchCurrency('inr');
  document.getElementById('typeAmount').onclick = () => switchOrderType('amount');
  document.getElementById('typeQty').onclick = () => switchOrderType('qty');
  document.getElementById('autoToggle').onchange = (e) => toggleAutoTrade(e.target.checked);
  document.getElementById('tradeCoinSelect').onchange = () => fetchChart(currentTimeframe);

  // NAYA: Timeframe buttons
  document.querySelectorAll('.tfBtn').forEach(btn => {
    btn.onclick = (e) => {
      document.querySelectorAll('.tfBtn').forEach(b => b.style.background = '#334155');
      e.target.style.background = '#0ea5e9';
      fetchChart(e.target.dataset.tf);
    }
  });
}

// NAYA: BINANCE API FOR 1M, 15M, 1H, 4H CHART
async function fetchChart(timeframe) {
  currentTimeframe = timeframe;
  const symbol = document.getElementById('tradeCoinSelect').value + 'usdt'; // btcusdt

  const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${timeframe}&limit=100`);
  const data = await res.json();
  chartData = data.map(c => [c[0], parseFloat(c[1]), parseFloat(c[2]), parseFloat(c[3]), parseFloat(c[4])]); // [time, open, high, low, close]
  drawChart();
}

function drawChart() {
  const canvas = document.getElementById('tradingChart');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth; canvas.height = 320; ctx.clearRect(0, 0, canvas.width, canvas.height);

  const max = Math.max(...chartData.map(c => c[2]));
  const min = Math.min(...chartData.map(c => c[3]));
  const candleWidth = canvas.width / chartData.length * 0.6;

  chartData.forEach((candle, i) => {
    const [time, open, high, low, close] = candle;
    const x = (i / chartData.length) * canvas.width + candleWidth/2;
    const yHigh = canvas.height - ((high - min) / (max - min)) * canvas.height;
    const yLow = canvas.height - ((low - min) / (max - min)) * canvas.height;
    const yOpen = canvas.height - ((open - min) / (max - min)) * canvas.height;
    const yClose = canvas.height - ((close - min) / (max - min)) * canvas.height;

    ctx.strokeStyle = close >= open? '#10b981' : '#ef4444';
    ctx.beginPath(); ctx.moveTo(x, yHigh); ctx.lineTo(x, yLow); ctx.stroke();
    ctx.fillStyle = close >= open? '#10b981' : '#ef4444';
    ctx.fillRect(x - candleWidth/2, Math.min(yOpen, yClose), candleWidth, Math.abs(yOpen - yClose) || 1);
  });
}

// NAYA: AUTO TRADE - AB STRATEGY TAB SE SIGNAL LEGA
async function toggleAutoTrade(status) {
  autoTrade = status;
  document.getElementById('toggleSlider').style.background = status? "#10b981" : "#334155";

  if(status && currentStrategy){
    alert(`Auto Trade ON - Running: ${currentStrategy.name}`);
    autoTradeInterval = setInterval(runActiveStrategy, 60000); // 1 min check
  } else {
    clearInterval(autoTradeInterval);
    alert("Auto Trade OFF");
  }
}

async function runActiveStrategy() {
  if(!currentStrategy) return;
  const symbol = document.getElementById('tradeCoinSelect').value;
  // Yaha hum Strategy tab me save ki hui RSI/MA logic run karenge
  // Abhi ke liye dummy: agar RSI < 30 to BUY
  console.log("Checking strategy:", currentStrategy.name);
}

// बाकी function same
function switchCurrency(curr) { currentTradeCurrency = curr; const symbol = curr === "inr"? "₹" : "$"; document.getElementById('balanceDisplay').innerText = `${symbol}${tradeBalance.toFixed(2)}`; document.getElementById('currUsdt').style.background = curr === "usdt"? "#0ea5e9" : "transparent"; document.getElementById('currInr').style.background = curr === "inr"? "#0ea5e9" : "transparent"; }
function switchOrderType(type) { currentOrderType = type; document.getElementById('typeAmount').style.background = type === "amount"? "#0ea5e9" : "transparent"; document.getElementById('typeQty').style.background = type === "qty"? "#0ea5e9" : "transparent"; }
async function placeTrade(type) { alert(`${type} Order - Manual`); }
