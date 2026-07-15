// Global State Balance Reference
if (typeof cryptoBalance === 'undefined') {
  var cryptoBalance = { usdt: 10000, btc: 0.15, eth: 1.2, sol: 5.0, bnb: 0, xrp: 0, ada: 0, doge: 0, dot: 0, matic: 0, avax: 0 };
}

// Track active positions
if (typeof activePositions === 'undefined') {
  var activePositions = []; 
}

// Auto Trading States
let currentTradingMode = "MANUAL"; // MANUAL or AUTO
let isAutoTradingActive = false;
let selectedStrategy = "crossover"; // crossover, rsi, telegram
let autoIntervalSeconds = 10; // check every 10s by default
let autoTradeUSDT = 200; // USDT size per automatic trade
let autoTradingTimer = null;
let autoTradingLogs = ["🤖 Auto Trading Bot initialized. Choose a strategy and click Start."];

const tradingCoins = [
  { name: "Bitcoin", code: "btc", cgId: "bitcoin", icon: "🪙" },
  { name: "Ethereum", code: "eth", cgId: "ethereum", icon: "🔷" },
  { name: "Solana", code: "sol", cgId: "solana", icon: "☀️" },
  { name: "BNB", code: "bnb", cgId: "binancecoin", icon: "🔶" },
  { name: "Ripple", code: "xrp", cgId: "ripple", icon: "💧" },
  { name: "Cardano", code: "ada", cgId: "cardano", icon: "₳" },
  { name: "Dogecoin", code: "doge", cgId: "dogecoin", icon: "🐕" },
  { name: "Polkadot", code: "dot", cgId: "polkadot", icon: "⚫" },
  { name: "Polygon", code: "matic", cgId: "matic-network", icon: "💜" },
  { name: "Avalanche", code: "avax", cgId: "avalanche-2", icon: "🔺" }
];

let selectedTradingCoin = "btc";
let selectedSide = "BUY";
let livePrices = { btc: 65000, eth: 3500, sol: 150 }; 
let tradingIntervalId = null;

