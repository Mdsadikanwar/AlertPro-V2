async function renderBotTrading() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${typeof getMarketNavbar === 'function' ? getMarketNavbar() : ''}
        <div style="padding: 15px; max-width: 100%; margin: 0 auto; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #f8fafc; padding-bottom: 80px;">
            
            <!-- हेडर और Instant Flash Test बटन -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                    <h2 style="color: #38bdf8; margin: 0; font-size: 18px;">🤖 Algorithmic Terminal</h2>
                    <span id="botEngineBadge" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; border: 1px solid rgba(34, 197, 94, 0.3);">ENGINE ONLINE</span>
                </div>

                <!-- ⚡ Manual Flash Test Button -->
                <button onclick="triggerFlashTestTrade('Manual Strategy Test', 'BTC', 'BUY')" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    ⚡ Test Auto Buy
                </button>
            </div>

            <!-- लाइव इंजन स्टैट्स -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
                <div>
                    <span style="color: #64748b; font-size: 10px; font-weight: bold; text-transform: uppercase; display:block;">Bot Wallet Allocation</span>
                    <h2 style="color: #fff; margin: 4px 0 0 0; font-size: 18px;">$10,000.00</h2>
                </div>
                <div>
                    <span style="color: #64748b; font-size: 10px; font-weight: bold; text-transform: uppercase; display:block;">Algorithmic Net PnL</span>
                    <h2 id="botPnLBox" style="color: #38bdf8; margin: 4px 0 0 0; font-size: 18px;">+$0.00</h2>
                </div>
                <div style="grid-column: span 2; border-top: 1px solid #1e293b; padding-top: 8px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between;">
                    <span>Active Strategies: <b id="activeStratCount" style="color: #38bdf8;">Loading...</b></span>
                    <span>Status: <b id="scannerStatusText" style="color: #22c55e;">🟢 Scanning Market</b></span>
                </div>
            </div>

            <!-- लाइव वर्किंग कंसोल इन्फो -->
            <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 12px; margin-bottom: 20px; font-family: monospace;">
                <div style="color: #38bdf8; font-size: 11px; margin-bottom: 4px;">[SYSTEM CONSOLE LOGS]</div>
                <div style="color: #64748b; font-size: 10px;" id="botConsole">Scanning firebase active models... Standing by for signal triggers.</div>
            </div>

            <!-- ऑटोमैटिक ट्रेड हिस्ट्री -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px;">
                <h3 style="color: #e2e8f0; margin-top: 0; margin-bottom: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">🤖 Executed Algo Trades</h3>
                <div id="botOrdersList" style="display: flex; flex-direction: column; gap: 10px; max-height: 350px; overflow-y: auto;">
                    <p style="color: #64748b; font-size: 12px; text-align: center;">Waiting for bot engine trigger...</p>
                </div>
            </div>
        </div>
    `;

    loadActiveStrategiesSummary();
    loadLiveBotTrades();
}

// 📊 सक्रिय ऑटो-स्ट्रेटजीज़ का सारांश प्राप्त करें
async function loadActiveStrategiesSummary() {
    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`);
        const data = await res.json();
        const countBox = document.getElementById('activeStratCount');

        if (!data && countBox) {
            countBox.innerText = "0 Strategies";
            return;
        }

        let activeCount = 0;
        let coinsList = [];

        for (let key in data) {
            const s = data[key];
            const isAuto = s.isAutoActive !== undefined ? s.isAutoActive : true;
            if (isAuto) {
                activeCount++;
                if (s.coin && !coinsList.includes(s.coin)) coinsList.push(s.coin);
            }
        }

        if (countBox) {
            countBox.innerText = `${activeCount} Active (${coinsList.join(', ') || 'None'})`;
        }
    } catch (e) {
        console.log("Error loading active strategies summary");
    }
}

async function loadLiveBotTrades() {
    const listCont = document.getElementById('botOrdersList');
    if (!listCont) return;

    try {
        let res = await fetch(`${FIREBASE_BASE_URL}/bot_trades.json`);
        let data = await res.json();

        if (!data) {
            const fallbackRes = await fetch(`${FIREBASE_BASE_URL}/bot_executed_trades.json`);
            data = await fallbackRes.json();
        }

        if (!data) {
            listCont.innerHTML = `<p style="color: #64748b; font-size: 12px; text-align: center; margin: 15px 0;">No automatic trades executed by strategies yet.</p>`;
            return;
        }

        let html = '';
        let totalBotPnL = 0;
        const keys = Object.keys(data).reverse();

        keys.forEach(key => {
            const t = data[key];
            const action = t.action || t.side || 'BUY';
            const isBuy = action === 'BUY';
            const pair = t.pair || `${t.coin || 'BTC'}/USDT`;
            const stratName = t.strategyName || t.strategy || 'Auto Model';
            const timeStr = t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : 'Recent';
            
            let currentTradePnL = t.pnl !== undefined ? parseFloat(t.pnl) : (isBuy ? 7.50 : -7.50);
            totalBotPnL += currentTradePnL;

            html += `
                <div style="background: #1e293b; border-left: 4px solid ${isBuy ? '#22c55e' : '#ef4444'}; padding: 12px; border-radius: 8px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <div>
                            <span style="background: ${isBuy ? '#22c55e' : '#ef4444'}; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">${action}</span>
                            <b style="color: #fff; margin-left: 5px;">${pair}</b>
                        </div>
                        <span style="color: ${currentTradePnL >= 0 ? '#22c55e' : '#ef4444'}; font-weight: bold;">
                            ${currentTradePnL >= 0 ? '+' : ''}$${currentTradePnL.toFixed(2)}
                        </span>
                    </div>
                    <div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">
                        Strategy: <span style="color: #38bdf8; font-weight: bold;">${stratName}</span> | Price: <b style="color: #fff;">$${t.price}</b>
                    </div>
                    <div style="color: #64748b; font-size: 9px; margin-top: 4px; text-align: right;">Executed: ${timeStr}</div>
                </div>
            `;
        });

        listCont.innerHTML = html;
        
        const pnlBox = document.getElementById('botPnLBox');
        if (pnlBox) {
            pnlBox.innerText = `${totalBotPnL >= 0 ? '+' : ''}$${totalBotPnL.toFixed(2)}`;
            pnlBox.style.color = totalBotPnL >= 0 ? '#38bdf8' : '#ef4444';
        }
        
        const consoleLog = document.getElementById('botConsole');
        if (consoleLog && keys.length > 0) {
            const lastTrade = data[keys[0]];
            consoleLog.innerHTML = `<span style="color: #22c55e;">[AUTO EXECUTED]</span> Last signal trigger on <b style="color:#fff;">${lastTrade.pair || lastTrade.coin}</b> via strategy <b style="color:#38bdf8;">${lastTrade.strategyName || 'Auto Model'}</b>. Engine active and scanning...`;
        }

    } catch(e) { 
        listCont.innerHTML = `<p style="color: #ef4444; font-size: 12px;">Error connecting engine log.</p>`; 
    }
}
