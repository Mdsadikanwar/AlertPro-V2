let dashboardInterval;
let currentCoin = 'bitcoin';

const DEMO_DATA = {
  'bitcoin': { name: 'Bitcoin', price: 67234.50, change: 1.78, high: 68100.20, low: 66100.00 },
  'ethereum': { name: 'Ethereum', price: 3421.80, change: -0.45, high: 3480.00, low: 3390.50 },
  'solana': { name: 'Solana', price: 142.30, change: 3.21, high: 145.00, low: 138.20 },
  'binancecoin': { name: 'BNB', price: 512.40, change: 0.89, high: 518.00, low: 505.10 }
}

async function render_dashboard() {
  const content = document.getElementById('tab-content');
  content.innerHTML = `
    <div class="filter-row">
      <select class="input" id="coin-select">
        <option value="bitcoin">Bitcoin (BTC)</option>
        <option value="ethereum">Ethereum (ETH)</option>
        <option value="solana">Solana (SOL)</option>
        <option value="binancecoin">BNB (BNB)</option>
      </select>
      <select class="input small">
        <option>USD</option>
      </select>
    </div>

    <div class="price-card">
      <div class="price-pair" id="pair-name">Bitcoin/USD</div>
      <div class="price-main" id="btc-price">Loading...</div>
      <div class="price-change" id="btc-change">--</div>
      <div>Active: <span class="active-badge">Live</span></div>

      <div class="stats-row">
        <div class="stat">
          <div class="stat-label">24h High</div>
          <div class="stat-value" id="high-24h">--</div>
        </div>
        <div class="stat">
          <div class="stat-label">24h Low</div>
          <div class="stat-value" id="low-24h">--</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('coin-select').addEventListener('change', (e)=>{
    currentCoin = e.target.value;
    const name = DEMO_DATA[currentCoin].name;
    document.getElementById('pair-name').innerText = name + '/USD';
    updateUI();
  });

  updateUI();
  dashboardInterval = setInterval(updateUI, 3000); // 3 sec में price हिलेगा
}

function updateUI() {
  const d = DEMO_DATA[currentCoin];
  
  // थोड़ा price ऊपर नीचे कर देंगे live जैसा लगे
  const randomChange = (Math.random() - 0.5) * 50;
  const price = d.price + randomChange;
  
  document.getElementById('btc-price').innerText = '$' + price.toLocaleString('en-US', {minimumFractionDigits: 2});
  document.getElementById('btc-change').innerHTML = (d.change >= 0? '▲ ' : '▼ ') + Math.abs(d.change).toFixed(2) + '% (24h)';
  document.getElementById('btc-change').className = 'price-change ' + (d.change >= 0? 'green' : 'red');
  document.getElementById('high-24h').innerText = '$' + d.high.toLocaleString('en-US', {minimumFractionDigits: 2});
  document.getElementById('low-24h').innerText = '$' + d.low.toLocaleString('en-US', {minimumFractionDigits: 2});
}

function stopDashboard() { clearInterval(dashboardInterval); }
