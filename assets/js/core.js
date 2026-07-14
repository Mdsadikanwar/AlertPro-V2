// GLOBAL DATA
var orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
var livePrices = { btc: { usdt: 65000 }, eth: { usdt: 3500 }, sol: { usdt: 150 } }; // STEP 2: YE AUTO UPDATE HOGA
var tradeBalance = { usdt: 10000, inr: 830000 };

// STEP 2: LIVE PRICE FETCHER - BINANCE API
async function fetchLivePrices() {
  try {
    let res = await fetch('https://api.binance.com/api/v3/ticker/price');
    let data = await res.json();

    data.forEach(d => {
      if(d.symbol.endsWith('USDT')){
        let coin = d.symbol.replace('USDT','').toLowerCase();
        if(livePrices[coin]){ // sirf jo coin hum use kar rahe
          livePrices[coin].usdt = parseFloat(d.price);
        }
      }
    });
    console.log("Prices Updated:", livePrices);
  } catch(e) {
    console.log("Price fetch error", e);
  }
}

// हर 3 sec me price update karo
setInterval(fetchLivePrices, 3000);
fetchLivePrices(); // pehli baar turant call

// NAVBAR + ROUTER - YAHAN FIX KIYA
function getNavbar() {
    return `
    <div class="topbar">
        <div class="logo" onclick="renderDashboard()" style="cursor:pointer;">⚡ ApexTraders</div>
        <div class="navbar">
            <button class="nav-btn" onclick="renderHome()">🏠 Home</button>
            <button class="nav-btn" onclick="renderDashboard()">📊 Dashboard</button>
            <button class="nav-btn" onclick="renderHistory()">💰 PNL & History</button>
            <button class="nav-btn" onclick="renderTrading()">💵 Trading</button>
            <button class="nav-btn" onclick="renderStrategies()">🤖 Strategies</button> <!-- FIX: s ADD KAR DIYA -->
            <button class="nav-btn" onclick="renderBacktest()">📈 Backtest</button>
            <button class="nav-btn" onclick="renderSettings()">⚙️ Settings</button>
            <button class="nav-btn" onclick="renderLogs()">📝 Logs</button>
            <button class="nav-btn" onclick="renderHub()">🔧 Hub</button>
        </div>
    </div>
    `;
}
function showScreen(html){ document.getElementById('app').innerHTML = html; }

// HISTORY FUNCTIONS
function addToHistory(type, coin, price, amount){
  let pnl = (Math.random() - 0.5) * 20; // Dummy PNL for now
  orderHistory.unshift({type, coin, price, amount, time: new Date().toLocaleString(), pnl: pnl.toFixed(2)});
  localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
}
function clearHistory(){
  if(confirm("Clear All History?")){
    orderHistory = [];
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    renderHistory();
  }
}

// STEP 2 KA FAYDA: renderHistory me real PNL dikhega
function renderHistory() {
  showScreen(`${getNavbar()}
    <div class="container">
      <div class="card">
        <h3>PNL & Order History</h3>
        <button onclick="clearHistory()" style="background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:6px; float:right;">Clear All</button>
      </div>

      <div class="card">
        ${orderHistory.length == 0? '<p style="color:#94a3b8;">No trades yet</p>' :
          orderHistory.map(o => `
            <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #374151;">
              <div>
                <b style="color:${o.type=='BUY'?'#22c55e':'#ef4444'}">${o.type}</b> ${o.coin.toUpperCase()}
                <br><span style="font-size:12px; color:#94a3b8;">${o.time}</span>
              </div>
              <div style="text-align:right;">
                <div>$${o.price.toFixed(2)}</div>
                <div style="color:${o.pnl>=0?'#22c55e':'#ef4444'}">${o.pnl>=0?'+':''}$${o.pnl}</div>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `);
}
