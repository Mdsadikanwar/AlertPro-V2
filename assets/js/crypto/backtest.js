function renderCryptoBacktest() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 30px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
            <h2 style="color: #38bdf8; margin-bottom: 20px;">🧪 Historical Backtester</h2>
            <div style="background: #111827; padding: 25px; border-radius: 12px; border: 1px solid #1e293b; color: #94a3b8;">
                <p>Backtest your JS strategy parameters using historical crypto candles directly in-browser.</p>
                <button onclick="alert('⚡ Fetching historical crypto data... Features loading!')" style="background: #1e293b; color: white; border: 1px solid #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Run Simulation</button>
            </div>
        </div>
    `;
}
