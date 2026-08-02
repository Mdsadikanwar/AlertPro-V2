import fetch from 'node-fetch';

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const FIREBASE_URL = process.env.FIREBASE_DB_URL;
        let masterData = {};

        // 1. Retrieve Master Data from Firebase Realtime DB
        if (FIREBASE_URL) {
            const cleanUrl = FIREBASE_URL.replace(/\/+$/, "");
            const fbRes = await fetch(`${cleanUrl}/app_master_data.json`);
            if (fbRes.ok) {
                masterData = await fbRes.json() || {};
            }
        }

        const strategies = masterData.strategies || [];
        const settings = masterData.settings || {};

        // 2. Check Signals Engine Switches
        if (settings.ruleAutotradeEnable === false || settings.cronEnable === false) {
            return res.status(200).json({ status: 'paused', message: 'Signal engine or Cron switch is OFF' });
        }

        const activeStrats = strategies.filter(s => s.active !== false);
        const listToRun = activeStrats.length > 0 ? activeStrats : [{
            name: "Default Momentum Strategy",
            coin: "BTCUSDT,ETHUSDT",
            sl: 1.5,
            tp: 3.0
        }];

        let newGeneratedTrades = [];

        for (const strat of listToRun) {
            const coins = strat.coin ? strat.coin.split(',') : ['BTCUSDT'];

            for (const rawCoin of coins) {
                const symbol = rawCoin.trim().toUpperCase();
                if (!symbol) continue;

                // Live Ticker Price Fetch from Binance Public API
                const tickerRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
                if (!tickerRes.ok) continue;

                const ticker = await tickerRes.json();
                const price = parseFloat(ticker.price);
                const action = Math.random() > 0.5 ? 'BUY' : 'SELL';

                const slVal = action === 'BUY' ? price * (1 - (parseFloat(strat.sl || 1.5) / 100)) : price * (1 + (parseFloat(strat.sl || 1.5) / 100));
                const tpVal = action === 'BUY' ? price * (1 + (parseFloat(strat.tp || 3.0) / 100)) : price * (1 - (parseFloat(strat.tp || 3.0) / 100));

                const tradeObj = {
                    id: 'SIG_' + Date.now() + '_' + Math.floor(Math.random() * 100),
                    time: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }),
                    strategy: strat.name,
                    symbol: symbol,
                    action: action,
                    entryPrice: price.toFixed(2),
                    livePrice: price.toFixed(2),
                    pnl: 0.00,
                    sl: slVal.toFixed(2),
                    tp: tpVal.toFixed(2),
                    status: 'SIGNAL_ACTIVE'
                };

                newGeneratedTrades.push(tradeObj);

                // Send Alert Signal to Telegram Channel / Chat
                if (settings.tgEnable !== false && settings.tgToken && settings.tgChatId) {
                    const msg = `⚡ *NEW TRADING SIGNAL*\n\n` +
                                `📈 *Strategy:* ${strat.name}\n` +
                                `🪙 *Pair:* #${symbol}\n` +
                                `🎯 *Action:* ${action}\n` +
                                `💵 *Entry Price:* $${price.toFixed(2)}\n` +
                                `🛡️ *SL:* $${tradeObj.sl} | 🎯 *TP:* $${tradeObj.tp}`;

                    await fetch(`https://api.telegram.org/bot${settings.tgToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: settings.tgChatId,
                            text: msg,
                            parse_mode: 'Markdown'
                        })
                    }).catch(err => console.error("Telegram error:", err));
                }
            }
        }

        // 3. Store Generated Signals Back to Firebase
        if (FIREBASE_URL && newGeneratedTrades.length > 0) {
            const cleanUrl = FIREBASE_URL.replace(/\/+$/, "");
            const existingTrades = masterData.trades || [];
            const updatedTrades = [...newGeneratedTrades, ...existingTrades].slice(0, 30);

            await fetch(`${cleanUrl}/app_master_data/trades.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTrades)
            });
        }

        return res.status(200).json({
            status: 'success',
            signalsGenerated: newGeneratedTrades.length,
            trades: newGeneratedTrades
        });

    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
}
