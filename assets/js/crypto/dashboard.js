// Top 10 Coins List with their TradingView Symbols
const top10Coins = [
  { name: "Bitcoin (BTC)", symbol: "BINANCE:BTCUSDT", icon: "🪙" },
  { name: "Ethereum (ETH)", symbol: "BINANCE:ETHUSDT", icon: "🔷" },
  { name: "Solana (SOL)", symbol: "BINANCE:SOLUSDT", icon: "☀️" },
  { name: "Binance Coin (BNB)", symbol: "BINANCE:BNBUSDT", icon: "🟡" },
  { name: "Ripple (XRP)", symbol: "BINANCE:XRPUSDT", icon: "✖️" },
  { name: "Cardano (ADA)", symbol: "BINANCE:ADAUSDT", icon: "🔵" },
  { name: "Dogecoin (DOGE)", symbol: "BINANCE:DOGEUSDT", icon: "🐕" },
  { name: "Shiba Inu (SHIB)", symbol: "BINANCE:SHIBUSDT", icon: "🐕‍🦺" },
  { name: "Avalanche (AVAX)", symbol: "BINANCE:AVAXUSDT", icon: "🔺" },
  { name: "Polkadot (DOT)", symbol: "BINANCE:DOTUSDT", icon: "🔴" }
];

// Current selected symbol
let selectedCryptoSymbol = "BINANCE:BTCUSDT";

// Crypto Dashboard render function
function renderCryptoDashboard() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <!-- Welcome & Dropdown Row -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
        <div>
          <h2 style="color: #38bdf8; margin: 0;">Crypto Live Dashboard</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Select a coin to update the live TradingView chart</p>
        </div>
        
        <!-- TOP 10 COINS DROPDOWN -->
        <div style="display: flex; align-items: center; gap: 10px; background: #1e293b; padding: 10px 15px; border-radius: 8px; border: 1px solid #38bdf8;">
          <label for="coinSelector" style="color: #94a3b8; font-size: 14px; font-weight: bold;">Select Coin:</label>
          <select id="coinSelector" onchange="changeCryptoChart(this.value)" style="background: #0f172a; color: #fff; border: 1px solid #4b5563; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; outline: none;">
            ${top10Coins.map(coin => `
              <option value="${coin.symbol}" ${coin.symbol === selectedCryptoSymbol ? 'selected' : ''}>
                ${coin.icon} ${coin.name}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Quick Stats Card Grid (Will show based on selection) -->
      <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px; background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151; text-align: center;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0;">Selected Trading Pair</h4>
          <h2 id="activePairLabel" style="color: #38bdf8; margin: 0; font-size: 24px;">BTC / USDT</h2>
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

  // Load the TradingView Widget
  loadTradingViewWidget(selectedCryptoSymbol);
}

// Function to load/reload TradingView widget
function loadTradingViewWidget(symbol) {
  setTimeout(() => {
    if (typeof TradingView !== 'undefined' && document.getElementById('crypto_tradingview_widget')) {
      new TradingView.widget({
        "width": "100%",
        "height": 500,
        "symbol": symbol,
        "interval": "15",
        "timezone": "Etc/UTC",
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

// Handler for dropdown change
function changeCryptoChart(symbol) {
  selectedCryptoSymbol = symbol;
  
  // Update the label above chart (e.g. BINANCE:BTCUSDT -> BTC / USDT)
  const cleanName = symbol.replace("BINANCE:", "").replace("USDT", " / USDT");
  const labelElement = document.getElementById('activePairLabel');
  if (labelElement) {
    labelElement.innerText = cleanName;
  }
  
  // Reload widget with new symbol
  loadTradingViewWidget(symbol);
}
