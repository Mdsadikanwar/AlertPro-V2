// Top 10 Coins List (Base symbols and names)
const cryptoCoins = [
  { name: "Bitcoin", code: "BTC", icon: "🪙", cgId: "bitcoin" },
  { name: "Ethereum", code: "ETH", icon: "🔷", cgId: "ethereum" },
  { name: "Solana", code: "SOL", icon: "☀️", cgId: "solana" },
  { name: "Binance Coin", code: "BNB", icon: "🟡", cgId: "binancecoin" },
  { name: "Ripple", code: "XRP", icon: "✖️", cgId: "ripple" },
  { name: "Cardano", code: "ADA", icon: "🔵", cgId: "cardano" },
  { name: "Dogecoin", code: "DOGE", icon: "🐕", cgId: "dogecoin" },
  { name: "Shiba Inu", code: "SHIB", icon: "🐕‍🦺", cgId: "shiba-inu" },
  { name: "Avalanche", code: "AVAX", icon: "🔺", cgId: "avalanche-2" },
  { name: "Polkadot", code: "DOT", icon: "🔴", cgId: "polkadot" }
];

// Current States
let selectedCoinCode = "BTC";
let selectedCurrency = "USDT"; 
let selectedTimeframeHours = "24"; // Default 24 hours (Options: 1, 4, 12, 24)
let cooldownTime = 60; // Set default cooldown to 60 seconds to avoid CoinGecko block
let priceIntervalId = null; 

