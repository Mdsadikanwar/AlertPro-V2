export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

        // Fetch Strategies & Settings
        const [stratRes, configRes] = await Promise.all([
            fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`, { cache: 'no-store' }),
            fetch(`${FIREBASE_BASE_URL}/app_settings.json`, { cache: 'no-store' })
        ]);

        const strategies = await stratRes.json() || {};
        const config = await configRes.json() || {};

        const tgToken = config.tgToken || config.telegramToken || config.botToken;
        const tgChatId = config.tgChatId || config.telegramChatId || config.chatId;

        let executedTrades = [];

        function calculateRSI(closes, period = 14) {
            if (closes.length < period + 1) return 50;
            let gains = 0, losses = 0;
            for (let i = 1; i <= period; i++) {
                const diff = closes[i] - closes[i - 1];
                if (diff >= 0) gains += diff; else losses -= diff;
            }
            let avgGain = gains / period, avgLoss = losses / period;
            for (let i = period + 1; i < closes.length; i++) {
                const diff = closes[i] - closes[i - 1];
                if (diff >= 0) {
                    avgGain = (avgGain * (period - 1) + diff) / period;
                    avgLoss = (avgLoss * (period - 1)) / period;
                } else {
                    avgGain = (avgGain * (period - 1)) / period;
                    avgLoss = (avgLoss * (period - 1) - diff) / period;
                }
            }
            return avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
        }

        function calculateEMA(closes, period) {
            if (closes.length < period) return closes[closes.length - 1];
            const k = 2 / (period + 1);
            let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
            for (let i = period; i < closes.length; i++) {
                ema = (closes[i] * k) + (ema * (1 - k));
            }
            return ema;
        }

        for (const [stratId, strat] of Object.entries(strategies)) {
            const isActive = strat.status === "active" || strat.isAutoActive === true || strat.enabled === true;
            if (!isActive) continue;

            const rawCoin = (strat.symbol || strat.coin || "BTC").replace("/", "").toUpperCase();
            const cleanCoin = rawCoin.replace("USDT", "");
            const okxSymbol = `${cleanCoin}-USDT`;

            // OKX Unblocked API
            const candleRes = await fetch(`https://www.okx.com/api/v5/market/candles?instId=${okxSymbol}&bar=1H&limit=100`, { cache: 'no-store' });
            if (!candleRes.ok) continue;

            const okxData = await candleRes.json();
            if (!okxData?.data || okxData.data.length === 0) continue;

            const candles = okxData.data.reverse();
            const closePrices = candles.map(c => parseFloat(c[4]));
            const currentPrice = closePrices[closePrices.length - 1];

            const rsiPeriod = parseInt(strat.rsiPeriod) || 14;
            const currentRSI = calculateRSI(closePrices, rsiPeriod);
            const emaFast = calculateEMA(closePrices, parseInt(strat.emaFast) || 9);
            const emaSlow = calculateEMA(closePrices, parseInt(strat.emaSlow) || 21);
            const rsiBuyLevel = parseFloat(strat.rsiBuyLevel) || 45;

            let isTriggered = false;
            let actionType = null;
            let reason = "";

            if (currentRSI <= rsiBuyLevel && emaFast >= emaSlow) {
                isTriggered = true;
                actionType = "BUY";
                reason = `CrossOver Matched! RSI (${currentRSI.toFixed(1)}) <= ${rsiBuyLevel} & Fast EMA (${emaFast.toFixed(1)}) >= Slow EMA (${emaSlow.toFixed(1)})`;
            } else if (strat.buyTarget && currentPrice <= parseFloat(strat.buyTarget)) {
                isTriggered = true;
                actionType = "BUY";
                reason = `Buy Target Price Hit: $${currentPrice}`;
            } else if (strat.sellTarget && currentPrice >= parseFloat(strat.sellTarget)) {
                isTriggered = true;
                actionType = "SELL";
                reason = `Sell Target Price Hit: $${currentPrice}`;
            }

            if (isTriggered) {
                const tradeLog = {
                    strategyId: stratId,
                    strategyName: strat.name || "Strategy Trade",
                    type: actionType,
                    symbol: `${cleanCoin}USDT`,
                    price: currentPrice,
                    rsi: currentRSI.toFixed(2),
                    reason: reason,
                    pnl: "0.00",
                    timestamp: new Date().toISOString()
                };

                await fetch(`${FIREBASE_BASE_URL}/bot_trades.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tradeLog)
                });

                executedTrades.push(`${strat.name}: ${actionType} at $${currentPrice}`);

                if (tgToken && tgChatId) {
                    const tgMsg = encodeURIComponent(
                        `🚨 *[AUTO TRADING SIGNAL]*\n\n` +
                        `📋 *Strategy:* ${strat.name || "Custom"}\n` +
                        `🎯 *Action:* ${actionType}\n` +
                        `📊 *Symbol:* ${cleanCoin}USDT\n` +
                        `💰 *Price:* $${currentPrice.toLocaleString()}\n` +
                        `📈 *RSI:* ${currentRSI.toFixed(1)}\n` +
                        `💡 *Reason:* ${reason}`
                    );
                    await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage?chat_id=${tgChatId}&text=${tgMsg}&parse_mode=Markdown`);
                }
            }
        }

        return res.status(200).json({
            success: true,
            activeChecked: Object.keys(strategies).length,
            executedTrades: executedTrades
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
