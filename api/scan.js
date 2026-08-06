import fetch from 'node-fetch';

export default async function handler(req, res) {
    try {
        // Binance Public Ticker - Fetch prices without IP ban
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) throw new Error('Binance API issue');

        const allTickers = await response.json();

        // Environment Variables or Default Coins
        const coinsToScan = (process.env.TARGET_COINS || 'BTCUSDT,ETHUSDT,SOLUSDT').split(',');
        const tgToken = process.env.TELEGRAM_BOT_TOKEN;
        const tgChatId = process.env.TELEGRAM_CHAT_ID;

        let signals = [];

        for (const coinSymbol of coinsToScan) {
            const symbol = coinSymbol.trim().toUpperCase();
            const coinData = allTickers.find(t => t.symbol === symbol);

            if (coinData) {
                const priceChange = parseFloat(coinData.priceChangePercent);
                const price = parseFloat(coinData.lastPrice);

                // Simple Signal Condition: High Volatility Movement
                if (Math.abs(priceChange) >= 2.0) {
                    const action = priceChange > 0 ? 'BUY 🟢' : 'SELL 🔴';
                    const sl = action.includes('BUY') ? (price * 0.985).toFixed(2) : (price * 1.015).toFixed(2);
                    const tp = action.includes('BUY') ? (price * 1.030).toFixed(2) : (price * 0.970).toFixed(2);

                    const msg = `🚀 *24x7 CRYPTO SIGNAL*\n\n` +
                                `🪙 *Coin:* #${symbol}\n` +
                                `🎯 *Action:* ${action}\n` +
                                `💵 *Price:* $${price}\n` +
                                `🛑 *SL:* $${sl} | 🎯 *TP:* $${tp}\n` +
                                `📈 *24h Move:* ${priceChange}%`;

                    signals.push({ symbol, action, price });

                    // Send Telegram Alert
                    if (tgToken && tgChatId) {
                        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ chat_id: tgChatId, text: msg, parse_mode: 'Markdown' })
                        });
                    }
                }
            }
        }

        return res.status(200).json({ success: true, scanned: coinsToScan.length, signalsFound: signals });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
