<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>AlertPro Auto Bot</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; overflow-x: hidden; }
    body { font-family: 'Inter', sans-serif; background: #0a0e1a; color: #e2e8f0; padding: 16px; }
.container { max-width: 600px; width: 100%; margin: 0 auto; }
.header { text-align: center; margin-bottom: 24px; }
.logo { font-size: 28px; font-weight: 800; margin-bottom: 8px; color: #10b981; }
.subtitle { color: #94a3b8; font-size: 13px; font-weight: 500; }
.card { background: rgba(19, 27, 46, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(30, 41, 59, 0.8); border-radius: 16px; padding: 20px; margin-bottom: 16px; }
.price-box { text-align: center; }
.price-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
.price-main { font-size: 42px; font-weight: 800; color: #f59e0b; line-height: 1; }
.price-change { font-size: 18px; margin-top: 12px; font-weight: 700; }
.green { color: #10b981; }
.red { color: #ef4444; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
.stat { background: rgba(15, 23, 42, 0.6); padding: 14px; border-radius: 12px; text-align: center; }
.stat-label { font-size: 11px; color: #64748b; margin-bottom: 6px; }
.stat-value { font-size: 20px; font-weight: 700; }
.toggle-row { display: flex; justify-content: space-between; align-items: center; margin: 12px 0; }
.toggle-label { font-size: 14px; font-weight: 600; }
.toggle { width: 50px; height: 26px; background: #334155; border-radius: 13px; position: relative; cursor: pointer; transition: 0.3s; }
.toggle.active { background: #10b981; }
.toggle-dot { width: 22px; height: 22px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.3s; }
.toggle.active .toggle-dot { left: 26px; }
.btn { width: 100%; padding: 14px; border: none; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; margin-top: 8px; }
.btn-buy { background: #10b981; color: white; }
.btn-sell { background: #ef4444; color: white; }
.btn-reset { background: #f59e0b; color: white; }
.btn-blue { background: #3b82f6; color: white; }
.btn:active { transform: scale(0.98); }
.input { width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 10px; color: #e2e8f0; margin: 8px 0; font-size: 14px; }
.log { background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; max-height: 200px; overflow-y: auto; font-size: 11px; font-family: monospace; }
.log-item { padding: 4px 0; border-bottom: 1px solid #1e293b; }
.tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.tab { flex: 1; min-width: 70px; padding: 10px; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 10px; text-align: center; font-size: 12px; font-weight: 600; cursor: pointer; }
.tab.active { background: #10b981; border-color: #10b981; color: white; }
.hidden { display: none; }
.hide { display: none; }
.select-row { display: flex; gap: 8px; margin-bottom: 12px; }
select.input { flex: 1; }
.status-banner { background: rgba(251, 191, 36, 0.15); border: 1px solid #fbbf24; padding: 8px; border-radius: 8px; margin-bottom: 12px; text-align: center; font-size: 12px; display: none; }
.sync-badge { font-size: 10px; color: #10b981; margin-left: 5px; }
.status-text { text-align: center; font-size: 12px; color: #10b981; margin-top: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🔔 AlertPro Auto Bot</div>
      <div class="subtitle">Multi-Coin Paper Trading + Live Signals <span class="sync-badge" id="syncStatus">☁️ Loading...</span></div>
    </div>
    <div class="status-banner" id="statusBanner">⚠️ API Error - Retrying...</div>

    <div class="tabs">
      <div class="tab active" onclick="showTab('dashboard', event)">Dashboard</div>
      <div class="tab" onclick="showTab('trading', event)">Trading</div>
      <div class="tab" onclick="showTab('strategies', event)">Strategies</div>
      <div class="tab" onclick="showTab('backtest', event)">Backtest</div>
      <div class="tab" onclick="showTab('settings', event)">Settings</div>
      <div class="tab" onclick="showTab('logs', event)">Logs</div>
    </div>

    <div id="dashboard">
      <div class="card">
        <div class="select-row">
          <select class="input" id="coinSelect" onchange="changeCoin()">
            <option value="bitcoin">Bitcoin (BTC)</option>
            <option value="ethereum">Ethereum (ETH)</option>
            <option value="binancecoin">BNB (BNB)</option>
            <option value="solana">Solana (SOL)</option>
            <option value="dogecoin">Dogecoin (DOGE)</option>
            <option value="ripple">XRP (XRP)</option>
          </select>
          <select class="input" id="currencySelect" onchange="updatePrices()" style="max-width: 100px;">
            <option value="usd">USD</option>
            <option value="inr">INR</option>
          </select>
        </div>
      </div>
      <div class="card price-box">
        <div class="price-label" id="pairLabel">BTC/USD</div>
        <div class="price-main" id="coinPrice">Loading...</div>
        <div class="price-change" id="coinChange">--</div>
        <div style="margin-top:8px;font-size:12px;color:#64748b;" id="countdown">Next Update: 60s</div>
        <div class="stats">
          <div class="stat"><div class="stat-label">24h High</div><div class="stat-value" id="high24h">--</div></div>
          <div class="stat"><div class="stat-label">24h Low</div><div class="stat-value" id="low24h">--</div></div>
        </div>
      </div>
    </div>

    <div id="trading" class="hidden"><div class="card"><h3>Trading Tab</h3></div></div>
    <div id="strategies" class="hidden"><div class="card"><h3>Strategies Tab</h3></div></div>
    <div id="backtest" class="hidden"><div class="card"><h3>Backtest Tab</h3></div></div>
    <div id="settings" class="hidden"><div class="card"><h3>Settings Tab</h3></div></div>
    <div id="logs" class="hidden"><div class="card"><h3>Logs Tab</h3></div></div>
  </div>

<script>
const STATE = { coinId: 'bitcoin', currency: 'usd' };
const COIN_DATA = {
  'bitcoin': { symbol: 'BTC' }, 'ethereum': { symbol: 'ETH' }, 'binancecoin': { symbol: 'BNB' },
  'solana': { symbol: 'SOL' }, 'dogecoin': { symbol: 'DOGE' }, 'ripple': { symbol: 'XRP' }
};
let fetchInterval;
let countdownInterval;
let cooldown = 60;

function showTab(tab, event) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  ['dashboard','trading','settings','logs','strategies','backtest'].forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById(tab).classList.remove('hidden');
}

function changeCoin() {
  STATE.coinId = document.getElementById('coinSelect').value;
  STATE.currency = document.getElementById('currencySelect').value;
  document.getElementById('pairLabel').textContent = COIN_DATA[STATE.coinId].symbol + '/' + STATE.currency.toUpperCase();
  fetchCoinData(); // coin change karte hi turant fetch
}

function updatePrices() {
  STATE.currency = document.getElementById('currencySelect').value;
  document.getElementById('pairLabel').textContent = COIN_DATA[STATE.coinId].symbol + '/' + STATE.currency.toUpperCase();
  fetchCoinData();
}

async function fetchCoinData() {
  try {
    document.getElementById('statusBanner').style.display = 'none';
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${STATE.coinId}&vs_currencies=${STATE.currency}&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true`);
    
    if(!res.ok) throw new Error('API Error');
    
    const data = await res.json();
    const d = data[STATE.coinId];
    
    const price = d[STATE.currency];
    const change = d[STATE.currency + '_24h_change'];
    const high = d[STATE.currency + '_24h_high'];
    const low = d[STATE.currency + '_24h_low'];
    
    let symbol = STATE.currency === 'inr' ? '₹' : '$';
    
    document.getElementById('coinPrice').innerText = symbol + price.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('coinChange').innerHTML = (change >= 0? '▲ ' : '▼ ') + Math.abs(change).toFixed(2) + '% (24h)';
    document.getElementById('coinChange').className = 'price-change ' + (change >= 0? 'green' : 'red');
    document.getElementById('high24h').innerText = symbol + high.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('low24h').innerText = symbol + low.toLocaleString('en-US', {minimumFractionDigits: 2});
    
  } catch(e) {
    console.log(e);
    document.getElementById('statusBanner').style.display = 'block';
    document.getElementById('coinPrice').innerText = 'Error';
  }
}

function startCountdown() {
  let time = cooldown;
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    time--;
    if(time < 0) time = cooldown;
    document.getElementById('countdown').innerText = 'Next Update: ' + time + 's';
  }, 1000);
}

// ========== INIT ==========
window.onload = function() {
  fetchCoinData();
  startCountdown();
  clearInterval(fetchInterval);
  fetchInterval = setInterval(fetchCoinData, cooldown * 1000); // 60s me auto update
  document.getElementById('syncStatus').textContent = '☁️ Synced';
}
</script>
</body>
</html>
