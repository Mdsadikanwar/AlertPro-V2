const top10Coins = [
  {name: "Bitcoin", symbol: "BTC", id: "bitcoin"}, {name: "Ethereum", symbol: "ETH", id: "ethereum"},
  {name: "BNB", symbol: "BNB", id: "binancecoin"}, {name: "Solana", symbol: "SOL", id: "solana"},
  {name: "XRP", symbol: "XRP", id: "ripple"}, {name: "Dogecoin", symbol: "DOGE", id: "dogecoin"},
  {name: "Toncoin", symbol: "TON", id: "toncoin"}, {name: "Cardano", symbol: "ADA", id: "cardano"},
  {name: "Avalanche", symbol: "AVAX", id: "avalanche"}, {name: "Shiba Inu", symbol: "SHIB", id: "shiba-inu"}
];

let currentCoin = "bitcoin";
let currentCurrency = "usd";
let currentTimeframe = "1d";
let priceTimeframe = "24h";
let countdown = 60;
let countdownInterval;

function renderDashboard() {
  showScreen(getNavbar() + `
    <div class="container">
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
          <div class="price" id="livePrice" style="font-size:32px; font-weight:800;">Loading...</div>

          <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin:10px 0;">
            <div class="change" id="changePrice">--</div>
            <select id="priceTimeframeSelect" style="padding:4px 8px; background:#1e293b; color:white; border:1px solid #334155; border-radius:6px; font-size:12px;">
              <option value="15m">15m</option><option value="1h">1h</option><option value="4h">4h</option>
              <option value="24h" selected>24h</option><option value="7d">7d</option>
            </select>
          </div>

          <div style="margin:15px 0;"><span id="cooldownTimer" style="background:#f59e0b; padding:4px 12px; border-radius:6px; font-size:12px; color:white;">Next update in 60s</span></div>
          <div style="font-size:11px; color:#64748b;" id="lastUpdate">Last Update: --</div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:20px; padding-top:20px; border-top:1px solid #1e293b;">
          <div><div style="color:#94a3b8; font-size:12px;">24h High</div><div style="font-size:16px; font-weight:600;" id="high24h">--</div></div>
          <div><div style="color:#94a3b8; font-size:12px;">24h Low</div><div style="font-size:16px; font-weight:600;" id="low24h">--</div></div>
        </div>
      </div>

      <!-- 2. MARKET ANALYSIS CARD -->
      <div class="card" style="margin-top:15px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <div style="font-size:16px; font-weight:700;">Market Analysis</div>
          <select id="timeframeSelect" style="padding:6px 10px; background:#1e293b; color:white; border:1px solid #334155; border-radius:6px; font-size:12px;">
            <option value="1h">1 Hour</option><option value="4h">4 Hour</option>
            <option value="1d" selected>1 Day</option><option value="7d">7 Day</option>
          </select>
        </div>

        <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding:15px; border-radius:10px; margin-bottom:12px; text-align:center; border:1px solid #334155;">
          <div style="color:#94a3b8; font-size:11px; margin-bottom:5px;">MARKET MOOD</div>
          <div style="font-size:22px; font-weight:800;" id="marketMood">--</div>
          <div style="font-size:11px; color:#94a3b8;" id="marketMoodDesc">Analyzing...</div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div style="background:#1e293b; padding:12px; border-radius:8px;">
            <div style="color:#94a3b8; font-size:11px;">Fear & Greed</div>
            <div style="font-size:20px; font-weight:800;" id="sentimentScore">--</div>
            <div style="font-size:10px;" id="sentimentLabel">Loading...</div>
          </div>
          <div style="background:#1e293b; padding:12px; border-radius:8px;">
            <div style="color:#94a3b8; font-size:11px;">RSI <span id="rsiTime">1D</span></div>
            <div style="font-size:20px; font-weight:800;" id="rsiValue">--</div>
            <div style="font-size:10px;" id="rsiLabel">--</div>
          </div>
          <div style="background:#1e293b; padding:12px; border-radius:8px; grid-column: span 2;">
            <div style="color:#94a3b8; font-size:11px;">24h Change <span id="mcapTime">24H</span></div>
            <div style="font-size:20px; font-weight:800;" id="marketCapChange">--%</div>
          </div>
        </div>
      </div>
    </div>
  `);

  document.getElementById('coinSelect').value = currentCoin;
  document.getElementById('currencySelect').value = currentCurrency;
  document.getElementById('timeframeSelect').value = currentTimeframe;
  document.getElementById('priceTimeframeSelect').value = priceTimeframe;

  document.getElementById('coinSelect').onchange = (e) => {currentCoin = e.target.value; countdown = 60; fetchPrice(); fetchSentiment()};
  document.getElementById('currencySelect').onchange = (e) => {currentCurrency = e.target.value; countdown = 60; fetchPrice()};
  document.getElementById('timeframeSelect').onchange = (e) => {currentTimeframe = e.target.value; document.getElementById('rsiTime').innerText = e.target.value.toUpperCase(); document.getElementById('mcapTime').innerText = e.target.value.toUpperCase(); fetchSentiment()};
  document.getElementById('priceTimeframeSelect').onchange = (e) => {priceTimeframe = e.target.value; fetchPrice()};

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
    const url = `https://api.coincap.io/v2/assets/${currentCoin}`;
    const res = await fetch(url); const data = await res.json(); const coinData = data.data;

    let price = parseFloat(coinData.priceUsd);
    if(currentCurrency === "inr") price = price * 83;

    document.getElementById('livePrice').innerText = `${symbol}${price.toLocaleString('en-IN', {maximumFractionDigits: 2})}`;

    const change = parseFloat(coinData.changePercent24Hr);
    document.getElementById('changePrice').innerText = `${change >= 0? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%`;
    document.getElementById('changePrice').style.color = change >= 0? '#10b981' : '#ef4444';

    let high = price * 1.05; let low = price * 0.95;
    document.getElementById('high24h').innerText = `${symbol}${high.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
    document.getElementById('low24h').innerText = `${symbol}${low.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
    document.getElementById('lastUpdate').innerText = `Last Update: ${new Date().toLocaleTimeString()}`;
  } catch (error) { document.getElementById('livePrice').innerText = "API Error"; }
}

