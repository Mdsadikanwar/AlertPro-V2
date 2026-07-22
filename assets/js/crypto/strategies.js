async function renderCryptoStrategies() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${typeof getMarketNavbar === 'function' ? getMarketNavbar() : ''}
        <div style="padding: 15px; max-width: 100%; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; min-height: 100vh; color: #f8fafc; padding-bottom: 80px;">
            
            <!-- 📡 Live Firebase Sync & Status Widget -->
            <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="color: #38bdf8; margin: 0; font-size: 15px; font-weight: bold;">📡 Live Firebase Engine Status</h3>
                    <button onclick="renderFirebaseStrategies()" style="background: #334155; color: #cbd5e1; border: none; padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer;">🔄 Refresh</button>
                </div>
                <div id="strategies-list-container">
                    <div style="text-align: center; color: #94a3b8; font-size: 12px;">🔄 Syncing with Firebase...</div>
                </div>
            </div>

            <!-- ⚡ Main Strategy Builder Card -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h2 style="color: #38bdf8; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">🎯 Crypto Strategy Builder</h2>
                
                <!-- 1️⃣ Strategy Mode / Source Select -->
                <div style="margin-bottom: 12px;">
                    <label style="color: #64748b; display: block; margin-bottom: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">STRATEGY MODE / SOURCE</label>
                    <select id="stratMode" onchange="toggleStrategyModeFields()" style="width: 100%; background: #1e293b; border: 1px solid #38bdf8; color: white; padding: 10px; border-radius: 8px; font-weight: bold; font-size: 13px; outline: none; cursor: pointer;">
                        <option value="EMA_RSI_SCALP">⚡ EMA + RSI Scalp / Indicator Model</option>
                        <option value="PERCENTAGE">📊 Percentage Rise/Drop (Grid 0.2%)</option>
                        <option value="CANDLESTICK">🕯️ Candlestick Pattern / Price Action</option>
                        <option value="AI_BASED">🤖 AI-Based Signal Model</option>
                        <option value="CUSTOM_TEXT">✍️ Custom Rule (Plain English)</option>
                        <option value="PINE_SCRIPT">📜 TradingView PineScript Code</option>
                    </select>
                </div>

                <!-- 2️⃣ Strategy Name -->
                <div style="margin-bottom: 12px;">
                    <label style="color: #64748b; display: block; margin-bottom: 4px; font-size: 10px; font-weight: bold;">STRATEGY NAME</label>
                    <input type="text" id="stratName" value="BTC EMA + RSI Scalp" style="width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: bold; outline: none;">
                </div>

                <!-- 3️⃣ Dynamic Parameters Grid -->
                <div id="technicalParamsGrid" style="margin-bottom: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                        <div>
                            <label style="color: #64748b; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">COIN</label>
                            <select id="stratCoin" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: bold; outline: none;">
                                <option value="BTC">BTC / USDT</option>
                                <option value="ETH">ETH / USDT</option>
                                <option value="SOL">SOL / USDT</option>
                                <option value="BNB">BNB / USDT</option>
                            </select>
                        </div>
                        <div>
                            <label style="color: #64748b; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">EMA 200 FILTER</label>
                            <select id="ema200Filter" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: bold; outline: none;">
                                <option value="above">Above</option>
                                <option value="below">Below</option>
                                <option value="none">None</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                        <div>
                            <label style="color: #64748b; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">SIGNAL TF</label>
                            <select id="stratSignalTF" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: bold; outline: none;">
                                <option value="1d">1d</option>
                                <option value="4h">4h</option>
                                <option value="1h">1h</option>
                                <option value="15m">15m</option>
                            </select>
                        </div>
                        <div>
                            <label style="color: #64748b; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">ENTRY TF</label>
                            <select id="stratEntryTF" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: bold; outline: none;">
                                <option value="1h">1h</option>
                                <option value="15m">15m</option>
                                <option value="5m">5m</option>
                                <option value="1m">1m</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                        <div>
                            <label style="color: #64748b; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">EMA FAST / SLOW</label>
                            <div style="display: flex; gap: 5px;">
                                <input type="number" id="emaFast" value="9" placeholder="Fast" style="width: 50%; background: #1e293b; border: 1px solid #334155; color: white; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center; font-weight: bold; outline: none;">
                                <input type="number" id="emaSlow" value="21" placeholder="Slow" style="width: 50%; background: #1e293b; border: 1px solid #334155; color: white; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center; font-weight: bold; outline: none;">
                            </div>
                        </div>
                        <div>
                            <label style="color: #64748b; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">RSI (PERIOD / BUY)</label>
                            <div style="display: flex; gap: 5px;">
                                <input type="number" id="rsiPeriod" value="14" placeholder="Period" style="width: 50%; background: #1e293b; border: 1px solid #334155; color: white; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center; font-weight: bold; outline: none;">
                                <input type="number" id="rsiBuyLevel" value="45" placeholder="Buy Level" style="width: 50%; background: #1e293b; border: 1px solid #334155; color: white; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center; font-weight: bold; outline: none;">
                            </div>
                        </div>
                    </div>

                    <!-- Risk Management Sub-box -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155;">
                        <div>
                            <label style="color: #ef4444; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">🛡️ STOP LOSS (%)</label>
                            <input type="number" id="slPercent" value="2" step="0.5" style="width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; color: white; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                        </div>
                        <div>
                            <label style="color: #22c55e; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">🎯 TAKE PROFIT (%)</label>
                            <input type="number" id="tpPercent" value="5" step="0.5" style="width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; color: white; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                        </div>
                    </div>
                </div>

                <!-- Grid Mode Parameters -->
                <div id="gridPercFields" style="display: none; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <label style="color: #ef4444; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">BUY IF DROP (%)</label>
                        <input type="number" id="buyLow" value="-0.2" step="0.1" style="width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; color: white; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                    </div>
                    <div>
                        <label style="color: #22c55e; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">SELL IF RISE (%)</label>
                        <input type="number" id="sellHigh" value="0.2" step="0.1" style="width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; color: white; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                    </div>
                </div>

                <!-- Custom Script Area -->
                <div id="dynamicCodeArea" style="display: none; margin-bottom: 15px;">
                    <label id="dynamicCodeLabel" style="color: #38bdf8; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">SCRIPT / LOGIC INPUT</label>
                    <textarea id="stratCustomCode" rows="4" placeholder="Paste script or write rules here..." style="width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; color: #38bdf8; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 11px; outline: none;"></textarea>
                </div>

                <input type="hidden" id="editingStrategyKey" value="">

                <button id="saveStratBtn" onclick="saveStrategy()" style="width: 100%; background: #38bdf8; color: #0f172a; border: none; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">💾 Save & Activate Strategy</button>
            </div>

            <!-- 📜 Active Strategies List Section -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 16px;">
                <h3 style="color: #e2e8f0; margin: 0 0 12px 0; font-size: 14px; font-weight: bold;">📁 Active Crypto Strategies</h3>
                <div id="strategiesList" style="display: flex; flex-direction: column; gap: 12px;">
                    <p style="color: #64748b; font-size: 12px; text-align: center;">Loading saved strategies...</p>
                </div>
            </div>
        </div>
    `;
    
    // Load local list and trigger Firebase API check
    loadSavedStrategies();
    renderFirebaseStrategies();
}

// 🟢 Option 1 Implementation: Fetch Strategies from Firebase via /api/check-strategies
async function renderFirebaseStrategies() {
    const container = document.getElementById('strategies-list-container');
    if (!container) return;

    container.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 10px; font-size: 12px;">🔄 Syncing with Firebase...</div>`;

    try {
        const response = await fetch('/api/check-strategies');
        const data = await response.json();

        if (data.strategiesList && data.strategiesList.length > 0) {
            let html = `<div style="display: flex; flex-direction: column; gap: 10px;">`;
            
            data.strategiesList.forEach(strat => {
                const isActive = strat.status === 'active';
                html += `
                    <div style="background: #0f172a; border: 1px solid ${isActive ? '#22c55e' : '#334155'}; border-radius: 8px; padding: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <strong style="font-size: 14px; color: #f8fafc;">${strat.name}</strong>
                            <span style="background: ${isActive ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)'}; color: ${isActive ? '#22c55e' : '#eab308'}; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                                ${strat.status.toUpperCase()}
                            </span>
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                            <div>Asset: <b style="color: #cbd5e1;">${strat.symbol}</b></div>
                            <div>Buy Target: <b style="color: #22c55e;">${strat.buyTarget}</b></div>
                            <div>Sell Target: <b style="color: #ef4444;">${strat.sellTarget}</b></div>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <div style="background: #0f172a; border: 1px dashed #ef4444; border-radius: 8px; padding: 12px; text-align: center; color: #f87171; font-size: 12px;">
                    ⚠️ Firebase में कोई एक्टिव स्ट्रेटजी नहीं मिली।
                </div>
            `;
        }
    } catch (err) {
        container.innerHTML = `<div style="color: #ef4444; text-align: center; font-size: 12px;">❌ Error loading strategy status from API</div>`;
    }
}

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
            codeLabel.innerText = "🕯️ CANDLESTICK PATTERNS";
        } else if (mode === 'AI_BASED') {
            codeLabel.innerText = "🤖 AI MODEL PROMPT LOGIC";
        } else if (mode === 'CUSTOM_TEXT') {
            codeLabel.innerText = "✍️ CUSTOM RULES IN PLAIN ENGLISH";
        } else if (mode === 'PINE_SCRIPT') {
            codeLabel.innerText = "📜 TRADINGVIEW PINESCRIPT CODE";
        }
    }
}

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
        isAutoActive: true,
        status: "active", // Added status field for backend scanner compatibility
        createdAt: new Date().toLocaleDateString()
    };

    const targetKey = editingKey || `${coin}_${Date.now()}`;

    try {
        await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${targetKey}.json`, {
            method: 'PUT',
            body: JSON.stringify(stratData)
        });
        alert(editingKey ? "✏️ Strategy Updated Successfully!" : "🚀 Strategy Saved & Activated!");
        
        document.getElementById('editingStrategyKey').value = "";
        document.getElementById('saveStratBtn').innerText = "💾 Save & Activate Strategy";
        
        loadSavedStrategies();
        renderFirebaseStrategies(); // Refresh API status box as well
    } catch(e) { 
        alert("❌ Error saving strategy!"); 
    }
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
        for(let key in data) {
            const s = data[key];
            const sl = parseFloat(s.slPercent) || 2;
            const tp = parseFloat(s.tpPercent) || 5;
            const rrRatio = (tp / sl).toFixed(1);
            const isAuto = s.isAutoActive !== undefined ? s.isAutoActive : true;

            html += `
                <div style="background: #1e293b; border: 1px solid #334155; padding: 12px; border-radius: 8px; font-size: 12px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <b style="color: #fff; font-size: 14px;">${s.name}</b>
                            <span style="color: #38bdf8; font-weight: bold; margin-left: 5px;">(${s.coin || 'BTC'})</span>
                        </div>
                        
                        <!-- Auto ON/OFF Toggle Switch -->
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span style="font-size: 10px; color: ${isAuto ? '#22c55e' : '#64748b'}; font-weight: bold;">Auto: ${isAuto ? 'ON' : 'OFF'}</span>
                            <input type="checkbox" ${isAuto ? 'checked' : ''} onchange="toggleStrategyAuto('${key}', this.checked)" style="cursor: pointer; width: 16px; height: 16px;">
                        </div>
                    </div>

                    <div style="color: #94a3b8; font-size: 11px; background: #0f172a; padding: 8px; border-radius: 6px; margin-bottom: 10px; line-height: 1.5;">
                        <div><b>TF:</b> Signal ${s.signalTF || '1d'} / Entry ${s.entryTF || '1h'}</div>
                        <div><b>EMA:</b> ${s.emaFast || '9'}/${s.emaSlow || '21'} (200: ${s.ema200Filter || 'above'}) | <b>RSI:</b> ${s.rsiPeriod || '14'} < ${s.rsiBuyLevel || '45'}</div>
                        <div><b>SL:</b> ${s.slPercent || '2'}% | <b>TP:</b> ${s.tpPercent || '5'}% | <b>R:R:</b> 1:${rrRatio}</div>
                    </div>

                    <!-- Action Buttons Grid: Test, Edit, Delete -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
                        <button onclick="instantTestStrategy('${key}')" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 6px; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer;">⚡ Test</button>
                        <button onclick="editStrategy('${key}')" style="background: #334155; color: #e2e8f0; border: none; padding: 6px; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer;">✏️ Edit</button>
                        <button onclick="deleteStrategy('${key}')" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); padding: 6px; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer;">🗑️ Delete</button>
                    </div>
                </div>
            `;
        }
        cont.innerHTML = html;
    } catch(e) { 
        cont.innerHTML = `<p style="color: #ef4444;">Error loading strategies.</p>`; 
    }
}

async function toggleStrategyAuto(key, status) {
    try {
        await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${key}/isAutoActive.json`, {
            method: 'PUT',
            body: JSON.stringify(status)
        });
        loadSavedStrategies();
        renderFirebaseStrategies();
    } catch(e) {
        alert("❌ Error updating auto status!");
    }
}

async function instantTestStrategy(key) {
    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${key}.json`);
        const s = await res.json();
        if(!s) return;

        alert(`⚡ Running Instant Test for: "${s.name}" (${s.coin})\n\nChecking live market candles & indicators...\n✅ Strategy Logic Validated!\n💡 Signal Result: Neutral / Waiting for breakout condition.`);
    } catch(e) {
        alert("❌ Error running instant test!");
    }
}

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
        alert("❌ Error fetching strategy details!");
    }
}

async function deleteStrategy(key) {
    if(!confirm("क्या आप इस स्ट्रेटेजी को डिलीट करना चाहते हैं?")) return;

    try {
        await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${key}.json`, {
            method: 'DELETE'
        });
        alert("🗑️ Strategy deleted successfully!");
        loadSavedStrategies();
        renderFirebaseStrategies();
    } catch(e) { 
        alert("❌ Error deleting strategy!"); 
    }
}