// Main Tab Render
function renderCryptoTrading() {
  const root = document.getElementById('app');
  
  const coinOptions = tradingCoins.map(coin => {
    const currentPrice = livePrices[coin.code] || 0;
    const formattedPrice = currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 });
    return `<option value="${coin.code}" ${coin.code === selectedTradingCoin ? 'selected' : ''}>
      ${coin.icon} ${coin.name} (${coin.code.toUpperCase()}) - Live: $${formattedPrice}
    </option>`;
  }).join('');

  root.innerHTML = `
    \${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 15px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff; width: 100%; box-sizing: border-box;">
      
      <!-- Wallet Balance Bar -->
      <div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; max-width: 600px; margin-left: auto; margin-right: auto;">
        <div style="background: #1e293b; padding: 12px 15px; border-radius: 12px; border: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <span style="color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase;">USDT Balance:</span>
          <h2 style="color: #22c55e; margin: 0; font-size: 20px; font-family: monospace;">$${cryptoBalance.usdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>
        
        <button onclick="resetBalance()" style="width: 100%; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 13px;">
          🔄 Reset Wallet & Positions
        </button>
      </div>

      <!-- Main Columns Flex wrapper -->
      <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 25px; max-width: 600px; margin-left: auto; margin-right: auto;">
        
        <!-- Live TradingView Chart (Optimized Mobile Height) -->
        <div style="width: 100%; background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; height: 750px; display: flex; flex-direction: column;">
          <div style="background: #0f172a; padding: 12px 15px; font-weight: bold; font-size: 14px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
            <span>📈 Chart (${selectedTradingCoin.toUpperCase()}/USDT)</span>
            <span style="font-size: 11px; background: #38bdf8; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-weight: bold;">LIVE</span>
          </div>
          <div id="chartContainer" style="flex: 1; position: relative;">
            <!-- TradingView Widget Dynamically Mounted -->
          </div>
        </div>

        <!-- Master Order Panel (Manual & Auto Switcher) -->
        <div style="width: 100%; background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; box-sizing: border-box;">
          
          <!-- Mode Tabs Toggle -->
          <div style="display: flex; background: #0f172a; padding: 4px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #334155;">
            <button onclick="switchTradingMode('MANUAL')" style="flex: 1; padding: 10px; border: none; border-radius: 6px; font-weight: bold; font-size: 13px; cursor: pointer; transition: 0.2s; background: ${currentTradingMode === 'MANUAL' ? '#38bdf8' : 'transparent'}; color: ${currentTradingMode === 'MANUAL' ? '#0f172a' : '#94a3b8'};">
              Manual Order
            </button>
            <button onclick="switchTradingMode('AUTO')" style="flex: 1; padding: 10px; border: none; border-radius: 6px; font-weight: bold; font-size: 13px; cursor: pointer; transition: 0.2s; background: ${currentTradingMode === 'AUTO' ? '#a855f7' : 'transparent'}; color: ${currentTradingMode === 'AUTO' ? '#fff' : '#94a3b8'};">
              🤖 Auto Bot
            </button>
          </div>

          <!-- MANUAL TRADING CARD -->
          <div id="manualTradingCard" style="display: ${currentTradingMode === 'MANUAL' ? 'block' : 'none'};">
            <h3 style="color: #fff; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #334155; padding-bottom: 10px; font-size: 16px;">Place Instant Order</h3>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 12px; font-weight: bold;">Select Crypto Asset</label>
              <select id="tradeCoin" onchange="changeTradingCoin(this.value)" style="width: 100%; padding: 12px; background: #0f172a; border: 1px solid #4b5563; border-radius: 8px; color: #fff; font-weight: bold; outline: none; font-size: 14px;">
                ${coinOptions}
              </select>
            </div>

            <div style="margin-bottom: 15px;">
              <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 12px; font-weight: bold;">Order Side</label>
              <div style="display: flex; gap: 10px;">
                <button id="buyBtn" onclick="setOrderSide('BUY')" style="flex: 1; padding: 12px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; opacity: ${selectedSide === 'BUY' ? '1' : '0.4'};">
                  BUY
                </button>
                <button id="sellBtn" onclick="setOrderSide('SELL')" style="flex: 1; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; opacity: ${selectedSide === 'SELL' ? '1' : '0.4'};">
                  SELL
                </button>
              </div>
              <input type="hidden" id="orderSide" value="${selectedSide}">
            </div>

            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <label style="color: #94a3b8; font-size: 12px; font-weight: bold;">Amount</label>
                <span id="maxBalanceBtn" onclick="fillMaxAmount()" style="color: #38bdf8; font-size: 11px; cursor: pointer; text-decoration: underline;">Max Balance</span>
              </div>
              <div style="position: relative; display: flex; align-items: center;">
                <input type="number" id="tradeAmount" placeholder="0.00" step="any" min="0" oninput="calculateTotalEstimate()" style="width: 100%; padding: 12px; padding-right: 60px; background: #0f172a; border: 1px solid #4b5563; border-radius: 8px; color: #fff; box-sizing: border-box; font-family: monospace; font-size: 14px; outline: none;">
                <span style="position: absolute; right: 15px; color: #64748b; font-weight: bold; font-size: 12px;" id="coinSymbolSuffix">${selectedTradingCoin.toUpperCase()}</span>
              </div>
            </div>

            <div style="background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #94a3b8; font-size: 12px;">Est. Value:</span>
              <span id="estimatedCost" style="font-weight: bold; font-family: monospace; font-size: 14px; color: #fff;">$0.00</span>
            </div>

            <button onclick="executeCryptoOrder()" style="width: 100%; padding: 14px; background: #38bdf8; color: #0f172a; border: none; border-radius: 8px; font-weight: bold; font-size: 15px; cursor: pointer; transition: 0.2s;">
              Execute ${selectedSide} Order
            </button>
          </div>

          <!-- AUTO TRADING CARD -->
          <div id="autoTradingCard" style="display: ${currentTradingMode === 'AUTO' ? 'block' : 'none'};">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 15px;">
              <h3 style="color: #fff; margin: 0; font-size: 16px;">🤖 Algorithmic Auto Bot</h3>
              <span style="font-size: 11px; background: ${isAutoTradingActive ? '#22c55e' : '#64748b'}; color: #fff; padding: 2px 8px; border-radius: 12px; font-weight: bold;">
                ${isAutoTradingActive ? 'RUNNING' : 'STOPPED'}
              </span>
            </div>

            <!-- Strategy Choice -->
            <div style="margin-bottom: 12px;">
              <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Trading Strategy</label>
              <select id="autoStrategy" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; font-size: 13px; outline: none;">
                <option value="crossover" ${selectedStrategy === 'crossover' ? 'selected' : ''}>📈 Moving Average Crossover (EMA 9/21)</option>
                <option value="rsi" ${selectedStrategy === 'rsi' ? 'selected' : ''}>📊 RSI Extreme Divergence (Oversold < 30)</option>
                <option value="telegram" ${selectedStrategy === 'telegram' ? 'selected' : ''}>📡 Telegram Auto Signals (API Feed)</option>
              </select>
            </div>

            <!-- Parameters Grid -->
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
              <div style="flex: 1;">
                <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Trade Size (USDT)</label>
                <input type="number" id="autoSize" value="${autoTradeUSDT}" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; font-family: monospace; font-size: 13px; outline: none;">
              </div>
              <div style="flex: 1;">
                <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Scan Interval</label>
                <select id="autoInterval" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; font-size: 13px; outline: none;">
                  <option value="5" ${autoIntervalSeconds === 5 ? 'selected' : ''}>5 Seconds</option>
                  <option value="10" ${autoIntervalSeconds === 10 ? 'selected' : ''}>10 Seconds</option>
                  <option value="30" ${autoIntervalSeconds === 30 ? 'selected' : ''}>30 Seconds</option>
                </select>
              </div>
            </div>

            <!-- Action Controls -->
            <div style="margin-bottom: 15px;">
              ${isAutoTradingActive ? `
                <button onclick="stopAutoTradingBot()" style="width: 100%; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">
                  🔴 Stop Auto Bot
                </button>
              ` : `
                <button onclick="startAutoTradingBot()" style="width: 100%; padding: 12px; background: #a855f7; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">
                  ⚡ Start Auto Trading
                </button>
              `}
            </div>

            <!-- Real-time logs terminal -->
            <div>
              <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Bot Activity Log</label>
              <div id="autoLogsTerminal" style="background: #090d16; border: 1px solid #1e293b; border-radius: 6px; height: 120px; overflow-y: auto; padding: 10px; font-family: monospace; font-size: 11px; color: #38bdf8; line-height: 1.4;">
                ${autoTradingLogs.map(log => `<div>${log}</div>`).join('')}
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom Panel: Active Positions -->
      <div style="background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 15px; overflow-x: auto; max-width: 600px; margin-left: auto; margin-right: auto;">
        <h3 style="color: #fff; margin-top: 0; margin-bottom: 12px; font-size: 16px; border-bottom: 1px solid #334155; padding-bottom: 8px;">
          💼 Active Positions (${activePositions.length})
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; min-width: 400px;">
          <thead>
            <tr style="border-bottom: 1px solid #334155; color: #94a3b8;">
              <th style="padding: 8px;">Pair</th>
              <th style="padding: 8px;">Type</th>
              <th style="padding: 8px;">Qty</th>
              <th style="padding: 8px;">Entry Price</th>
              <th style="padding: 8px;">P&L (%)</th>
              <th style="padding: 8px; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody id="positionsTableBody">
            <!-- Dynamic rows will inject here -->
          </tbody>
        </table>
      </div>

    </div>
  `;

  // Inject the TradingView Chart dynamically
  embedTradingViewChart(selectedTradingCoin);
  startTradingPricesStream();
  
  // Scroll logs to bottom if open
  const logTerm = document.getElementById('autoLogsTerminal');
  if (logTerm) logTerm.scrollTop = logTerm.scrollHeight;
}

