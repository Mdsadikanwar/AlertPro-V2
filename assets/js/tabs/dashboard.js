let dashboardInterval;
let currentCoin = 'bitcoin';
let cooldown = 60;

async function render_dashboard() {
  const content = document.getElementById('tab-content');
  content.innerHTML = `
    <div class="filter-row">
      <select class="input" id="coin-select">
        <option value="bitcoin">Bitcoin (BTC)</option>
        <option value="ethereum">Ethereum (ETH)</option>
        <option value="solana">Solana (SOL)</option>
        <option value="binancecoin">BNB (BNB)</option>
        <option value="ripple">XRP (XRP)</option>
      </select>
      <select class="input small"><option>USD</option></select>
    </div>

    <div class="price-card">
      <div class="price-pair" id="pair-name">BTC/USD</div>
      <div class="price-main" id="btc-price">Loading...</div>
      <div class="price-change" id="btc-change">--</div>
      <div style="margin-top:8px; font-size:14px; color:#aaa;">Next Update: <span id="cooldown-timer">${cooldown}s</span></div>

      <div class="stats-row">
        <div class="stat"><div class="stat-label">24h High</div><div class="stat-value" id="high-24h">--</div></div>
        <div class="stat"><div class="stat-label">24h Low</div><div class="stat-value" id="low-24h">--</div></div>
      </div>
    </div>
  `;

  document.getElementById('coin-select').addEventListener('change', (e)=>{
    currentCoin = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text.split(' ')[0];
    document.getElementById('pair-name').innerText = name + '/USD';
    fetchDashboardData();
  });

  fetchDashboardData();
  startCooldown();
  dashboardInterval = setInterval(fetchDashboardData, cooldown * 1000);
}

async function fetchDashboardData() {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${currentCoin}&vs_currencies=usd&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true`);
    
    if(!res.ok) throw new Error('API Failed'); // अगर 429 आया तो
    
    const data = await res.json();
    const d = data[currentCoin];

    if(!d) throw new Error('Coin Data Missing');

    const price = d.usd;
    const change = d.usd_24h_change || 0;
    const high = d.usd_24h_high || 0;
    const low = d.usd_24h_low || 0;

    document.getElementById('btc-price').innerText = '$' + price.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('btc-change').innerHTML = (change >= 0? '▲ ' : '▼ ') + Math.abs(change).toFixed(2) + '% (24h)';
    document.getElementById('btc-change').className = 'price-change ' + (change >= 0? 'green' : 'red');
    
    document.getElementById('high-24h').innerText = '$' + high.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('low-24h').innerText = '$' + low.toLocaleString('en-US', {minimumFractionDigits: 2});

  } catch(e) { 
    console.log('API Error', e);
    document.getElementById('btc-price').innerText = 'Fetching...'; // Error की जगह Loading
    document.getElementById('btc-change').innerText = '--';
    document.getElementById('high-24h').innerText = '--';
    document.getElementById('low-24h').innerText = '--';
  }
}

function startCooldown() {
  let time = cooldown;
  setInterval(() => {
    time--;
    if(time < 0) time = cooldown;
    document.getElementById('cooldown-timer').innerText = time + 's';
  }, 1000);
}

function stopDashboard() { 
  clearInterval(dashboardInterval); 
}
