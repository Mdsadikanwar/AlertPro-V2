let dashboardInterval;
let currentCoin = 'bitcoin';
let currentCurrency = 'usd';
let cooldown = 60;

const COIN_DATA = {
  'bitcoin': { symbol: 'BTC' }, 'ethereum': { symbol: 'ETH' },
  'binancecoin': { symbol: 'BNB' }, 'solana': { symbol: 'SOL' },
  'dogecoin': { symbol: 'DOGE' }, 'ripple': { symbol: 'XRP' },
  'cardano': { symbol: 'ADA' }, 'tron': { symbol: 'TRX' },
  'the-open-network': { symbol: 'TON' }, 'shiba-inu': { symbol: 'SHIB' }
};

async function render_dashboard() {
  const content = document.getElementById('tab-content');
  content.innerHTML = `
    <div class="card">
      <div class="select-row">
        <select class="input" id="coinSelect">
          <option value="bitcoin">Bitcoin (BTC)</option>
          <option value="ethereum">Ethereum (ETH)</option>
          <option value="binancecoin">BNB (BNB)</option>
          <option value="solana">Solana (SOL)</option>
          <option value="dogecoin">Dogecoin (DOGE)</option>
          <option value="ripple">XRP (XRP)</option>
        </select>
        <select class="input" id="currencySelect" style="max-width: 120px;">
          <option value="usd">USD</option>
          <option value="inr">INR</option>
        </select>
      </div>
    </div>

    <div class="card price-box">
      <div class="price-label" id="pairLabel">BTC/USD</div>
      <div class="price-main" id="coinPrice">Loading...</div>
      <div class="price-change" id="coinChange">--</div>
      <div style="margin-top:8px;font-size:12px;color:#64748b;" id="countdown">Cooldown: 60s</div>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-label">24h High</div>
          <div class="stat-value" id="high24h">--</div>
        </div>
        <div class="stat">
          <div class="stat-label">24h Low</div>
          <div class="stat-value" id="low24h">--</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('coinSelect').value = currentCoin;
  document.getElementById('currencySelect').value = currentCurrency;
  
  document.getElementById('coinSelect').addEventListener('change', (e)=>{
    currentCoin = e.target.value;
    updatePairLabel();
    fetchDashboardData();
  });

  document.getElementById('currencySelect').addEventListener('change', (e)=>{
    currentCurrency = e.target.value;
    updatePairLabel();
    fetchDashboardData();
  });

  updatePairLabel();
  fetchDashboardData();
  startCountdown();
  
  clearInterval(dashboardInterval);
  dashboardInterval = setInterval(fetchDashboardData, cooldown * 1000);
}

function updatePairLabel() {
  const symbol = COIN_DATA[currentCoin].symbol;
  document.getElementById('pairLabel').textContent = symbol + '/' + currentCurrency.toUpperCase();
}

// YAHI WALA FIX HAI 👇
async function fetchDashboardData() {
  try {
    // NAYA API: coins/markets - isme high low sahi aata hai
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&ids=${currentCoin}&price_change_percentage=24h`);
    
    if(!res.ok) throw new Error('API Failed');
    
    const data = await res.json();
    const d = data[0];

    const price = d.current_price;
    const change = d.price_change_percentage_24h || 0;
    const high = d.high_24h || 0;
    const low = d.low_24h || 0;

    let symbol = currentCurrency === 'inr'? '₹' : '$';
    
    document.getElementById('coinPrice').innerText = symbol + price.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('coinChange').innerHTML = (change >= 0? '▲ ' : '▼ ') + Math.abs(change).toFixed(2) + '% (24h)';
    document.getElementById('coinChange').className = 'price-change ' + (change >= 0? 'green' : 'red');
    
    document.getElementById('high24h').innerText = symbol + high.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('low24h').innerText = symbol + low.toLocaleString('en-IN', {minimumFractionDigits: 2});

  } catch(e) { 
    console.log('API Error', e);
    document.getElementById('coinPrice').innerText = 'Error';
  }
}

function startCountdown() {
  let time = cooldown;
  setInterval(() => {
    time--;
    if(time < 0) time = cooldown;
    const countdownEl = document.getElementById('countdown');
    if(countdownEl) countdownEl.innerText = 'Cooldown: ' + time + 's';
  }, 1000);
}

function stopDashboard() { 
  clearInterval(dashboardInterval); 
}
