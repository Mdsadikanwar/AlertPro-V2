// Crypto Dashboard render function
function renderCryptoDashboard() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <!-- Welcome & Market Stat row -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
        <div>
          <h2 style="color: #38bdf8; margin: 0;">Crypto Live Dashboard</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Monitor active coins and real-time statistics</p>
        </div>
        <div style="background: #1e293b; padding: 10px 20px; border-radius: 8px; border: 1px solid #38bdf8;">
          <span style="color: #94a3b8; font-size: 14px;">Market Status:</span> 
          <b style="color: #22c55e;">● Live & Trading</b>
        </div>
      </div>

      <!-- Quick Stats Card Grid -->
      <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
        
        <!-- BTC Stat Card -->
        <div style="flex: 1; min-width: 200px; background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151; text-align: center;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0;">Bitcoin (BTC)</h4>
          <h2 style="color: #f59e0b; margin: 0; font-size: 24px;">$65,000.00</h2>
        </div>

        <!-- ETH Stat Card -->
        <div style="flex: 1; min-width: 200px; background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151; text-align: center;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0;">Ethereum (ETH)</h4>
          <h2 style="color: #6366f1; margin: 0; font-size: 24px;">$3,500.00</h2>
        </div>

        <!-- SOL Stat Card -->
        <div style="flex: 1; min-width: 200px; background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151; text-align: center;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0;">Solana (SOL)</h4>
          <h2 style="color: #14b8a6; margin: 0; font-size: 24px;">$150.00</h2>
        </div>

      </div>

      <!-- TradingView Chart Container -->
      <div style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #374151;">
        <h3 style="color: #fff; margin-top: 0; margin-bottom: 15px;">Live Market Chart</h3>
        <div id="crypto_tradingview_widget" style="height: 450px; background: #151c2c; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8;">
          TradingView Chart Widget Loading...
        </div>
      </div>

    </div>
  `;

  // Dynamic Chart Load (TradingView)
  setTimeout(() => {
    if (typeof TradingView !== 'undefined' && document.getElementById('crypto_tradingview_widget')) {
      new TradingView.widget({
        "width": "100%",
        "height": 450,
        "symbol": "BINANCE:BTCUSDT",
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
