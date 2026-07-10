let dashboardInterval;
let currentCoin = 'bitcoin';
let currentCurrency = 'usd';
let cooldown = 60;

const COIN_DATA = {
  'bitcoin': { symbol: 'BTC' },
  'ethereum': { symbol: 'ETH' },
  'binancecoin': { symbol: 'BNB' },
  'solana': { symbol: 'SOL' },
  'dogecoin': { symbol: 'DOGE' },
  'ripple': { symbol: 'XRP' },
  'cardano': { symbol: 'ADA' },
  'tron': { symbol: 'TRX' },
  'the-open-network': { symbol: 'TON' },
  'shiba-inu': { symbol: 'SHIB' }
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
          <option value="cardano">Cardano (ADA)</option>
          <option value="tron">TRON (TRX)</option>
          <option value="the-open-network">Toncoin (TON)</option>
          <option value="shiba-inu">Shiba Inu (SHIB)</option>
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

  // Event listeners
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
  fetchDashboardData(); // pehli baar
  startCountdown();
  
  clearInterval(dashboardInterval);
  dashboardInterval = setInterval(fetchDashboardData, cooldown * 1000); // 60s me repeat
}

function updatePairLabel() {
  const symbol = COIN_DATA[currentCoin].symbol;
  document.getElementById('pairLabel').textContent = symbol + '/' + currentCurrency.toUpperCase();
}

async function fetchDashboardData() {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${currentCoin}&vs_currencies=${currentCurrency}&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true`);
    
    if(!res.ok) throw new Error('API Failed');
    
    const data = await res.json();
    const d = data[currentCoin];

    const price = d[currentCurrency];
    const change = d[currentCurrency + '_24h_change'] || 0;
    const high = d[currentCurrency + '_24h_high'] || 0;
    const low = d[currentCurrency + '_24h_low'] || 0;

    let symbol = currentCurrency === 'inr'? '₹' : '$';
    
    document.getElementById('coinPrice').innerText = symbol + price.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('coinChange').innerHTML = (change >= 0? '▲ ' : '▼ ') + Math.abs(change).toFixed(2) + '% (24h)';
    document.getElementById('coinChange').className = 'price-change ' + (change >= 0? 'green' : 'red');
    
    document.getElementById('high24h').innerText = symbol + high.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('low24h').innerText = symbol + low.toLocaleString('en-US', {minimumFractionDigits: 2});

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
