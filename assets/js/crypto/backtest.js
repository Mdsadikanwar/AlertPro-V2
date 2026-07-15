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

  // Generate table rows dynamically from last backtest result trades
  const tradeRows = lastBacktestResult.trades.map(trade => {
    const sideColor = trade.side === 'BUY' ? '#22c55e' : '#ef4444';
    const resultColor = trade.status === 'TP ✅' ? '#22c55e' : '#ef4444';
    const pnlSign = trade.pnl >= 0 ? '+' : '';
    const pnlColor = trade.pnl >= 0 ? '#22c55e' : '#ef4444';

    return `
      <tr style="border-bottom: 1px solid #374151; font-size: 13px; font-family: monospace;">
        <td style="padding: 10px 5px; color: #cbd5e1;">${trade.time}</td>
        <td style="padding: 10px 5px; color: ${sideColor}; font-weight: bold;">${trade.side}</td>
        <td style="padding: 10px 5px; color: #cbd5e1;">$${trade.entry.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td style="padding: 10px 5px; color: #cbd5e1;">$${trade.exit.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td style="padding: 10px 5px; color: ${pnlColor}; font-weight: bold;">${pnlSign}$${trade.pnl.toFixed(2)}</td>
        <td style="padding: 10px 5px; color: ${resultColor}; font-weight: bold; text-align: right;">${trade.status}</td>
      </tr>
    `;
  }).join('');

  return `
    <div style="width: 100%;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #374151; padding-bottom: 10px; margin-bottom: 20px;">
        <h3 style="color: #38bdf8; margin: 0;">Backtest Results (${lastBacktestResult.pair})</h3>
        <span style="font-size: 12px; background: #334155; padding: 4px 10px; border-radius: 12px; color: #94a3b8; font-weight: bold;">
          ${lastBacktestResult.strategy.toUpperCase()} • ${lastBacktestResult.timeframe} • RR ${lastBacktestResult.rr}
        </span>
      </div>
      
      <!-- Performance Metrics Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 25px;">
        <div style="background: #0f172a; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #374151;">
          <span style="color: #94a3b8; font-size: 11px; font-weight: bold; text-transform: uppercase;">Total Trades</span>
          <h2 style="margin: 5px 0 0 0; color: #fff; font-size: 20px;">${lastBacktestResult.totalTrades}</h2>
        </div>
        <div style="background: #0f172a; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #374151;">
          <span style="color: #94a3b8; font-size: 11px; font-weight: bold; text-transform: uppercase;">Win Rate</span>
          <h2 style="margin: 5px 0 0 0; color: #22c55e; font-size: 20px;">${lastBacktestResult.winRate}%</h2>
        </div>
        <div style="background: #0f172a; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #374151;">
          <span style="color: #94a3b8; font-size: 11px; font-weight: bold; text-transform: uppercase;">Profit Factor</span>
          <h2 style="margin: 5px 0 0 0; color: #eab308; font-size: 20px;">${lastBacktestResult.profitFactor}</h2>
        </div>
        <div style="background: #0f172a; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #374151;">
          <span style="color: #94a3b8; font-size: 11px; font-weight: bold; text-transform: uppercase;">Sharpe Ratio</span>
          <h2 style="margin: 5px 0 0 0; color: #38bdf8; font-size: 20px;">${lastBacktestResult.sharpeRatio}</h2>
        </div>
        <div style="background: #0f172a; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #374151;">
          <span style="color: #94a3b8; font-size: 11px; font-weight: bold; text-transform: uppercase;">Max Drawdown</span>
          <h2 style="margin: 5px 0 0 0; color: #f43f5e; font-size: 20px;">${lastBacktestResult.maxDrawdown}%</h2>
        </div>
        <div style="background: #0f172a; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #374151;">
          <span style="color: #94a3b8; font-size: 11px; font-weight: bold; text-transform: uppercase;">Net Profit</span>
          <h2 style="margin: 5px 0 0 0; color: #22c55e; font-size: 20px;">+$${lastBacktestResult.netProfit}</h2>
        </div>
      </div>

      <!-- Historical Trade Logs Table -->
      <div style="background: #0f172a; padding: 15px; border-radius: 8px; border: 1px solid #374151;">
        <h4 style="margin: 0 0 12px 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Detailed Historical Trade Logs</h4>
        <div style="overflow-x: auto; max-height: 250px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #374151; color: #94a3b8; font-size: 11px; text-transform: uppercase;">
                <th style="padding-bottom: 8px;">Time (UTC)</th>
                <th style="padding-bottom: 8px;">Type</th>
                <th style="padding-bottom: 8px;">Entry</th>
                <th style="padding-bottom: 8px;">Exit</th>
                <th style="padding-bottom: 8px;">Profit/Loss</th>
                <th style="padding-bottom: 8px; text-align: right;">Result</th>
              </tr>
            </thead>
            <tbody>
              ${tradeRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Simulate Backtest Calculation with realistic random logic
function runCryptoBacktest() {
  const strategy = document.getElementById('backtestStrategy').value;
  const pair = document.getElementById('backtestPair').value.toUpperCase();
  const timeframe = document.getElementById('backtestTimeframe').value;
  const rr = document.getElementById('backtestRR').value;

  // Show a loading text briefly
  const resultPanel = document.getElementById('backtestResultsPanel');
  resultPanel.innerHTML = `
    <div style="text-align: center; color: #38bdf8;">
      <div style="font-size: 40px; animation: spin 1s linear infinite; margin-bottom: 15px;">⏳</div>
      <h3>Simulating Historical Trades on ${pair}...</h3>
      <p style="color: #64748b; font-size: 13px;">Analyzing timeframe: ${timeframe} with Strategy: ${strategy.toUpperCase()}</p>
    </div>
    <style>
      @keyframes spin { 100% { transform: rotate(360deg); } }
    </style>
  `;

  setTimeout(() => {
    // Standard logic variables for simulation parameters
    const isORB = strategy === 'orb';
    const rrMultiplier = rr === '1:1' ? 1 : (rr === '1:2' ? 2 : 3);
    
    // Simulate core stats
    const totalTrades = isORB ? Math.floor(Math.random() * 15) + 25 : Math.floor(Math.random() * 20) + 35; // 25-40 or 35-55
    const winRate = isORB ? Math.floor(Math.random() * 10) + 52 : Math.floor(Math.random() * 12) + 40; // 52-62% or 40-52%
    const profitFactor = (isORB ? (1.4 + Math.random() * 0.5) : (1.1 + Math.random() * 0.4)).toFixed(2);
    const maxDrawdown = (isORB ? (4.5 + Math.random() * 3) : (6.8 + Math.random() * 5)).toFixed(1);
    const sharpeRatio = (isORB ? (1.8 + Math.random() * 0.7) : (1.2 + Math.random() * 0.5)).toFixed(2);
    
    // Base asset price to generate trade logs
    let basePrice = 64000;
    if (pair.includes("ETH")) basePrice = 3400;
    else if (pair.includes("SOL")) basePrice = 145;
    else if (pair.includes("BNB")) basePrice = 580;

    // Generate 7-8 highly detailed sample logs for display
    const trades = [];
    const numDisplayTrades = 8;
    
    for (let i = 0; i < numDisplayTrades; i++) {
      const isWin = Math.random() * 100 < winRate;
      const side = Math.random() > 0.5 ? "BUY" : "SELL";
      
      // Calculate random price changes based on BTC / Altcoin sizes
      const volatility = basePrice * 0.015; // 1.5% average move
      const entryPrice = basePrice + (Math.random() - 0.5) * basePrice * 0.04;
      
      let exitPrice;
      let pnl;
      
      if (side === 'BUY') {
        if (isWin) {
          exitPrice = entryPrice + (volatility * rrMultiplier);
          pnl = (exitPrice - entryPrice) * (100 / entryPrice) * 100; // Simulated $10K position sizing
        } else {
          exitPrice = entryPrice - volatility;
          pnl = -((entryPrice - exitPrice) * (100 / entryPrice) * 100);
        }
      } else { // SELL
        if (isWin) {
          exitPrice = entryPrice - (volatility * rrMultiplier);
          pnl = (entryPrice - exitPrice) * (100 / entryPrice) * 100;
        } else {
          exitPrice = entryPrice + volatility;
          pnl = -((exitPrice - entryPrice) * (100 / entryPrice) * 100);
        }
      }

      // Generate a mock timestamp
      const mockHour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
      const mockMin = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      const mockTime = `2026-07-${String(15 - i).padStart(2, '0')} ${mockHour}:${mockMin}`;

      trades.push({
        time: mockTime,
        side: side,
        entry: Math.round(entryPrice * 100) / 100,
        exit: Math.round(exitPrice * 100) / 100,
        pnl: Math.round(pnl * 100) / 100,
        status: isWin ? "TP ✅" : "SL ❌"
      });
    }

    // Sort trades by date/time descending
    trades.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Calculate simulated net profit based on displayed trades
    const sumPnl = trades.reduce((acc, curr) => acc + curr.pnl, 0);
    const netProfitFormatted = (sumPnl * 15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Save backtest simulation results
    lastBacktestResult = {
      strategy: strategy,
      pair: pair,
      timeframe: timeframe,
      rr: rr,
      totalTrades: totalTrades,
      winRate: winRate,
      profitFactor: profitFactor,
      sharpeRatio: sharpeRatio,
      maxDrawdown: maxDrawdown,
      netProfit: netProfitFormatted,
      trades: trades
    };
    
    // Refresh the backtest view to show the result
    renderCryptoBacktest();
  }, 1200);
}
