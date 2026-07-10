let dashboardInterval;
let currentCoin = 'bitcoin';

const COIN_MAP = {
  'BTCUSDT': 'bitcoin',
  'ETHUSDT': 'ethereum', 
  'SOLUSDT': 'solana',
  'BNBUSDT': 'binancecoin'
}

async function render_dashboard() {
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
  currentCoin = document.getElementById('coin-select').value;
  const name = currentCoin.replace('USDT', '');
  document.getElementById('pair-name').innerText = name + '/USD';
  fetchDashboardData();
}

async function fetchDashboardData() {
  try {
    const coinId = COIN_MAP[currentCoin];
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`);
    const data = await res.json();
    const m = data.market_data;
    
    const price = m.current_price.usd;
    const change = m.price_change_percentage_24h;
    const high = m.high_24h.usd;
    const low = m.low_24h.usd;
    
    document.getElementById('btc-price').innerText = '$' + price.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('btc-change').innerHTML = (change >= 0 ? '▲ ' : '▼ ') + Math.abs(change).toFixed(2) + '% (24h)';
    document.getElementById('btc-change').className = 'price-change ' + (change >= 0 ? 'green' : 'red');
    document.getElementById('high-24h').innerText = '$' + high.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('low-24h').innerText = '$' + low.toLocaleString('en-US', {minimumFractionDigits: 2});
    
  } catch(e) { 
    console.log('API Error', e); 
    document.getElementById('btc-price').innerText = 'API Error';
  }
}

function stopDashboard() { clearInterval(dashboardInterval); }
