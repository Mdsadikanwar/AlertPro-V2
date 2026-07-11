const top10Coins = [
  {name: "Bitcoin", symbol: "BTC", id: "bitcoin"}, {name: "Ethereum", symbol: "ETH", id: "ethereum"},
  {name: "BNB", symbol: "BNB", id: "binancecoin"}, {name: "Solana", symbol: "SOL", id: "solana"},
  {name: "XRP", symbol: "XRP", id: "ripple"}, {name: "Dogecoin", symbol: "DOGE", id: "dogecoin"},
  {name: "Toncoin", symbol: "TON", id: "toncoin"}, {name: "Cardano", symbol: "ADA", id: "cardano"},
  {name: "Avalanche", symbol: "AVAX", id: "avalanche-2"}, {name: "Shiba Inu", symbol: "SHIB", id: "shiba-inu"}
];

let currentCoin = "bitcoin";
let currentCurrency = "usd";
let currentTimeframe = "1d";
let countdown = 60;
let countdownInterval;

function renderDashboard() {
  showScreen(`
    ${getNavbar()}

    <!-- 1. PRICE CARD -->
    <div class="card">
      <div style="display:flex; gap:10px; margin-bottom:20px;">
        <select id="coinSelect" style="flex:1; padding:12px; background:#1e293b; color:white; border:1px solid #334155; border-radius:8px;">
          ${top10Coins.map(c => `<option value="${c.id}">${c.name} (${c.symbol})</option>`).join('')}
        </select>
        <select id="currencySelect" style="width:100px; padding:12px; background:#1e293b; color:white; border:1px solid #334155; border-radius:8px;">
          <option value="usd">USDT</option><option value="inr">INR</option>
        </select>
      </div>

      <div style="text-align:center;">
        <div style="color:#94a3b8; font-size:14px; margin-bottom:5px;" id="pairTitle">BTC/USDT</div>
        <div class="price" id="livePrice">Loading...</div>
        <div class="change" id="change24h">--</div>
        <div style="margin:15px 0;"><span id="cooldownTimer" style="background:#f59e0b; padding:4px 12px; border-radius:6px; font-size:12px; color:white;">Next update in 60s</span></div>
        <div style="font-size:11px; color:#64748b;" id="lastUpdate">Last Update: --</div>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:20px; padding-top:20px; border-top:1px solid #1e293b;">
        <div><div style="color:#94a3b8; font-size:12px;">24h High</div><div style="font-size:16px; font-weight:600;" id="high24h">--</div></div>
        <div><div style="color:#94a3b8; font-size:12px;">24h Low</div><div style="font-size:16px; font-weight:600;" id="low24h">--</div></div>
      </div>
    </div>

    <!-- 2. ADVANCED SENTIMENT CARD -->
    <div class="card" style="margin-top:15px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <div style="font-size:16px; font-weight:700;">Market Analysis</div>
        <select id="timeframeSelect" style="padding:6px 10px; background:#1e293b; color:white; border:1px solid #334155; border-radius:6px; font-size:12px;">
          <option value="1h">1 Hour</option>
          <option value="4h">4 Hour</option>
          <option value="1d" selected>1 Day</option>
          <option value="7d">7 Day</option>
        </select>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <!-- Fear & Greed -->
        <div style="background:#1e293b; padding:12px; border-radius:8px;">
          <div style="color:#94a3b8; font-size:11px;">Fear & Greed</div>
          <div style="font-size:20px; font-weight:800;" id="sentimentScore">--</div>
          <div style="font-size:10px;" id="sentimentLabel">--</div>
        </div>
        <!-- RSI -->
        <div style="background:#1e293b; padding:12px; border-radius:8px;">
          <div style="color:#94a3b8; font-size:11px;">RSI <span id="rsiTime">1D</span></div>
          <div style="font-size:20px; font-weight:800;" id="rsiValue">--</div>
          <div style="font-size:10px;" id="rsiLabel">--</div>
        </div>
        <!-- Market Cap Change - NAYA -->
        <div style="background:#1e293b; padding:12px; border-radius:8px; grid-column: span 2;">
          <div style="color:#94a3b8; font-size:11px;">Total Market Cap Change <span id="mcapTime">24H</span></div>
          <div style="font-size:20px; font-weight:800;" id="marketCapChange">--%</div>
        </div>
      </div>
    </div>
  `);

  document.getElementById('coinSelect').value = currentCoin;
  document.getElementById('currencySelect').value = currentCurrency;
  document.getElementById('timeframeSelect').value = currentTimeframe;

  document.getElementById('coinSelect').onchange = (e) => {currentCoin = e.target.value; countdown = 60; fetchPrice(); fetchSentiment()};
  document.getElementById('currencySelect').onchange = (e) => {currentCurrency = e.target.value; countdown = 60; fetchPrice()};
  document.getElementById('timeframeSelect').onchange = (e) => {currentTimeframe = e.target.value; document.getElementById('rsiTime').innerText = e.target.value.toUpperCase(); document.getElementById('mcapTime').innerText = e.target.value.toUpperCase(); fetchSentiment()};

  fetchPrice();
  fetchSentiment();
  setInterval(fetchPrice, 60000);
  setInterval(fetchSentiment, 300000);
  startCountdown();
}

