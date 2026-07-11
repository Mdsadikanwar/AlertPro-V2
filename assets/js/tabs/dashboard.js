const top10Coins = [
  {name: "Bitcoin", symbol: "BTC"},
  {name: "Ethereum", symbol: "ETH"},
  {name: "BNB", symbol: "BNB"},
  {name: "Solana", symbol: "SOL"},
  {name: "XRP", symbol: "XRP"},
  {name: "Dogecoin", symbol: "DOGE"},
  {name: "Toncoin", symbol: "TON"},
  {name: "Cardano", symbol: "ADA"},
  {name: "Avalanche", symbol: "AVAX"},
  {name: "Shiba Inu", symbol: "SHIB"}
];

let currentCoin = "BTC";
let currentCurrency = "USDT";

function renderDashboard() {
  showScreen(`
    ${getNavbar()}
    <div class="card">
      <!-- Selectors -->
      <div style="display:flex; gap:10px; margin-bottom:20px;">
        <select id="coinSelect" style="flex:1; padding:12px; background:#1e293b; color:white; border:1px solid #334155; border-radius:8px;">
          ${top10Coins.map(c => `<option value="${c.symbol}">${c.name} (${c.symbol})</option>`).join('')}
        </select>
        
        <select id="currencySelect" style="width:120px; padding:12px; background:#1e293b; color:white; border:1px solid #334155; border-radius:8px;">
          <option value="USDT">USDT</option>
          <option value="INR">INR</option>
        </select>
      </div>

      <!-- Price Section -->
      <div style="text-align:center;">
        <div style="color:#94a3b8; font-size:14px; margin-bottom:5px;">${currentCoin}/${currentCurrency}</div>
        <div class="price" id="livePrice">$63798.00</div>
        <div class="change" id="change24h">▲ 0.98% (24h)</div>
        <div style="margin:15px 0;">
          <span style="background:#10b981; padding:4px 12px; border-radius:6px; font-size:12px;">LIVE</span>
        </div>
      </div>

      <!-- 24h High Low -->
      <div style="display:flex; justify-content:space-between; margin-top:20px; padding-top:20px; border-top:1px solid #1e293b;">
        <div style="text-align:center;">
          <div style="color:#94a3b8; font-size:12px;">24h High</div>
          <div style="font-size:16px; font-weight:600;" id="high24h">$64554.00</div>
        </div>
        <div style="text-align:center;">
          <div style="color:#94a3b8; font-size:12px;">24h Low</div>
          <div style="font-size:16px; font-weight:600;" id="low24h">$62955.00</div>
        </div>
      </div>
    </div>
  `);

  // Event Listeners
  document.getElementById('coinSelect').value = currentCoin;
  document.getElementById('currencySelect').value = currentCurrency;

  document.getElementById('coinSelect').onchange = (e) => {
    currentCoin = e.target.value;
    updatePrice();
  }
  document.getElementById('currencySelect').onchange = (e) => {
    currentCurrency = e.target.value;
    updatePrice();
  }

  updatePrice(); // First load
}

function updatePrice() {
  // अभी के लिए dummy data है। बाद में API लगाएंगे
  const dummyPrice = (Math.random() * 50000 + 20000).toFixed(2);
  const dummyChange = (Math.random() * 4 - 2).toFixed(2);
  const dummyHigh = (parseFloat(dummyPrice) + 1000).toFixed(2);
  const dummyLow = (parseFloat(dummyPrice) - 1000).toFixed(2);
  const symbol = currentCurrency === "INR" ? "₹" : "$";

  document.getElementById('livePrice').innerText = `${symbol}${dummyPrice}`;
  document.getElementById('change24h').innerText = `${dummyChange >= 0 ? '▲' : '▼'} ${Math.abs(dummyChange)}% (24h)`;
  document.getElementById('change24h').style.color = dummyChange >= 0 ? '#10b981' : '#ef4444';
  document.getElementById('high24h').innerText = `${symbol}${dummyHigh}`;
  document.getElementById('low24h').innerText = `${symbol}${dummyLow}`;
  
  // Title update
  document.querySelector('.card div').innerText = `${currentCoin}/${currentCurrency}`;
}
