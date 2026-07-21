// 🔄 Every 1-Minute Strategy Engine Scanner
export default async function handler(req, res) {
    try {
        const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

        // 1. Firebase से एक्टिव स्ट्रेटजीज़ निकालें
        const stratRes = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`);
        const strategies = await stratRes.json();

        if (!strategies) {
            return res.status(200).json({ status: "No active strategies found" });
        }

        // 2. Binance से BTC/USDT का लाइव रेट लें
        const binanceRes = await fetch(`https://api.binance.com/api/3/ticker/price?symbol=BTCUSDT`);
        const priceData = await binanceRes.json();
        const currentPrice = parseFloat(priceData.price);

        let executedTrades = [];

        // 3. हर स्ट्रेटजी की कंडीशन चेक करें
        for (let key in strategies) {
            const strat = strategies[key];
            const isAuto = strat.isAutoActive !== undefined ? strat.isAutoActive : true;

            if (isAuto) {
                // यहाँ आपकी स्ट्रेटजी की लॉजिक काम करेगी (जैसे target high/low hit होना)
                // टेस्टिंग के लिए ऑटो-ट्रेड ट्रिगर payload:
                const tradePayload = {
                    action: "BUY",
                    pair: `${strat.coin || 'BTC'}/USDT`,
                    price: currentPrice.toFixed(2),
                    strategyName: strat.name || "Cron Auto Scanner",
                    pnl: 7.50,
                    timestamp: new Date().toISOString()
                };

                // 4. Firebase में ट्रेड सेव करें
                await fetch(`${FIREBASE_BASE_URL}/bot_trades.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tradePayload)
                });

                executedTrades.push(strat.name || key);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Market scanned successfully",
            executed: executedTrades,
            scannedAt: new Date().toLocaleTimeString()
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
