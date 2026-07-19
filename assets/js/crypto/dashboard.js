async function renderCryptoDashboard() {
    const root = document.getElementById('app');
    if (!root) return;

    // 📱 प्रीमियम और क्लीन मोबाइल डैशबोर्ड लेआउट
    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 15px; max-width: 100%; margin: 0 auto; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #f8fafc;">
            
            <!-- वेलकम और लाइव स्टेटस -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                    <h2 style="color: #fff; margin: 0; font-size: 20px; font-weight: bold;">📊 Command Center</h2>
                    <span style="color: #64748b; font-size: 11px;">Real-time algorithmic overview</span>
                </div>
                <span style="background: #1e293b; color: #38bdf8; padding: 5px 10px; border-radius: 20px; font-size: 10px; font-weight: bold; border: 1px solid #334155; display: flex; align-items: center; gap: 5px;">
                    <span style="width: 6px; height: 6px; background: #22c55e; border-radius: 50%; display: inline-block; animation: pulse 1.5s infinite;"></span> SYSTEM LIVE
                </span>
            </div>

            <!-- 💳 द अल्टीमेट कंबाइंड PnL कार्ड (One Card to Rule Them All) -->
            <div style="background: linear-gradient(135deg, #1e1b4b 0%, #111827 100%); border: 1px solid #312e81; border-radius: 16px; padding: 18px; margin-bottom: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);">
                <span style="color: #818cf8; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Total Combined Balance</span>
                <h1 id="dashTotalBalance" style="color: #fff; margin: 0 0 15px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">$20,000.00</h1>
                
                <!-- दोनों PnL का इंटरनल ग्रिड -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 10px; border: 1px solid #1e293b;">
                    <div style="border-right: 1px solid #1e293b; padding-right: 5px;">
                        <span style="color: #94a3b8; font-size: 10px; font-weight: bold; display: block; margin-bottom: 2px;">📝 MANUAL PAPER</span>
                        <h3 id="dashPaperPnL" style="margin: 0; font-size: 15px; color: #22c55e;">+$0.00</h3>
                    </div>
                    <div style="padding-left: 5px;">
                        <span style="color: #94a3b8; font-size: 10px; font-weight: bold; display: block; margin-bottom: 2px;">🤖 AUTO BOT PnL</span>
                        <h3 id="dashBotPnL" style="margin: 0; font-size: 15px; color: #38bdf8;">+$0.00</h3>
                    </div>
                </div>
            </div>

            <!-- 📈 लाइव मार्केट टिकर (Top 3 Coins) -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 12px; margin-bottom: 20px;">
                <h4 style="color: #64748b; margin: 0 0 10px 0; font-size: 10px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">⚡ Live Asset Feed (Binance Spot)</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                    <div style="background: #1e293b; padding: 8px; border-radius: 6px; flex: 1; text-align: center;">
                        <div style="font-size: 10px; color: #94a3b8; font-weight: bold;">BTC</div>
                        <span id="tickerBTC" style="font-size: 12px; color: #fff; font-weight: bold;">Loading...</span>
                    </div>
                    <div style="background: #1e293b; padding: 8px; border-radius: 6px; flex: 1; text-align: center;">
                        <div style="font-size: 10px; color: #94a3b8; font-weight: bold;">ETH</div>
                        <span id="tickerETH" style="font-size: 12px; color: #fff; font-weight: bold;">Loading...</span>
                    </div>
                    <div style="background: #1e293b; padding: 8px; border-radius: 6px; flex: 1; text-align: center;">
                        <div style="font-size: 10px; color: #94a3b8; font-weight: bold;">SOL</div>
                        <span id="tickerSOL" style="font-size: 12px; color: #fff; font-weight: bold;">Loading...</span>
                    </div>
                </div>
            </div>

            <!-- 📊 एक्टिविटी समरी और इंजन रिस्क स्कोर -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 15px;">
                <h3 style="color: #e2e8f0; margin-top: 0; margin-bottom: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">🎯 Operational Metrics</h3>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
                        <span style="color: #94a3b8;">Manual Trade Count</span>
                        <b id="dashPaperCount" style="color: #fff;">0 Trades</b>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
                        <span style="color: #94a3b8;">Bot Signals Triggered</span>
                        <b id="dashBotCount" style="color: #fff;">0 Signals</b>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                        <span style="color: #94a3b8;">Execution Health</span>
                        <b style="color: #22c55e;">100% Operational</b>
                    </div>
                </div>
            </div>

        </div>

        <style>
            @keyframes pulse {
                0% { opacity: 0.4; }
                50% { opacity: 1; }
                100% { opacity: 0.4; }
            }
        </style>
    `;

    // डेटा लोड करना और लाइव टिकर शुरू करना
    fetchDashboardMetrics();
    startDashboardTicker();
}

async function fetchDashboardMetrics() {
    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/.json`);
        const db = await res.json();

        let paperPnL = 0;
        let paperCount = 0;
        let paperMargin = 0;
        if (db && db.paper_trades) {
            Object.keys(db.paper_trades).forEach(k => {
                const t = db.paper_trades[k];
                paperCount++;
                const margin = parseFloat(t.usdtValue) || 0;
                paperMargin += margin;
                // सिमुलेटेड PnL
                let mockPnl = margin * 0.015;
                if (t.action !== 'BUY') mockPnl = mockPnl * -1;
                paperPnL += mockPnl;
            });
        }

        let botPnL = 0;
        let botCount = 0;
        if (db && db.bot_trades) {
            Object.keys(db.bot_trades).forEach(k => {
                const t = db.bot_trades[k];
                botCount++;
                // बोट के लिए सिमुलेटेड कैलकुलेशन
                let mockPnl = 7.50; // एवरेज $7.50 पर ऑटो सिग्नल प्रॉफिट
                if (t.action !== 'BUY') mockPnl = mockPnl * -1;
                botPnL += mockPnl;
            });
        }

        // डोम एलिमेंट्स में डेटा डालना
        const initialPaperBal = 10000;
        const initialBotBal = 10000;
        
        const finalPaperBal = initialPaperBal - paperMargin + paperPnL;
        const finalBotBal = initialBotBal + botPnL;
        const combinedTotal = finalPaperBal + finalBotBal;

        document.getElementById('dashTotalBalance').innerText = `$${combinedTotal.toFixed(2)}`;
        
        const pBox = document.getElementById('dashPaperPnL');
        pBox.innerText = `${paperPnL >= 0 ? '+' : ''}$${paperPnL.toFixed(2)}`;
        pBox.style.color = paperPnL >= 0 ? '#22c55e' : '#ef4444';

        const bBox = document.getElementById('dashBotPnL');
        bBox.innerText = `${botPnL >= 0 ? '+' : ''}$${botPnL.toFixed(2)}`;
        bBox.style.color = botPnL >= 0 ? '#38bdf8' : '#ef4444';

        document.getElementById('dashPaperCount').innerText = `${paperCount} Trades`;
        document.getElementById('dashBotCount').innerText = `${botCount} Signals`;

    } catch(e) { console.log("Dashboard metrics sync error:", e); }
}

function startDashboardTicker() {
    const updatePrices = async () => {
        const coins = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
        for(let c of coins) {
            try {
                const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${c}`);
                const d = await r.json();
                const price = parseFloat(d.price);
                const elId = `ticker${c.replace('USDT', '')}`;
                const el = document.getElementById(elId);
                if(el) {
                    el.innerText = `$${price >= 100 ? price.toFixed(2) : price.toFixed(4)}`;
                }
            } catch(e) { console.log("Ticker refresh error"); }
        }
    };
    updatePrices();
    setInterval(updatePrices, 8000); // हर 8 सेकंड में रेट अपडेट होंगे
}
