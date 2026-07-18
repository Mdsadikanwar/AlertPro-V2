function renderCryptoBacktest() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 30px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
            <h2 style="color: #38bdf8; margin-bottom: 20px;">⏳ Backtest Engine Simulator</h2>
            <div style="background: #111827; padding: 30px; border-radius: 12px; border: 1px solid #1e293b; text-align: center;">
                <p style="color: #94a3b8;">Simulate strategy configurations across 30 days of historical spot market candle data.</p>
                <button onclick="alert('Starting core simulation... check console logs.')" style="background: transparent; border: 1px solid #38bdf8; color: #38bdf8; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 15px;">
                    ⚡ Run Backtest Simulation
                </button>
            </div>
        </div>
    `;
}
