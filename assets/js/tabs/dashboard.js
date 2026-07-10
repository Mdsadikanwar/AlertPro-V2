let dashboardInterval;
let currentSymbol = 'BTCUSDT';

async function render_dashboard() {
  document.getElementById('top-tabs').classList.remove('hidden');
  const content = document.getElementById('tab-content');
  content.innerHTML = `
    <div class="filter-row">
      <select class="input" id="coin-select" onchange="changeCoin()">
        <option value="BTCUSDT">Bitcoin (BTC)</option>
        <option value="ETHUSDT">Ethereum (ETH)</option>
        <option value="SOLUSDT">Solana (SOL)</option>
        <option value="BNBUSDT">BNB (BNB)</option>
      </select>
      <select class="input small">
        <option>USD</option>
      </select>
    </div>

    <div class="price-card">
      <div class="price-pair" id="pair-name">BTC/USD</div>
      <div class="price-main" id="btc-price">Loading...</div>
      <div class="price-change" id="btc-change">--</div>
      <div>Active: <span class="active-badge">hlw</span></div>
      
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
  
  fetchDashboardData();
  dashboardInterval = setInterval(fetchDashboardData, 5000);
}

function changeCoin() {
  currentSymbol = document.getElementById('coin-select').value;
  const name = currentSymbol.replace('USDT', '');
  document.getElementById('pair-name').innerText = name + '/USD';
  fetchDashboardData();
}

async function fetchDashboardData() {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${currentSymbol}`);
    const data = await res.json();
    
    const price = parseFloat(data.lastPrice).toLocaleString('en-US', {minimumFractionDigits: 2});
    const change = parseFloat(data.priceChangePercent).toFixed(2);
    const high = parseFloat(data.highPrice).toLocaleString('en-US', {minimumFractionDigits: 2});
    const low = parseFloat(data.lowPrice).toLocaleString('en-US', {minimumFractionDigits: 2});
    
    document.getElementById('btc-price').innerText = '$' + price;
    document.getElementById('btc-change').innerHTML = (change >= 0 ? '▲ ' : '▼ ') + Math.abs(change) + '% (24h)';
    document.getElementById('btc-change').className = 'price-change ' + (change >= 0 ? 'green' : 'red');
    document.getElementById('high-24h').innerText = '$' + high;
    document.getElementById('low-24h').innerText = '$' + low;
    
  } catch(e) { console.log('API Error', e); }
}

function stopDashboard() { clearInterval(dashboardInterval); }
