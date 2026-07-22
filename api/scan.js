export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    try {
        const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

        // 1. Live Binance Price
        const binanceRes = await fetch(`https://api.binance.com/api/3/ticker/price?symbol=BTCUSDT`, { cache: 'no-store' });
        const priceData = await binanceRes.json();
        const currentPrice = parseFloat(priceData.price);

        // 2. Fetch App Settings (TG Credentials)
        const configRes = await fetch(`${FIREBASE_BASE_URL}/app_settings.json`, { cache: 'no-store' });
        const config = await configRes.json() || {};

        // Extract Telegram Token & Chat ID
        const tgToken = config.tgToken || config.telegramToken || config.botToken;
        const tgChatId = config.tgChatId || config.telegramChatId || config.chatId;

        // Diagnostic Check
        if (!tgToken || !tgChatId) {
            return res.status(200).json({
                success: false,
                error: "Telegram Token or Chat ID missing in Firebase app_settings!",
                fetchedConfig: config
            });
        }

        // 3. FORCE TELEGRAM MESSAGE (Direct Test Ping)
        const timeStr = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
        const testMsg = encodeURIComponent(
            `🚀 *[CRON SCAN ACTIVE]*\n\n` +
            `💰 *BTC Price:* $${currentPrice.toLocaleString()}\n` +
            `⏰ *Time:* ${timeStr}\n\n` +
            `✅ *Bot scanner is running successfully!*`
        );

        const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage?chat_id=${tgChatId}&text=${testMsg}&parse_mode=Markdown`);
        const tgStatus = await tgRes.json();

        return res.status(200).json({
            success: true,
            btcPrice: currentPrice,
            telegramSent: tgStatus.ok,
            telegramError: tgStatus.description || null
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