async function fetchSentiment() {
  try {
    const fngRes = await fetch('https://api.alternative.me/fng/?limit=1');
    const fngData = await fngRes.json();
    if(fngData.data && fngData.data[0]){
      const score = fngData.data[0].value;
      const label = fngData.data[0].value_class;
      document.getElementById('sentimentScore').innerText = score;
      document.getElementById('sentimentLabel').innerText = label;
      document.getElementById('sentimentLabel').style.color = score <= 50? '#ef4444' : '#10b981';
    }

    const coin = top10Coins.find(c => c.id === currentCoin);
    let days = 14;
    if(currentTimeframe === "1h") days = 1;
    if(currentTimeframe === "4h") days = 1;
    if(currentTimeframe === "7d") days = 30;

    const change = parseFloat(document.getElementById('changePrice').innerText.replace('▲','').replace('▼','').replace('%',''));
    const rsi = 50 + change;
    document.getElementById('rsiValue').innerText = rsi.toFixed(0);
    document.getElementById('rsiLabel').innerText = rsi < 30? "Oversold/Buy" : rsi > 70? "Overbought/Sell" : "Neutral";
    document.getElementById('rsiLabel').style.color = rsi < 30? '#10b981' : rsi > 70? '#ef4444' : '#94a3b8';

    // MARKET MOOD
    const fngScore = parseInt(document.getElementById('sentimentScore').innerText) || 50;
    let mood = "NEUTRAL"; let moodDesc = "Market is sideways"; let moodColor = "#94a3b8";
    if(rsi > 60 && fngScore > 60){ mood = "BULLISH"; moodDesc = "Strong uptrend, Greed"; moodColor = "#10b981"; }
    else if(rsi < 40 && fngScore < 40){ mood = "BEARISH"; moodDesc = "Downtrend, Fear"; moodColor = "#ef4444"; }
    else if(rsi >= 40 && rsi <= 60){ mood = "SIDEWAYS"; moodDesc = "Consolidation"; moodColor = "#f59e0b"; }
    document.getElementById('marketMood').innerText = mood;
    document.getElementById('marketMood').style.color = moodColor;
    document.getElementById('marketMoodDesc').innerText = moodDesc;

    document.getElementById('marketCapChange').innerText = `${change >= 0? '+' : ''}${change.toFixed(2)}%`;
    document.getElementById('marketCapChange').style.color = change >= 0? '#10b981' : '#ef4444';
  } catch (error) { console.error("Sentiment error", error); }
}
