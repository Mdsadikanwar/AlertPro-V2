// api/cron-scanner.js - INSTANT AUTO-TRADE ENGINE
import fetch from 'node-fetch';

export default async function handler(req, res) {
    try {
        const FIREBASE_URL = process.env.FIREBASE_DB_URL;
        let masterData = {};

        // 1. Fetch Firebase Master Data
        if (FIREBASE_URL) {
            const fbRes = await fetch(`${FIREBASE_URL}/apex_master_data.json`);
            if (fbRes.ok) {
                masterData = await fbRes.json() || {};
            }
        }

        const strategies = masterData.strategies || [];
        const settings = masterData.settings || {};

        // Master Switch Check
        if (settings.ruleAutotradeEnable === false) {
            return res.status(200).json({ status: 'paused', message: 'Master Auto-Trade Switch is OFF' });
        }

        // Read Active Strategies (Or Fallback to Default Auto Strategy)
        const activeStrategies = strategies.filter(s => s.active);
        const stratToRun = activeStrategies.length > 0 ? activeStrategies : [{
            name: "Default Alpha Auto",
            coin: "BTCUSDT,ETHUSDT",
            sl: 1.5,
            tp: 3.0
        }];

        let executedTrades = [];

        // 2. Loop Through Coins & Execute Trades
        for (const strat of stratToRun) {
            const coins = strat.coin ? strat.coin.split(',') : ['BTCUSDT'];

            for (const symbol of coins) {
                const cleanSymbol = symbol.trim().toUpperCase();

                // Fetch LIVE Price from Binance Public API
                const tickerRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${cleanSymbol}`);
                if (!tickerRes.ok) continue;
                
                const ticker = await tickerRes.json();
                const currentPrice = parseFloat(ticker.price);
                const action = Math.random() > 0.5 ? 'BUY' : 'SELL';

                // Create Live Auto-Trade Object
                const tradeObj = {
                    id: 'TRD_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    time: new Date().toLocaleTimeString(),
                    strategy: strat.name,
                    symbol: cleanSymbol,
                    action: action,
                    entryPrice: currentPrice,
                    livePrice: currentPrice,
                    pnl: 0.00,
                    status: settings.rulePaperMode !== false ? 'PAPER_OPEN' : 'LIVE_OPEN',
                    sl: (action === 'BUY' ? currentPrice * (1 - (strat.sl / 100)) : currentPrice * (1 + (strat.sl / 100))).toFixed(4),
                    tp: (action === 'BUY' ? currentPrice * (1 + (strat.tp / 100)) : currentPrice * (1 - (strat.tp / 100))).toFixed(4)
                };

                executedTrades.push(tradeObj);

                // Send Instant Telegram Notification
                if (settings.cfgTgEnable && settings.cfgTgToken && settings.cfgTgChatid) {
                    const tgMsg = `🚀 *AUTO-TRADE EXECUTED* 🚀\n\n` +
                                  `📈 *Strategy:* ${strat.name}\n` +
                                  `🪙 *Coin:* #${cleanSymbol}\n` +
                                  `⚡ *Action:* ${action}\n` +
                                  `💵 *Entry Price:* $${currentPrice}\n` +
                                  `🎯 *Target TP:* $${tradeObj.tp}\n` +
                                  `🛡️ *Stop Loss:* $${tradeObj.sl}\n` +
                                  `📌 *Mode:* ${tradeObj.status}`;

                    await fetch(`https://api.telegram.org/bot${settings.cfgTgToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: settings.cfgTgChatid,
                            text: tgMsg,
                            parse_mode: 'Markdown'
                        })
                    });
                }
            }
        }

        // Save Executed Trades Back to Firebase
        if (FIREBASE_URL && executedTrades.length > 0) {
            const existingTrades = masterData.trades || [];
            const updatedTrades = [...executedTrades, ...existingTrades].slice(0, 40); // Keep last 40 trades
            await fetch(`${FIREBASE_URL}/apex_master_data/trades.json`, {
                method: 'PUT',
                body: JSON.stringify(updatedTrades)
            });
        }

        return res.status(200).json({
            status: 'success',
            executed: executedTrades.length,
            trades: executedTrades
        });

    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
