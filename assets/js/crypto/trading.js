function renderCryptoTrading() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 30px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
            <h2 style="color: #38bdf8; margin-bottom: 5px;">🔮 Execution Terminal</h2>
            <p style="color: #94a3b8; margin-top: 0; margin-bottom: 30px;">Choose your trading style: Manual Interface or Automated API Engine.</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                
                <!-- ऑप्शन A: वेबसाइट ट्रेडिंग (Manual) -->
                <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 25px;">
                    <h3 style="color: #e2e8f0; margin-top: 0; display: flex; align-items: center; gap: 10px;">💻 Option A: Website Manual Trade</h3>
                    <p style="color: #64748b; font-size: 13px;">Execute instant paper-trades directly from this web UI control room.</p>
                    
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

                <!-- ऑप्शन B: API ट्रेडिंग (Automated via Python Engine) -->
                <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 25px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <h3 style="color: #e2e8f0; margin-top: 0; display: flex; align-items: center; gap: 10px;">🤖 Option B: API Automated Broker</h3>
                        <p style="color: #64748b; font-size: 13px;">Let the backend Python core communicate directly with Binance API via secure keys.</p>
                        
                        <div style="background: #0b0f19; border-left: 4px solid #38bdf8; padding: 15px; border-radius: 4px; margin-top: 20px;">
                            <span style="color: #38bdf8; font-weight: bold; font-size: 12px; display: block;">ENGINE STATUS</span>
                            <span id="apiStatusText" style="color: #22c55e; font-size: 16px; font-weight: bold; display: block; margin-top: 5px;">🟢 Python Runner Connected</span>
                        </div>
                    </div>

                    <div style="margin-top: 25px;">
                        <button onclick="switchTab('settings')" style="width: 100%; background: #374151; color: #38bdf8; border: 1px solid #38bdf8; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; text-transform: uppercase;">
                            ⚙️ Configure API Master Keys
                        </button>
                    </div>
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
        price: 0, // पायथन लाइव प्राइस फेच कर लेगा
        quantity: amount,
        timestamp: new Date().toISOString(),
        status: "PENDING"
    };

    try {
        await fetch(`${FIREBASE_BASE_URL}/live_trades.json`, {
            method: 'POST',
            body: JSON.stringify(tradeData)
        });
        alert(`🎉 Manual ${side} order submitted successfully to Firebase!`);
    } catch (e) {
        alert("❌ Error sending order to Firebase.");
    }
}
