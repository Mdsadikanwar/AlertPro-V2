async function renderCryptoStrategies() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 15px; max-width: 100%; margin: 0 auto; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #f8fafc; padding-bottom: 80px;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                    <h2 style="color: #38bdf8; margin: 0; font-size: 20px; font-weight: bold;">🎯 Algo Strategies</h2>
                    <span style="color: #64748b; font-size: 11px;">Create automatic trade triggers</span>
                </div>
            </div>

            <!-- ➕ नई स्ट्रेटेजी फॉर्म -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                <h3 style="color: #e2e8f0; margin-top: 0; margin-bottom: 15px; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">⚙️ Create Bot Logic</h3>
                
                <!-- 🎯 1. सबसे पहला ड्रॉपडाउन (STRATEGY MODE) -->
                <div style="margin-bottom: 15px; background: #1e293b; padding: 10px; border-radius: 8px; border: 1px solid #38bdf8;">
                    <label style="color: #38bdf8; display: block; margin-bottom: 6px; font-size: 11px; font-weight: bold;">SELECT STRATEGY MODE / SOURCE Mode</label>
                    <select id="stratMode" onchange="toggleStrategyModeFields()" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 13px; outline: none; cursor: pointer;">
                        <option value="PERCENTAGE">📊 Percentage Rise / Drop Mode (Default 0.2%)</option>
                        <option value="CANDLESTICK">🕯️ Candlestick Pattern / Price Action</option>
                        <option value="AI_BASED">🤖 AI-Based Model / Machine Learning Logic</option>
                        <option value="CUSTOM_TEXT">✍️ Custom Logic (Write in Plain English)</option>
                        <option value="PINE_SCRIPT">📜 TradingView PineScript / Copied Script</option>
                    </select>
                </div>

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

                <!-- कंडीशंस ग्रिड (PERCENTAGE MODE) -->
                <div id="gridPercFields" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <label style="color: #ef4444; font-size: 10px; font-weight: bold;">BUY IF DROP (%)</label>
                        <input type="number" id="buyLow" value="-0.2" step="0.1" style="width: 85%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 13px; outline: none;">
                    </div>
                    <div>
                        <label style="color: #22c55e; font-size: 10px; font-weight: bold;">SELL IF RISE (%)</label>
                        <input type="number" id="sellHigh" value="0.2" step="0.1" style="width: 85%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 13px; outline: none;">
                    </div>
                </div>

                <!-- टेक्स्ट-एरिया (AI / CANDLESTICK / SCRIPT MODES) -->
                <div id="dynamicCodeArea" style="display: none; margin-bottom: 15px;">
                    <label id="dynamicCodeLabel" style="color: #38bdf8; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">SCRIPT / LOGIC INPUT</label>
                    <textarea id="stratCustomCode" rows="4" placeholder="Paste script or write rules here..." style="width: 95%; background: #1e293b; border: 1px solid #334155; color: #38bdf8; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 12px; outline: none;"></textarea>
                </div>

                <button onclick="saveStrategy()" style="width: 100%; background: #38bdf8; color: #0f172a; border: none; padding: 14px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">💾 Save & Activate Strategy</button>
            </div>

            <!-- 📜 एक्टिव स्ट्रेटेजीज लिस्ट -->
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

function toggleStrategyModeFields() {
    const mode = document.getElementById('stratMode').value;
    const percFields = document.getElementById('gridPercFields');
    const codeArea = document.getElementById('dynamicCodeArea');
    const codeLabel = document.getElementById('dynamicCodeLabel');

    if (mode === 'PERCENTAGE') {
        percFields.style.display = 'grid';
        codeArea.style.display = 'none';
    } else {
        percFields.style.display = 'none';
        codeArea.style.display = 'block';

        if (mode === 'CANDLESTICK') {
            codeLabel.innerText = "🕯️ CANDLESTICK PATTERNS (e.g., Bullish Engulfing, Hammer, Doji)";
        } else if (mode === 'AI_BASED') {
            codeLabel.innerText = "🤖 AI MODEL LOGIC / PROMPT";
        } else if (mode === 'CUSTOM_TEXT') {
            codeLabel.innerText = "✍️ WRITE RULES IN PLAIN ENGLISH";
        } else if (mode === 'PINE_SCRIPT') {
            codeLabel.innerText = "📜 TRADINGVIEW PINESCRIPT / AI SCRIPT CODE";
        }
    }
}

async function saveStrategy() {
    const mode = document.getElementById('stratMode').value;
    const name = document.getElementById('stratName').value;
    const pair = document.getElementById('stratPair').value;
    const buyLow = document.getElementById('buyLow').value;
    const sellHigh = document.getElementById('sellHigh').value;
    const customCode = document.getElementById('stratCustomCode').value;

    const stratData = {
        mode: mode,
        name: name,
        buyLowPercent: buyLow,
        sellHighPercent: sellHigh,
        customCode: customCode || "",
        status: "Active",
        createdAt: new Date().toLocaleDateString()
    };

    try {
        await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${pair}.json`, {
            method: 'PUT',
            body: JSON.stringify(stratData)
        });
        alert(`🚀 Strategy (${mode}) Saved & Attached to Live Bot Engine!`);
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
            const modeBadge = s.mode || 'PERCENTAGE';
            
            html += `
                <div style="background: #1e293b; border: 1px solid #334155; padding: 12px; border-radius: 8px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <b style="color: #fff; font-size: 14px;">${s.name}</b>
                            <span style="color: #38bdf8; font-weight: bold; margin-left: 5px;">(${pair})</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 10px;">${modeBadge}</span>
                            <button onclick="deleteStrategy('${pair}')" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">🗑️</button>
                        </div>
                    </div>
                    
                    ${s.mode === 'PERCENTAGE' || !s.mode ? `
                        <div style="display: flex; gap: 15px; color: #94a3b8; font-size: 11px; background: #111827; padding: 6px; border-radius: 4px;">
                            <div>Trigger Buy: <b style="color: #ef4444;">${s.buyLowPercent}% Drop</b></div>
                            <div>Trigger Sell: <b style="color: #22c55e;">+${s.sellHighPercent}% Rise</b></div>
                        </div>
                    ` : `
                        <div style="color: #38bdf8; font-family: monospace; font-size: 11px; background: #111827; padding: 6px; border-radius: 4px; max-height: 60px; overflow-y: auto;">
                            ${s.customCode || "Custom Mode Configured"}
                        </div>
                    `}
                    
                    <div style="text-align: right; margin-top: 6px; font-size: 9px; color: #64748b;">Activated: ${s.createdAt}</div>
                </div>
            `;
        }
        cont.innerHTML = html;
    } catch(e) { cont.innerHTML = `<p style="color: #ef4444;">Error loading rules.</p>`; }
}

async function deleteStrategy(pair) {
    if(!confirm(`क्या आप ${pair} की स्ट्रेटेजी डिलीट करना चाहते हैं?`)) return;

    try {
        await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${pair}.json`, {
            method: 'DELETE'
        });
        alert("🗑️ Strategy deleted successfully!");
        loadSavedStrategies();
    } catch(e) { alert("❌ डिलीट करने में एरर आया!"); }
}
