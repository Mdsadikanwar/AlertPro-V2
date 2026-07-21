async function renderCryptoStrategies() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${typeof getMarketNavbar === 'function' ? getMarketNavbar() : ''}
        <div style="padding: 15px; max-width: 100%; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0f1d; min-height: 100vh; color: #f8fafc; padding-bottom: 80px;">
            
            <!-- Top Header Bar -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                <button onclick="window.history.back()" style="background: #1e293b; color: #f59e0b; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; font-size: 13px; cursor: pointer;">← Back</button>
                <h2 style="color: #f59e0b; margin: 0; font-size: 18px; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                    <span>₿</span> Crypto Strategies Pro Max
                </h2>
                <div></div>
            </div>

            <!-- Top Navigation / Sub-tabs -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px;">
                <button style="background: #131d31; color: #94a3b8; border: none; padding: 10px 4px; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer; text-align: center;">📊 Sentiment</button>
                <button style="background: #f59e0b; color: #0a0f1d; border: none; padding: 10px 4px; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer; text-align: center;">⚡ Strategy</button>
                <button style="background: #131d31; color: #94a3b8; border: none; padding: 10px 4px; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer; text-align: center;">🤖 AI Suggest</button>
                <button style="background: #131d31; color: #94a3b8; border: none; padding: 10px 4px; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer; text-align: center;">📝 Paper</button>
            </div>

            <!-- Main Builder Container -->
            <div style="background: #101728; border: 1px solid #1e293b; border-radius: 14px; padding: 16px; margin-bottom: 20px;">
                <h3 style="color: #f59e0b; margin-top: 0; margin-bottom: 15px; font-size: 15px; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                    <span>⚡</span> Crypto Strategy Builder Pro
                </h3>
                
                <!-- 1️⃣ Strategy Mode Select Dropdown -->
                <div style="margin-bottom: 14px;">
                    <label style="color: #38bdf8; display: block; margin-bottom: 5px; font-size: 10px; font-weight: bold; text-transform: uppercase;">Strategy Source / Mode</label>
                    <select id="stratMode" onchange="toggleStrategyModeFields()" style="width: 100%; background: #1a233a; border: 1px solid #38bdf8; color: white; padding: 10px; border-radius: 8px; font-weight: bold; font-size: 13px; outline: none; cursor: pointer;">
                        <option value="EMA_RSI_SCALP">⚡ EMA + RSI Scalp / Indicator Model</option>
                        <option value="PERCENTAGE">📊 Percentage Rise/Drop (Grid 0.2%)</option>
                        <option value="CANDLESTICK">🕯️ Candlestick Pattern / Price Action</option>
                        <option value="AI_BASED">🤖 AI-Based Signal Model</option>
                        <option value="CUSTOM_TEXT">✍️ Custom Rule (Plain English)</option>
                        <option value="PINE_SCRIPT">📜 TradingView PineScript Code</option>
                    </select>
                </div>

                <!-- Strategy Name Input -->
                <div style="margin-bottom: 14px;">
                    <label style="color: #64748b; display: block; margin-bottom: 5px; font-size: 10px; font-weight: bold;">STRATEGY NAME</label>
                    <input type="text" id="stratName" value="BTC EMA + RSI Scalp" style="width: 93%; background: #1a233a; border: 1px solid #263352; color: #f8fafc; padding: 10px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; outline: none;">
                </div>

                <!-- Technical Indicator Parameters Grid (Screenshots Exact Fields) -->
                <div id="technicalParamsGrid" style="margin-bottom: 15px;">
                    <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin;">
                        <!-- Coin Select -->
                        <div style="min-width: 65px;">
                            <label style="color: #64748b; font-size: 9px; font-weight: bold; display: block; margin-bottom: 4px;">Coin</label>
                            <select id="stratCoin" style="width: 100%; background: #1a233a; border: 1px solid #263352; color: white; padding: 8px 4px; border-radius: 6px; font-size: 11px; font-weight: bold; outline: none;">
                                <option value="BTC">BTC</option>
                                <option value="ETH">ETH</option>
                                <option value="SOL">SOL</option>
                                <option value="BNB">BNB</option>
                            </select>
                        </div>

                        <!-- Signal TF -->
                        <div style="min-width: 65px;">
                            <label style="color: #64748b; font-size: 9px; font-weight: bold; display: block; margin-bottom: 4px;">Signal TF</label>
                            <select id="stratSignalTF" style="width: 100%; background: #1a233a; border: 1px solid #263352; color: white; padding: 8px 4px; border-radius: 6px; font-size: 11px; font-weight: bold; outline: none;">
                                <option value="1d">1d</option>
                                <option value="4h">4h</option>
                                <option value="1h">1h</option>
                                <option value="15m">15m</option>
                            </select>
                        </div>

                        <!-- Entry TF -->
                        <div style="min-width: 65px;">
                            <label style="color: #64748b; font-size: 9px; font-weight: bold; display: block; margin-bottom: 4px;">Entry TF</label>
                            <select id="stratEntryTF" style="width: 100%; background: #1a233a; border: 1px solid #263352; color: white; padding: 8px 4px; border-radius: 6px; font-size: 11px; font-weight: bold; outline: none;">
                                <option value="1h">1h</option>
                                <option value="15m">15m</option>
                                <option value="5m">5m</option>
                                <option value="1m">1m</option>
                            </select>
                        </div>

                        <!-- EMA Fast -->
                        <div style="min-width: 55px;">
                            <label style="color: #64748b; font-size: 9px; font-weight: bold; display: block; margin-bottom: 4px;">EMA Fast</label>
                            <input type="number" id="emaFast" value="9" style="width: 70%; background: #1a233a; border: 1px solid #263352; color: white; padding: 8px 4px; border-radius: 6px; font-size: 11px; text-align: center; font-weight: bold; outline: none;">
                        </div>

                        <!-- EMA Slow -->
                        <div style="min-width: 55px;">
                            <label style="color: #64748b; font-size: 9px; font-weight: bold; display: block; margin-bottom: 4px;">EMA Slow</label>
                            <input type="number" id="emaSlow" value="21" style="width: 70%; background: #1a233a; border: 1px solid #263352; color: white; padding: 8px 4px; border-radius: 6px; font-size: 11px; text-align: center; font-weight: bold; outline: none;">
                        </div>

                        <!-- EMA 200 Filter -->
                        <div style="min-width: 70px;">
                            <label style="color: #64748b; font-size: 9px; font-weight: bold; display: block; margin-bottom: 4px;">EMA 200 Filter</label>
                            <select id="ema200Filter" style="width: 100%; background: #1a233a; border: 1px solid #263352; color: white; padding: 8px 2px; border-radius: 6px; font-size: 10px; font-weight: bold; outline: none;">
                                <option value="above">Above</option>
                                <option value="below">Below</option>
                                <option value="none">None</option>
                            </select>
                        </div>

                        <!-- RSI Period -->
                        <div style="min-width: 55px;">
                            <label style="color: #64748b; font-size: 9px; font-weight: bold; display: block; margin-bottom: 4px;">RSI Period</label>
                            <input type="number" id="rsiPeriod" value="14" style="width: 70%; background: #1a233a; border: 1px solid #263352; color: white; padding: 8px 4px; border-radius: 6px; font-size: 11px; text-align: center; font-weight: bold; outline: none;">
                        </div>

                        <!-- RSI Buy Level -->
                        <div style="min-width: 60px;">
                            <label style="color: #64748b; font-size: 9px; font-weight: bold; display: block; margin-bottom: 4px;">RSI Buy Level</label>
                            <input type="number" id="rsiBuyLevel" value="45" style="width: 70%; background: #1a233a; border: 1px solid #263352; color: white; padding: 8px 4px; border-radius: 6px; font-size: 11px; text-align: center; font-weight: bold; outline: none;">
                        </div>
                    </div>

                    <!-- Risk Management Row -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; background: #131c30; padding: 10px; border-radius: 8px; border: 1px dashed #263352;">
                        <div>
                            <label style="color: #ef4444; font-size: 10px; font-weight: bold;">🛡️ STOP LOSS (SL %)</label>
                            <input type="number" id="slPercent" value="2" step="0.5" style="width: 80%; background: #1a233a; border: 1px solid #263352; color: white; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                        </div>
                        <div>
                            <label style="color: #22c55e; font-size: 10px; font-weight: bold;">🎯 TAKE PROFIT (TP %)</label>
                            <input type="number" id="tpPercent" value="5" step="0.5" style="width: 80%; background: #1a233a; border: 1px solid #263352; color: white; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                        </div>
                    </div>
                </div>

                <!-- Grid Mode Custom Inputs -->
                <div id="gridPercFields" style="display: none; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <label style="color: #ef4444; font-size: 10px; font-weight: bold;">BUY IF DROP (%)</label>
                        <input type="number" id="buyLow" value="-0.2" step="0.1" style="width: 85%; background: #1a233a; border: 1px solid #263352; color: white; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                    </div>
                    <div>
                        <label style="color: #22c55e; font-size: 10px; font-weight: bold;">SELL IF RISE (%)</label>
                        <input type="number" id="sellHigh" value="0.2" step="0.1" style="width: 85%; background: #1a233a; border: 1px solid #263352; color: white; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                    </div>
                </div>

                <!-- Textarea for Custom Logic/PineScript -->
                <div id="dynamicCodeArea" style="display: none; margin-bottom: 15px;">
                    <label id="dynamicCodeLabel" style="color: #38bdf8; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">SCRIPT / LOGIC INPUT</label>
                    <textarea id="stratCustomCode" rows="4" placeholder="Paste script or write rules here..." style="width: 95%; background: #1a233a; border: 1px solid #263352; color: #38bdf8; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 11px; outline: none;"></textarea>
                </div>

                <!-- Hidden Input to Track Editing Key -->
                <input type="hidden" id="editingStrategyKey" value="">

                <!-- Save Strategy Button -->
                <button id="saveStratBtn" onclick="saveStrategy()" style="width: 100%; background: #f59e0b; color: #0a0f1d; border: none; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">💾 Save & Activate Strategy</button>
            </div>

            <!-- Saved Strategies List Section -->
            <div style="background: #101728; border: 1px solid #1e293b; border-radius: 14px; padding: 16px;">
                <h3 style="color: #f59e0b; margin-top: 0; margin-bottom: 12px; font-size: 14px; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                    <span>📁</span> Meri Crypto Strategies
                </h3>
                <div id="strategiesList" style="display: flex; flex-direction: column; gap: 12px;">
                    <p style="color: #64748b; font-size: 12px; text-align: center;">Loading saved strategies...</p>
                </div>
            </div>
        </div>
    `;
    loadSavedStrategies();
}

// Mode toggle controller
function toggleStrategyModeFields() {
    const mode = document.getElementById('stratMode').value;
    const techGrid = document.getElementById('technicalParamsGrid');
    const percFields = document.getElementById('gridPercFields');
    const codeArea = document.getElementById('dynamicCodeArea');
    const codeLabel = document.getElementById('dynamicCodeLabel');

    if (mode === 'EMA_RSI_SCALP') {
        techGrid.style.display = 'block';
        percFields.style.display = 'none';
        codeArea.style.display = 'none';
    } else if (mode === 'PERCENTAGE') {
        techGrid.style.display = 'none';
        percFields.style.display = 'grid';
        codeArea.style.display = 'none';
    } else {
        techGrid.style.display = 'none';
        percFields.style.display = 'none';
        codeArea.style.display = 'block';

        if (mode === 'CANDLESTICK') {
            codeLabel.innerText = "🕯️ CANDLESTICK PATTERNS (e.g., Bullish Engulfing, Hammer)";
        } else if (mode === 'AI_BASED') {
            codeLabel.innerText = "🤖 AI MODEL PROMPT LOGIC";
        } else if (mode === 'CUSTOM_TEXT') {
            codeLabel.innerText = "✍️ CUSTOM RULES IN PLAIN ENGLISH";
        } else if (mode === 'PINE_SCRIPT') {
            codeLabel.innerText = "📜 TRADINGVIEW PINESCRIPT CODE";
        }
    }
}

// Save or Update Strategy Logic
async function saveStrategy() {
    const mode = document.getElementById('stratMode').value;
    const name = document.getElementById('stratName').value;
    const coin = document.getElementById('stratCoin').value;
    const editingKey = document.getElementById('editingStrategyKey').value;

    const stratData = {
        mode: mode,
        name: name,
        coin: coin,
        signalTF: document.getElementById('stratSignalTF').value,
        entryTF: document.getElementById('stratEntryTF').value,
        emaFast: document.getElementById('emaFast').value,
        emaSlow: document.getElementById('emaSlow').value,
        ema200Filter: document.getElementById('ema200Filter').value,
        rsiPeriod: document.getElementById('rsiPeriod').value,
        rsiBuyLevel: document.getElementById('rsiBuyLevel').value,
        slPercent: document.getElementById('slPercent').value,
        tpPercent: document.getElementById('tpPercent').value,
        buyLowPercent: document.getElementById('buyLow').value,
        sellHighPercent: document.getElementById('sellHigh').value,
        customCode: document.getElementById('stratCustomCode').value || "",
        status: "Active",
        createdAt: new Date().toLocaleDateString()
    };

    const targetKey = editingKey || `${coin}_${Date.now()}`;

    try {
        await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${targetKey}.json`, {
            method: 'PUT',
            body: JSON.stringify(stratData)
        });
        alert(editingKey ? "✏️ Strategy Updated Successfully!" : "🚀 Strategy Saved & Activated!");
        
        // Reset Edit Key & Button Label
        document.getElementById('editingStrategyKey').value = "";
        document.getElementById('saveStratBtn').innerText = "💾 Save & Activate Strategy";
        
        loadSavedStrategies();
    } catch(e) { 
        alert("❌ Error saving strategy!"); 
    }
}

