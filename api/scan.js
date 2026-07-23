export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    try {
        const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

        // 1. Fetch Live Price from CoinGecko (Safe & No-Block)
        const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', { cache: 'no-store' });
        const priceData = await priceRes.json();
        const currentPrice = priceData?.bitcoin?.usd;

        if (!currentPrice) {
            // Fallback API if CoinGecko rate limits
            const fallbackRes = await fetch('https://api.coincap.io/v2/assets/bitcoin', { cache: 'no-store' });
            const fallbackData = await fallbackRes.json();
            var finalPrice = parseFloat(fallbackData?.data?.priceUsd);
        } else {
            var finalPrice = currentPrice;
        }

        if (!finalPrice || isNaN(finalPrice)) {
            return res.status(500).json({ success: false, error: "Unable to fetch live price from CoinGecko/CoinCap" });
        }

        // 2. Fetch Active Strategies & Settings from Firebase
        const [stratRes, configRes] = await Promise.all([
            fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`, { cache: 'no-store' }),
            fetch(`${FIREBASE_BASE_URL}/app_settings.json`, { cache: 'no-store' })
        ]);

        const strategies = await stratRes.json() || {};
        const config = await configRes.json() || {};

        const tgToken = config.tgToken || config.telegramToken || config.botToken; //
        const tgChatId = config.tgChatId || config.telegramChatId || config.chatId; //

        let executedTrades = [];

        // 3. Loop through ALL User Defined Active Strategies (Dynamic Strategy Execution)
        for (const [stratId, strat] of Object.entries(strategies)) {
            if (strat.status !== "active" && strat.enabled !== true) continue;

            // Read Strategy Parameters (Target, Condition, Thresholds)
            const symbol = strat.symbol || "BTCUSDT";
            const stratName = strat.name || "Custom Strategy";
            
            // Example: Strategy-based Rule Checks
            let isTriggered = false;
            let actionType = null;

            // If user strategy defines high/low target or percentage shift
            if (strat.sellTarget && finalPrice >= strat.sellTarget) {
                isTriggered = true;
                actionType = "SELL 🔴";
            } else if (strat.buyTarget && finalPrice <= strat.buyTarget) {
                isTriggered = true;
                actionType = "BUY 🟢";
            }

            // Execute Trade if Strategy Rule Matched
            if (isTriggered) {
                const tradeLog = {
                    strategyId: stratId,
                    strategyName: stratName,
                    type: actionType.includes("BUY") ? "BUY" : "SELL",
                    symbol: symbol,
                    price: finalPrice,
                    timestamp: new Date().toISOString()
                };

                // Record Trade in Firebase
                await fetch(`${FIREBASE_BASE_URL}/bot_trades.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tradeLog)
                });

                executedTrades.push(`${stratName}: ${actionType}`);

                // Send Telegram Notification
                if (tgToken && tgChatId) {
                    const tgMsg = encodeURIComponent(
                        `⚠️ *[BOT STRATEGY SIGNAL]*\n\n` +
                        `📋 *Strategy:* ${stratName}\n` +
                        `🎯 *Signal Action:* ${actionType}\n` +
                        `📊 *Target Asset:* ${symbol}\n` +
                        `💰 *Trigger Price:* $${finalPrice.toLocaleString()}\n\n` +
                        `🚀 *ApexTraders V2 Automated Core Engine*`
                    );
                    await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage?chat_id=${tgChatId}&text=${tgMsg}&parse_mode=Markdown`);
                }
            }
        }

        // 4. Send Heartbeat Scan Response
        return res.status(200).json({
            success: true,
            provider: "CoinGecko/CoinCap",
            liveBtcPrice: finalPrice,
            activeStrategiesCount: Object.keys(strategies).length,
            executedTrades: executedTrades
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