// Switch between Manual and Auto layout
function switchTradingMode(mode) {
  currentTradingMode = mode;
  renderCryptoTrading();
}

// Start Auto Bot Loop
function startAutoTradingBot() {
  const sizeInput = document.getElementById('autoSize');
  const intervalSelect = document.getElementById('autoInterval');
  const strategySelect = document.getElementById('autoStrategy');

  if (sizeInput) autoTradeUSDT = parseFloat(sizeInput.value) || 200;
  if (intervalSelect) autoIntervalSeconds = parseInt(intervalSelect.value) || 10;
  if (strategySelect) selectedStrategy = strategySelect.value;

  if (cryptoBalance.usdt < autoTradeUSDT) {
    alert("❌ Error: Insufficient USDT balance to start automated bot!");
    return;
  }

  isAutoTradingActive = true;
  addBotLog(`🟢 Bot Started with Strategy: ${selectedStrategy.toUpperCase()}`);
  addBotLog(`⚙️ Allocated per trade: $${autoTradeUSDT} USDT | Scan rate: ${autoIntervalSeconds}s`);

  // Trigger continuous auto execution
  runAutoTradingBotEngine();
  
  renderCryptoTrading();
}

// Stop Bot
function stopAutoTradingBot() {
  isAutoTradingActive = false;
  if (autoTradingTimer) {
    clearTimeout(autoTradingTimer);
    autoTradingTimer = null;
  }
  addBotLog(`🔴 Bot Stopped. Automatic scanner deactivated.`);
  renderCryptoTrading();
}

