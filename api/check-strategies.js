export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    try {
        const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

        // Fetch Strategies and App Settings from Firebase in real-time
        const [stratRes, configRes] = await Promise.all([
            fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`, { cache: 'no-store' }),
            fetch(`${FIREBASE_BASE_URL}/app_settings.json`, { cache: 'no-store' })
        ]);

        const strategies = await stratRes.json() || {};
        const config = await configRes.json() || {};

        // Format and clean settings for secure view (hide full token)
        const tgConfigured = !!(config.tgToken || config.telegramToken || config.botToken);
        const chatIdConfigured = !!(config.tgChatId || config.telegramChatId || config.chatId);

        let strategySummary = [];
        for (const [id, strat] of Object.entries(strategies)) {
            strategySummary.push({
                id: id,
                name: strat.name || "Unnamed Strategy",
                status: strat.status || (strat.enabled ? "active" : "inactive"),
                symbol: strat.symbol || "BTCUSDT",
                buyTarget: strat.buyTarget || "N/A",
                sellTarget: strat.sellTarget || "N/A"
            });
        }

        return res.status(200).json({
            firebaseStatus: "Connected Successfully",
            telegramConfigured: tgConfigured && chatIdConfigured,
            totalStrategiesSaved: strategySummary.length,
            strategiesList: strategySummary
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: "Failed to connect to Firebase", 
            details: error.message 
        });
    }
}
