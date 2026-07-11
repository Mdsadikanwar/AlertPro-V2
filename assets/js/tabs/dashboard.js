const top10Coins = [
  {name: "Bitcoin", symbol: "BTC", id: "bitcoin"},
  {name: "Ethereum", symbol: "ETH", id: "ethereum"},
  {name: "BNB", symbol: "BNB", id: "binancecoin"},
  {name: "Solana", symbol: "SOL", id: "solana"},
  {name: "XRP", symbol: "XRP", id: "ripple"},
  {name: "Dogecoin", symbol: "DOGE", id: "dogecoin"},
  {name: "Toncoin", symbol: "TON", id: "toncoin"},
  {name: "Cardano", symbol: "ADA", id: "cardano"},
  {name: "Avalanche", symbol: "AVAX", id: "avalanche-2"},
  {name: "Shiba Inu", symbol: "SHIB", id: "shiba-inu"}
];

let currentCoin = "bitcoin";
let currentCurrency = "usd";
let lastFetchTime = 0;

function renderDashboard() {
  showScreen(`
    ${getNavbar()}
    <div class="card">
      <div style="display:flex; gap:10px; margin-bottom:20px;">
        <select id="coinSelect" style="flex:1; padding:12px; background:#1e293b; color:white; border:1px solid #334155; border-radius:8px; font-size:14px;">
          ${top10Coins.map(c => `<option value="${c.id}">${c.name} (${c.symbol})</option>`).join('')}
        </select>

        <select id="currencySelect" style="width:120px; padding:12px; background:#1e293b; color:white; border:1px solid #334155; border-radius:8px; font-size:14px;">
          <option value="usd">USDT</option>
          <option value="inr">INR</option>
        </select>
      </div>

      <div style="text-align:center;">
        <div style="color:#94a3b8; font-size:14px; margin-bottom:5px;" id="pairTitle">BTC/USDT</div>
        <div class="price" id="livePrice">Loading...</div>
        <div class="change" id="change24h">--</div>
        <div style="margin:15px 0;">
          <span style="background:#10b981; padding:4px 12px; border-radius:6px; font-size:12px;">LIVE</span>
        </div>
        <div style="margin:10px 0; font-size:11px; color:#64748b;" id="lastUpdate">Last Update: --</div>
      </div>

      <div style="display:flex; justify-content:space-between; margin-top:20px; padding-top:20px; border-top:1px solid #1e293b;">
        <div style="text-align:center;">
          <div style="color:#94a3b8; font-size:12px;">24h High</div>
          <div style="font-size:16px; font-weight:600;" id="high24h">--</div>
        </div>
        <div style="text-align:center;">
          <div style="color:#94a3b8; font-size:12px;">24h Low</div>
          <div style="font-size:16px; font-weight:600;" id="low24h">--</div>
        </div>
      </div>
    </div>
  `);

  document.getElementById('coinSelect').value = currentCoin;
  document.getElementById('currencySelect').value = currentCurrency;

  document.getElementById('coinSelect').onchange = (e) => {
    currentCoin = e.target.value;
    lastFetchTime = 0;
    fetchPrice();
  }
  document.getElementById('currencySelect').onchange = (e) => {
    currentCurrency = e.target.value;
    lastFetchTime = 0;
    fetchPrice();
  }

  fetchPrice();
  setInterval(fetchPrice, 60000);
}

async function fetchPrice() {
  const now = Date.now();
  if (now - lastFetchTime < 60000) return;
  lastFetchTime = now;

  const coin = top10Coins.find(c => c.id === currentCoin);
  const symbol = currentCurrency === "inr"? "₹" : "$";
  const currencyName = currentCurrency === "inr"? "INR" : "USDT";

  document.getElementById('pairTitle').innerText = `${coin.symbol}/${currencyName}`;
  document.getElementById('livePrice').innerText = "Loading...";

  // PROXY LIST - 2 backup
  const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${currentCoin}&vs_currencies=${currentCurrency}&include_24hr_change=true&include_24hr_high_low=true`;
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`
  ];

  for (let proxyUrl of proxies) {
    try {
      const res = await fetch(proxyUrl);
      const data = await res.json();
      const coinData = data[currentCoin];

      const price = coinData[currentCurrency].toLocaleString('en-IN');
      const change = coinData[`${currentCurrency}_24h_change`].toFixed(2);
      const high = coinData[`${currentCurrency}_24h_high`].toLocaleString('en-IN');
      const low = coinData[`${currentCurrency}_24h_low`].toLocaleString('en-IN');

      document.getElementById('livePrice').innerText = `${symbol}${price}`;
      document.getElementById('change24h').innerText = `${change >= 0? '▲' : '▼'} ${Math.abs(change)}% (24h)`;
      document.getElementById('change24h').style.color = change >= 0? '#10b981' : '#ef4444';
      document.getElementById('high24h').innerText = `${symbol}${high}`;
      document.getElementById('low24h').innerText = `${symbol}${low}`;
      document.getElementById('lastUpdate').innerText = `Last Update: ${new Date().toLocaleTimeString()}`;
      return; // success, exit loop

    } catch (error) {
      console.log("Proxy failed, trying next...", error);
    }
  }
  
  // agar dono proxy fail
  document.getElementById('livePrice').innerText = "Error fetching data";
  document.getElementById('livePrice').style.color = "#ef4444";
}
