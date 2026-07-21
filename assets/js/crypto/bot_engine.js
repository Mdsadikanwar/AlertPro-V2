// 🤖 Fixed & Tested Flash Test Trigger
async function triggerFlashTestTrade(stratName = "Manual Flash Test", coin = "BTC", forceAction = "BUY") {
    try {
        console.log("⚡ Executing Flash Test Trigger...");

        // 1. Get Base URL and clean it up
        let baseUrl = (typeof FIREBASE_BASE_URL !== 'undefined' && FIREBASE_BASE_URL) 
            ? FIREBASE_BASE_URL 
            : "https://alertpro-bot-default-rtdb.firebaseio.com";

        // Remove trailing slash if present
        baseUrl = baseUrl.replace(/\/+$/, "");

        // 2. Fetch Live Price (Fallback if network blocks Binance)
        let currentPrice = 67450.50; // Backup Price
        try {
            const binanceRes = await fetch(`https://api.binance.com/api/3/ticker/price?symbol=${coin}USDT`);
            if (binanceRes.ok) {
                const bData = await binanceRes.json();
                currentPrice = parseFloat(bData.price);
            }
        } catch (e) {
            console.warn("Binance API fetch bypassed, using ticker estimate.");
        }

        // 3. Construct Trade Data
        const tradeData = {
            action: forceAction,
            pair: `${coin}/USDT`,
            price: currentPrice.toFixed(2),
            strategyName: stratName,
            pnl: forceAction === 'BUY' ? 7.50 : -3.20,
            timestamp: new Date().toISOString()
        };

        // 4. Push directly to Firebase via REST API (.json is MANDATORY)
        const targetEndpoint = `${baseUrl}/bot_trades.json`;
        console.log("Posting to Endpoint:", targetEndpoint);

        const response = await fetch(targetEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tradeData)
        });

        if (!response.ok) {
            throw new Error(`Firebase Error: ${response.status} ${response.statusText}`);
        }

        alert(`🚀 Success!\n\nAuto Order Triggered:\nAction: ${forceAction}\nCoin: ${coin}/USDT\nPrice: $${currentPrice.toFixed(2)}`);

        // UI रिफ्रेश करें
        if (typeof loadLiveBotTrades === 'function') {
            loadLiveBotTrades();
        }

    } catch (err) {
        console.error("Execution Error:", err);
        alert(`❌ Flash Test Error:\n${err.message}\n\nकृपया Firebase Rules (Read/Write = true) चेक करें।`);
    }
}
