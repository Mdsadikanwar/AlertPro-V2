// Global State Balance Reference
if (typeof cryptoBalance === 'undefined') {
  var cryptoBalance = { usdt: 10000, btc: 0.15, eth: 1.2, sol: 5.0 };
}

// Track active paper trading positions to calculate live Profit/Loss
if (typeof activePositions === 'undefined') {
  var activePositions = []; 
}

// Available coins list with CoinGecko IDs for real-time pricing
const tradingCoins = [
  { name: "Bitcoin", code: "btc", cgId: "bitcoin", icon: "🪙" },
  { name: "Ethereum", code: "eth", cgId: "ethereum", icon: "🔷" },
  { name: "Solana", code: "sol", cgId: "solana", icon: "☀️" }
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
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <!-- Header -->
      <div style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
        <div>
          <h2 style="color: #38bdf8; margin: 0; font-size: 26px;">Crypto Trading Desk</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Interactive real-time Paper Trading terminal with live P&L</p>
        </div>
        <button onclick="resetBalance()" style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px; transition: 0.2s;">
          🔄 Reset Wallet ($10k)
        </button>
      </div>

      <!-- Wallet Balances & Assets Row -->
      <div style="display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
        
        <div style="flex: 1; min-width: 180px; background: #1e293b; padding: 15px 20px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <span style="color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase;">USDT Wallet Balance</span>
          <h2 style="color: #22c55e; margin: 8px 0 0 0; font-size: 22px; font-family: monospace;">$${cryptoBalance.usdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>

        <div style="flex: 1; min-width: 150px; background: #1e293b; padding: 15px 20px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <span style="color: #f59e0b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Bitcoin Holdings</span>
          <h2 style="color: #fff; margin: 8px 0 0 0; font-size: 20px; font-family: monospace;">${cryptoBalance.btc.toFixed(4)} BTC</h2>
          <span style="color: #64748b; font-size: 11px;">≈ $${(cryptoBalance.btc * livePrices.btc).toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
        </div>

        <div style="flex: 1; min-width: 150px; background: #1e293b; padding: 15px 20px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <span style="color: #a855f7; font-size: 12px; font-weight: bold; text-transform: uppercase;">Ethereum Holdings</span>
          <h2 style="color: #fff; margin: 8px 0 0 0; font-size: 20px; font-family: monospace;">${cryptoBalance.eth.toFixed(4)} ETH</h2>
          <span style="color: #64748b; font-size: 11px;">≈ $${(cryptoBalance.eth * livePrices.eth).toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
        </div>

        <div style="flex: 1; min-width: 150px; background: #1e293b; padding: 15px 20px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <span style="color: #06b6d4; font-size: 12px; font-weight: bold; text-transform: uppercase;">Solana Holdings</span>
          <h2 style="color: #fff; margin: 8px 0 0 0; font-size: 20px; font-family: monospace;">${cryptoBalance.sol.toFixed(2)} SOL</h2>
          <span style="color: #64748b; font-size: 11px;">≈ $${(cryptoBalance.sol * livePrices.sol).toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
        </div>

      </div>

      <!-- Two-Column Layout: Chart Left, Order-book Right -->
      <div style="display: flex; gap: 20px; margin-bottom: 25px; flex-wrap: wrap;">
        
        <!-- TradingView Embedded Chart Widget -->
        <div style="flex: 2; min-width: 320px; background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; height: 450px; display: flex; flex-direction: column;">
          <div style="background: #0f172a; padding: 12px 18px; font-weight: bold; font-size: 14px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
            <span>📈 TradingView Interactive Chart (${selectedTradingCoin.toUpperCase()}/USDT)</span>
            <span style="font-size: 11px; background: #38bdf8; color: #0f172a; padding: 2px 6px; border-radius: 4px;">LIVE</span>
          </div>
          <div id="chartContainer" style="flex: 1; position: relative;">
            <!-- TradingView Widget Will Mount Here Dynamically -->
          </div>
        </div>

        <!-- Place Instant Order Desk Card -->
        <div style="flex: 1; min-width: 300px; background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #334155; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="color: #fff; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 10px; font-size: 18px;">Place Instant Order</h3>
            
            <!-- Coin Selection -->
            <div style="margin-bottom: 18px;">
              <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 13px; font-weight: bold;">Select Coin</label>
              <select id="tradeCoin" onchange="changeTradingCoin(this.value)" style="width: 100%; padding: 12px; background: #0f172a; border: 1px solid #4b5563; border-radius: 8px; color: #fff; font-weight: bold; outline: none; cursor: pointer;">
                ${coinOptions}
              </select>
            </div>

            <!-- Direction Selection (BUY/SELL) -->
            <div style="margin-bottom: 18px;">
              <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 13px; font-weight: bold;">Order Side</label>
              <div style="display: flex; gap: 10px;">
                <button id="buyBtn" onclick="setOrderSide('BUY')" style="flex: 1; padding: 12px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; opacity: ${selectedSide === 'BUY' ? '1' : '0.4'}; transition: 0.2s;">
                  BUY (LONG)
                </button>
                <button id="sellBtn" onclick="setOrderSide('SELL')" style="flex: 1; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; opacity: ${selectedSide === 'SELL' ? '1' : '0.4'}; transition: 0.2s;">
                  SELL (SHORT)
                </button>
              </div>
              <input type="hidden" id="orderSide" value="${selectedSide}">
            </div>

            <!-- Input Amount -->
            <div style="margin-bottom: 22px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <label style="color: #94a3b8; font-size: 13px; font-weight: bold;">Amount (in Coins)</label>
                <span id="maxBalanceBtn" onclick="fillMaxAmount()" style="color: #38bdf8; font-size: 11px; cursor: pointer; text-decoration: underline;">Use Max Balance</span>
              </div>
              <div style="position: relative; display: flex; align-items: center;">
                <input type="number" id="tradeAmount" placeholder="0.00" step="any" min="0" oninput="calculateTotalEstimate()" style="width: 100%; padding: 12px; padding-right: 60px; background: #0f172a; border: 1px solid #4b5563; border-radius: 8px; color: #fff; box-sizing: border-box; font-family: monospace; font-size: 15px; outline: none;">
                <span style="position: absolute; right: 15px; color: #64748b; font-weight: bold; font-size: 13px;" id="coinSymbolSuffix">${selectedTradingCoin.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <!-- Total Estimations & Execution Button -->
          <div>
            <div style="background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #94a3b8; font-size: 12px;">Estimated Value:</span>
              <span id="estimatedCost" style="font-weight: bold; font-family: monospace; font-size: 14px; color: #fff;">$0.00</span>
            </div>

            <button onclick="executeCryptoOrder()" style="width: 100%; padding: 14px; background: #38bdf8; color: #0f172a; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px rgba(56, 189, 248, 0.2);">
              Execute ${selectedSide} Order
            </button>
          </div>
        </div>

      </div>

      <!-- Bottom Panel: Active Paper Trading Positions -->
      <div style="background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 20px; overflow-x: auto;">
        <h3 style="color: #fff; margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 1px solid #334155; padding-bottom: 10px;">
          💼 Active Positions & Logs
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 1px solid #334155; color: #94a3b8;">
              <th style="padding: 12px;">Asset Pair</th>
              <th style="padding: 12px;">Type</th>
              <th style="padding: 12px;">Size (Qty)</th>
              <th style="padding: 12px;">Entry Price</th>
              <th style="padding: 12px;">Current Price</th>
              <th style="padding: 12px;">Initial Margin</th>
              <th style="padding: 12px;">P&L (%)</th>
              <th style="padding: 12px; text-align: right;">Actions</th>
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
    sol: "BINANCE:SOLUSDT"
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
      "hide_side_toolbar": false,
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
  tradingIntervalId = setInterval(fetchTradingPrices, 60000); // 60 seconds interval
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

      // Update Select Dropdown options inline if select element is open
      const selectEl = document.getElementById('tradeCoin');
      if (selectEl) {
        // Keep selected index
        const currentIdx = selectEl.selectedIndex;
        selectEl.innerHTML = tradingCoins.map(coin => {
          const currentPrice = livePrices[coin.code] || 0;
          return `<option value="${coin.code}" ${coin.code === selectedTradingCoin ? 'selected' : ''}>
            ${coin.icon} ${coin.name} (${coin.code.toUpperCase()}) - Live: $${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </option>`;
        }).join('');
        selectEl.selectedIndex = currentIdx;
      }

      // Update estimations & live positions
      calculateTotalEstimate();
      updatePositionsTable();
    })
    .catch(err => {
      console.warn("Pricing Fetch warning, utilizing latest available client cache:", err);
      updatePositionsTable();
    });
}

// Set Order direction & toggle element transparency
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

// Triggered on Dropdown Selector Change
function changeTradingCoin(val) {
  selectedTradingCoin = val;
  const suffix = document.getElementById('coinSymbolSuffix');
  if (suffix) suffix.innerText = val.toUpperCase();

  // Reset inputs
  const amountInput = document.getElementById('tradeAmount');
  if (amountInput) amountInput.value = "";
  
  // Rerender specific chart container to change symbol
  embedTradingViewChart(val);
  calculateTotalEstimate();
}

// Quick autofill based on balance
function fillMaxAmount() {
  const currentPrice = livePrices[selectedTradingCoin] || 1;
  const amountInput = document.getElementById('tradeAmount');
  if (!amountInput) return;

  if (selectedSide === 'BUY') {
    // Max Buy depends on total wallet USDT
    const maxBuyQty = cryptoBalance.usdt / currentPrice;
    amountInput.value = (maxBuyQty * 0.99).toFixed(5); // 1% buffer
  } else {
    // Max Sell depends on current coin holdings
    const currentHoldings = cryptoBalance[selectedTradingCoin] || 0;
    amountInput.value = currentHoldings.toFixed(5);
  }
  calculateTotalEstimate();
}

// Dynamic input field calculator
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

// Execute Trading Engine Logic (Mock/Paper Execution)
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
    // Check if sufficient USDT balance is there
    if (cryptoBalance.usdt < totalCost) {
      alert(`⚠️ Insufficient USDT Balance! You need $${totalCost.toFixed(2)} but only have $${cryptoBalance.usdt.toFixed(2)}`);
      return;
    }
    // Deduct USDT, Add Coin
    cryptoBalance.usdt -= totalCost;
    cryptoBalance[coin] = (cryptoBalance[coin] || 0) + amount;
  } else {
    // SELL / SHORT Position
    // Check if sufficient coin is there to sell
    if ((cryptoBalance[coin] || 0) < amount) {
      alert(`⚠️ Insufficient ${coin.toUpperCase()} Balance! You have ${cryptoBalance[coin]} but trying to sell ${amount}`);
      return;
    }
    // Deduct Coin, Add USDT
    cryptoBalance[coin] -= amount;
    cryptoBalance.usdt += totalCost;
  }

  // Push into Mock Position logs array
  activePositions.push({
    id: Date.now(),
    coin: coin,
    type: selectedSide,
    qty: amount,
    entryPrice: currentPrice,
    timestamp: new Date().toLocaleTimeString()
  });

  alert(`🚀 Order Executed Successfully!\n\nSide: ${selectedSide}\nQty: ${amount} ${coin.toUpperCase()}\nPrice: $${currentPrice.toLocaleString()}`);
  
  // Wipe text field & update view state
  amountInput.value = "";
  renderCryptoTrading();
}

// Calculate and render live position profits/losses
function updatePositionsTable() {
  const tableBody = document.getElementById('positionsTableBody');
  if (!tableBody) return;

  if (activePositions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="padding: 25px; text-align: center; color: #64748b; font-style: italic;">
          No active positions. Buy or Sell some coins on the right to start trading!
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = activePositions.map(pos => {
    const currentLivePrice = livePrices[pos.coin] || pos.entryPrice;
    const initialMargin = pos.qty * pos.entryPrice;
    
    // Calculate simulated Profit/Loss Percentage
    let pnlPct = 0;
    let pnlCash = 0;
    if (pos.type === 'BUY') {
      pnlPct = ((currentLivePrice - pos.entryPrice) / pos.entryPrice) * 100;
      pnlCash = (currentLivePrice - pos.entryPrice) * pos.qty;
    } else {
      // For Sell order simulation
      pnlPct = ((pos.entryPrice - currentLivePrice) / pos.entryPrice) * 100;
      pnlCash = (pos.entryPrice - currentLivePrice) * pos.qty;
    }

    const pnlColor = pnlPct >= 0 ? "#22c55e" : "#ef4444";
    const sign = pnlPct >= 0 ? "+" : "";

    return `
      <tr style="border-bottom: 1px solid #1e293b; color: #e2e8f0; vertical-align: middle;">
        <td style="padding: 12px; font-weight: bold;">🪙 ${pos.coin.toUpperCase()}/USDT</td>
        <td style="padding: 12px;">
          <span style="background: ${pos.type === 'BUY' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${pos.type === 'BUY' ? '#22c55e' : '#ef4444'}; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 11px;">
            ${pos.type}
          </span>
        </td>
        <td style="padding: 12px; font-family: monospace;">${pos.qty.toFixed(4)}</td>
        <td style="padding: 12px; font-family: monospace; color: #94a3b8;">$${pos.entryPrice.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
        <td style="padding: 12px; font-family: monospace; color: #38bdf8;">$${currentLivePrice.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
        <td style="padding: 12px; font-family: monospace; color: #94a3b8;">$${initialMargin.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
        <td style="padding: 12px; font-family: monospace; color: ${pnlColor}; font-weight: bold;">
          ${sign}${pnlPct.toFixed(2)}% (${sign}$${pnlCash.toLocaleString(undefined, {maximumFractionDigits: 2})})
        </td>
        <td style="padding: 12px; text-align: right;">
          <button onclick="closePosition(${pos.id})" style="background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; transition: 0.2s;">
            Close Position
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Close a trade position and process cash adjustments
function closePosition(id) {
  const index = activePositions.findIndex(pos => pos.id === id);
  if (index === -1) return;

  const pos = activePositions[index];
  const currentLivePrice = livePrices[pos.coin] || pos.entryPrice;
  
  // Calculate final return on investment
  let finalReturn = 0;
  if (pos.type === 'BUY') {
    finalReturn = pos.qty * currentLivePrice;
    // Put back the final cash return to USDT balance, and clear actual holdings
    cryptoBalance.usdt += finalReturn;
    cryptoBalance[pos.coin] = Math.max(0, (cryptoBalance[pos.coin] || 0) - pos.qty);
  } else {
    // For Shorts, refund the margin and the simulated PnL cash difference
    const pnlCash = (pos.entryPrice - currentLivePrice) * pos.qty;
    const originalMargin = pos.qty * pos.entryPrice;
    cryptoBalance.usdt += (originalMargin + pnlCash);
    cryptoBalance[pos.coin] = (cryptoBalance[pos.coin] || 0) + pos.qty;
  }

  alert(`💼 Position Closed!\nAsset: ${pos.coin.toUpperCase()}/USDT\nExecution Price: $${currentLivePrice.toLocaleString()}`);
  
  activePositions.splice(index, 1); // remove position
  renderCryptoTrading();
}

// Reset Wallet to Default Demo $10k
function resetBalance() {
  if (confirm("Are you sure you want to reset your wallet balance back to starting demo funds ($10,000 USDT)?")) {
    cryptoBalance = { usdt: 10000, btc: 0.15, eth: 1.2, sol: 5.0 };
    activePositions = [];
    renderCryptoTrading();
  }
}
