// Stocks Dashboard render function
function renderStocksDashboard() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('STOCKS', '#22c55e')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <!-- Welcome & Market Stat row -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
        <div>
          <h2 style="color: #22c55e; margin: 0;">Indian Share Market Dashboard</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Track NIFTY, SENSEX, and top equity stocks in real-time</p>
        </div>
        <div style="background: #1e293b; padding: 10px 20px; border-radius: 8px; border: 1px solid #22c55e;">
          <span style="color: #94a3b8; font-size: 14px;">Market Status:</span> 
          <b style="color: #22c55e;">● Live & Active</b>
        </div>
      </div>

      <!-- Quick Stats Card Grid -->
      <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
        
        <!-- NIFTY 55 Stat Card -->
        <div style="flex: 1; min-width: 200px; background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151; text-align: center;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0;">NIFTY 50</h4>
          <h2 style="color: #22c55e; margin: 0; font-size: 24px;">23,450.80</h2>
          <span style="color: #22c55e; font-size: 12px;">+1.20% (Today)</span>
        </div>

        <!-- SENSEX Stat Card -->
        <div style="flex: 1; min-width: 200px; background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151; text-align: center;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0;">SENSEX</h4>
          <h2 style="color: #22c55e; margin: 0; font-size: 24px;">77,120.40</h2>
          <span style="color: #22c55e; font-size: 12px;">+1.05% (Today)</span>
        </div>

        <!-- ONGC Stat Card -->
        <div style="flex: 1; min-width: 200px; background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151; text-align: center;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0;">ONGC</h4>
          <h2 style="color: #22c55e; margin: 0; font-size: 24px;">268.45</h2>
          <span style="color: #ef4444; font-size: 12px;">-0.45% (Today)</span>
        </div>

      </div>

      <!-- TradingView Chart Container -->
      <div style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #374151;">
        <h3 style="color: #fff; margin-top: 0; margin-bottom: 15px;">NIFTY 50 Live Index Chart</h3>
        <div id="stocks_tradingview_widget" style="height: 450px; background: #151c2c; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8;">
          TradingView Chart Widget Loading...
        </div>
      </div>

    </div>
  `;

  // Dynamic Chart Load (TradingView)
  setTimeout(() => {
    if (typeof TradingView !== 'undefined' && document.getElementById('stocks_tradingview_widget')) {
      new TradingView.widget({
        "width": "100%",
        "height": 450,
        "symbol": "NSE:NIFTY",
        "interval": "15",
        "timezone": "Asia/Kolkata",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "container_id": "stocks_tradingview_widget"
      });
    }
  }, 100);
}
