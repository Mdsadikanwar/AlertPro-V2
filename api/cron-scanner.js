// api/cron-scanner.js - GUARANTEED FORCE-RUN
import fetch from 'node-fetch';

export default async function handler(req, res) {
    try {
        // Binance Live Rate Fetch
        const tickerRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`);
        const ticker = await tickerRes.json();
        const btcPrice = parseFloat(ticker.price);

        const newTrade = {
            id: 'TRD_' + Date.now(),
            time: new Date().toLocaleTimeString(),
            strategy: 'Live Binance Auto Engine',
            symbol: 'BTCUSDT',
            action: 'BUY',
            entryPrice: btcPrice,
            livePrice: btcPrice,
            pnl: 0.00,
            status: 'PAPER_OPEN',
            sl: (btcPrice * 0.985).toFixed(2),
            tp: (btcPrice * 1.03).toFixed(2)
        };

        // Firebase Sync (If URL present)
        const FIREBASE_URL = process.env.FIREBASE_DB_URL;
        if (FIREBASE_URL) {
            await fetch(`${FIREBASE_URL}/apex_master_data/trades.json`, {
                method: 'PUT',
                body: JSON.stringify([newTrade])
            });
        }

        return res.status(200).json({
            status: 'SUCCESS',
            message: '100% FORCE TRADE GENERATED!',
            trade: newTrade
        });

    } catch (error) {
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}
