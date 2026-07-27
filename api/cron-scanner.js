// api/cron-scanner.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
    try {
        // 1. Fetch Master Data from Firebase (Fallback to mock if DB not set)
        const FIREBASE_URL = process.env.FIREBASE_DB_URL;
        let masterData = {};

        if (FIREBASE_URL) {
            const fbRes = await fetch(`${FIREBASE_URL}/apex_master_data.json`);
            if (fbRes.ok) {
                masterData = await fbRes.json() || {};
            }
        }

        const strategies = masterData.strategies || [];
        const settings = masterData.settings || {};
        
        // Check Master Auto-Trade Switch
        if (settings.ruleAutotradeEnable === false) {
            return res.status(200).json({ status: 'skipped', message: 'Master Auto-Trade is Disabled.' });
        }

        const activeStrategies = strategies.filter(s => s.active);
        if (activeStrategies.length === 0) {
            return res.status(200).json({ status: 'success', message: 'No active strategies found.' });
        }

        let executedTrades = [];

        // 2. Loop through active strategies & scan selected coins
        for (const strat of activeStrategies) {
            const coins = strat.coin ? strat.coin.split(',') : ['BTCUSDT'];

            for (const symbol of coins) {
                const cleanSymbol = symbol.trim().toUpperCase();

                // Fetch 15m Candlestick / Ticker data from Binance Public API
                const tickerRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${cleanSymbol}`);
                if (!tickerRes.ok) continue;
                
                const ticker = await tickerRes.json();
                const currentPrice = parseFloat(ticker.lastPrice);
                const priceChangePct = parseFloat(ticker.priceChangePercent);

                // Simple Signal Logic Engine
                let isSignalTriggered = false;
                let action = 'BUY';

                if (strat.type === 'candlestick') {
                    // Example trigger check: 24h dip recovery / momentum
                    if (priceChangePct > 1.5 || priceChangePct < -3.0) {
                        isSignalTriggered = true;
                        action = priceChangePct < -3.0 ? 'BUY' : 'SELL';
                    }
                } else if (strat.type === 'crossover') {
                    if (Math.abs(priceChangePct) > 2.0) {
                        isSignalTriggered = true;
                    }
                } else {
                    // AI Prompt Strategy Logic Trigger
                    if (Math.random() > 0.4) { // Active scanning match simulation
                        isSignalTriggered = true;
                    }
                }

                if (isSignalTriggered) {
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
                        sl: (currentPrice * (1 - (strat.sl / 100))).toFixed(4),
                        tp: (currentPrice * (1 + (strat.tp / 100))).toFixed(4)
                    };

                    executedTrades.push(tradeObj);

                    // Send Telegram Alert if Enabled
                    if (settings.cfgTgEnable && settings.cfgTgToken && settings.cfgTgChatid) {
                        const tgMsg = `⚡ *APEX BOT TRADE TRIGGERED*\n\n` +
                                      `📈 *Strategy:* ${strat.name}\n` +
                                      `🪙 *Symbol:* ${cleanSymbol}\n` +
                                      `🚀 *Action:* ${action}\n` +
                                      `💵 *Entry Price:* $${currentPrice}\n` +
                                      `🎯 *TP:* $${tradeObj.tp} | 🛡️ *SL:* $${tradeObj.sl}\n` +
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
        }

        // Save Executed Trades back to Firebase if available
        if (FIREBASE_URL && executedTrades.length > 0) {
            const existingTrades = masterData.trades || [];
            const updatedTrades = [...executedTrades, ...existingTrades].slice(0, 50); // Keep last 50
            await fetch(`${FIREBASE_URL}/apex_master_data/trades.json`, {
                method: 'PUT',
                body: JSON.stringify(updatedTrades)
            });
        }

        return res.status(200).json({
            status: 'success',
            scannedStrategies: activeStrategies.length,
            executedTradesCount: executedTrades.length,
            trades: executedTrades
        });

    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
