function renderCryptoTrading() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 30px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
            <h2 style="color: #38bdf8; margin-bottom: 5px;">🔮 Execution Terminal</h2>
            <p style="color: #94a3b8; margin-top: 0; margin-bottom: 30px;">Direct Web Engine Integration - No Python Required.</p>

            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 25px; max-width: 600px;">
                <h3 style="color: #e2e8f0; margin-top: 0;">💻 Instant Web Trade</h3>
                <p style="color: #64748b; font-size: 13px;">Execute trades directly into your Firebase cluster.</p>
                
                <div style="margin-top: 20px;">
                    <label style="color: #94a3b8; display: block; margin-bottom: 5px; font-size: 12px;">SELECT PAIR</label>
                    <select id="manualPair" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-weight: bold;">
                        <option value="BTCUSDT">BTC/USDT</option>
                        <option value="ETHUSDT">ETH/USDT</option>
                        <option value="SOLUSDT">SOL/USDT</option>
                    </select>
                </div>

                <div style="margin-top: 15px;">
                    <label style="color: #94a3b8; display: block; margin-bottom: 5px; font-size: 12px;">AMOUNT (USDT)</label>
                    <input type="number" id="manualAmount" value="100" style="width: 96%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-weight: bold;">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 25px;">
                    <button onclick="executeManualTrade('BUY')" style="background: #22c55e; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">🟢 Instant BUY</button>
                    <button onclick="executeManualTrade('SELL')" style="background: #ef4444; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">🔴 Instant SELL</button>
                </div>
            </div>
        </div>
    `;
}

async function executeManualTrade(side) {
    const pair = document.getElementById('manualPair').value;
    const amount = document.getElementById('manualAmount').value;
    
    const tradeData = {
        strategyName: "Manual Web Trade",
        pair: pair,
        action: side,
        price: 0,
        quantity: amount,
        timestamp: new Date().toISOString(),
        status: "PENDING"
    };

    try {
        await fetch(`${FIREBASE_BASE_URL}/live_trades.json`, {
            method: 'POST',
            body: JSON.stringify(tradeData)
        });
        alert(`🎉 Manual ${side} order submitted!`);
    } catch (e) {
        alert("❌ Firebase Error.");
    }
}
