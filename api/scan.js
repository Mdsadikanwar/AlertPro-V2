export default async function handler(req, res) {
    try {
        const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

        // 1. Fetch active strategies
        const stratRes = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`);
        const strategies = await stratRes.json();

        if (!strategies) {
            return res.status(200).json({ success: true, message: "No active strategies found" });
        }

        // 2. Fetch Live Price from Binance
        const binanceRes = await fetch(`https://api.binance.com/api/3/ticker/price?symbol=BTCUSDT`);
        const priceData = await binanceRes.json();
        const currentPrice = parseFloat(priceData.price);

        return res.status(200).json({
            success: true,
            message: "Market scanned successfully",
            btcPrice: currentPrice,
            scannedAt: new Date().toLocaleTimeString()
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
