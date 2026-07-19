async function renderCryptoStrategies() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 30px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
            <h2 style="color: #38bdf8; margin-bottom: 20px;">⚙️ Strategy Manager</h2>
            
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 25px; max-width: 600px; margin-bottom: 30px;">
                <h3 style="color: #e2e8f0; margin-top: 0;">➕ Create Auto Crypto Strategy</h3>
                
                <div style="margin-top: 15px;">
                    <label style="color: #94a3b8; display: block; margin-bottom: 5px; font-size: 12px;">STRATEGY NAME</label>
                    <input type="text" id="stratName" value="Crypto Dip Buyer" style="width: 96%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-weight: bold;">
                </div>

                <div style="margin-top: 15px;">
                    <label style="color: #94a3b8; display: block; margin-bottom: 5px; font-size: 12px;">CRYPTO PAIR</label>
                    <select id="stratPair" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-weight: bold;">
                        <option value="BTCUSDT">BTC/USDT</option>
                        <option value="ETHUSDT">ETH/USDT</option>
                        <option value="SOLUSDT">SOL/USDT</option>
                    </select>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="color: #94a3b8; display: block; margin-bottom: 5px; font-size: 12px;">BUY DEPTH % (e.g. -1.5)</label>
                        <input type="number" id="buyLow" value="-1.0" step="0.1" style="width: 92%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-weight: bold;">
                    </div>
                    <div>
                        <label style="color: #94a3b8; display: block; margin-bottom: 5px; font-size: 12px;">SELL PROFIT % (e.g. 0.5)</label>
                        <input type="number" id="sellHigh" value="0.5" step="0.1" style="width: 92%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-weight: bold;">
                    </div>
                </div>

                <button onclick="saveCryptoStrategy()" style="width: 100%; background: #38bdf8; color: #0f172a; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 20px;">💾 Save & Activate Strategy</button>
            </div>
        </div>
    `;
}

async function saveCryptoStrategy() {
    const name = document.getElementById('stratName').value;
    const pair = document.getElementById('stratPair').value;
    const buyLow = document.getElementById('buyLow').value;
    const sellHigh = document.getElementById('sellHigh').value;

    const payload = {
        name: name,
        pair: pair,
        buyLowPercent: buyLow,
        sellHighPercent: sellHigh,
        status: "Active",
        timestamp: new Date().toISOString()
    };

    try {
        await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${pair}.json`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        alert("🚀 Strategy live! Web Engine will monitor this pair now.");
    } catch(e) { alert("❌ Error saving strategy."); }
}
