export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

        // Fetch active strategies
        const stratRes = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`, { cache: 'no-store' });
        const strategies = await stratRes.json() || {};

        // Fetch Telegram Config from Firebase
        const configRes = await fetch(`${FIREBASE_BASE_URL}/app_settings.json`, { cache: 'no-store' });
        const config = await configRes.json() || {};

        const tgToken = config.tgToken || config.telegramToken || config.botToken;
        const tgChatId = config.tgChatId || config.telegramChatId || config.chatId;

        let executedTrades = [];

        // Fetch Live Price from Coingecko
        const priceRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd", { cache: 'no-store' });
        const prices = await priceRes.json() || {};

        const coinMap = {
            "BTC": prices.bitcoin?.usd || 0,
            "ETH": prices.ethereum?.usd || 0,
            "SOL": prices.solana?.usd || 0
        };

        for (const [stratId, strat] of Object.entries(strategies)) {
            const isActive = strat.status === "active" || strat.isAutoActive === true || strat.enabled === true;
            if (!isActive) continue;

            const coin = (strat.coin || strat.symbol || "BTC").toUpperCase();
            const currentPrice = coinMap[coin] || 0;

            if (currentPrice === 0) continue;

            let isTriggered = false;
            let action = null;

            if (strat.buyTarget && currentPrice <= parseFloat(strat.buyTarget)) {
                isTriggered = true;
                action = "BUY";
            } else if (strat.sellTarget && currentPrice >= parseFloat(strat.sellTarget)) {
                isTriggered = true;
                action = "SELL";
            }

            if (isTriggered) {
                const tradeData = {
                    strategyId: stratId,
                    strategyName: strat.name || "Strategy Trade",
                    type: action,
                    symbol: `${coin}USDT`,
                    price: currentPrice,
                    pnl: "0.00",
                    timestamp: new Date().toISOString()
                };

                // Record Trade in Firebase
                await fetch(`${FIREBASE_BASE_URL}/bot_trades.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tradeData)
                });

                executedTrades.push(`${strat.name}: ${action} at $${currentPrice}`);

                // Send Telegram Notification
                if (tgToken && tgChatId) {
                    const msg = encodeURIComponent(`🚨 [AUTO ${action} SIGNAL]\nStrategy: ${strat.name}\nCoin: ${coin}\nPrice: $${currentPrice}`);
                    await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage?chat_id=${tgChatId}&text=${msg}`);
                }
            }
        }

        return res.status(200).json({
            success: true,
            checkedCount: Object.keys(strategies).length,
            executedTrades: executedTrades
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
