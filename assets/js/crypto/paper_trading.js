async function renderPaperTrading() {
    const root = document.getElementById('app');
    if (!root) return;

    // मोबाइल-फ्रेंडली यूआई (पूरी स्क्रीन फिट)
    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 15px; max-width: 100%; margin: 0 auto; font-family: sans-serif; background: #0f172a; min-height: 100vh;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2 style="color: #38bdf8; margin: 0; font-size: 20px;">📝 Paper Trading</h2>
                <span style="background: #1e293b; color: #38bdf8; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; border: 1px solid #334155;">MANUAL MODE</span>
            </div>

            <!-- लाइव पीएनएल और बैलेंस कार्ड -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div>
                    <span style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Paper Balance</span>
                    <h2 style="color: #fff; margin: 5px 0 0 0; font-size: 18px;">$10,000.00</h2>
                </div>
                <div>
                    <span style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Manual PnL</span>
                    <h2 id="paperPnL" style="color: #22c55e; margin: 5px 0 0 0; font-size: 18px;">+$0.00</h2>
                </div>
            </div>

            <!-- मोबाइल ऑर्डर फॉर्म कार्ड -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                <h3 style="color: #e2e8f0; margin-top: 0; margin-bottom: 15px; font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">🚀 Place Order</h3>
                
                <div style="margin-bottom: 12px;">
                    <label style="color: #94a3b8; display: block; margin-bottom: 5px; font-size: 11px;">SELECT CRYPTO</label>
                    <select id="paperPair" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; outline: none;">
                        <option value="BTCUSDT">BTC/USDT</option>
                        <option value="ETHUSDT">ETH/USDT</option>
                        <option value="SOLUSDT">SOL/USDT</option>
                    </select>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="color: #94a3b8; display: block; margin-bottom: 5px; font-size: 11px;">AMOUNT (USDT)</label>
                    <input type="number" id="paperAmount" value="500" style="width: 93%; background: #1e293b; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; outline: none;">
                </div>

                <!-- बड़े मोबाइल टच बटन्स -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <button onclick="submitPaperTrade('BUY')" style="background: #22c55e; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; transition: background 0.2s;">🟢 BUY</button>
                    <button onclick="submitPaperTrade('SELL')" style="background: #ef4444; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; transition: background 0.2s;">🔴 SELL</button>
                </div>
            </div>

            <!-- लाइव हिस्ट्री सेक्शन -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px;">
                <h3 style="color: #e2e8f0; margin-top: 0; margin-bottom: 10px; font-size: 14px; text-transform: uppercase;">📜 Order Book History</h3>
                <div id="paperOrdersList" style="display: flex; flex-direction: column; gap: 10px; max-height: 250px; overflow-y: auto;">
                    <p style="color: #64748b; font-size: 13px; text-align: center; margin: 15px 0;">Loading paper trades...</p>
                </div>
            </div>
        </div>
    `;
    loadPaperTrades();
}

async function submitPaperTrade(side) {
    const pair = document.getElementById('paperPair').value;
    const amount = document.getElementById('paperAmount').value;
    
    // लाइव प्राइस फेज करें ताकि पेपर ट्रेड एकदम असली रेट पर लगे
    const symbol = pair.replace('USDT', '');
    let livePrice = 0;
    try {
        const pRes = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`);
        const pData = await pRes.json();
        livePrice = parseFloat(pData.USD) || 0;
    } catch(e) { livePrice = 0; }

    const tradeData = {
        type: "Manual Paper",
        pair: pair,
        action: side,
        price: livePrice,
        quantity: amount,
        timestamp: new Date().toLocaleTimeString(),
        status: "SUCCESS"
    };

    try {
        await fetch(`${FIREBASE_BASE_URL}/paper_trades.json`, {
            method: 'POST',
            body: JSON.stringify(tradeData)
        });
        alert(`🎉 Paper ${side} Executed at $${livePrice}`);
        loadPaperTrades();
    } catch (e) { alert("❌ Firebase sync error."); }
}

async function loadPaperTrades() {
    const listCont = document.getElementById('paperOrdersList');
    if (!listCont) return;

    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/paper_trades.json`);
        const data = await res.json();
        if (!data) {
            listCont.innerHTML = `<p style="color: #64748b; font-size: 12px; text-align: center; margin: 15px 0;">No manual trades executed yet.</p>`;
            return;
        }

        let html = '';
        let totalPnL = 0;
        
        // डेटा को रिवर्स लूप में घुमाएं ताकि नया ट्रेड सबसे ऊपर दिखे
        const keys = Object.keys(data).reverse();
        keys.forEach(key => {
            const t = data[key];
            const isBuy = t.action === 'BUY';
            html += `
                <div style="background: #1e293b; border-left: 4px solid ${isBuy ? '#22c55e' : '#ef4444'}; padding: 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                    <div>
                        <span style="font-weight: bold; color: ${isBuy ? '#22c55e' : '#ef4444'};">${t.action}</span> 
                        <span style="color: #fff; font-weight: bold; margin-left: 5px;">${t.pair}</span>
                        <div style="color: #64748b; font-size: 10px; margin-top: 2px;">Time: ${t.timestamp}</div>
                    </div>
                    <div style="text-align: right;">
                        <span style="color: #fff; font-weight: bold;">$${t.price}</span>
                        <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">Vol: $${t.quantity}</div>
                    </div>
                </div>
            `;
        });
        listCont.innerHTML = html;
    } catch(e) { listCont.innerHTML = `<p style="color: #ef4444; font-size: 12px;">Error loading logs.</p>`; }
}
