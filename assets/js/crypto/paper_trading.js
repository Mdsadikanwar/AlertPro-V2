async function renderPaperTrading() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 15px; max-width: 100%; margin: 0 auto; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #f8fafc;">
            
            <!-- हेडर -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2 style="color: #38bdf8; margin: 0; font-size: 20px;">📝 Advanced Paper Trading</h2>
                <span style="background: #22c55e; color: #0f172a; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold;">LIVE SIMULATION</span>
            </div>

            <!-- Dashboard Card -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
                <div>
                    <span style="color: #64748b; font-size: 10px; font-weight: bold; text-transform: uppercase; display:block;">Available Balance</span>
                    <h2 id="paperBalance" style="color: #fff; margin: 4px 0 0 0; font-size: 18px;">$10,000.00</h2>
                </div>
                <div>
                    <span style="color: #64748b; font-size: 10px; font-weight: bold; text-transform: uppercase; display:block;">Total Realized PnL</span>
                    <h2 id="paperPnL" style="color: #22c55e; margin: 4px 0 0 0; font-size: 18px;">+$0.00</h2>
                </div>
                <div style="grid-column: span 2; border-top: 1px solid #1e293b; padding-top: 8px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
                    <span>Used Margin: <b id="usedMargin" style="color: #e2e8f0;">$0.00</b></span>
                    <span>Active Trades: <b id="activeTradesCount" style="color: #38bdf8;">0</b></span>
                </div>
            </div>

            <!-- Order Form -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                <h3 style="color: #94a3b8; margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 8px; letter-spacing: 0.5px;">🚀 Institutional Order Form</h3>
                
                <div style="margin-bottom: 12px;">
                    <label style="color: #64748b; display: block; margin-bottom: 5px; font-size: 10px; font-weight:bold;">ASSET (TOP 10 CRYPTO)</label>
                    <select id="paperPair" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; outline: none;">
                        <option value="BTCUSDT">Bitcoin (BTC/USDT)</option>
                        <option value="ETHUSDT">Ethereum (ETH/USDT)</option>
                        <option value="SOLUSDT">Solana (SOL/USDT)</option>
                        <option value="BNBUSDT">BNB (BNB/USDT)</option>
                        <option value="XRPUSDT">Ripple (XRP/USDT)</option>
                        <option value="ADAUSDT">Cardano (ADA/USDT)</option>
                        <option value="DOTUSDT">Polkadot (DOT/USDT)</option>
                        <option value="DOGEUSDT">Dogecoin (DOGE/USDT)</option>
                        <option value="MATICUSDT">Polygon (MATIC/USDT)</option>
                        <option value="AVAXUSDT">Avalanche (AVAX/USDT)</option>
                    </select>
                </div>

                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <label style="color: #64748b; font-size: 10px; font-weight:bold;">ORDER SIZE</label>
                        <select id="amountType" onchange="toggleAmountLabel()" style="background: #1e293b; border: 1px solid #334155; color: #38bdf8; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; outline: none;">
                            <option value="USDT">By USDT ($)</option>
                            <option value="COIN">By Coin Qty</option>
                        </select>
                    </div>
                    <input type="number" id="paperAmount" value="500" style="width: 93%; background: #1e293b; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; outline: none;">
                    <span id="amountHint" style="color: #64748b; font-size: 10px; display: block; margin-top: 4px;">ट्रेड साइज $ में कटाई होगी।</span>
                </div>

                <div style="margin-bottom: 15px; border-top: 1px solid #1e293b; padding-top: 10px;">
                    <label style="color: #64748b; display: block; margin-bottom: 5px; font-size: 10px; font-weight:bold;">RISK MANAGEMENT (R:R RATIO)</label>
                    <select id="rrRatio" onchange="toggleCustomRiskFields()" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; outline: none; margin-bottom: 10px;">
                        <option value="none">None (Manual Exit)</option>
                        <option value="1:1">1:1 (Risk 1% to Win 1%)</option>
                        <option value="1:2">1:2 (Risk 1% to Win 2%)</option>
                        <option value="1:3">1:3 (Risk 1% to Win 3%)</option>
                        <option value="custom">Custom SL / TP (%)</option>
                    </select>

                    <div id="customRiskFields" style="display: none; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="color: #64748b; font-size: 10px;">STOP LOSS (%)</label>
                            <input type="number" id="customSL" value="1" step="0.1" style="width: 85%; background: #1e293b; border: 1px solid #334155; color: #ef4444; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                        </div>
                        <div>
                            <label style="color: #64748b; font-size: 10px;">TAKE PROFIT (%)</label>
                            <input type="number" id="customTP" value="2" step="0.1" style="width: 85%; background: #1e293b; border: 1px solid #334155; color: #22c55e; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <button onclick="submitAdvancedPaperTrade('BUY')" style="background: #22c55e; color: #0f172a; border: none; padding: 14px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">🟢 BUY / LONG</button>
                    <button onclick="submitAdvancedPaperTrade('SELL')" style="background: #ef4444; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">🔴 SELL / SHORT</button>
                </div>
            </div>

            <!-- Positions & History Log -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px;">
                <h3 style="color: #e2e8f0; margin-top: 0; margin-bottom: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">📜 Positions & History Log</h3>
                <div id="paperOrdersList" style="display: flex; flex-direction: column; gap: 10px; max-height: 350px; overflow-y: auto;">
                    <p style="color: #64748b; font-size: 12px; text-align: center; margin: 15px 0;">Syncing advanced trades...</p>
                </div>
            </div>
        </div>
    `;
    loadAdvancedPaperTrades();
}

function toggleAmountLabel() {
    const type = document.getElementById('amountType').value;
    const hint = document.getElementById('amountHint');
    const input = document.getElementById('paperAmount');
    if (type === 'USDT') {
        input.value = "500";
        hint.innerText = "ट्रेड साइज सीधे डॉलर ($) वैल्यू में कैलकुलेट होगा।";
    } else {
        input.value = "0.05";
        hint.innerText = "ट्रेड साइज सीधे कॉइन के नंबर्स (जैसे 0.1 BTC) में कैलकुलेट होगा।";
    }
}

function toggleCustomRiskFields() {
    const rr = document.getElementById('rrRatio').value;
    const fields = document.getElementById('customRiskFields');
    fields.style.display = (rr === 'custom') ? 'grid' : 'none';
}

async function submitAdvancedPaperTrade(side) {
    const pair = document.getElementById('paperPair').value;
    const amountInput = parseFloat(document.getElementById('paperAmount').value) || 0;
    const amountType = document.getElementById('amountType').value;
    const rr = document.getElementById('rrRatio').value;

    if(amountInput <= 0) return alert("❌ वलीड अमाउंट डालो भाई!");

    const symbol = pair.replace('USDT', '');
    let livePrice = 0;

    // 🛠️ फिक्स: स्ट्रिंग लिटरल्स को ठीक किया और बिना API की के बिना रुकावट के लिए बाइनेंस पब्लिक API बैकअप जोड़ा
    try {
        const pRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
        const pData = await pRes.json();
        livePrice = parseFloat(pData.price) || 0;
    } catch(e) {
        // बैकअप API अगर बाइनेंस ब्लॉक हो
        try {
            const pRes = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`);
            const pData = await pRes.json();
            livePrice = parseFloat(pData.USD) || 0;
        } catch(err) {
            livePrice = 0;
        }
    }

    if (!livePrice || livePrice === 0) {
        return alert("❌ लाइव रेट फेच नहीं हो पाया! कृपया इंटरनेट या API चेक करें।");
    }

    let finalUsdtValue = 0;
    let finalCoinQty = 0;

    if (amountType === 'USDT') {
        finalUsdtValue = amountInput;
        finalCoinQty = (amountInput / livePrice).toFixed(5);
    } else {
        finalCoinQty = amountInput;
        finalUsdtValue = amountInput * livePrice;
    }

    let slPercent = 0, tpPercent = 0;
    if (rr === '1:1') { slPercent = 1; tpPercent = 1; }
    else if (rr === '1:2') { slPercent = 1; tpPercent = 2; }
    else if (rr === '1:3') { slPercent = 1; tpPercent = 3; }
    else if (rr === 'custom') {
        slPercent = parseFloat(document.getElementById('customSL').value) || 0;
        tpPercent = parseFloat(document.getElementById('customTP').value) || 0;
    }

    const tradePacket = {
        pair: pair,
        action: side,
        entryPrice: livePrice,
        usdtValue: finalUsdtValue.toFixed(2),
        coinQty: finalCoinQty,
        amountType: amountType,
        slPercent: slPercent,
        tpPercent: tpPercent,
        timestamp: new Date().toLocaleTimeString(),
        status: "FILLED",
        pnl: "0.00"
    };

    try {
        await fetch(`${FIREBASE_BASE_URL}/paper_trades.json`, {
            method: 'POST',
            body: JSON.stringify(tradePacket)
        });
        alert(`🟢 Order Success: ${side} ${finalCoinQty} ${symbol} at $${livePrice}`);
        loadAdvancedPaperTrades();
    } catch(e) { alert("❌ डेटाबेस सिंक फेल!"); }
}

