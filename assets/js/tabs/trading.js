let tradeBalance = { usdt: 1000, inr: 83000 };
let tradeHistory = JSON.parse(localStorage.getItem('tradeHistory') || "[]");
let autoTrade = false;
let autoTradeInterval;
let chartData = [];

function renderTrading() {
  try {
    showScreen(`
      ${getNavbar()}
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <div style="font-size:18px; font-weight:700;">Trading Panel</div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="font-size:11px; font-weight:600;">Auto</div>
            <label style="position:relative; display:inline-block; width:44px; height:24px;">
              <input type="checkbox" id="autoToggle" style="opacity:0; width:0; height:0;">
              <span id="toggleSlider" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#334155; border-radius:24px;"></span>
            </label>
          </div>
        </div>

        <div style="background:#1e293b; padding:15px; border-radius:10px; margin-bottom:15px;">
          <div style="color:#94a3b8; font-size:12px;">Balance</div>
          <div style="font-size:22px; font-weight:800;" id="balanceDisplay">$${tradeBalance.usdt.toFixed(2)}</div>
        </div>

        <div style="margin-bottom:15px;">
          <select id="tradeCoinSelect" style="width:100%; padding:10px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px;">
            <option value="btc">Bitcoin (BTC)</option>
            <option value="eth">Ethereum (ETH)</option>
            <option value="sol">Solana (SOL)</option>
            <option value="bnb">BNB (BNB)</option>
            <option value="xrp">XRP (XRP)</option>
          </select>
        </div>

        <!-- TIMEFRAME BUTTONS -->
        <div style="display:flex; gap:5px; margin-bottom:15px; overflow-x:auto;">
          <button class="tfBtn" data-tf="1d" style="padding:6px 10px; background:#0ea5e9; color:white; border:none; border-radius:6px; font-size:11px;">1D</button>
          <button class="tfBtn" data-tf="7d" style="padding:6px 10px; background:#334155; color:white; border:none; border-radius:6px; font-size:11px;">7D</button>
          <button class="tfBtn" data-tf="30d" style="padding:6px 10px; background:#334155; color:white; border:none; border-radius:6px; font-size:11px;">30D</button>
        </div>

        <!-- SIMPLE CHART - BINANCE HATA DIYA TEMP -->
        <div style="background:#0f172a; padding:10px; border-radius:10px; margin-bottom:15px; text-align:center; color:#94a3b8;">
          <canvas id="tradingChart" style="width:100%; height:250px;"></canvas>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <button id="buyBtn" style="background:#10b981; color:white; padding:14px; border:none; border-radius:8px; font-weight:700;">BUY</button>
          <button id="sellBtn" style="background:#ef4444; color:white; padding:14px; border:none; border-radius:8px; font-weight:700;">SELL</button>
        </div>
      </div>

      <div class="card" style="margin-top:15px;">
        <div style="font-size:16px; font-weight:700; margin-bottom:15px;">Order History</div>
        <div id="orderHistory">
          ${tradeHistory.length === 0? '<div style="color:#94a3b8; text-align:center;">No trades yet</div>' : ''}
        </div>
      </div>
    `);

    setupTradingEvents();
    drawDummyChart(); // Pehle dummy chart
  } catch(e) {
    console.error("Trading Error:", e);
    showScreen(`<div class="card"><h2>Error in Trading Tab</h2><p>${e.message}</p></div>`);
  }
}

function setupTradingEvents() {
  if(document.getElementById('buyBtn')) document.getElementById('buyBtn').onclick = () => alert("BUY Clicked");
  if(document.getElementById('sellBtn')) document.getElementById('sellBtn').onclick = () => alert("SELL Clicked");
  if(document.getElementById('autoToggle')) document.getElementById('autoToggle').onchange = (e) => {
    document.getElementById('toggleSlider').style.background = e.target.checked? "#10b981" : "#334155";
  }
  
  document.querySelectorAll('.tfBtn').forEach(btn => {
    btn.onclick = (e) => {
      document.querySelectorAll('.tfBtn').forEach(b => b.style.background = '#334155');
      e.target.style.background = '#0ea5e9';
      alert("Timeframe: " + e.target.dataset.tf);
    }
  });
}

function drawDummyChart() {
  const canvas = document.getElementById('tradingChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth; canvas.height = 250;
  ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 2; ctx.beginPath();
  ctx.moveTo(0, 200); ctx.lineTo(100, 150); ctx.lineTo(200, 180); ctx.lineTo(300, 100); ctx.stroke();
  ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif'; ctx.fillText("Demo Chart", 10, 20);
}
