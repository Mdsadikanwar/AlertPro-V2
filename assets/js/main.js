// 📱 ग्लोबल स्टेट और फायरबेस कॉन्फिग
var activeTab = localStorage.getItem('apex_active_tab') || 'dashboard';
const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

window.onload = function() {
    executeTabRender();
    // 🚀 बोट ट्रेडिंग इंजन चालू करें (यह स्ट्रेटेजी से सिग्नल लेकर बोट ट्रेडिंग टैब में ट्रेड डालेगा)
    startJsCryptoEngine();
};

function switchTab(tabId) {
    activeTab = tabId;
    localStorage.setItem('apex_active_tab', tabId);
    executeTabRender();
}

function executeTabRender() {
    if (activeTab === 'dashboard') typeof renderCryptoDashboard === 'function' && renderCryptoDashboard();
    if (activeTab === 'paper_trade') typeof renderPaperTrading === 'function' && renderPaperTrading();
    if (activeTab === 'bot_trade') typeof renderBotTrading === 'function' && renderBotTrading();
    if (activeTab === 'strategies') typeof renderCryptoStrategies === 'function' && renderCryptoStrategies();
    if (activeTab === 'backtest') typeof renderCryptoBacktest === 'function' && renderCryptoBacktest();
    if (activeTab === 'settings') typeof renderCryptoSettings === 'function' && renderCryptoSettings();
    if (activeTab === 'logs') typeof renderCryptoLogs === 'function' && renderCryptoLogs();
}

// 📱 मोबाइल-फ्रेंडली फिक्स नेविगेशन बार (7 बटन ग्रिड - No Slide!)
function getMarketNavbar() {
    // ट्रेडिंग को हटाकर पेपर और बोट ट्रेडिंग अलग कर दिया
    const tabs = ['dashboard', 'paper_trade', 'bot_trade', 'strategies', 'backtest', 'settings', 'logs'];
    return `
      <div style="background: #1e293b; border-bottom: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); font-family: sans-serif;">
        <!-- Top Title Bar -->
        <div style="padding: 10px 15px; text-align: center; border-bottom: 1px solid #334155;">
          <h2 style="color: #38bdf8; margin: 0; font-size: 16px; letter-spacing: 0.5px;">⚡ APEX TRADERS CLOUD</h2>
        </div>
        <!-- Fixed Mobile Grid: बटन स्क्रीन पर फिक्स रहेंगे -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; padding: 6px;">
          ${tabs.map((tab, idx) => {
            // बोट ट्रेड और पेपर ट्रेड का नाम छोटा और मोबाइल फ्रेंडली दिखे इसलिए डिस्प्ले नेम बदला
            let displayName = tab.replace('_', ' ');
            if(tab === 'paper_trade') displayName = '📝 Paper';
            if(tab === 'bot_trade') displayName = '🤖 Bot Trade';
            
            // आख़िरी बटन को पूरी चौड़ाई देने के लिए (ताकि 3-3-1 का परफेक्ट ग्रिड बने)
            const styleFix = idx === 6 ? 'grid-column: span 3;' : '';
            
            return `
              <button onclick="switchTab('${tab}')" style="${styleFix} background: ${tab === activeTab ? '#38bdf8' : '#111827'}; border: 1px solid ${tab === activeTab ? '#38bdf8' : '#334155'}; padding: 12px 2px; color: ${tab === activeTab ? '#0f172a' : '#94a3b8'}; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 11px; text-transform: uppercase; text-align: center;">
                ${displayName}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
}

// 🤖 बोट ट्रेडिंग इंजन (जो स्ट्रेटेजी टैब से सिग्नल लेकर 'bot_trades' में सेव करेगा)
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
                    // 🤖 बोट ट्रेडिंग डेटाबेस एंट्री
                    await fetch(`${FIREBASE_BASE_URL}/bot_trades.json`, {
                        method: 'POST',
                        body: JSON.stringify({
                            strategyName: strat.name,
                            pair: pair,
                            action: signal,
                            price: currentPrice,
                            timestamp: new Date().toISOString(),
                            status: "FILLED"
                        })
                    });

                    await fetch(`${FIREBASE_BASE_URL}/last_executed_prices/${pair}.json`, {
                        method: 'PUT',
                        body: JSON.stringify({ price: currentPrice, action: signal, timestamp: new Date().toISOString() })
                    });

                    if (settings.telegramToken && settings.telegramChatId) {
                        const msg = `🤖 *BOT TRADE EXECUTED*\n\n• *Pair:* ${pair}\n• *Action:* ${signal}\n• *Price:* $${currentPrice}`;
                        await fetch(`https://api.telegram.org/bot${settings.telegramToken}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ chat_id: settings.telegramChatId, text: msg, parse_mode: "Markdown" })
                        });
                    }
                }
            }
        } catch (e) { console.log("Bot Engine error:", e); }
    }, 10000);
}

function float(v) { return parseFloat(v) || 0; }