// Core Simulated Strategy Logic
function runAutoTradingBotEngine() {
  if (!isAutoTradingActive) return;

  // Select a random coin to simulate market analysis
  const randomCoinObj = tradingCoins[Math.floor(Math.random() * tradingCoins.length)];
  const coin = randomCoinObj.code;
  const currentPrice = livePrices[coin] || 10;
  
  addBotLog(`🔍 Checking ${coin.toUpperCase()} market indicators...`);

  // Simulate strategy calculations
  setTimeout(() => {
    if (!isAutoTradingActive) return;

    // Simulated indicators
    const rsiValue = Math.floor(Math.random() * 60) + 20; // 20 - 80 range
    const isOverbought = rsiValue > 70;
    const isOversold = rsiValue < 30;
    
    // EMA Cross simulation
    const crossoverAction = Math.random() > 0.5 ? 'BUY_CROSS' : 'SELL_CROSS';

    let tradeAction = null; // 'BUY', 'SELL', or null

    if (selectedStrategy === "rsi") {
      addBotLog(`📊 [RSI Strategy] Current RSI for ${coin.toUpperCase()} is ${rsiValue}`);
      if (isOversold) tradeAction = "BUY";
      else if (isOverbought) tradeAction = "SELL";
    } else if (selectedStrategy === "crossover") {
      addBotLog(`📈 [EMA Strategy] Checking Fast/Slow MA lines for ${coin.toUpperCase()}...`);
      if (crossoverAction === 'BUY_CROSS') tradeAction = "BUY";
      else tradeAction = "SELL";
    } else if (selectedStrategy === "telegram") {
      addBotLog(`📡 [Telegram Feed] Scanning signal channels for alerts...`);
      if (Math.random() > 0.7) {
        tradeAction = Math.random() > 0.5 ? "BUY" : "SELL";
      }
    }

    if (tradeAction) {
      executeAutoBotTrade(coin, tradeAction, currentPrice);
    } else {
      addBotLog(`⏳ [Hold] No strong triggers. Continuing to monitor...`);
    }

    // Schedule next run
    autoTradingTimer = setTimeout(runAutoTradingBotEngine, autoIntervalSeconds * 1000);
  }, 1500);
}

