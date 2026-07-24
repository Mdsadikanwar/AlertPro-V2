export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

    try {
        // 1. Fetch Active Strategies and Telegram Config
        const [stratRes, configRes] = await Promise.all([
            fetch(`${FIREBASE_URL}/trading_strategies.json`, { cache: 'no-store' }),
            fetch(`${FIREBASE_URL}/app_settings.json`, { cache: 'no-store' })
        ]);

        const strategies = await stratRes.json() || {};
        const config = await configRes.json() || {};

        const tgToken = config.tgToken || config.telegramToken;
        const tgChatId = config.tgChatId || config.telegramChatId;

        const executedTrades = [];

        // Technical Indicator Calculations
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

        // 2. Loop Strategies & Check OKX Live Market Candles
        for (const [id, strat] of Object.entries(strategies)) {
            if (strat.status !== "active" && !strat.enabled) continue;

            const coin = (strat.coin || strat.symbol || "BTC").replace("USDT", "").toUpperCase();
            const instId = `${coin}-USDT`;

            const okxRes = await fetch(`https://www.okx.com/api/v5/market/candles?instId=${instId}&bar=1H&limit=50`, { cache: 'no-store' });
            if (!okxRes.ok) continue;

            const okxData = await okxRes.json();
            if (!okxData?.data?.length) continue;

            const candles = okxData.data.reverse();
            const closes = candles.map(c => parseFloat(c[4]));
            const currentPrice = closes[closes.length - 1];

            const rsi = calculateRSI(closes, parseInt(strat.rsiPeriod) || 14);
            const emaFast = calculateEMA(closes, parseInt(strat.emaFast) || 9);
            const emaSlow = calculateEMA(closes, parseInt(strat.emaSlow) || 21);
            const targetRsi = parseFloat(strat.rsiBuyLevel) || 45;

            let trigger = false;
            let action = null;
            let reason = "";

            if (rsi <= targetRsi && emaFast >= emaSlow) {
                trigger = true;
                action = "BUY";
                reason = `Crossover: RSI (${rsi.toFixed(1)}) ≤ ${targetRsi} & Fast EMA (${emaFast.toFixed(1)}) ≥ Slow EMA (${emaSlow.toFixed(1)})`;
            } else if (strat.buyTarget && currentPrice <= parseFloat(strat.buyTarget)) {
                trigger = true;
                action = "BUY";
                reason = `Price hit Buy Target: $${currentPrice}`;
            } else if (strat.sellTarget && currentPrice >= parseFloat(strat.sellTarget)) {
                trigger = true;
                action = "SELL";
                reason = `Price hit Sell Target: $${currentPrice}`;
            }

            // 3. Record Trade & Send Telegram Alert
            if (trigger) {
                const tradePayload = {
                    strategyId: id,
                    strategyName: strat.name || "Custom Strategy",
                    symbol: `${coin}USDT`,
                    type: action,
                    price: currentPrice,
                    pnl: "0.00",
                    reason: reason,
                    timestamp: new Date().toISOString()
                };

                await fetch(`${FIREBASE_URL}/bot_trades.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tradePayload)
                });

                if (tgToken && tgChatId) {
                    const text = encodeURIComponent(
                        `🚀 *[APEXTRADERS V3 SIGNAL]*\n\n` +
                        `📋 *Strategy:* ${strat.name || "Auto"}\n` +
                        `🎯 *Action:* ${action}\n` +
                        `🪙 *Symbol:* ${coin}USDT\n` +
                        `💰 *Price:* $${currentPrice}\n` +
                        `💡 *Reason:* ${reason}`
                    );
                    await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage?chat_id=${tgChatId}&text=${text}&parse_mode=Markdown`);
                }

                executedTrades.push({ strategy: strat.name, action, price: currentPrice });
            }
        }

        return res.status(200).json({ success: true, executed: executedTrades });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
