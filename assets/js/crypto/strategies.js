// Global Strategies State
var cryptoStrategies = [
  { id: 1, name: "Opening Range Breakout (ORB)", status: "Active", timeframe: "15m", riskReward: "1:2", pair: "BTCUSDT" },
  { id: 2, name: "EMA Cross (9 / 21)", status: "Inactive", timeframe: "5m", riskReward: "1:1.5", pair: "ETHUSDT" }
];

// Crypto Strategies tab render function
function renderCryptoStrategies() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
        <div>
          <h2 style="color: #38bdf8; margin: 0;">Trading Strategies</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Manage and launch automated trading scripts</p>
        </div>
        <button onclick="addNewCryptoStrategy()" style="background: #38bdf8; color: #0f172a; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer;">+ Create Strategy</button>
      </div>

      <!-- Strategy List Grid -->
      <div id="strategiesList" style="display: flex; flex-direction: column; gap: 15px;">
        ${cryptoStrategies.map(strat => `
          <div style="background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
              <h3 style="margin: 0 0 8px 0; color: #fff;">${strat.name}</h3>
              <div style="display: flex; gap: 15px; font-size: 14px; color: #94a3b8;">
                <span><b>Pair:</b> ${strat.pair}</span>
                <span><b>Timeframe:</b> ${strat.timeframe}</span>
                <span><b>R:R Ratio:</b> ${strat.riskReward}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
              <span style="background: ${strat.status === 'Active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${strat.status === 'Active' ? '#22c55e' : '#ef4444'}; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                ${strat.status}
              </span>
              <button onclick="toggleCryptoStrategy(${strat.id})" style="background: #374151; color: #fff; border: 1px solid #4b5563; padding: 8px 14px; border-radius: 6px; cursor: pointer;">
                ${strat.status === 'Active' ? 'Pause' : 'Start'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

// Toggle active status
function toggleCryptoStrategy(id) {
  cryptoStrategies = cryptoStrategies.map(strat => {
    if (strat.id === id) {
      strat.status = strat.status === 'Active' ? 'Inactive' : 'Active';
    }
    return strat;
  });
  renderCryptoStrategies();
}

// Simulated Add Strategy
function addNewCryptoStrategy() {
  const name = prompt("Enter Strategy Name:", "New Strategy");
  if (!name) return;
  const pair = prompt("Enter Pair (e.g. BTCUSDT):", "BTCUSDT").toUpperCase();
  
  const newStrat = {
    id: cryptoStrategies.length + 1,
    name: name,
    status: "Inactive",
    timeframe: "15m",
    riskReward: "1:2",
    pair: pair
  };
  
  cryptoStrategies.push(newStrat);
  renderCryptoStrategies();
}
