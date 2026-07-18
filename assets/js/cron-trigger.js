const https = require('https');
const crypto = require('crypto');

// HTTP रिक्वेस्ट के लिए हेल्पर फंक्शन
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

// बाइनेंस टेस्टनेट बैलेंस सिंक फंक्शन
async function syncBalanceToFirebase(apiKey, apiSecret, firebaseBaseUrl) {
  const BINANCE_KEY = apiKey || process.env.BINANCE_TESTNET_API_KEY;
  const BINANCE_SECRET = apiSecret || process.env.BINANCE_TESTNET_SECRET_KEY;

  if (!BINANCE_KEY || BINANCE_KEY.includes("mock") || !BINANCE_SECRET) {
    return; // मॉक मोड में बैलेंस चेंज नहीं कर रहे
  }

  const baseUrl = "https://testnet.binance.vision";
  const path = "/api/v3/account";
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', BINANCE_SECRET).update(queryString).digest('hex');
  const url = `${baseUrl}${path}?${queryString}&signature=${signature}`;

  try {
    const accountData = await makeRequest(url, { method: 'GET', headers: { 'X-MBX-APIKEY': BINANCE_KEY } });
    if (accountData && accountData.balances) {
      const usdtAsset = accountData.balances.find(b => b.asset === "USDT");
      const btcAsset = accountData.balances.find(b => b.asset === "BTC");
      const usdtFree = usdtAsset ? parseFloat(usdtAsset.free).toFixed(2) : "0.00";
      const btcFree = btcAsset ? parseFloat(btcAsset.free).toFixed(6) : "0.000000";

      await makeRequest(`${firebaseBaseUrl}/account_balance.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usdt: usdtFree, btc: btcFree, lastUpdated: new Date().toISOString() })
      });
    }
  } catch (err) {
    console.error("❌ Balance Sync Error:", err.message);
  }
}

// बाइनेंस टेस्टनेट पर असली आर्डर प्लेस करना
async function placeTestnetOrder(symbol, side, qty, apiKey, apiSecret) {
  const BINANCE_KEY = apiKey || process.env.BINANCE_TESTNET_API_KEY;
  const BINANCE_SECRET = apiSecret || process.env.BINANCE_TESTNET_SECRET_KEY;

  if (!BINANCE_KEY || BINANCE_KEY.includes("mock") || !BINANCE_SECRET) {
    console.log(`🎰 [MOCK] Simulating ${side} order...`);
    return { orderId: "MOCK_" + Date.now(), status: "FILLED" };
  }

  const baseUrl = "https://testnet.binance.vision";
  const path = "/api/v3/order";
  const timestamp = Date.now();
  
  let queryString = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${qty}&timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', BINANCE_SECRET).update(queryString).digest('hex');
  queryString += `&signature=${signature}`;

  return await makeRequest(`${baseUrl}${path}?${queryString}`, {
    method: 'POST',
    headers: { 'X-MBX-APIKEY': BINANCE_KEY }
  });
}

// मुख्य फ़ंक्शन
async function run24x7Bot() {
  console.log("🚀 Starting 24x7 Strategy Runner...");
  const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

  try {
    const dbData = await makeRequest(`${FIREBASE_BASE_URL}/.json`);
    if (!dbData || !dbData.app_settings) {
      console.log("❌ Settings not found.");
      return;
    }

    const { telegramToken, telegramChatId, binanceApiKey, binanceApiSecret } = dbData.app_settings;
    const strategies = dbData.trading_strategies || {};

    // बैलेंस सिंक करें
    await syncBalanceToFirebase(binanceApiKey, binanceApiSecret, FIREBASE_BASE_URL);

    // सिर्फ एक्टिव स्ट्रेटेजी चेक करें
    const activeStrategies = Object.keys(strategies).map(k => strategies[k]).filter(s => s.status === "Active");
    if (activeStrategies.length === 0) {
      console.log("💤 No active strategies.");
      return;
    }

    for (const strat of activeStrategies) {
      // लाइव प्राइस लाना
      const marketData = await makeRequest(`https://min-api.cryptocompare.com/data/price?fsym=${strat.pair.replace('USDT','')}&tsyms=USD`);
      const currentPrice = parseFloat(marketData.USD);
      if (!currentPrice || isNaN(currentPrice)) continue;

      // 🎰 टेस्टिंग के लिए सिग्नल जेनरेट
      const mockSignal = Math.random() > 0.5 ? "BUY" : "SELL"; 
      const tradeQty = 0.005; 

      // 1. बाइनेंस एक्सचेंज पर आर्डर मारना
      const orderResult = await placeTestnetOrder(strat.pair, mockSignal, tradeQty, binanceApiKey, binanceApiSecret);
      
      // 2. 📝 [NEW] ट्रेड को फायरबेस डेटाबेस में सेव करना ताकि वेबसाइट पर दिखे
      const tradeRecord = {
        strategyName: strat.name,
        pair: strat.pair,
        action: mockSignal,
        price: currentPrice,
        quantity: tradeQty,
        orderId: orderResult.orderId || "UNKNOWN",
        status: orderResult.status || "EXECUTED",
        timestamp: new Date().toISOString()
      };

      // फायरबेस के 'live_trades' नोड में ट्रेड को पुश करना
      await makeRequest(`${FIREBASE_BASE_URL}/live_trades.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeRecord)
      });
      console.log("📝 Trade recorded in Firebase!");

      // बैलेंस दोबारा सिंक करें
      await syncBalanceToFirebase(binanceApiKey, binanceApiSecret, FIREBASE_BASE_URL);

      // 3. टेलीग्राम अलर्ट
      if (telegramToken && telegramChatId) {
        const emoji = mockSignal === "BUY" ? "🟢" : "🔴";
        const alertMessage = `${emoji} *TRADE EXECUTED*\n\n• *Strategy:* ${strat.name}\n• *Pair:* ${strat.pair}\n• *Action:* ${mockSignal}\n• *Price:* $${currentPrice}\n• *Status:* ${tradeRecord.status}`;
        await makeRequest(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: telegramChatId, text: alertMessage, parse_mode: "Markdown" })
        });
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

run24x7Bot();