// Execute simulated trade
function executeAutoBotTrade(coin, side, price) {
  if (side === 'BUY') {
    if (cryptoBalance.usdt >= autoTradeUSDT) {
      const qty = autoTradeUSDT / price;
      cryptoBalance.usdt -= autoTradeUSDT;
      cryptoBalance[coin] = (cryptoBalance[coin] || 0) + qty;
      
      activePositions.push({
        id: Date.now(),
        coin: coin,
        type: "BUY",
        qty: qty,
        entryPrice: price,
        timestamp: new Date().toLocaleTimeString()
      });
      addBotLog(`✅ [AUTO BUY SUCCESS] Bought ${qty.toFixed(4)} ${coin.toUpperCase()} at $${price.toLocaleString()}`);
    } else {
      addBotLog(`❌ [ERR] Insufficient funds for AUTO BUY.`);
    }
  } else { // SELL
    const currentHolding = cryptoBalance[coin] || 0;
    if (currentHolding > 0) {
      // Auto sell 50% of the bag
      const sellQty = currentHolding * 0.5;
      const creditVal = sellQty * price;
      cryptoBalance[coin] -= sellQty;
      cryptoBalance.usdt += creditVal;

      activePositions.push({
        id: Date.now(),
        coin: coin,
        type: "SELL",
        qty: sellQty,
        entryPrice: price,
        timestamp: new Date().toLocaleTimeString()
      });
      addBotLog(`🔥 [AUTO SELL SUCCESS] Sold ${sellQty.toFixed(4)} ${coin.toUpperCase()} at $${price.toLocaleString()}`);
    } else {
      addBotLog(`⚠️ [Skip] Auto trigger generated SELL signal for ${coin.toUpperCase()} but we have 0 holdings.`);
    }
  }
  
  // Refresh UI dynamically without breaking state
  const table = document.getElementById('positionsTableBody');
  if (table) updatePositionsTable();
  renderCryptoTrading();
}

// Log utility
function addBotLog(msg) {
  const time = new Date().toLocaleTimeString();
  autoTradingLogs.push(`[${time}] ${msg}`);
  if (autoTradingLogs.length > 30) autoTradingLogs.shift(); // limit logs
  
  const logTerm = document.getElementById('autoLogsTerminal');
  if (logTerm) {
    logTerm.innerHTML = autoTradingLogs.map(log => `<div>${log}</div>`).join('');
    logTerm.scrollTop = logTerm.scrollHeight;
  }
}

// Dynamically embed TradingView's official widget
function embedTradingViewChart(coinCode) {
  const container = document.getElementById('chartContainer');
  if (!container) return;

  const symbolMapping = {
    btc: "BINANCE:BTCUSDT",
    eth: "BINANCE:ETHUSDT",
    sol: "BINANCE:SOLUSDT",
    bnb: "BINANCE:BNBUSDT",
    xrp: "BINANCE:XRPUSDT",
    ada: "BINANCE:ADAUSDT",
    doge: "BINANCE:DOGEUSDT",
    dot: "BINANCE:DOTUSDT",
    matic: "BINANCE:MATICUSDT",
    avax: "BINANCE:AVAXUSDT"
  };

  const widgetSymbol = symbolMapping[coinCode] || "BINANCE:BTCUSDT";
  container.innerHTML = "";

  const widgetScript = document.createElement('script');
  widgetScript.src = 'https://s3.tradingview.com/tv.js';
  widgetScript.async = true;
  widgetScript.onload = () => {
    new TradingView.widget({
      "width": "100%",
      "height": "750px", // Changed from 1700px to 750px
      "symbol": widgetSymbol,
      "interval": "15",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#0f172a",
      "enable_publishing": false,
      "hide_side_toolbar": true, 
      "allow_symbol_change": false,
      "container_id": "chartContainer",
      "backgroundColor": "#1e293b",
      "gridColor": "rgba(42, 46, 57, 0.3)"
    });
  };
  document.head.appendChild(widgetScript);
}

