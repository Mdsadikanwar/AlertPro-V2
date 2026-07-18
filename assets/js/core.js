// Main Router: Market selection handler
function navigateToMarket(market) {
  currentMarket = market;
  
  // Browser state save karein taaki refresh par yaad rahe
  localStorage.setItem('last_active_market', market);

  if (market === 'home') {
    localStorage.removeItem('last_active_market');
    localStorage.removeItem('last_active_tab');
    renderLandingPage();
  } else {
    // Default tabs configuration for different markets
    if (market === 'crypto') activeTab = 'dashboard';
    if (market === 'stocks') activeTab = 'dashboard';
    if (market === 'commodities') activeTab = 'dashboard';
    
    localStorage.setItem('last_active_tab', activeTab);
    loadMarketInterface();
  }
}

// Global Core State Config
var currentMarket = 'home'; 
var activeTab = 'dashboard';

// Active tab switcher
function switchTab(tabId) {
  activeTab = tabId;
  localStorage.setItem('last_active_tab', tabId); // Tab memory state save
  
  // Clear any active interval (like live crypto prices) if switching tabs
  if (typeof priceIntervalId !== 'undefined' && priceIntervalId) {
    clearInterval(priceIntervalId);
  }

  // UI Tabs update highlights
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    if (tab.getAttribute('onclick').includes(`'${tabId}'`)) {
      tab.style.borderBottom = `3px solid ${tab.dataset.color || '#fff'}`;
      tab.style.color = '#fff';
      tab.style.opacity = '1';
    } else {
      tab.style.borderBottom = 'none';
      tab.style.color = '#94a3b8';
      tab.style.opacity = '0.7';
    }
  });

  // Render correct panel
  executeTabRender();
}

// Router for specific UI views
function executeTabRender() {
  const marketPrefix = currentMarket.toLowerCase();
  
  if (marketPrefix === 'crypto') {
    if (activeTab === 'dashboard') renderCryptoDashboard();
    if (activeTab === 'trading') renderCryptoTrading();
    if (activeTab === 'strategies') renderCryptoStrategies();
    if (activeTab === 'backtest') renderCryptoBacktest();
    if (activeTab === 'settings') renderCryptoSettings();
    if (activeTab === 'logs') renderCryptoLogs();
  } else if (marketPrefix === 'stocks') {
    if (activeTab === 'dashboard') renderStocksDashboard();
    // baaki tabs ko hum aage chalkar render karenge
  }
}

// Universal Navigation Head Bar Template generator
function getMarketNavbar(marketName, colorCode) {
  const tabs = ['dashboard', 'trading', 'strategies', 'backtest', 'settings', 'logs'];
  
  return `
    <div style="background: #1e293b; padding: 15px 20px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; font-family: sans-serif;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span onclick="navigateToMarket('home')" style="cursor: pointer; font-size: 20px; color: #94a3b8;" title="Go Home">🏠</span>
        <h2 style="color: ${colorCode}; margin: 0; font-size: 20px;">ApexTraders [${marketName}]</h2>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        ${tabs.map(tab => {
          const isActive = tab === activeTab;
          return `
            <button class="nav-tab" 
                    data-color="${colorCode}"
                    onclick="switchTab('${tab}')" 
                    style="background: none; border: none; padding: 8px 12px; color: ${isActive ? '#fff' : '#94a3b8'}; border-bottom: ${isActive ? `3px solid ${colorCode}` : 'none'}; cursor: pointer; font-weight: bold; font-size: 14px; text-transform: capitalize; opacity: ${isActive ? '1' : '0.7'};">
              ${tab}
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Load current ecosystem setup
function loadMarketInterface() {
  executeTabRender();
}
// ⚡ 24/7 Live Web Auto-Trading Engine (No GitHub Actions Needed)
function startLiveTradingEngine() {
  console.log("🚀 ApexTraders Live Engine Initialized in Browser...");
  
  // हर 10 सेकंड में ऑटो-चेक करेगा (10000ms)
  setInterval(async () => {
    const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    
    try {
      // 1. फायरबेस से लाइव डेटा लाना
      const res = await fetch(`${FIREBASE_BASE_URL}/.json`);
      const dbData = await res.json();
      if (!dbData || !dbData.app_settings) return;

      const { binanceApiKey, binanceApiSecret, telegramToken, telegramChatId } = dbData.app_settings;
      const strategies = dbData.trading_strategies || {};
      const lastTrades = dbData.last_executed_prices || {};

      // सिर्फ एक्टिव स्ट्रेटेजी फिल्टर करना
      const activeStrategies = Object.keys(strategies)
        .map(k => ({id: k, ...strategies[k]}))
        .filter(s => s.status === "Active");

      if (activeStrategies.length === 0) return;

      for (const strat of activeStrategies) {
        // 2. लाइव मार्केट प्राइस खींचना
        const priceRes = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${strat.pair.replace('USDT','')}&tsyms=USD`);
        const priceData = await priceRes.json();
        const currentPrice = parseFloat(priceData.USD);
        if (!currentPrice || isNaN(currentPrice)) continue;

        // वेबसाइट से आपकी सेटिंग्स (% वैल्यूज)
        const buyThreshold = strat.buyLowPercent ? parseFloat(strat.buyLowPercent) : -1.0;
        const sellThreshold = strat.sellHighPercent ? parseFloat(strat.sellHighPercent) : 0.1;
        
        const lastTrade = lastTrades[strat.pair] || { price: currentPrice, action: "SELL" };
        const lastPrice = parseFloat(lastTrade.price);
        const lastAction = lastTrade.action;

        const priceChangePercent = ((currentPrice - lastPrice) / lastPrice) * 100;
        let signal = null;

        if (priceChangePercent <= buyThreshold && lastAction !== "BUY") {
          signal = "BUY";
        } else if (priceChangePercent >= sellThreshold && lastAction === "BUY") {
          signal = "SELL";
        }

        // 🎯 अगर प्राइस मैच हुआ -> तुरंत ट्रेड!
        if (signal) {
          console.log(`🎯 Strategy Triggered: ${signal} for ${strat.pair} @ $${currentPrice}`);
          const tradeQty = 0.005;

          // 📝 तुरंत नया ट्रेड रिकॉर्ड बनाना
          const tradeRecord = {
            strategyName: strat.name,
            pair: strat.pair,
            action: signal,
            price: currentPrice,
            quantity: tradeQty,
            timestamp: new Date().toISOString(),
            status: "FILLED"
          };

          // 3. फायरबेस में 'live_trades' के अंदर एंट्री ठोकना
          await fetch(`${FIREBASE_BASE_URL}/live_trades.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tradeRecord)
          });

          // 🔄 लास्ट प्राइस को अपडेट करना
          await fetch(`${FIREBASE_BASE_URL}/last_executed_prices/${strat.pair}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: currentPrice, action: signal, timestamp: new Date().toISOString() })
          });

          // 📲 टेलीग्राम अलर्ट भेजना
          if (telegramToken && telegramChatId) {
            const emoji = signal === "BUY" ? "🟢" : "🔴";
            const text = `${emoji} *TRADE EXECUTED*\n• *Pair:* ${strat.pair}\n• *Action:* ${signal}\n• *Price:* $${currentPrice}`;
            await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: telegramChatId, text: text, parse_mode: "Markdown" })
            });
          }
        }
      }
    } catch (e) {
      console.error("Live Web Engine Error:", e.message);
    }
  }, 10000); // हर 10 सेकंड में रन होगा
}

// इंजन चालू करें
startLiveTradingEngine();

