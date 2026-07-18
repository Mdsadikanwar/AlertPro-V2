const https = require('https');
const crypto = require('crypto');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', (err) => reject(err));
    if (options.body) { req.write(options.body); }
    req.end();
  });
}

async function syncBalanceToFirebase(apiKey, apiSecret, firebaseBaseUrl) {
  const BINANCE_KEY = apiKey || process.env.BINANCE_TESTNET_API_KEY;
  const BINANCE_SECRET = apiSecret || process.env.BINANCE_TESTNET_SECRET_KEY;
  if (!BINANCE_KEY || BINANCE_KEY.includes("mock") || !BINANCE_SECRET) return;

  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = crypto.createHmac('sha256', BINANCE_SECRET).update(queryString).digest('hex');
    const accountData = await makeRequest(`https://testnet.binance.vision/api/v3/account?${queryString}&signature=${signature}`, {
      method: 'GET', headers: { 'X-MBX-APIKEY': BINANCE_KEY }
    });
    if (accountData && accountData.balances) {
      const usdt = accountData.balances.find(b => b.asset === "USDT");
      const btc = accountData.balances.find(b => b.asset === "BTC");
      await makeRequest(`${firebaseBaseUrl}/account_balance.json`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usdt: usdt ? parseFloat(usdt.free).toFixed(2) : "0.00", btc: btc ? parseFloat(btc.free).toFixed(6) : "0.000000", lastUpdated: new Date().toISOString() })
      });
    }
  } catch (e) { console.error("Balance sync error:", e.message); }
}

async function placeTestnetOrder(symbol, side, qty, apiKey, apiSecret) {
  const BINANCE_KEY = apiKey || process.env.BINANCE_TESTNET_API_KEY;
  const BINANCE_SECRET = apiSecret || process.env.BINANCE_TESTNET_SECRET_KEY;
  if (!BINANCE_KEY || BINANCE_KEY.includes("mock") || !BINANCE_SECRET) {
    return { orderId: "MOCK_" + Date.now(), status: "FILLED" };
  }
  const timestamp = Date.now();
  let queryString = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${qty}&timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', BINANCE_SECRET).update(queryString).digest('hex');
  return await makeRequest(`https://testnet.binance.vision/api/v3/order?${queryString}&signature=${signature}`, {
    method: 'POST', headers: { 'X-MBX-APIKEY': BINANCE_KEY }
  });
}

async function run24x7Bot() {
  console.log("🚀 Running Dynamic Percentage Strategy Bot...");
  const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

  try {
    const dbData = await makeRequest(`${FIREBASE_BASE_URL}/.json`);
    if (!dbData || !dbData.app_settings) return;

    const { telegramToken, telegramChatId, binanceApiKey, binanceApiSecret } = dbData.app_settings;
    const strategies = dbData.trading_strategies || {};
    const lastTrades = dbData.last_executed_prices || {}; // आखिरी ट्रेड प्राइस ट्रैक करने के लिए

    await syncBalanceToFirebase(binanceApiKey, binanceApiSecret, FIREBASE_BASE_URL);

    const activeStrategies = Object.keys(strategies).map(k => ({id: k, ...strategies[k]})).filter(s => s.status === "Active");
    if (activeStrategies.length === 0) return;

    for (const strat of activeStrategies) {
      const marketData = await makeRequest(`https://min-api.cryptocompare.com/data/price?fsym=${strat.pair.replace('USDT','')}&tsyms=USD`);
      const currentPrice = parseFloat(marketData.USD);
      if (!currentPrice || isNaN(currentPrice)) continue;

      // 🧠 वेबसाइट से डायनेमिक वैल्यूज उठाना (अगर सेट नहीं हैं तो डिफ़ॉल्ट 1% और 0.1% रहेगा)
      const buyThreshold = strat.buyLowPercent ? parseFloat(strat.buyLowPercent) : -1.0; // -1%
      const sellThreshold = strat.sellHighPercent ? parseFloat(strat.sellHighPercent) : 0.1; // +0.1%
      
      // आखिरी खरीद या बिक्री का प्राइस ढूंढना
      const lastPrice = lastTrades[strat.pair] ? parseFloat(lastTrades[strat.pair].price) : currentPrice;
      const lastAction = lastTrades[strat.pair] ? lastTrades[strat.pair].action : "SELL"; // डिफ़ॉल्ट मान लेते हैं कि पहले सेल था ताकि बाय ट्रिगर हो सके

      const priceChangePercent = ((currentPrice - lastPrice) / lastPrice) * 100;
      let signal = null;

      // 📉 अगर प्राइस 1% या उससे ज्यादा गिर गया है और पिछला एक्शन SELL था -> BUY करो
      if (priceChangePercent <= buyThreshold && lastAction !== "BUY") {
        signal = "BUY";
      } 
      // 📈 अगर प्राइस 0.1% या उससे ज्यादा बढ़ गया है और पिछला एक्शन BUY था -> PROFIT BOOK / SELL करो
      else if (priceChangePercent >= sellThreshold && lastAction === "BUY") {
        signal = "SELL";
      }

      if (signal) {
        const tradeQty = 0.005; 
        const orderResult = await placeTestnetOrder(strat.pair, signal, tradeQty, binanceApiKey, binanceApiSecret);
        
        // फायरबेस में ट्रेड का इतिहास सेव करना
        const tradeRecord = {
          strategyName: strat.name, pair: strat.pair, action: signal, price: currentPrice,
          quantity: tradeQty, orderId: orderResult.orderId || "MOCK", status: orderResult.status || "FILLED", timestamp: new Date().toISOString()
        };

        await makeRequest(`${FIREBASE_BASE_URL}/live_trades.json`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tradeRecord) });
        
        // 🔄 आखिरी प्राइस को अपडेट करना ताकि अगला 0.1% या 1% इसके आधार पर कैलकुलेट हो
        await makeRequest(`${FIREBASE_BASE_URL}/last_executed_prices/${strat.pair}.json`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ price: currentPrice, action: signal, timestamp: new Date().toISOString() })
        });

        await syncBalanceToFirebase(binanceApiKey, binanceApiSecret, FIREBASE_BASE_URL);

        if (telegramToken && telegramChatId) {
          const emoji = signal === "BUY" ? "🟢" : "🔴";
          const msg = `${emoji} *DYNAMIC TRADE EXECUTED*\n\n• *Pair:* ${strat.pair}\n• *Action:* ${signal}\n• *Execution Price:* $${currentPrice}\n• *Change:* ${priceChangePercent.toFixed(2)}%`;
          await makeRequest(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: telegramChatId, text: msg, parse_mode: "Markdown" })
          });
        }
      } else {
        console.log(`ℹ️ ${strat.pair}: No trade triggered. Change from last trade: ${priceChangePercent.toFixed(2)}% (Target Buy: ${buyThreshold}%, Sell: +${sellThreshold}%)`);
      }
    }
  } catch (e) { console.error("Error:", e.message); }
}

run24x7Bot();