// Load Strategies and Render Exact Screenshot-Style Cards
async function loadSavedStrategies() {
    const cont = document.getElementById('strategiesList');
    if(!cont) return;

    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`);
        const data = await res.json();

        if(!data) {
            cont.innerHTML = `<p style="color: #64748b; font-size: 12px; text-align: center;">No active strategies. Build one above!</p>`;
            return;
        }

        let html = '';
        for(let key in data) {
            const s = data[key];
            const modeBadge = s.mode || 'EMA_RSI_SCALP';
            
            // Calculate Risk Reward Ratio safely
            const sl = parseFloat(s.slPercent) || 2;
            const tp = parseFloat(s.tpPercent) || 5;
            const rrRatio = (tp / sl).toFixed(1);

            html += `
                <div style="background: #131c30; border: 1px solid #1e293b; padding: 14px; border-radius: 12px; font-size: 12px;">
                    <!-- Card Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <b style="color: #f59e0b; font-size: 15px;">${s.name}</b>
                            <span style="background: #8b5cf6; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px;">MTF</span>
                        </div>
                        <span style="background: #22c55e; color: #0a0f1d; padding: 3px 10px; border-radius: 6px; font-weight: bold; font-size: 10px;">Active</span>
                    </div>

                    <!-- Details Summary Box -->
                    <div style="color: #94a3b8; font-size: 11px; line-height: 1.6; margin-bottom: 12px;">
                        <div><b>Coin:</b> ${s.coin || 'BTC'} | <b>Signal:</b> ${s.signalTF || '1d'} | <b>Entry:</b> ${s.entryTF || '1h'}</div>
                        <div><b>EMA:</b> ${s.emaFast || '9'}/${s.emaSlow || '21'} | <b>EMA200:</b> ${s.ema200Filter || 'above'}</div>
                        <div><b>RSI:</b> ${s.rsiPeriod || '14'} < ${s.rsiBuyLevel || '45'} | <b>SL:</b> ${s.slPercent || '2'}% | <b>TP:</b> ${s.tpPercent || '5'}% | <b>R:R:</b> 1:${rrRatio}</div>
                    </div>

                    <!-- Action Buttons Bar (Screenshot Design) -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                        <button onclick="testStrategy('${key}')" style="background: #f59e0b; color: #0a0f1d; border: none; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; cursor: pointer;">📊 Test</button>
                        <button onclick="startStrategy('${key}')" style="background: #0ea5e9; color: white; border: none; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; cursor: pointer;">📱 Start</button>
                        <button onclick="viewChart('${s.coin || 'BTC'}')" style="background: #334155; color: white; border: none; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; cursor: pointer;">📈</button>
                    </div>

                    <!-- Edit and Delete Buttons Bar -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button onclick="editStrategy('${key}')" style="background: #334155; color: #f59e0b; border: none; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            ✏️ <span style="font-size: 11px;">Edit</span>
                        </button>
                        <button onclick="deleteStrategy('${key}')" style="background: #ef4444; color: white; border: none; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            🗑️ <span style="font-size: 11px;">Delete</span>
                        </button>
                    </div>
                </div>
            `;
        }
        cont.innerHTML = html;
    } catch(e) { 
        cont.innerHTML = `<p style="color: #ef4444;">Error loading strategies.</p>`; 
    }
}

// Edit Strategy Function - Populates Form Fields
async function editStrategy(key) {
    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${key}.json`);
        const s = await res.json();
        if(!s) return;

        document.getElementById('editingStrategyKey').value = key;
        document.getElementById('stratMode').value = s.mode || 'EMA_RSI_SCALP';
        toggleStrategyModeFields();

        document.getElementById('stratName').value = s.name || '';
        document.getElementById('stratCoin').value = s.coin || 'BTC';
        document.getElementById('stratSignalTF').value = s.signalTF || '1d';
        document.getElementById('stratEntryTF').value = s.entryTF || '1h';
        document.getElementById('emaFast').value = s.emaFast || '9';
        document.getElementById('emaSlow').value = s.emaSlow || '21';
        document.getElementById('ema200Filter').value = s.ema200Filter || 'above';
        document.getElementById('rsiPeriod').value = s.rsiPeriod || '14';
        document.getElementById('rsiBuyLevel').value = s.rsiBuyLevel || '45';
        document.getElementById('slPercent').value = s.slPercent || '2';
        document.getElementById('tpPercent').value = s.tpPercent || '5';
        document.getElementById('buyLow').value = s.buyLowPercent || '-0.2';
        document.getElementById('sellHigh').value = s.sellHighPercent || '0.2';
        document.getElementById('stratCustomCode').value = s.customCode || '';

        document.getElementById('saveStratBtn').innerText = "✏️ Update Strategy";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch(e) {
        alert("❌ Error fetching strategy details for edit!");
    }
}

// Delete Strategy Function
async function deleteStrategy(key) {
    if(!confirm("क्या आप इस स्ट्रेटेजी को डिलीट करना चाहते हैं?")) return;

    try {
        await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${key}.json`, {
            method: 'DELETE'
        });
        alert("🗑️ Strategy deleted successfully!");
        loadSavedStrategies();
    } catch(e) { 
        alert("❌ Error deleting strategy!"); 
    }
}

function testStrategy(key) {
    alert(`📊 Running Backtest for Strategy: ${key}...`);
}

function startStrategy(key) {
    alert(`🚀 Bot Engine Activated for Strategy: ${key}`);
}

function viewChart(coin) {
    alert(`📈 Opening Chart View for ${coin}`);
}
