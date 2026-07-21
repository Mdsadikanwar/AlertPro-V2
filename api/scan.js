export default async function handler(req, res) {
    try {
        const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

        // 1. Live Price Fetch From Binance (BTCUSDT)
        const binanceRes = await fetch(`https://api.binance.com/api/3/ticker/price?symbol=BTCUSDT`);
        const priceData = await binanceRes.json();
        const currentPrice = parseFloat(priceData.price);

        // 2. Fetch Config & Last Executed Price State from Firebase
        const [configRes, stateRes] = await Promise.all([
            fetch(`${FIREBASE_BASE_URL}/app_settings.json`),
            fetch(`${FIREBASE_BASE_URL}/bot_state.json`)
        ]);

        const config = await configRes.json();
        let botState = await stateRes.json() || {};

        let lastPrice = botState.lastPrice || currentPrice;
        let actionTriggered = null;

        // Calculate % Change from Last Saved Price
        const priceChangePercent = ((currentPrice - lastPrice) / lastPrice) * 100;

        // 3. Check 0.2% Buy / Sell Threshold Rules
        if (priceChangePercent >= 0.2) {
            actionTriggered = "SELL 🔴";
        } else if (priceChangePercent <= -0.2) {
            actionTriggered = "BUY 🟢";
        }

        // 4. If Trigger Condition Met -> Execute Order & Save to DB
        if (actionTriggered) {
            const tradeLog = {
                type: actionTriggered.includes("BUY") ? "BUY" : "SELL",
                symbol: "BTCUSDT",
                price: currentPrice,
                prevPrice: lastPrice,
                changePercent: priceChangePercent.toFixed(3),
                timestamp: new Date().toISOString()
            };

            // Save Trade Log and Update Last Price on Firebase
            await Promise.all([
                fetch(`${FIREBASE_BASE_URL}/bot_trades.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tradeLog)
                }),
                fetch(`${FIREBASE_BASE_URL}/bot_state.json`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lastPrice: currentPrice, updatedAt: new Date().toISOString() })
                })
            ]);

            // Send Instant Telegram Execution Alert
            if (config && config.tgToken && config.tgChatId) {
                const tgMsg = encodeURIComponent(
                    `⚡ *[BOT ORDER EXECUTED]*\n\n` +
                    `🎯 *Action:* ${actionTriggered}\n` +
                    `📊 *Symbol:* BTC/USDT\n` +
                    `💰 *Execution Price:* $${currentPrice.toLocaleString()}\n` +
                    `📉 *Base Price:* $${lastPrice.toLocaleString()}\n` +
                    `📈 *Shift:* ${priceChangePercent.toFixed(2)}%\n\n` +
                    `🚀 *Trade recorded in Paper/Bot Dashboard!*`
                );
                await fetch(`https://api.telegram.org/bot${config.tgToken}/sendMessage?chat_id=${config.tgChatId}&text=${tgMsg}&parse_mode=Markdown`);
            }
        } else {
            // First time setup if no state existed
            if (!botState.lastPrice) {
                await fetch(`${FIREBASE_BASE_URL}/bot_state.json`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lastPrice: currentPrice, updatedAt: new Date().toISOString() })
                });
            }
        }

        return res.status(200).json({
            success: true,
            currentPrice,
            lastPrice,
            changePercent: priceChangePercent.toFixed(3) + "%",
            actionTriggered: actionTriggered || "NONE (Price within 0.2% range)"
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
