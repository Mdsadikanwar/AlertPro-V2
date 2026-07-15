// Global State Balance Reference
if (typeof cryptoBalance === 'undefined') {
  var cryptoBalance = { usdt: 10000, btc: 0.15, eth: 1.2, sol: 5.0, bnb: 0, xrp: 0, ada: 0, doge: 0, dot: 0, matic: 0, avax: 0 };
}

// Track active paper trading positions to calculate live Profit/Loss
if (typeof activePositions === 'undefined') {
  var activePositions = []; 
}

// Top 10 Cryptocurrencies list with CoinGecko IDs for real-time pricing
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

// Active selection states
let selectedTradingCoin = "btc";
let selectedSide = "BUY";
let livePrices = { btc: 65000, eth: 3500, sol: 150 }; // Fallback defaults
let tradingIntervalId = null;

// Crypto Trading tab render function
function renderCryptoTrading() {
  const root = document.getElementById('app');
  
  // Build Options for Dropdown
  const coinOptions = tradingCoins.map(coin => {
    const currentPrice = livePrices[coin.code] || 0;
    const formattedPrice = currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 });
    return `<option value="${coin.code}" ${coin.code === selectedTradingCoin ? 'selected' : ''}>
      ${coin.icon} ${coin.name} (${coin.code.toUpperCase()}) - Live: $${formattedPrice}
    </option>`;
  }).join('');

  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 15px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff; max-width: 480px; margin: 0 auto;">
      
      <!-- Top Action Bar -->
      <div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px;">
        <div style="background: #1e293b; padding: 12px 15px; border-radius: 12px; border: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <span style="color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase;">USDT Balance:</span>
          <h2 style="color: #22c55e; margin: 0; font-size: 20px; font-family: monospace;">$${cryptoBalance.usdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>
        
        <button onclick="resetBalance()" style="width: 100%; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 13px;">
          🔄 Reset Wallet ($10k)
        </button>
      </div>

      <!-- Vertical Mobile Layout: Chart Top, Order-book Bottom -->
      <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 25px;">
        
        <!-- TradingView Embedded Chart Widget - Mobile Width, Custom High Length -->
        <div style="width: 100%; background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; height: 850px; display: flex; flex-direction: column;">
          <div style="background: #0f172a; padding: 12px 15px; font-weight: bold; font-size: 14px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
            <span>📈 Chart (${selectedTradingCoin.toUpperCase()}/USDT)</span>
            <span style="font-size: 11px; background: #38bdf8; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-weight: bold;">LIVE</span>
          </div>
          <div id="chartContainer" style="flex: 1; position: relative;">
            <!-- TradingView Widget Will Mount Here Dynamically -->
          </div>
        </div>

        <!-- Place Instant Order Desk Card (Now Below Chart) -->
        <div style="width: 100%; background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; box-sizing: border-box;">
          <h3 style="color: #fff; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #334155; padding-bottom: 10px; font-size: 16px;">Place Instant Order</h3>
          
          <!-- Top 10 Crypto Selection Menu -->
          <div style="margin-bottom: 15px;">
            <label style="display: block; color: #94a3b8; margin-bottom: 6px; font-size: 12px; font-weight: bold;">Select Crypto Asset</label>
            <select id="tradeCoin" onchange="changeTradingCoin(this.value)" style="width: 100%; padding: 12px; background: #0f172a; border: 1px solid #4b5563; border-radius: 8px; color: #fff; font-weight: bold; outline: none; font-size: 14px;">
              ${coinOptions}
            </select>
          </div>

          <!-- Direction Selection (BUY/SELL) -->
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

          <!-- Input Amount -->
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

          <!-- Total Estimations & Execution Button -->
          <div style="background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #94a3b8; font-size: 12px;">Est. Value:</span>
            <span id="estimatedCost" style="font-weight: bold; font-family: monospace; font-size: 14px; color: #fff;">$0.00</span>
          </div>

          <button onclick="executeCryptoOrder()" style="width: 100%; padding: 14px; background: #38bdf8; color: #0f172a; border: none; border-radius: 8px; font-weight: bold; font-size: 15px; cursor: pointer;">
            Execute ${selectedSide} Order
          </button>
        </div>

      </div>

      <!-- Bottom Panel: Active Positions -->
      <div style="background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 15px; overflow-x: auto;">
        <h3 style="color: #fff; margin-top: 0; margin-bottom: 12px; font-size: 16px; border-bottom: 1px solid #334155; padding-bottom: 8px;">
          💼 Active Positions
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; min-width: 400px;">
          <thead>
            <tr style="border-bottom: 1px solid #334155; color: #94a3b8;">
              <th style="padding: 8px;">Pair</th>
              <th style="padding: 8px;">Type</th>
              <th style="padding: 8px;">Qty</th>
              <th style="padding: 8px;">Entry</th>
              <th style="padding: 8px;">P&L</th>
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

  // Fetch prices instantly on layout load and loop interval
  startTradingPricesStream();
}

// Dynamically embed TradingView's official widget inside the app
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

  // Clear previous iframe if any
  container.innerHTML = "";

  const widgetScript = document.createElement('script');
  widgetScript.src = 'https://s3.tradingview.com/tv.js';
  widgetScript.async = true;
  widgetScript.onload = () => {
    new TradingView.widget({
      "width": "100%",
      "height": "100%",
      "symbol": widgetSymbol,
      "interval": "15",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#0f172a",
      "enable_publishing": false,
      "hide_side_toolbar": true, // Hidden for mobile cleanliness
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

// Fetch live CoinGecko prices and calculate unrealized P&L
function fetchTradingPrices() {
  const ids = tradingCoins.map(coin => coin.cgId).join(',');
  
  fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
    .then(res => {
      if (!res.ok) throw new Error("CoinGecko API Rate Limit");
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
    renderCryptoTrading();
  }
}
