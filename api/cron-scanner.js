import fetch from 'node-fetch';

export default async function handler(req, res) {
    try {
        const FIREBASE_URL = process.env.FIREBASE_DB_URL;
        let masterData = {};

        if (FIREBASE_URL) {
            const cleanUrl = FIREBASE_URL.replace(/\/+$/, "");
            const fbRes = await fetch(`${cleanUrl}/crypto_signals_master.json`);
            if (fbRes.ok) masterData = await fbRes.json() || {};
        }

        const strats = masterData.strategies || [];
        const settings = masterData.settings || {};
        const activeStrats = strats.filter(s => s.active !== false);

        if (activeStrats.length === 0) {
            return res.status(200).json({ status: 'no_active_strategies' });
        }

        let newSignals = [];

        for (const strat of activeStrats) {
            const coins = strat.coins ? strat.coins.split(',') : ['BTCUSDT'];
            for (const rawCoin of coins) {
                const coin = rawCoin.trim().toUpperCase();
                if (!coin) continue;

                // Live Binance Ticker API
                const pRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}`);
                if (!pRes.ok) continue;

                const priceData = await pRes.json();
                const price = parseFloat(priceData.price);
                const action = Math.random() > 0.5 ? 'BUY' : 'SELL';

                const slVal = action === 'BUY' ? price * (1 - (strat.sl / 100)) : price * (1 + (strat.sl / 100));
                const tpVal = action === 'BUY' ? price * (1 + (strat.tp / 100)) : price * (1 - (strat.tp / 100));

                const sig = {
                    id: 'SIG_' + Date.now(),
                    coin: coin,
                    action: action,
                    price: price.toFixed(2),
                    sl: slVal.toFixed(2),
                    tp: tpVal.toFixed(2),
                    time: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })
                };

                newSignals.push(sig);

                // Send Telegram Notification
                if (settings.tgToken && settings.tgChatId) {
                    const msg = `⚡ *NEW CRYPTO SIGNAL*\n\n` +
                                `🪙 *Coin:* #${coin}\n` +
                                `🎯 *Action:* ${action === 'BUY' ? '🟢 BUY' : '🔴 SELL'}\n` +
                                `💵 *Entry Price:* $${sig.price}\n` +
                                `🛑 *SL:* $${sig.sl} | 🎯 *TP:* $${sig.tp}\n` +
                                `⏰ *Time:* ${sig.time}`;

                    await fetch(`https://api.telegram.org/bot${settings.tgToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: settings.tgChatId, text: msg, parse_mode: 'Markdown' })
                    }).catch(() => {});
                }
            }
        }

        return res.status(200).json({ status: 'success', generated: newSignals.length, signals: newSignals });

    } catch (e) {
        return res.status(500).json({ status: 'error', message: e.message });
    }
}
