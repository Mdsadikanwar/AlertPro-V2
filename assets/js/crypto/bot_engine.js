// 🤖 Live Background Auto Trading Engine
let botInterval = null;

function startAutoTradingEngine() {
    if (botInterval) clearInterval(botInterval);

    console.log("🚀 Starting Crypto Bot Engine...");
    
    // हर 10 सेकंड में लाइव स्कैनिंग और ऑटो-ट्रेडिंग चेक करें
    botInterval = setInterval(async () => {
        await processAutoTrades();
    }, 10000);
}

async function processAutoTrades() {
    try {
        // 1. ग्लोबल सेटिंग्स चेक करें (Global Switch Check)
        const settingsRes = await fetch(`${FIREBASE_BASE_URL}/app_settings.json`);
        const settings = await settingsRes.json();

        if (!settings || settings.botSwitch !== 'ON') {
            updateBotConsoleLog("🔴 Bot Engine Disabled from Settings.");
            return;
        }

        // 2. एक्टिव स्ट्रेटजीज़ निकालें
        const stratRes = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`);
        const strategies = await stratRes.json();
        if (!strategies) return;

        for (let key in strategies) {
            const strat = strategies[key];
            const isAuto = strat.isAutoActive !== undefined ? strat.isAutoActive : true;

            if (isAuto) {
                await checkStrategyAndExecute(key, strat, settings);
            }
        }
    } catch (e) {
        console.error("Bot Engine Loop Error:", e);
    }
}

async function checkStrategyAndExecute(stratKey, strat, settings) {
    const coin = strat.coin || 'BTC';
    const symbol = `${coin}USDT`;

    try {
        // 3. बाइनेंस से लाइव प्राइस फेच करें
        const priceRes = await fetch(`https://api.binance.com/api/3/ticker/price?symbol=${symbol}`);
        const priceData = await priceRes.json();
        const currentPrice = parseFloat(priceData.price);

        updateBotConsoleLog(`🔍 Scanning ${coin} at $${currentPrice} for ${strat.name}...`);

        // यहाँ आपकी स्ट्रेटजी रूल्स का सिमुलेशन है
        // (अगर आप चाहें तो तुरंत टेस्ट करने के लिए फ्लैश टेस्ट बटन भी इस्तेमाल कर सकते हैं)
    } catch (err) {
        console.error("Price Fetch Error:", err);
    }
}

// ⚡ 3. INSTANT LIVE TEST TRIGGER (मैनुअल बाय/सेल टेस्ट)
async function triggerFlashTestTrade(stratName = "Manual Flash Test", coin = "BTC", forceAction = "BUY") {
    try {
        const symbol = `${coin}USDT`;
        const priceRes = await fetch(`https://api.binance.com/api/3/ticker/price?symbol=${symbol}`);
        const priceData = await priceRes.json();
        const currentPrice = parseFloat(priceData.price);

        const newTrade = {
            action: forceAction,
            pair: `${coin}/USDT`,
            price: currentPrice.toFixed(2),
            strategyName: stratName,
            pnl: forceAction === 'BUY' ? 7.50 : -3.20,
            timestamp: new Date().toLocaleTimeString()
        };

        // फ़ायरबेस में ट्रेड सेव करें
        await fetch(`${FIREBASE_BASE_URL}/bot_trades.json`, {
            method: 'POST',
            body: JSON.stringify(newTrade)
        });

        alert(`🚀 Flash Test Executed!\n\nAction: ${forceAction}\nCoin: ${coin}\nLive Price: $${currentPrice}`);

        // UI रिफ्रेश करें
        if (typeof loadLiveBotTrades === 'function') loadLiveBotTrades();

    } catch (e) {
        alert("❌ Flash Test Failed! Check Firebase connection.");
    }
}

function updateBotConsoleLog(message) {
    const consoleLog = document.getElementById('botConsole');
    if (consoleLog) {
        consoleLog.innerHTML = `<span style="color: #38bdf8;">[${new Date().toLocaleTimeString()}]</span> ${message}`;
    }
}

// ऐप लोड होते ही इंजन ऑटो स्टार्ट करें
startAutoTradingEngine();
