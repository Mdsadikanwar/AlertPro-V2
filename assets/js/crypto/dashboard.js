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
let selectedCurrency = "USDT"; // Default currency
let selectedTimeframe = "15m"; // Default timeframe
let cooldownTime = 5; // Default cooldown in seconds
let priceIntervalId = null; // Storing interval reference to clear it

// Crypto Dashboard render function
function renderCryptoDashboard() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <!-- Welcome & Filter Controls Row -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
        <div>
          <h2 style="color: #38bdf8; margin: 0;">Crypto Live Dashboard</h2>
        </div>
        
        <!-- DROPDOWNS & TIMEFRAME CONTAINER -->
        <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
          
          <!-- 1. COIN SELECTOR DROPDOWN -->
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

          <!-- 2. CURRENCY SELECTOR (USDT / INR) DROPDOWN -->
          <div style="display: flex; align-items: center; gap: 8px; background: #1e293b; padding: 8px 12px; border-radius: 8px; border: 1px solid #38bdf8;">
            <span style="color: #94a3b8; font-size: 13px;">Pair:</span>
            <select id="currencySelector" onchange="updateCryptoFilters()" style="background: #0f172a; color: #fff; border: 1px solid #4b5563; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-weight: bold; outline: none;">
              <option value="USDT" ${selectedCurrency === 'USDT' ? 'selected' : ''}>🇺🇸 USDT</option>
              <option value="INR" ${selectedCurrency === 'INR' ? 'selected' : ''}>🇮🇳 INR</option>
            </select>
          </div>

        </div>
      </div>

      <!-- Live Dashboard Card Grid -->
      <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 30px;">
        
        <!-- MAIN PRICE CARD -->
        <div style="flex: 2; min-width: 300px; background: #1e293b; border: 2px solid #38bdf8; border-radius: 12px; padding: 30px 20px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
          <span id="priceLabel" style="color: #94a3b8; font-size: 18px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">
            ${selectedCoinCode} / ${selectedCurrency} LIVE PRICE
          </span>
          
          <h1 id="livePriceValue" style="color: #22c55e; font-size: 48px; margin: 15px 0; font-family: monospace;">
            Loading...
          </h1>

          <!-- High / Low Metrics Row -->
          <div style="display: flex; justify-content: space-around; background: #0f172a; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #374151;">
            <div>
              <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 5px;">▲ 24H HIGH</span>
              <span id="highPriceValue" style="color: #22c55e; font-weight: bold; font-family: monospace; font-size: 16px;">Loading...</span>
            </div>
            <div style="border-left: 1px solid #374151;"></div>
            <div>
              <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 5px;">▼ 24H LOW</span>
              <span id="lowPriceValue" style="color: #ef4444; font-weight: bold; font-family: monospace; font-size: 16px;">Loading...</span>
            </div>
          </div>
        </div>

        <!-- CONTROLS & SETTINGS SIDE CARD -->
        <div style="flex: 1; min-width: 250px; background: #1e293b; border: 1px solid #374151; border-radius: 12px; padding: 25px; display: flex; flex-direction: column; justify-content: space-between;">
          
          <!-- TIMEFRAME SELECTOR -->
          <div>
            <h4 style="color: #94a3b8; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Select Timeframe</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 25px;">
              ${['1m', '5m', '15m', '1h', '4h', '1D'].map(tf => `
                <button onclick="setTimeframe('${tf}')" style="padding: 8px; border-radius: 6px; border: 1px solid #4b5563; background: ${tf === selectedTimeframe ? '#38bdf8' : '#0f172a'}; color: ${tf === selectedTimeframe ? '#0f172a' : '#fff'}; font-weight: bold; cursor: pointer; transition: 0.2s;">
                  ${tf}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- COOLDOWN SETTINGS -->
          <div>
            <h4 style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Refresh Cooldown</h4>
            <div style="display: flex; align-items: center; gap: 10px; background: #0f172a; padding: 8px 12px; border-radius: 6px; border: 1px solid #4b5563;">
              <input type="number" id="cooldownInput" value="${cooldownTime}" min="2" max="60" onchange="updateCooldown(this.value)" style="background: none; border: none; color: #fff; width: 50px; font-weight: bold; font-size: 16px; outline: none; text-align: center;">
              <span style="color: #94a3b8; font-size: 14px;">seconds</span>
            </div>
            <p style="color: #64748b; font-size: 11px; margin: 8px 0 0 0;">Min: 2s | Max: 60s</p>
          </div>

        </div>

      </div>

    </div>
  `;

  // Start fetching live price
  startLivePriceStream();
}

// Function to fetch live price and high/low stats from CoinGecko API
function fetchLivePrice() {
  const activeCoin = cryptoCoins.find(coin => coin.code === selectedCoinCode);
  if (!activeCoin) return;

  const cgId = activeCoin.cgId;
  const targetCurrency = selectedCurrency.toLowerCase();
  const apiCurrency = targetCurrency === 'usdt' ? 'usd' : 'inr';

  // Fetching live price, 24h high, and 24h low in a single call
  fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${apiCurrency}&ids=${cgId}`)
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        const marketData = data[0];
        const currentPrice = marketData.current_price;
        const highPrice = marketData.high_24h;
        const lowPrice = marketData.low_24h;
        
        const currencySymbol = selectedCurrency === "INR" ? "₹ " : "$ ";
        
        // Formatter Helper
        const formatNum = (num) => {
          if (!num) return "N/A";
          return num < 1 
            ? num.toFixed(6) 
            : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        const priceElement = document.getElementById('livePriceValue');
        const highElement = document.getElementById('highPriceValue');
        const lowElement = document.getElementById('lowPriceValue');

        if (priceElement) priceElement.innerText = currencySymbol + formatNum(currentPrice);
        if (highElement) highElement.innerText = currencySymbol + formatNum(highPrice);
        if (lowElement) lowElement.innerText = currencySymbol + formatNum(lowPrice);
      }
    })
    .catch(error => {
      console.error("Price fetch error:", error);
      const priceElement = document.getElementById('livePriceValue');
      if (priceElement) {
        priceElement.innerText = "Connection Error";
      }
    });
}

// Start auto fetching price stream
function startLivePriceStream() {
  if (priceIntervalId) {
    clearInterval(priceIntervalId);
  }

  fetchLivePrice();

  // Set interval based on chosen cooldown time
  priceIntervalId = setInterval(fetchLivePrice, cooldownTime * 1000);
}

// Handler for dropdown changes
function updateCryptoFilters() {
  selectedCoinCode = document.getElementById('coinSelector').value;
  selectedCurrency = document.getElementById('currencySelector').value;
  
  // Reset fields to loading
  resetLoadingUI();
  startLivePriceStream();
}

// Handler for Timeframe selection
function setTimeframe(tf) {
  selectedTimeframe = tf;
  renderCryptoDashboard(); // Re-render to highlight active button
}

// Handler for Cooldown modification
function updateCooldown(val) {
  let numVal = parseInt(val);
  if (isNaN(numVal) || numVal < 2) numVal = 2;
  if (numVal > 60) numVal = 60;
  
  cooldownTime = numVal;
  startLivePriceStream(); // Restart stream with new cooldown
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

  if (priceElement) priceElement.innerText = "Loading...";
  if (highElement) highElement.innerText = "Loading...";
  if (lowElement) lowElement.innerText = "Loading...";
}