// Continuous background updater for prices
function startTradingPricesStream() {
  if (tradingIntervalId) {
    clearInterval(tradingIntervalId);
  }
  fetchTradingPrices();
  tradingIntervalId = setInterval(fetchTradingPrices, 60000);
}

// Fetch live CoinGecko prices
function fetchTradingPrices() {
  const ids = tradingCoins.map(coin => coin.cgId).join(',');
  
  fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
    .then(res => {
      if (!res.ok) throw new Error("CoinGecko API Limit reached");
      return res.json();
    })
    .then(data => {
      tradingCoins.forEach(coin => {
        if (data[coin.cgId]) {
          livePrices[coin.code] = data[coin.cgId].usd;
        }
      });

      const selectEl = document.getElementById('tradeCoin');
      if (selectEl) {
        const currentIdx = selectEl.selectedIndex;
        selectEl.innerHTML = tradingCoins.map(coin => {
          const currentPrice = livePrices[coin.code] || 0;
          const formattedPrice = currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 });
          return `<option value="${coin.code}" ${coin.code === selectedTradingCoin ? 'selected' : ''}>
            ${coin.icon} ${coin.name} (${coin.code.toUpperCase()}) - Live: $${formattedPrice}
          </option>`;
        }).join('');
        selectEl.selectedIndex = currentIdx;
      }

      calculateTotalEstimate();
      updatePositionsTable();
    })
    .catch(err => {
      console.warn("Pricing Fetch warning:", err);
      updatePositionsTable();
    });
}

// Set Order direction
function setOrderSide(side) {
  selectedSide = side;
  const buyBtn = document.getElementById('buyBtn');
  const sellBtn = document.getElementById('sellBtn');
  
  if (buyBtn && sellBtn) {
    if (side === 'BUY') {
      buyBtn.style.opacity = '1';
      sellBtn.style.opacity = '0.4';
    } else {
      buyBtn.style.opacity = '0.4';
      sellBtn.style.opacity = '1';
    }
  }
  calculateTotalEstimate();
}

// Dropdown Change
function changeTradingCoin(val) {
  selectedTradingCoin = val;
  const suffix = document.getElementById('coinSymbolSuffix');
  if (suffix) suffix.innerText = val.toUpperCase();

  const amountInput = document.getElementById('tradeAmount');
  if (amountInput) amountInput.value = "";
  
  embedTradingViewChart(val);
  calculateTotalEstimate();
}

// Quick autofill
function fillMaxAmount() {
  const currentPrice = livePrices[selectedTradingCoin] || 1;
  const amountInput = document.getElementById('tradeAmount');
  if (!amountInput) return;

  if (selectedSide === 'BUY') {
    const maxBuyQty = cryptoBalance.usdt / currentPrice;
    amountInput.value = (maxBuyQty * 0.99).toFixed(5);
  } else {
    const currentHoldings = cryptoBalance[selectedTradingCoin] || 0;
    amountInput.value = currentHoldings.toFixed(5);
  }
  calculateTotalEstimate();
}

