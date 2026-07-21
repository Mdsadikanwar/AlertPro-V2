// 🤖 Simple & Safe Bot Engine Trigger
async function triggerFlashTestTrade(stratName = "Manual Flash Test", coin = "BTC", forceAction = "BUY") {
    try {
        console.log("⚡ Executing Flash Test...");
        const symbol = `${coin}USDT`;
        
        // Binance से लाइव रेट लें
        const priceRes = await fetch(`https://api.binance.com/api/3/ticker/price?symbol=${symbol}`);
        const priceData = await priceRes.json();
        const currentPrice = parseFloat(priceData.price);

        const newTrade = {
            action: forceAction,
            pair: `${coin}/USDT`,
            price: currentPrice.toFixed(2),
            strategyName: stratName,
            pnl: forceAction === 'BUY' ? 7.50 : -3.20,
            timestamp: new Date().toISOString()
        };

        // Firebase Base URL चेक करें
        const firebaseUrl = typeof FIREBASE_BASE_URL !== 'undefined' ? FIREBASE_BASE_URL : '';
        
        if (!firebaseUrl) {
            alert("⚠️ FIREBASE_BASE_URL नहीं मिला! कृपया settings.js चेक करें।");
            return;
        }

        // Firebase में पुश करें
        await fetch(`${firebaseUrl}/bot_trades.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTrade)
        });

        alert(`✅ Success! Trade Executed at $${currentPrice.toFixed(2)}`);

        // UI अपडेट करें
        if (typeof loadLiveBotTrades === 'function') {
            loadLiveBotTrades();
        }

    } catch (e) {
        console.error("Flash Test Error:", e);
        alert("❌ Error: " + e.message);
    }
}
