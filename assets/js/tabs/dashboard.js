const top10Coins = [
  {name: "Bitcoin", symbol: "BTC", id: "bitcoin"}, {name: "Ethereum", symbol: "ETH", id: "ethereum"},
  {name: "BNB", symbol: "BNB", id: "binancecoin"}, {name: "Solana", symbol: "SOL", id: "solana"},
  {name: "XRP", symbol: "XRP", id: "ripple"}, {name: "Dogecoin", symbol: "DOGE", id: "dogecoin"},
  {name: "Toncoin", symbol: "TON", id: "toncoin"}, {name: "Cardano", symbol: "ADA", id: "cardano"},
  {name: "Avalanche", symbol: "AVAX", id: "avalanche-2"}, {name: "Shiba Inu", symbol: "SHIB", id: "shiba-inu"}
];

// UX FIX: LocalStorage से यूजर की पसंद लोड करना
let currentCoin = localStorage.getItem('currentCoin') || "bitcoin";
let currentCurrency = localStorage.getItem('currentCurrency') || "usd";
let currentTimeframe = localStorage.getItem('currentTimeframe') || "1d";
let priceTimeframe = localStorage.getItem('priceTimeframe') || "24h";
let countdown = 60;

// MEMORY LEAK FIX: टाइमर्स को ट्रैक करने के लिए ग्लोबल वैरिएबल्स
let countdownInterval;
let priceInterval;
let sentimentInterval;