// Calculator
function calculateTotalEstimate() {
  const amountInput = document.getElementById('tradeAmount');
  const costLabel = document.getElementById('estimatedCost');
  if (!amountInput || !costLabel) return;

  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    costLabel.innerText = "$0.00";
    return;
  }

  const currentPrice = livePrices[selectedTradingCoin] || 0;
  const estVal = amount * currentPrice;
  costLabel.innerText = `$${estVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Order Execution
function executeCryptoOrder() {
  const coinInput = document.getElementById('tradeCoin');
  const amountInput = document.getElementById('tradeAmount');
  if (!coinInput || !amountInput) return;

  const coin = coinInput.value;
  const amount = parseFloat(amountInput.value);
  
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid coin amount!");
    return;
  }

  const currentPrice = livePrices[coin] || 0;
  const totalCost = amount * currentPrice;

  if (selectedSide === 'BUY') {
    if (cryptoBalance.usdt < totalCost) {
      alert(`⚠️ Insufficient USDT!`);
      return;
    }
    cryptoBalance.usdt -= totalCost;
    cryptoBalance[coin] = (cryptoBalance[coin] || 0) + amount;
  } else {
    if ((cryptoBalance[coin] || 0) < amount) {
      alert(`⚠️ Insufficient Balance!`);
      return;
    }
    cryptoBalance[coin] = (cryptoBalance[coin] || 0) - amount;
    cryptoBalance.usdt += totalCost;
  }

  activePositions.push({
    id: Date.now(),
    coin: coin,
    type: selectedSide,
    qty: amount,
    entryPrice: currentPrice,
    timestamp: new Date().toLocaleTimeString()
  });

  alert(`🚀 Order Executed!\n${selectedSide} ${amount} ${coin.toUpperCase()}`);
  amountInput.value = "";
  renderCryptoTrading();
}

// Positions Table Render
function updatePositionsTable() {
  const tableBody = document.getElementById('positionsTableBody');
  if (!tableBody) return;

  if (activePositions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="padding: 15px; text-align: center; color: #64748b; font-style: italic;">
          No active positions.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = activePositions.map(pos => {
    const currentLivePrice = livePrices[pos.coin] || pos.entryPrice;
    
    let pnlPct = 0;
    if (pos.type === 'BUY') {
      pnlPct = ((currentLivePrice - pos.entryPrice) / pos.entryPrice) * 100;
    } else {
      pnlPct = ((pos.entryPrice - currentLivePrice) / pos.entryPrice) * 100;
    }

    const pnlColor = pnlPct >= 0 ? "#22c55e" : "#ef4444";
    const sign = pnlPct >= 0 ? "+" : "";

    return `
      <tr style="border-bottom: 1px solid #1e293b; color: #e2e8f0; vertical-align: middle;">
        <td style="padding: 8px; font-weight: bold;">${pos.coin.toUpperCase()}</td>
        <td style="padding: 8px; color: ${pos.type === 'BUY' ? '#22c55e' : '#ef4444'}; font-weight: bold;">${pos.type}</td>
        <td style="padding: 8px; font-family: monospace;">${pos.qty.toFixed(3)}</td>
        <td style="padding: 8px; font-family: monospace; color: #94a3b8;">$${pos.entryPrice.toFixed(1)}</td>
        <td style="padding: 8px; font-family: monospace; color: ${pnlColor}; font-weight: bold;">${sign}${pnlPct.toFixed(2)}%</td>
        <td style="padding: 8px; text-align: right;">
          <button onclick="closePosition(${pos.id})" style="background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size: 11px;">
            ✕
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Close Position
function closePosition(id) {
  const index = activePositions.findIndex(pos => pos.id === id);
  if (index === -1) return;

  const pos = activePositions[index];
  const currentLivePrice = livePrices[pos.coin] || pos.entryPrice;
  
  if (pos.type === 'BUY') {
    cryptoBalance.usdt += pos.qty * currentLivePrice;
    cryptoBalance[pos.coin] = Math.max(0, (cryptoBalance[pos.coin] || 0) - pos.qty);
  } else {
    const pnlCash = (pos.entryPrice - currentLivePrice) * pos.qty;
    cryptoBalance.usdt += ((pos.qty * pos.entryPrice) + pnlCash);
    cryptoBalance[pos.coin] = (cryptoBalance[pos.coin] || 0) + pos.qty;
  }

  activePositions.splice(index, 1);
  renderCryptoTrading();
}

// Reset Balance
function resetBalance() {
  if (confirm("Reset wallet back to $10,000 USDT?")) {
    cryptoBalance = { usdt: 10000, btc: 0.15, eth: 1.2, sol: 5.0, bnb: 0, xrp: 0, ada: 0, doge: 0, dot: 0, matic: 0, avax: 0 };
    activePositions = [];
    if (isAutoTradingActive) {
      stopAutoTradingBot();
    } else {
      renderCryptoTrading();
    }
  }
}
