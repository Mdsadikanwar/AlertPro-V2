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
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Select a coin and currency pair to view its real-time rate</p>
        </div>
        
        <!-- DROPDOWNS CONTAINER -->
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

      <!-- Live Price Large Display Screen -->
      <div style="background: #1e293b; border: 2px solid #38bdf8; border-radius: 12px; padding: 40px 20px; text-align: center; max-width: 600px; margin: 40px auto; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
        <span id="priceLabel" style="color: #94a3b8; font-size: 18px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">
          ${selectedCoinCode} / ${selectedCurrency} LIVE PRICE
        </span>
        
        <h1 id="livePriceValue" style="color: #22c55e; font-size: 48px; margin: 20px 0; font-family: monospace;">
          Loading...
        </h1>
        
        <div style="color: #94a3b8; font-size: 12px; display: flex; justify-content: center; align-items: center; gap: 5px;">
          <span>🟢 Auto-refreshing every 5 seconds</span>
        </div>
      </div>

    </div>
  `;

  // Start fetching live price
  startLivePriceStream();
}

// Function to fetch live price from CoinGecko API
function fetchLivePrice() {
  const activeCoin = cryptoCoins.find(coin => coin.code === selectedCoinCode);
  if (!activeCoin) return;

  const cgId = activeCoin.cgId;
  const targetCurrency = selectedCurrency.toLowerCase(); // 'usd' (for usdt symbol query) or 'inr'
  const apiCurrency = targetCurrency === 'usdt' ? 'usd' : 'inr';

  fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=${apiCurrency}`)
    .then(response => response.json())
    .then(data => {
      if (data[cgId] && data[cgId][apiCurrency]) {
        const rawPrice = data[cgId][apiCurrency];
        const symbolSymbol = selectedCurrency === "INR" ? "₹ " : "$ ";
        
        // Pretty formatting based on coin price scale (like Shiba Inu)
        const formattedPrice = rawPrice < 1 
          ? rawPrice.toFixed(6) 
          : rawPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const priceElement = document.getElementById('livePriceValue');
        if (priceElement) {
          priceElement.innerText = symbolSymbol + formattedPrice;
        }
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
  // Clear any existing intervals first
  if (priceIntervalId) {
    clearInterval(priceIntervalId);
  }

  // Fetch immediately
  fetchLivePrice();

  // Then fetch every 5 seconds
  priceIntervalId = setInterval(fetchLivePrice, 5000);
}

// Handler for dropdown changes
function updateCryptoFilters() {
  selectedCoinCode = document.getElementById('coinSelector').value;
  selectedCurrency = document.getElementById('currencySelector').value;
  
  // Update UI Labels instantly
  const labelElement = document.getElementById('priceLabel');
  if (labelElement) {
    labelElement.innerText = `${selectedCoinCode} / ${selectedCurrency} LIVE PRICE`;
  }
  const priceElement = document.getElementById('livePriceValue');
  if (priceElement) {
    priceElement.innerText = "Loading...";
  }
  
  // Restart stream with new filters
  startLivePriceStream();
}
