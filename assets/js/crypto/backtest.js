// Simulated Backtest Results State
var lastBacktestResult = null;

// Crypto Backtest tab render function
function renderCryptoBacktest() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <div style="margin-bottom: 25px;">
        <h2 style="color: #38bdf8; margin: 0;">Strategy Backtester</h2>
        <p style="color: #94a3b8; margin: 5px 0 0 0;">Test your indicators against historical data before going live</p>
      </div>

      <div style="display: flex; gap: 25px; flex-wrap: wrap;">
        
        <!-- Backtest Settings Form -->
        <div style="flex: 1; min-width: 300px; background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #374151;">
          <h3 style="color: #fff; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #374151; padding-bottom: 10px;">Run New Backtest</h3>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; color: #94a3b8; margin-bottom: 8px;">Select Strategy</label>
            <select id="backtestStrategy" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff;">
              <option value="orb">Opening Range Breakout (ORB)</option>
              <option value="ema">EMA Cross (9 / 21)</option>
            </select>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; color: #94a3b8; margin-bottom: 8px;">Symbol / Pair</label>
            <input type="text" id="backtestPair" value="BTCUSDT" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; box-sizing: border-box;">
          </div>

          <div style="display: flex; gap: 15px; margin-bottom: 20px;">
            <div style="flex: 1;">
              <label style="display: block; color: #94a3b8; margin-bottom: 8px;">Timeframe</label>
              <select id="backtestTimeframe" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff;">
                <option value="5m">5 Minute</option>
                <option value="15m" selected>15 Minute</option>
                <option value="1h">1 Hour</option>
              </select>
            </div>
            <div style="flex: 1;">
              <label style="display: block; color: #94a3b8; margin-bottom: 8px;">Risk:Reward</label>
              <select id="backtestRR" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff;">
                <option value="1:1">1:1</option>
                <option value="1:2" selected>1:2</option>
                <option value="1:3">1:3</option>
              </select>
            </div>
          </div>

          <button onclick="runCryptoBacktest()" style="width: 100%; padding: 14px; background: #22c55e; color: #fff; border: none; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer;">Run Backtest</button>
        </div>

        <!-- Backtest Results Display -->
        <div id="backtestResultsPanel" style="flex: 1.5; min-width: 300px; background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #374151; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 350px;">
          ${renderBacktestResultHTML()}
        </div>

      </div>

    </div>
  `;
}

// Generate HTML for result panel
function renderBacktestResultHTML() {
  if (!lastBacktestResult) {
    return `
      <div style="text-align: center; color: #94a3b8;">
        <div style="font-size: 50px; margin-bottom: 15px;">📊</div>
        <h3>No Backtest Run Yet</h3>
        <p style="font-size: 14px; max-width: 300px; margin: 0 auto;">Configure your strategy parameters on the left and click 'Run Backtest' to see historical performance results.</p>
      </div>
    `;
  }

  return `
    <div style="width: 100%;">
      <h3 style="color: #38bdf8; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #374151; padding-bottom: 10px;">Backtest Summary (${lastBacktestResult.pair})</h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <div style="background: #0f172a; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #374151;">
          <span style="color: #94a3b8; font-size: 13px;">Total Trades</span>
          <h2 style="margin: 5px 0 0 0; color: #fff;">${lastBacktestResult.totalTrades}</h2>
        </div>
        <div style="background: #0f172a; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #374151;">
          <span style="color: #94a3b8; font-size: 13px;">Win Rate</span>
          <h2 style="margin: 5px 0 0 0; color: #22c55e;">${lastBacktestResult.winRate}%</h2>
        </div>
        <div style="background: #0f172a; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #374151;">
          <span style="color: #94a3b8; font-size: 13px;">Profit Factor</span>
          <h2 style="margin: 5px 0 0 0; color: #eab308;">${lastBacktestResult.profitFactor}</h2>
        </div>
        <div style="background: #0f172a; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #374151;">
          <span style="color: #94a3b8; font-size: 13px;">Net Profit</span>
          <h2 style="margin: 5px 0 0 0; color: #22c55e;">+$${lastBacktestResult.netProfit}</h2>
        </div>
      </div>

      <div style="background: #0f172a; padding: 15px; border-radius: 8px; border: 1px solid #374151;">
        <h4 style="margin: 0 0 10px 0; color: #94a3b8;">Recent Trade Logs:</h4>
        <div style="font-size: 13px; font-family: monospace; display: flex; flex-direction: column; gap: 5px; color: #cbd5e1;">
          <div>[BUY] Entered BTCUSDT at $64,200 ➔ Closed at $65,000 (Take Profit) ✅</div>
          <div>[SELL] Entered BTCUSDT at $64,800 ➔ Closed at $65,200 (Stop Loss) ❌</div>
          <div>[BUY] Entered BTCUSDT at $63,900 ➔ Closed at $64,700 (Take Profit) ✅</div>
        </div>
      </div>
    </div>
  `;
}

// Simulate Backtest Calculation
function runCryptoBacktest() {
  const strategy = document.getElementById('backtestStrategy').value;
  const pair = document.getElementById('backtestPair').value.toUpperCase();
  const timeframe = document.getElementById('backtestTimeframe').value;
  const rr = document.getElementById('backtestRR').value;

  // Show a loading text briefly
  const resultPanel = document.getElementById('backtestResultsPanel');
  resultPanel.innerHTML = `<h3 style="color: #38bdf8;">Running Calculations on ${pair}...</h3>`;

  setTimeout(() => {
    // Generate realistic random simulation results based on strategy input
    const isORB = strategy === 'orb';
    lastBacktestResult = {
      pair: pair,
      totalTrades: isORB ? 32 : 45,
      winRate: isORB ? 58 : 42,
      profitFactor: isORB ? "1.8" : "1.2",
      netProfit: isORB ? "1,240.50" : "410.00"
    };
    
    // Refresh the backtest view to show the result
    renderCryptoBacktest();
  }, 800);
}
