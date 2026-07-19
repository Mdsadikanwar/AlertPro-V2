var activeTab = localStorage.getItem('apex_active_tab') || 'dashboard';
const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

window.onload = function() {
    executeTabRender();
    // 🤖 पायथन खत्म! अब यही से हर 10 सेकंड में ऑटो-ट्रेडिंग इंजन चलेगा
    startJsCryptoEngine();
};

function switchTab(tabId) {
    activeTab = tabId;
    localStorage.setItem('apex_active_tab', tabId);
    executeTabRender();
}

function executeTabRender() {
    if (activeTab === 'dashboard') typeof renderCryptoDashboard === 'function' && renderCryptoDashboard();
    if (activeTab === 'trading') typeof renderCryptoTrading === 'function' && renderCryptoTrading();
    if (activeTab === 'strategies') typeof renderCryptoStrategies === 'function' && renderCryptoStrategies();
    if (activeTab === 'backtest') typeof renderCryptoBacktest === 'function' && renderCryptoBacktest();
    if (activeTab === 'settings') typeof renderCryptoSettings === 'function' && renderCryptoSettings();
    if (activeTab === 'logs') typeof renderCryptoLogs === 'function' && renderCryptoLogs();
}

function getMarketNavbar() {
    const tabs = ['dashboard', 'trading', 'strategies', 'backtest', 'settings', 'logs'];
    return `
      <div style="background: #1e293b; padding: 15px 20px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
        <div><h2 style="color: #38bdf8; margin: 0; font-size: 20px;">⚡ ApexTraders [JS ENGINE]</h2></div>
        <div style="display: flex; gap: 5px;">
          ${tabs.map(tab => `<button onclick="switchTab('${tab}')" style="background: none; border: none; padding: 8px 16px; color: ${tab === activeTab ? '#38bdf8' : '#94a3b8'}; border-bottom: ${tab === activeTab ? '3px solid #38bdf8' : 'none'}; cursor: pointer; font-weight: bold; text-transform: uppercase;">${tab}</button>`).join('')}
        </div>
      </div>
    `;
}

// 🚀 प्योर जावास्क्रिप्ट ऑटो-ट्रेडिंग इंजन
async function startJsCryptoEngine() {
    setInterval(async () => {
        try {
            const res = await fetch(`${FIREBASE_BASE_URL}/.json`);
            const db_data = await res.json();
            if (!db_data || !db_data.trading_strategies) return;

            const strategies = db_data.trading_strategies;
            const last_trades = db_data.last_executed_prices || {};
            const settings = db_data.app_settings || {};

            for (let pair in strategies) {
                const strat = strategies[pair];
                if (strat.status !== 'Active') continue;

                const symbol = pair.replace('USDT', '');
                const priceRes = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`);
                const priceData = await priceRes.json();
                const currentPrice = float(priceData.USD);

                if (!currentPrice) continue;

                const buyThreshold = float(strat.buyLowPercent);
                const sellThreshold = float(strat.sellHighPercent);

                const lastTrade = last_trades[pair] || { price: currentPrice, action: 'SELL' };
                const lastPrice = float(lastTrade.price);
                const lastAction = lastTrade.action;

                const priceChangePercent = ((currentPrice - lastPrice) / lastPrice) * 100;
                let signal = null;

                if (priceChangePercent <= buyThreshold && lastAction !== 'BUY') signal = 'BUY';
                if (priceChangePercent >= sellThreshold && lastAction === 'BUY') signal = 'SELL';

                if (signal) {
                    // फायरबेस में ट्रेड डालो
                    await fetch(`${FIREBASE_BASE_URL}/live_trades.json`, {
                        method: 'POST',
                        body: JSON.stringify({
                            strategyName: strat.name,
                            pair: pair,
                            action: signal,
                            price: currentPrice,
                            quantity: 0.005,
                            timestamp: new Date().toISOString(),
                            status: "FILLED"
                        })
                    });

                    // लास्ट प्राइस सिंक करो
                    await fetch(`${FIREBASE_BASE_URL}/last_executed_prices/${pair}.json`, {
                        method: 'PUT',
                        body: JSON.stringify({ price: currentPrice, action: signal, timestamp: new Date().toISOString() })
                    });

                    // टेलीग्राम अलर्ट
                    if (settings.telegramToken && settings.telegramChatId) {
                        const msg = `${signal === 'BUY' ? '🟢' : '🔴'} *JS TRADE EXECUTED*\n\n• *Pair:* ${pair}\n• *Action:* ${signal}\n• *Price:* $${currentPrice}`;
                        await fetch(`https://api.telegram.org/bot${settings.telegramToken}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ chat_id: settings.telegramChatId, text: msg, parse_mode: "Markdown" })
                        });
                    }
                }
            }
        } catch (e) { console.log("Engine error:", e); }
    }, 10000); // हर 10 सेकंड में ऑटो-चेक
}
function float(v) { return parseFloat(v) || 0; }