async function loadAdvancedPaperTrades() {
    const listCont = document.getElementById('paperOrdersList');
    if (!listCont) return;

    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/paper_trades.json`);
        const data = await res.json();
        
        let initialBalance = 10000; 
        let totalPnL = 0;
        let usedMargin = 0;
        let activeCount = 0;

        if (!data) {
            listCont.innerHTML = `<p style="color: #64748b; font-size: 12px; text-align: center; margin: 15px 0;">No active positions or logs found.</p>`;
            document.getElementById('paperBalance').innerText = `$${initialBalance.toFixed(2)}`;
            document.getElementById('paperPnL').innerText = `+$0.00`;
            document.getElementById('usedMargin').innerText = `$0.00`;
            document.getElementById('activeTradesCount').innerText = "0";
            return;
        }

        let html = '';
        const keys = Object.keys(data).reverse();

        keys.forEach(key => {
            const t = data[key];
            const isBuy = t.action === 'BUY';
            const margin = parseFloat(t.usdtValue) || 0;
            
            usedMargin += margin;
            activeCount++;

            let mockPnl = (margin * 0.015).toFixed(2); 
            if(!isBuy) mockPnl = (mockPnl * -1).toFixed(2);
            totalPnL += parseFloat(mockPnl);

            html += `
                <div style="background: #1e293b; border-left: 4px solid ${isBuy ? '#22c55e' : '#ef4444'}; padding: 12px; border-radius: 8px; font-size: 12px; margin-bottom: 5px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <div>
                            <span style="background: ${isBuy ? '#22c55e' : '#ef4444'}; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">${t.action}</span>
                            <span style="color: #fff; font-weight: bold; margin-left: 6px;">${t.pair}</span>
                        </div>
                        <span style="color: ${parseFloat(mockPnl) >= 0 ? '#22c55e' : '#ef4444'}; font-weight: bold;">
                            ${parseFloat(mockPnl) >= 0 ? '+' : ''}$${mockPnl}
                        </span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; color: #94a3b8; font-size: 11px; margin-top: 8px; background: #111827; padding: 6px; border-radius: 4px;">
                        <div>Entry: <b style="color: #fff;">$${t.entryPrice}</b></div>
                        <div>Qty: <b style="color: #fff;">${t.coinQty}</b></div>
                        <div>Margin: <b style="color: #fff;">$${t.usdtValue}</b></div>
                        <div>Risk/RR: <b style="color: #38bdf8;">${t.tpPercent > 0 ? `SL:${t.slPercent}% | TP:${t.tpPercent}%` : 'None'}</b></div>
                    </div>
                    <div style="color: #64748b; font-size: 10px; margin-top: 6px; text-align: right;">Time: ${t.timestamp}</div>
                </div>
            `;
        });

        listCont.innerHTML = html;
        
        document.getElementById('paperBalance').innerText = `$${(initialBalance - usedMargin + totalPnL).toFixed(2)}`;
        const pnlBox = document.getElementById('paperPnL');
        pnlBox.innerText = `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`;
        pnlBox.style.color = totalPnL >= 0 ? '#22c55e' : '#ef4444';
        document.getElementById('usedMargin').innerText = `$${usedMargin.toFixed(2)}`;
        document.getElementById('activeTradesCount').innerText = activeCount;

    } catch(e) { listCont.innerHTML = `<p style="color: #ef4444; font-size: 12px;">Error connecting network.</p>`; }
}
