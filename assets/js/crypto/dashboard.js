// Top 10 Coins List (Base symbols and names)
const cryptoCoins = [
  { name: "Bitcoin", code: "BTC", icon: "🪙" },
  { name: "Ethereum", code: "ETH", icon: "🔷" },
  { name: "Solana", code: "SOL", icon: "☀️" },
  { name: "Binance Coin", code: "BNB", icon: "🟡" },
  { name: "Ripple", code: "XRP", icon: "✖️" },
  { name: "Cardano", code: "ADA", icon: "🔵" },
  { name: "Dogecoin", code: "DOGE", icon: "🐕" },
  { name: "Shiba Inu", code: "SHIB", icon: "🐕‍🦺" },
  { name: "Avalanche", code: "AVAX", icon: "🔺" },
  { name: "Polkadot", code: "DOT", icon: "🔴" }
];

// Current States
let selectedCoinCode = "BTC";
let selectedCurrency = "USDT"; // Default currency

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
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Select coin and pair currency to view live chart</p>
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

      <!-- Quick Stats Card Grid -->
      <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px; background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151; text-align: center;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0;">Selected Trading Pair</h4>
          <h2 id="activePairLabel" style="color: #38bdf8; margin: 0; font-size: 24px;">
            ${selectedCoinCode} / ${selectedCurrency}
          </h2>
        </div>
        <div style="flex: 1; min-width: 250px; background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151; text-align: center;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0;">Market Status</h4>
          <h2 style="color: #22c55e; margin: 0; font-size: 24px;">● Live Feed</h2>
        </div>
      </div>

      <!-- TradingView Chart Container -->
      <div style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #374151;">
        <h3 style="color: #fff; margin-top: 0; margin-bottom: 15px;">Live Technical Chart</h3>
        <div id="crypto_tradingview_widget" style="height: 500px; background: #151c2c; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8;">
          TradingView Chart Widget Loading...
        </div>
      </div>

    </div>
  `;

  // Init chart load
  loadTradingViewWidget();
}

// Function to construct symbol based on coin and currency
function getTVSystemSymbol() {
  if (selectedCurrency === "INR") {
    // For INR, we use CoinDCX data on TradingView
    return `COINDCX:${selectedCoinCode}INR`;
  } else {
    // For USDT, we use Binance data on TradingView
    return `BINANCE:${selectedCoinCode}USDT`;
  }
}

// Function to load/reload TradingView widget
function loadTradingViewWidget() {
  const symbol = getTVSystemSymbol();
  
  setTimeout(() => {
    if (typeof TradingView !== 'undefined' && document.getElementById('crypto_tradingview_widget')) {
      new TradingView.widget({
        "width": "100%",
        "height": 500,
        "symbol": symbol,
        "interval": "15",
        "timezone": "Asia/Kolkata",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "container_id": "crypto_tradingview_widget"
      });
    }
  }, 100);
}

// Handler for dropdown changes
function updateCryptoFilters() {
  selectedCoinCode = document.getElementById('coinSelector').value;
  selectedCurrency = document.getElementById('currencySelector').value;
  
  // Update the status panel label instantly
  const labelElement = document.getElementById('activePairLabel');
  if (labelElement) {
    labelElement.innerText = `${selectedCoinCode} / ${selectedCurrency}`;
  }
  
  // Reload the widget with new filters
  loadTradingViewWidget();
}
