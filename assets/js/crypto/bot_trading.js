async function renderBotTrading() {
    const root = document.getElementById('app');
    if (!root) return;

    // 📱 मोबाइल-फ्रेंडली यूआई (100% स्क्रीन फिट)
    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 15px; max-width: 100%; margin: 0 auto; font-family: sans-serif; background: #0f172a; min-height: 100vh;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2 style="color: #38bdf8; margin: 0; font-size: 20px;">🤖 Bot Trading</h2>
                <span style="background: #1e293b; color: #22c55e; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; border: 1px solid #334155;">AUTO ENGINE</span>
            </div>

            <!-- लाइव बोट पीएनएल और स्टेटस कार्ड -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div>
                    <span style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Bot Status</span>
                    <h2 style="color: #22c55e; margin: 5px 0 0 0; font-size: 16px;">🟢 RUNNING</h2>
                </div>
                <div>
                    <span style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Bot Algorithmic PnL</span>
                    <h2 id="botPnL" style="color: #38bdf8; margin: 5px 0 0 0; font-size: 18px;">+$0.00</h2>
                </div>
            </div>

            <!-- बोट की लाइव वर्किंग इन्फो -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                <h3 style="color: #e2e8f0; margin-top: 0; margin-bottom: 5px; font-size: 13px; text-transform: uppercase;">🎯 SIGNAL MONITOR</h3>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">यह इंजन आपकी बनाई स्ट्रेटेजी के अनुसार लाइव मार्केट से रेट्स चेक करके बैकग्राउंड में ऑटोमैटिक सिग्नल्स जनरेट करता है।</p>
            </div>

            <!-- ऑटोमैटिक बोट ट्रेड हिस्ट्री -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px;">
                <h3 style="color: #e2e8f0; margin-top: 0; margin-bottom: 10px; font-size: 14px; text-transform: uppercase;">🤖 Algorithmic Trade History</h3>
                <div id="botOrdersList" style="display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto;">
                    <p style="color: #64748b; font-size: 13px; text-align: center; margin: 15px 0;">Waiting for bot signals...</p>
                </div>
            </div>
        </div>
    `;
    loadBotTrades();
}

async function loadBotTrades() {
    const listCont = document.getElementById('botOrdersList');
    if (!listCont) return;

    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/bot_trades.json`);
        const data = await res.json();
        if (!data) {
            listCont.innerHTML = `<p style="color: #64748b; font-size: 12px; text-align: center; margin: 15px 0;">No automated strategy trades triggered yet.</p>`;
            return;
        }

        let html = '';
        const keys = Object.keys(data).reverse(); // लेटेस्ट ट्रेड सबसे ऊपर दिखाने के लिए
        keys.forEach(key => {
            const t = data[key];
            const isBuy = t.action === 'BUY';
            html += `
                <div style="background: #1e293b; border-left: 4px solid ${isBuy ? '#22c55e' : '#ef4444'}; padding: 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                    <div>
                        <span style="font-weight: bold; color: ${isBuy ? '#22c55e' : '#ef4444'};">${t.action}</span> 
                        <span style="color: #fff; font-weight: bold; margin-left: 5px;">${t.pair}</span>
                        <div style="color: #64748b; font-size: 10px; margin-top: 2px;">Strat: ${t.strategyName || 'Auto Bot'}</div>
                    </div>
                    <div style="text-align: right;">
                        <span style="color: #fff; font-weight: bold;">$${t.price}</span>
                        <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">${t.status}</div>
                    </div>
                </div>
            `;
        });
        listCont.innerHTML = html;
    } catch(e) { listCont.innerHTML = `<p style="color: #ef4444; font-size: 12px;">Error loading bot logs.</p>`; }
}
