async function renderCryptoStrategies() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 30px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
            <h2 style="color: #38bdf8; margin-bottom: 20px;">⚙️ Trading Strategies</h2>
            
            <div style="background: #111827; padding: 25px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 30px;">
                <h3 style="color: #fff; margin-top: 0;">Create Trigger Strategy</h3>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 20px;">
                    <div>
                        <label style="color:#94a3b8; font-size:12px; display:block; margin-bottom:5px;">STRATEGY NAME</label>
                        <input type="text" id="stratName" value="Apex Scalper" style="width:90%; background:#1e293b; border:1px solid #334155; color:white; padding:10px; border-radius:6px;">
                    </div>
                    <div>
                        <label style="color:#94a3b8; font-size:12px; display:block; margin-bottom:5px;">CRYPTO PAIR</label>
                        <select id="stratPair" style="width:100%; background:#1e293b; border:1px solid #334155; color:white; padding:10px; border-radius:6px;">
                            <option value="BTCUSDT">BTC/USDT</option>
                            <option value="ETHUSDT">ETH/USDT</option>
                        </select>
                    </div>
                    <div>
                        <label style="color:#94a3b8; font-size:12px; display:block; margin-bottom:5px;">BUY LOW % (e.g. -1.5)</label>
                        <input type="number" id="stratBuy" value="-1.0" step="0.1" style="width:90%; background:#1e293b; border:1px solid #334155; color:white; padding:10px; border-radius:6px;">
                    </div>
                    <div>
                        <label style="color:#94a3b8; font-size:12px; display:block; margin-bottom:5px;">SELL HIGH % (e.g. 2.0)</label>
                        <input type="number" id="stratSell" value="0.5" step="0.1" style="width:90%; background:#1e293b; border:1px solid #334155; color:white; padding:10px; border-radius:6px;">
                    </div>
                </div>
                <button onclick="saveStrategy()" style="margin-top: 20px; background: #38bdf8; color: #0f172a; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer;">💾 Save & Activate Strategy</button>
            </div>
        </div>
    `;
}

async function saveStrategy() {
    const name = document.getElementById('stratName').value;
    const pair = document.getElementById('stratPair').value;
    const buy = document.getElementById('stratBuy').value;
    const sell = document.getElementById('stratSell').value;

    const payload = {
        name: name,
        pair: pair,
        buyLowPercent: buy,
        sellHighPercent: sell,
        status: "Active"
    };

    await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${pair}.json`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    alert("🚀 Strategy deployment synched with Firebase Core!");
}
