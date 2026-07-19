async function renderCryptoStrategies() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 15px; max-width: 100%; margin: 0 auto; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #f8fafc;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                    <h2 style="color: #38bdf8; margin: 0; font-size: 20px;">🎯 Algo Strategies</h2>
                    <span style="color: #64748b; font-size: 11px;">Create automatic trade triggers</span>
                </div>
            </div>

            <!-- ➕ नई स्ट्रेटेजी बनाने का फॉर्म -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                <h3 style="color: #e2e8f0; margin-top: 0; margin-bottom: 15px; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">⚙️ Create Bot Logic</h3>
                
                <div style="margin-bottom: 12px;">
                    <label style="color: #64748b; display: block; margin-bottom: 5px; font-size: 10px; font-weight:bold;">STRATEGY NAME</label>
                    <input type="text" id="stratName" value="Crypto Grid Alpha" style="width: 93%; background: #1e293b; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; outline: none;">
                </div>

                <div style="margin-bottom: 12px;">
                    <label style="color: #64748b; display: block; margin-bottom: 5px; font-size: 10px; font-weight:bold;">SELECT PAIR</label>
                    <select id="stratPair" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; outline: none;">
                        <option value="BTCUSDT">BTC/USDT</option>
                        <option value="ETHUSDT">ETH/USDT</option>
                        <option value="SOLUSDT">SOL/USDT</option>
                        <option value="BNBUSDT">BNB/USDT</option>
                    </select>
                </div>

                <!-- कंडीशंस ग्रिड -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <label style="color: #ef4444; font-size: 10px; font-weight: bold;">BUY IF DROP (%)</label>
                        <input type="number" id="buyLow" value="-1.5" step="0.1" style="width: 85%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 13px; outline: none;">
                    </div>
                    <div>
                        <label style="color: #22c55e; font-size: 10px; font-weight: bold;">SELL IF RISE (%)</label>
                        <input type="number" id="sellHigh" value="2.5" step="0.1" style="width: 85%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 13px; outline: none;">
                    </div>
                </div>

                <button onclick="saveStrategy()" style="width: 100%; background: #38bdf8; color: #0f172a; border: none; padding: 14px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">💾 Save & Activate Strategy</button>
            </div>

            <!-- 📜 एक्टिव स्ट्रेटेजीज की लिस्ट -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px;">
                <h3 style="color: #e2e8f0; margin-top: 0; margin-bottom: 12px; font-size: 13px; text-transform: uppercase;">⚡ Active Bot Rules</h3>
                <div id="strategiesList" style="display: flex; flex-direction: column; gap: 10px;">
                    <p style="color: #64748b; font-size: 12px; text-align: center;">Loading strategies...</p>
                </div>
            </div>
        </div>
    `;
    loadSavedStrategies();
}

async function saveStrategy() {
    const name = document.getElementById('stratName').value;
    const pair = document.getElementById('stratPair').value;
    const buyLow = document.getElementById('buyLow').value;
    const sellHigh = document.getElementById('sellHigh').value;

    const stratData = {
        name: name,
        buyLowPercent: buyLow,
        sellHighPercent: sellHigh,
        status: "Active",
        createdAt: new Date().toLocaleDateString()
    };

    try {
        // इसे सीधे उसी नोड पर सेट कर रहे हैं जहाँ से main.js का इंजन डेटा रीड करता है
        await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${pair}.json`, {
            method: 'PUT',
            body: JSON.stringify(stratData)
        });
        alert("🚀 Strategy Saved & Attached to Live Bot Engine!");
        loadSavedStrategies();
    } catch(e) { alert("❌ सेव करने में एरर आया!"); }
}

async function loadSavedStrategies() {
    const cont = document.getElementById('strategiesList');
    if(!cont) return;

    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`);
        const data = await res.json();

        if(!data) {
            cont.innerHTML = `<p style="color: #64748b; font-size: 12px; text-align: center;">No active strategies. Create one above!</p>`;
            return;
        }

        let html = '';
        for(let pair in data) {
            const s = data[pair];
            html += `
                <div style="background: #1e293b; border: 1px solid #334155; padding: 12px; border-radius: 8px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <b style="color: #fff; font-size: 14px;">${s.name}</b>
                            <span style="color: #38bdf8; font-weight: bold; margin-left: 5px;">(${pair})</span>
                        </div>
                        <span style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 10px;">${s.status}</span>
                    </div>
                    <div style="display: flex; gap: 15px; color: #94a3b8; font-size: 11px; background: #111827; padding: 6px; border-radius: 4px;">
                        <div>Trigger Buy: <b style="color: #ef4444;">${s.buyLowPercent}% Drop</b></div>
                        <div>Trigger Sell: <b style="color: #22c55e;">+${s.sellHighPercent}% Rise</b></div>
                    </div>
                    <div style="text-align: right; margin-top: 6px; font-size: 9px; color: #64748b;">Activated: ${s.createdAt}</div>
                </div>
            `;
        }
        cont.innerHTML = html;
    } catch(e) { cont.innerHTML = `<p style="color: #ef4444;">Error loading rules.</p>`; }
}
