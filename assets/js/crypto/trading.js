// ... (बाकी कोड वही है, बस नीचे दिए गए फंक्शन्स को अपडेट करें)

// Crypto Trading tab render function
function renderCryptoTrading() {
  // ... (बाकी कोड वही है)
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

      <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 25px;">
        
        <!-- Chart height doubled to 1700px -->
        <div style="width: 100%; background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; height: 1700px; display: flex; flex-direction: column;">
          <div style="background: #0f172a; padding: 12px 15px; font-weight: bold; font-size: 14px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
            <span>📈 Chart (${selectedTradingCoin.toUpperCase()}/USDT)</span>
            <span style="font-size: 11px; background: #38bdf8; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-weight: bold;">LIVE</span>
          </div>
          <div id="chartContainer" style="flex: 1; position: relative;">
            <!-- TradingView Widget Will Mount Here Dynamically -->
          </div>
        </div>

        <!-- Place Instant Order Desk Card -->
        <div style="width: 100%; background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; box-sizing: border-box;">
           <!-- ... (बाकी ऑर्डर डेस्क का कोड वही रहेगा) -->
           <h3 style="color: #fff; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #334155; padding-bottom: 10px; font-size: 16px;">Place Instant Order</h3>
           <!-- ... -->
        </div>
      </div>
      <!-- ... (बाकी कोड वही है) -->
    </div>
  `;
  embedTradingViewChart(selectedTradingCoin);
  startTradingPricesStream();
}

// Dynamically embed TradingView's official widget
function embedTradingViewChart(coinCode) {
  const container = document.getElementById('chartContainer');
  if (!container) return;

  // ... (symbolMapping कोड वही है)
  const widgetSymbol = symbolMapping[coinCode] || "BINANCE:BTCUSDT";

  container.innerHTML = "";

  const widgetScript = document.createElement('script');
  widgetScript.src = 'https://s3.tradingview.com/tv.js';
  widgetScript.async = true;
  widgetScript.onload = () => {
    new TradingView.widget({
      "width": "100%",
      "height": "1700px", // यहाँ भी 1700px कर दिया है
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