// Crypto Dashboard render function
function renderCryptoDashboard() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <!-- Filter Controls Row -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
        <div>
          <h2 style="color: #38bdf8; margin: 0;">Crypto Live Dashboard</h2>
        </div>
        
        <!-- DROPDOWNS CONTAINER -->
        <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
          
          <!-- COIN SELECTOR -->
          <div style="display: flex; align-items: center; gap: 8px; background: #1e293b; padding: 8px 12px; border-radius: 8px; border: 1px solid #38bdf8;">
            <span style="color: #94a3b8; font-size: 13px;">Coin:</span>
            <select id="coinSelector" onchange="updateCryptoFilters()" style="background: #0f172a; color: #fff; border: 1px solid #4b5563; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-weight: bold; outline: none;">
              ${cryptoCoins.map(coin => `
                <option value="${coin.code}" ${coin.code === selectedCoinCode ? 'selected' : ''}>
                  ${coin.icon} ${coin.name} (${coin.code})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- CURRENCY SELECTOR -->
          <div style="display: flex; align-items: center; gap: 8px; background: #1e293b; padding: 8px 12px; border-radius: 8px; border: 1px solid #38bdf8;">
            <span style="color: #94a3b8; font-size: 13px;">Pair:</span>
            <select id="currencySelector" onchange="updateCryptoFilters()" style="background: #0f172a; color: #fff; border: 1px solid #4b5563; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-weight: bold; outline: none;">
              <option value="USDT" ${selectedCurrency === 'USDT' ? 'selected' : ''}>🇺🇸 USDT</option>
              <option value="INR" ${selectedCurrency === 'INR' ? 'selected' : ''}>🇮🇳 INR</option>
            </select>
          </div>

        </div>
      </div>

      <!-- MAIN ALL-IN-ONE CARD -->
      <div style="background: #1e293b; border: 2px solid #38bdf8; border-radius: 16px; padding: 30px; text-align: center; max-width: 550px; margin: 30px auto; box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.5);">
        
        <!-- Live Price Heading -->
        <span id="priceLabel" style="color: #94a3b8; font-size: 16px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">
          ${selectedCoinCode} / ${selectedCurrency} LIVE PRICE
        </span>
        
        <!-- Big Price Display -->
        <h1 id="livePriceValue" style="color: #22c55e; font-size: 52px; margin: 15px 0 5px 0; font-family: monospace;">
          Loading...
        </h1>

        <!-- % Change Indicator -->
        <div style="margin-bottom: 25px;">
          <span id="priceChangeLabel" style="font-size: 16px; font-weight: bold; padding: 4px 10px; border-radius: 6px; background: rgba(255,255,255,0.05);">
            --%
          </span>
        </div>

        <!-- Timeframe & Cooldown Controls inside the Card -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: #0f172a; padding: 12px 20px; border-radius: 10px; border: 1px solid #334155; margin-bottom: 20px; gap: 10px; flex-wrap: wrap;">
          
          <!-- TIMEFRAME DROPDOWN -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #94a3b8; font-size: 13px;">Timeframe:</span>
            <select id="timeframeSelector" onchange="updateTimeframe(this.value)" style="background: #1e293b; color: #fff; border: 1px solid #4b5563; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px; outline: none;">
              <option value="1" ${selectedTimeframeHours === '1' ? 'selected' : ''}>1 Hour</option>
              <option value="4" ${selectedTimeframeHours === '4' ? 'selected' : ''}>4 Hours</option>
              <option value="12" ${selectedTimeframeHours === '12' ? 'selected' : ''}>12 Hours</option>
              <option value="24" ${selectedTimeframeHours === '24' ? 'selected' : ''}>24 Hours</option>
            </select>
          </div>

          <!-- COOLDOWN REFRESH TIME -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #94a3b8; font-size: 13px;">Refresh:</span>
            <div style="display: flex; align-items: center; background: #1e293b; padding: 4px 8px; border-radius: 6px; border: 1px solid #4b5563;">
              <input type="number" id="cooldownInput" value="${cooldownTime}" min="10" max="300" onchange="updateCooldown(this.value)" style="background: none; border: none; color: #fff; width: 35px; font-weight: bold; font-size: 14px; outline: none; text-align: center;">
              <span style="color: #94a3b8; font-size: 12px; margin-left: 2px;">s</span>
            </div>
          </div>

        </div>

        <!-- High / Low Metrics Row -->
        <div style="display: flex; justify-content: space-around; background: #0f172a; padding: 15px; border-radius: 10px; border: 1px solid #334155;">
          <div>
            <span id="highLabel" style="color: #64748b; font-size: 11px; display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">▲ ${selectedTimeframeHours}H HIGH</span>
            <span id="highPriceValue" style="color: #22c55e; font-weight: bold; font-family: monospace; font-size: 16px;">Loading...</span>
          </div>
          <div style="border-left: 1px solid #334155;"></div>
          <div>
            <span id="lowLabel" style="color: #64748b; font-size: 11px; display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">▼ ${selectedTimeframeHours}H LOW</span>
            <span id="lowPriceValue" style="color: #ef4444; font-weight: bold; font-family: monospace; font-size: 16px;">Loading...</span>
          </div>
        </div>

      </div>

    </div>
  `;

  // Start fetching live price
  startLivePriceStream();
}

// Function to fetch price data, High/Low and % Change dynamically based on timeframe
function fetchLivePrice() {
  const activeCoin = cryptoCoins.find(coin => coin.code === selectedCoinCode);
  if (!activeCoin) return;

  const cgId = activeCoin.cgId;
  const targetCurrency = selectedCurrency.toLowerCase();
  const apiCurrency = targetCurrency === 'usdt' ? 'usd' : 'inr';

  // CoinGecko Market Chart API using historical points to calculate High/Low for 1h, 4h, 12h, 24h
  fetch(`https://api.coingecko.com/api/v3/coins/${cgId}/market_chart?vs_currency=${apiCurrency}&days=1`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status} (Likely Rate Limited)`);
      }
      return response.json();
    })
    .then(data => {
      if (data && data.prices) {
        const pricesList = data.prices; // Array of [timestamp, price]
        
        // Filter prices based on selected timeframe hours
        const now = Date.now();
        const cutoffTime = now - (parseInt(selectedTimeframeHours) * 60 * 60 * 1000);
        const filteredPrices = pricesList.filter(item => item[0] >= cutoffTime).map(item => item[1]);

        if (filteredPrices.length === 0) return;

        // Current price is the latest item in the list
        const currentPrice = pricesList[pricesList.length - 1][1];
        
        // Calculate dynamic High & Low for selected timeframe
        const highPrice = Math.max(...filteredPrices);
        const lowPrice = Math.min(...filteredPrices);

        // Calculate % Change over selected timeframe
        const initialPrice = filteredPrices[0];
        const priceChangePct = ((currentPrice - initialPrice) / initialPrice) * 100;

        const currencySymbol = selectedCurrency === "INR" ? "₹ " : "$ ";
        
        // Formatter Helper
        const formatNum = (num) => {
          if (!num) return "N/A";
          return num < 1 
            ? num.toFixed(6) 
            : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        // DOM update
        const priceElement = document.getElementById('livePriceValue');
        const highElement = document.getElementById('highPriceValue');
        const lowElement = document.getElementById('lowPriceValue');
        const changeElement = document.getElementById('priceChangeLabel');

        if (priceElement) priceElement.innerText = currencySymbol + formatNum(currentPrice);
        if (highElement) highElement.innerText = currencySymbol + formatNum(highPrice);
        if (lowElement) lowElement.innerText = currencySymbol + formatNum(lowPrice);

        if (changeElement) {
          const sign = priceChangePct >= 0 ? "+" : "";
          changeElement.innerText = `${sign}${priceChangePct.toFixed(2)}% (${selectedTimeframeHours}h)`;
          changeElement.style.color = priceChangePct >= 0 ? "#22c55e" : "#ef4444";
        }
      }
    })
    .catch(error => {
      console.error("Price fetch error:", error);
      const priceElement = document.getElementById('livePriceValue');
      if (priceElement) {
        // If Rate limited, display a helpful tip to the user
        priceElement.innerText = "API Rate Limit";
        priceElement.style.fontSize = "38px";
      }
    });
}

// Start auto fetching price stream
function startLivePriceStream() {
  if (priceIntervalId) {
    clearInterval(priceIntervalId);
  }

  fetchLivePrice();
  priceIntervalId = setInterval(fetchLivePrice, cooldownTime * 1000);
}

// Handler for dropdown changes
function updateCryptoFilters() {
  selectedCoinCode = document.getElementById('coinSelector').value;
  selectedCurrency = document.getElementById('currencySelector').value;
  
  resetLoadingUI();
  startLivePriceStream();
}

// Handler for Timeframe Dropdown
function updateTimeframe(val) {
  selectedTimeframeHours = val;
  
  // Update UI Labels inside card instantly
  const highLbl = document.getElementById('highLabel');
  const lowLbl = document.getElementById('lowLabel');
  if (highLbl) highLbl.innerText = `▲ ${selectedTimeframeHours}H HIGH`;
  if (lowLbl) lowLbl.innerText = `▼ ${selectedTimeframeHours}H LOW`;

  resetLoadingUI();
  startLivePriceStream();
}

// Handler for Cooldown modification
function updateCooldown(val) {
  let numVal = parseInt(val);
  if (isNaN(numVal) || numVal < 10) numVal = 10; // Minimum limit raised to 10s
  if (numVal > 300) numVal = 300;
  
  cooldownTime = numVal;
  startLivePriceStream();
}

// Quick UI Reset helper
function resetLoadingUI() {
  const labelElement = document.getElementById('priceLabel');
  if (labelElement) {
    labelElement.innerText = `${selectedCoinCode} / ${selectedCurrency} LIVE PRICE`;
  }
  const priceElement = document.getElementById('livePriceValue');
  const highElement = document.getElementById('highPriceValue');
  const lowElement = document.getElementById('lowPriceValue');
  const changeElement = document.getElementById('priceChangeLabel');

  if (priceElement) {
    priceElement.innerText = "Loading...";
    priceElement.style.fontSize = "52px"; // Restore size
  }
  if (highElement) highElement.innerText = "Loading...";
  if (lowElement) lowElement.innerText = "Loading...";
  if (changeElement) {
    changeElement.innerText = "--%";
    changeElement.style.color = "#94a3b8";
  }
}
