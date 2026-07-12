// ===== TRADING TAB - NO DUPLICATE VARIABLES =====
function renderTrading() { 
  showScreen(`${getNavbar()}
    <div class="container">
      <h2>📈 Trading Terminal</h2>
      <div class="trading-grid">
        <div class="card">
          <h3>Chart</h3>
          <canvas id="chart" width="800" height="400"></canvas>
        </div>
        <div class="card">
          <h3>Balance</h3>
          <div id="balance-ui">Loading...</div>
          <button onclick="placeTrade('BUY')" class="btn-buy">BUY</button>
          <button onclick="placeTrade('SELL')" class="btn-sell">SELL</button>
        </div>
      </div>
    </div>
  `);
  
  setupTradingEvents(); 
  fetchChart(1); 
  updateBalanceUI();
}

// DHYAN: yahan let currentCoin etc MAT LIKHNA
// wo core.js me pehle se hain

async function fetchChart(days) {
  // tera chart wala code yahan
  console.log("Fetching chart for", currentCoin);
}

function setupTradingEvents() {
  // tera events wala code
}

function placeTrade(type) {
  // tera buy/sell wala code
  alert(type + " order placed for " + currentCoin);
}

function updateBalanceUI() {
  document.getElementById('balance-ui').innerHTML = `
    USDT: ${tradeBalance.usdt} <br>
    INR: ${tradeBalance.inr}
  `;
}