function renderDashboard() {
  // पहले से चल रहे सभी पुराने टाइमर्स को साफ़ करना (Crucial Bug Fix)
  clearInterval(countdownInterval);
  clearInterval(priceInterval);
  clearInterval(sentimentInterval);

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

        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin:10px 0;">
          <div class="change" id="changePrice">--</div>
          <select id="priceTimeframeSelect" style="padding:4px 8px; background:#1e293b; color:white; border:1px solid #334155; border-radius:6px; font-size:12px;">
            <option value="15m">15m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="24h" selected>24h</option>
            <option value="7d">7d</option>
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
          <option value="1h">1 Hour</option>
          <option value="4h">4 Hour</option>
          <option value="1d" selected>1 Day</option>
          <option value="7d">7 Day</option>
        </select>
      </div>

      <!-- MARKET MOOD -->
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
          <div style="color:#94a3b8; font-size:11px;">RSI <span id="rsiTime">${currentTimeframe.toUpperCase()}</span></div>
          <div style="font-size:20px; font-weight:800;" id="rsiValue">--</div>
          <div style="font-size:10px;" id="rsiLabel">--</div>
        </div>
        <div style="background:#1e293b; padding:12px; border-radius:8px; grid-column: span 2;">
          <div style="color:#94a3b8; font-size:11px;">Market Cap Change <span id="mcapTime">24H</span></div>
          <div style="font-size:20px; font-weight:800;" id="marketCapChange">--%</div>
        </div>
      </div>
    </div>
  `);

  // सिलेक्टेड वैल्यूज सेट करना
  document.getElementById('coinSelect').value = currentCoin;
  document.getElementById('currencySelect').value = currentCurrency;
  document.getElementById('timeframeSelect').value = currentTimeframe;
  document.getElementById('priceTimeframeSelect').value = priceTimeframe;

  // इवेंट लिसनर्स और LocalStorage सेविंग लॉजिक
  document.getElementById('coinSelect').onchange = (e) => {
    currentCoin = e.target.value;
    localStorage.setItem('currentCoin', currentCoin);
    countdown = 60; 
    fetchPrice(); 
    fetchSentiment();
  };
  
  document.getElementById('currencySelect').onchange = (e) => {
    currentCurrency = e.target.value;
    localStorage.setItem('currentCurrency', currentCurrency);
    countdown = 60; 
    fetchPrice();
  };
  
  document.getElementById('timeframeSelect').onchange = (e) => {
    currentTimeframe = e.target.value;
    localStorage.setItem('currentTimeframe', currentTimeframe);
    document.getElementById('rsiTime').innerText = e.target.value.toUpperCase(); 
    fetchSentiment();
  };
  
  document.getElementById('priceTimeframeSelect').onchange = (e) => {
    priceTimeframe = e.target.value;
    localStorage.setItem('priceTimeframe', priceTimeframe);
    fetchPrice();
  };

  // इनिशियल फेच और इंटरवल मैनेजमेंट (Fix)
  fetchPrice();
  fetchSentiment();
  priceInterval = setInterval(fetchPrice, 60000);
  sentimentInterval = setInterval(fetchSentiment, 300000);
  startCountdown();
}

function startCountdown() {
  countdown = 60;
  countdownInterval = setInterval(() => {
    countdown--; 
    if(countdown < 0) countdown = 60;
    const timerEl = document.getElementById('cooldownTimer');
    if(timerEl){
      timerEl.innerText = `Next update in ${countdown}s`;
      timerEl.style.background = countdown <= 10 ? '#ef4444' : '#f59e0b';
    }
  }, 1000);
}

async function fetchPrice() {
  const coin = top10Coins.find(c => c.id === currentCoin);
  const symbol = currentCurrency === "inr" ? "₹" : "$";
  const currencyName = currentCurrency === "inr" ? "INR" : "USDT";
  
  const pairTitleEl = document.getElementById('pairTitle');
  const livePriceEl = document.getElementById('livePrice');
  if (pairTitleEl) pairTitleEl.innerText = `${coin.symbol}/${currencyName}`;
  if (livePriceEl) livePriceEl.innerText = "Loading..."; 
  
  countdown = 60;
  
  try {
    // API URL FIX: अतिरिक्त टाइमफ्रेम डेटा फेच करने के लिए पैरामीटर जोड़ा गया है
    const url = `https://coingecko.com{currentCurrency}&ids=${currentCoin}&price_change_percentage=1h,24h,7d`;
    const res = await fetch(url); 
    if (!res.ok) throw new Error("API Limit");
    const data = await res.json(); 
    const coinData = data[0];
    
    if(livePriceEl) livePriceEl.innerText = `${symbol}${coinData.current_price.toLocaleString('en-IN')}`;

    // डायनामिक चेंज की-मैपिंग फिक्स
    let changeKey = `price_change_percentage_24h_in_currency`;
    if(priceTimeframe === "1h") changeKey = `price_change_percentage_1h_in_currency`;
    if(priceTimeframe === "7d") changeKey = `price_change_percentage_7d_in_currency`;
    
    const changeVal = coinData[changeKey] || coinData.price_change_percentage_24h || 0;
    const change = changeVal.toFixed(2);
    
    const changePriceEl = document.getElementById('changePrice');
    if(changePriceEl) {
      changePriceEl.innerText = `${change >= 0 ? '▲' : '▼'} ${Math.abs(change)}%`;
      changePriceEl.style.color = change >= 0 ? '#10b981' : '#ef4444';
    }

    const highEl = document.getElementById('high24h');
    const lowEl = document.getElementById('low24h');
    const updateEl = document.getElementById('lastUpdate');
    
    if(highEl) highEl.innerText = `${symbol}${coinData.high_24h.toLocaleString('en-IN')}`;
    if(lowEl) lowEl.innerText = `${symbol}${coinData.low_24h.toLocaleString('en-IN')}`;
    if(updateEl) updateEl.innerText = `Last Update: ${new Date().toLocaleTimeString()}`;
  } catch (error) { 
    if(livePriceEl) livePriceEl.innerText = "Rate Limit / Error"; 
  }
}

// COMPLETELY FIXED + DYNAMIC MARKET MOOD
async function fetchSentiment() {
  try {
    // 1. FEAR & GREED API Implementation
    const fngRes = await fetch('https://alternative.me');
    const fngData = await fngRes.json();
    const fngValue = parseInt(fngData.data[0].value);
