let dashboardInterval;
let currentCoin = 'bitcoin';
let currentCurrency = 'usd';

const COIN_DATA = {
  'bitcoin': { symbol: 'BTC', cgId: 'bitcoin' }, 'ethereum': { symbol: 'ETH', cgId: 'ethereum' },
  'binancecoin': { symbol: 'BNB', cgId: 'binancecoin' }, 'solana': { symbol: 'SOL', cgId: 'solana' },
  'dogecoin': { symbol: 'DOGE', cgId: 'dogecoin' }, 'ripple': { symbol: 'XRP', cgId: 'ripple' },
  'cardano': { symbol: 'ADA', cgId: 'cardano' }, 'tron': { symbol: 'TRX', cgId: 'tron' },
  'the-open-network': { symbol: 'TON', cgId: 'the-open-network' }, 'shiba-inu': { symbol: 'SHIB', cgId: 'shiba-inu' }
};

async function render_dashboard() {
  const content = document.getElementById('tab-content');
  content.innerHTML = `
    <div class="card">
      <div class="select-row">
        <select class="input" id="coinSelect" onchange="changeCoin()">
          ${Object.keys(COIN_DATA).map(id => `<option value="${id}">${COIN_DATA[id].symbol}</option>`).join('')}
        </select>
        <select class="input" id="currencySelect" onchange="changeCurrency()" style="max-width: 100px;">
          <option value="usd">USD</option>
          <option value="inr">INR</option>
        </select>
      </div>
    </div>
    <div class="card price-box">
      <div class="price-label" id="pairLabel">BTC/USD</div>
      <div class="price-main" id="coinPrice">$0.00</div>
      <div class="price-change" id="coinChange">Loading...</div>
      <div class="stats">
        <div class="stat"><div class="stat-label">24h High</div><div class="stat-value" id="high24h">$0</div></div>
        <div class="stat"><div class="stat-label">24h Low</div><div class="stat-value" id="low24h">$0</div></div>
      </div>
    </div>
  `;
  document.getElementById('coinSelect').value = currentCoin;
  document.getElementById('currencySelect').value = currentCurrency;
  fetchDashboardData();
  dashboardInterval = setInterval(fetchDashboardData, 60000);
}

async function fetchDashboardData() {
  try {
    document.getElementById('statusBanner').style.display = 'none';
    let url = `https://api.coingecko.com/api/v3/coins/${COIN_DATA[currentCoin].cgId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;
    let res = await fetch(url);
    const data = await res.json();
    const m = data.market_data;
    const price = m.current_price[currentCurrency];
    const high = m.high_24h[currentCurrency];
    const low = m.low_24h[currentCurrency];
    const change = m.price_change_percentage_24h;
    const symbol = currentCurrency === 'usd'? '$' : '₹';

    document.getElementById('pairLabel').textContent = COIN_DATA[currentCoin].symbol + '/' + currentCurrency.toUpperCase();
    document.getElementById('coinPrice').textContent = symbol + price.toFixed(2);
    document.getElementById('coinChange').textContent = (change >= 0? '▲ ' : '▼ ') + Math.abs(change).toFixed(2) + '% (24h)';
    document.getElementById('coinChange').className = 'price-change ' + (change >= 0? 'green' : 'red');
    document.getElementById('high24h').textContent = symbol + high.toFixed(2);
    document.getElementById('low24h').textContent = symbol + low.toFixed(2);
  } catch(e) {
    document.getElementById('statusBanner').style.display = 'block';
    document.getElementById('coinChange').textContent = 'API Error';
  }
}

function changeCoin() {
  currentCoin = document.getElementById('coinSelect').value;
  fetchDashboardData();
}
function changeCurrency() {
  currentCurrency = document.getElementById('currencySelect').value;
  fetchDashboardData();
}
function stopDashboard() { clearInterval(dashboardInterval); }
