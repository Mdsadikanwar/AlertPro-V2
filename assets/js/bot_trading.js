document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

    // Telegram Signal Sender
    async function sendTelegramAlert(message) {
        try {
            const settingsRes = await fetch(`${FIREBASE_URL}/settings.json`);
            const settings = await settingsRes.json();
            if (!settings || !settings.tgToken || !settings.tgChatId) return;

            await fetch(`https://api.telegram.org/bot${settings.tgToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: settings.tgChatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
        } catch (err) {
            console.error("Telegram alert failed:", err);
        }
    }

    // Engine: Check Market Prices & Trigger Signals
    window.runBotEngine = async function() {
        try {
            const stratRes = await fetch(`${FIREBASE_URL}/trading_strategies.json`);
            const strats = await stratRes.json() || {};

            for (const [id, strat] of Object.entries(strats)) {
                if (!strat.autoTrade) continue;

                const symbol = strat.coin + "USDT";
                // Binance Public Price Ticker
                const tickerRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
                if (!tickerRes.ok) continue;
                
                const ticker = await tickerRes.json();
                const currentPrice = parseFloat(ticker.price);

                // Simulated RSI/Crossover Signal Check
                // (In Live deployment, this connects to Kline candles Data)
                const isBuySignal = Math.random() > 0.85; // Simulated Trigger Condition

                if (isBuySignal) {
                    const tradeLog = {
                        time: new Date().toLocaleTimeString(),
                        strategy: strat.name,
                        symbol: symbol,
                        action: 'BUY',
                        price: currentPrice,
                        pnl: 'OPEN'
                    };

                    // 1. Save Execution Log
                    await fetch(`${FIREBASE_URL}/bot_trades.json`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(tradeLog)
                    });

                    // 2. Open Paper Position automatically
                    await fetch(`${FIREBASE_URL}/paper_positions.json`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            symbol: strat.coin,
                            side: 'BUY',
                            entryPrice: currentPrice,
                            amount: strat.tradeAmount || 50,
                            leverage: strat.leverage || 10
                        })
                    });

                    // 3. Send Instant Telegram Alert
                    const msg = `🚀 <b>APEX TRADERS SIGNAL TRIGGERED</b>\n\n` +
                                `<b>Strategy:</b> ${strat.name}\n` +
                                `<b>Symbol:</b> ${symbol}\n` +
                                `<b>Action:</b> BUY\n` +
                                `<b>Entry Price:</b> $${currentPrice.toFixed(2)}\n` +
                                `<b>Leverage:</b> ${strat.leverage}x\n` +
                                `<b>Time:</b> ${new Date().toLocaleString()}`;
                    
                    await sendTelegramAlert(msg);
                    console.log(`[BOT] Triggered execution for ${symbol}`);
                }
            }
            window.loadBotLogs();
        } catch (err) {
            console.error("Bot Engine Run Error:", err);
        }
    };

    window.loadBotLogs = async function() {
        const tableBody = document.getElementById('bot-trades-table');
        if (!tableBody) return;

        try {
            const res = await fetch(`${FIREBASE_URL}/bot_trades.json`);
            const data = await res.json() || {};
            const logs = Object.values(data).reverse();

            if (logs.length === 0) return;

            tableBody.innerHTML = '';
            logs.slice(0, 10).forEach(log => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${log.time}</td>
                    <td><strong>${log.strategy}</strong></td>
                    <td>${log.symbol}</td>
                    <td><span class="badge ${log.action === 'BUY' ? 'bg-success' : 'bg-danger'}">${log.action}</span></td>
                    <td>$${parseFloat(log.price).toFixed(2)}</td>
                    <td class="text-warning fw-bold">${log.pnl}</td>
                `;
                tableBody.appendChild(tr);
            });
        } catch (err) { console.error(err); }
    };

    // Auto Run Engine Loop every 15 seconds
    setInterval(() => {
        window.runBotEngine();
    }, 15000);

    window.loadBotLogs();
});