function startCountdown() {
  clearInterval(countdownInterval);
  countdown = 60;
  countdownInterval = setInterval(() => {
    countdown--; if(countdown < 0) countdown = 60;
    const timerEl = document.getElementById('cooldownTimer');
    if(timerEl){
      timerEl.innerText = `Next update in ${countdown}s`;
      timerEl.style.background = countdown <= 10? '#ef4444' : '#f59e0b';
    }
  }, 1000);
}

async function fetchPrice() {
  const coin = top10Coins.find(c => c.id === currentCoin);
  const symbol = currentCurrency === "inr"? "₹" : "$";
  const currencyName = currentCurrency === "inr"? "INR" : "USDT";
  document.getElementById('pairTitle').innerText = `${coin.symbol}/${currencyName}`;
  document.getElementById('livePrice').innerText = "Loading..."; countdown = 60;
  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&ids=${currentCoin}&price_change_percentage=24h`;
    const res = await fetch(url); const data = await res.json(); const coinData = data[0];
    document.getElementById('livePrice').innerText = `${symbol}${coinData.current_price.toLocaleString('en-IN')}`;
    const change = coinData.price_change_percentage_24h.toFixed(2);
    document.getElementById('change24h').innerText = `${change >= 0? '▲' : '▼'} ${Math.abs(change)}% (24h)`;
    document.getElementById('change24h').style.color = change >= 0? '#10b981' : '#ef4444';
    document.getElementById('high24h').innerText = `${symbol}${coinData.high_24h.toLocaleString('en-IN')}`;
    document.getElementById('low24h').innerText = `${symbol}${coinData.low_24h.toLocaleString('en-IN')}`;
    document.getElementById('lastUpdate').innerText = `Last Update: ${new Date().toLocaleTimeString()}`;
  } catch (error) { document.getElementById('livePrice').innerText = "Error"; }
}

// ADVANCED SENTIMENT WITH TIMEFRAME
async function fetchSentiment() {
  try {
    // 1. Fear & Greed - same
    const fngRes = await fetch('https://api.alternative.me/fng/');
    const fngData = await fngRes.json();
    const score = fngData.data[0].value;
    document.getElementById('sentimentScore').innerText = score;
    document.getElementById('sentimentLabel').innerText = fngData.data[0].value_class;
    document.getElementById('sentimentLabel').style.color = score <= 50? '#ef4444' : '#10b981';

    // 2. RSI + Market Cap Change based on timeframe
    const coin = top10Coins.find(c => c.id === currentCoin);
    let days = 1, interval = 'hourly';
    if(currentTimeframe === "1h") { days = 1; interval = 'hourly'; }
    if(currentTimeframe === "4h") { days = 1; interval = 'hourly'; }
    if(currentTimeframe === "1d") { days = 14; interval = 'daily'; }
    if(currentTimeframe === "7d") { days = 30; interval = 'daily'; }

    const chartRes = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=${currentCurrency}&days=${days}`);
    const chartData = await chartRes.json();
    const prices = chartData.prices.map(p => p[1]);
    const marketCaps = chartData.market_caps.map(p => p[1]);

    // RSI Calculate
    const rsi = calculateRSI(prices);
    document.getElementById('rsiValue').innerText = rsi.toFixed(2);
    document.getElementById('rsiLabel').innerText = rsi < 30? "Oversold/Buy" : rsi > 70? "Overbought/Sell" : "Neutral";
    document.getElementById('rsiLabel').style.color = rsi < 30? '#10b981' : rsi > 70? '#ef4444' : '#94a3b8';

    // Market Cap Change Calculate
    let pointsToCheck = currentTimeframe === "1h"? 4 : currentTimeframe === "4h"? 4 : currentTimeframe === "1d"? 1 : 7;
    const oldCap = marketCaps[marketCaps.length - pointsToCheck - 1][1];
    const newCap = marketCaps[marketCaps.length - 1][1];
    const mcapChange = ((newCap - oldCap) / oldCap) * 100;
    document.getElementById('marketCapChange').innerText = `${mcapChange >= 0? '+' : ''}${mcapChange.toFixed(2)}%`;
    document.getElementById('marketCapChange').style.color = mcapChange >= 0? '#10b981' : '#ef4444';

  } catch (error) { console.error("Sentiment error", error); }
}

function calculateRSI(prices) {
  let gains = 0, losses = 0;
  for(let i = 1; i < prices.length; i++){
    const diff = prices[i] - prices[i-1];
    if(diff > 0) gains += diff; else losses -= diff;
  }
  const avgGain = gains / (prices.length-1);
  const avgLoss = losses / (prices.length-1);
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}
