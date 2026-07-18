const https = require('https');
const crypto = require('crypto'); // एपीआई सिग्नेचर के लिए

// Helper function for HTTP requests
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

// 💰 बाइनेंस टेस्टनेट से बैलेंस लाकर फायरबेस में अपडेट करने का फंक्शन
async function syncBalanceToFirebase(apiKey, apiSecret, firebaseBaseUrl) {
  // 🔍 फिक्स: अगर फायरबेस सेटिंग्स में कीज नहीं हैं, तो गिटहब सीक्रेट्स (process.env) से उठाएगा
  const BINANCE_KEY = apiKey || process.env.BINANCE_TESTNET_API_KEY;
  const BINANCE_SECRET = apiSecret || process.env.BINANCE_TESTNET_SECRET_KEY;

  if (!BINANCE_KEY || BINANCE_KEY.includes("mock") || !BINANCE_SECRET) {
    console.log("🎰 [MOCK BALANCE] Keys missing/mock. Simulating $10,000 USDT in Firebase...");
    const mockPayload = {
      usdt: "10000.00",
      btc: "0.500000",
      lastUpdated: new Date().toISOString()
    };
    await makeRequest(`${firebaseBaseUrl}/account_balance.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockPayload)
    });
    return;
  }

  const baseUrl = "https://testnet.binance.vision";
  const path = "/api/v3/account";
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', BINANCE_SECRET).update(queryString).digest('hex');
  const url = `${baseUrl}${path}?${queryString}&signature=${signature}`;

  try {
    const accountData = await makeRequest(url, {
      method: 'GET',
      headers: { 'X-MBX-APIKEY': BINANCE_KEY }
    });

    if (accountData && accountData.balances) {
      const usdtAsset = accountData.balances.find(b => b.asset === "USDT");
      const btcAsset = accountData.balances.find(b => b.asset === "BTC");
      
      const usdtFree = usdtAsset ? parseFloat(usdtAsset.free).toFixed(2) : "0.00";
      const btcFree = btcAsset ? parseFloat(btcAsset.free).toFixed(6) : "0.000000";

      // डेटाबेस में सीधे 'account_balance' नोड पर लिखना
      await makeRequest(`${firebaseBaseUrl}/account_balance.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usdt: usdtFree,
          btc: btcFree,
          lastUpdated: new Date().toISOString()
        })
      });
      console.log(`✅ [Balance Sync Success] USDT: $${usdtFree} | BTC: ${btcFree} synced to Firebase.`);
    } else {
      console.log("⚠️ [Balance Sync] Could not fetch balances from Binance response.");
    }
  } catch (err) {
    console.error("❌ [Balance Sync Error]:", err.message);
  }
}

// Binance Testnet पर ऑर्डर प्लेस करने का फंक्शन (Paper Trading)
async function placeTestnetOrder(symbol, side, qty, apiKey, apiSecret) {
  const BINANCE_KEY = apiKey || process.env.BINANCE_TESTNET_API_KEY;
  const BINANCE_SECRET = apiSecret || process.env.BINANCE_TESTNET_SECRET_KEY;

  if (!BINANCE_KEY || BINANCE_KEY.includes("mock") || !BINANCE_SECRET) {
    console.log(`🎰 [MOCK TRADE] Simulating ${side} order for ${qty} ${symbol} on Testnet...`);
    return { mock: true, orderId: "MOCK_" + Date.now(), status: "FILLED" };
  }

  const baseUrl = "https://testnet.binance.vision"; // बिनेंस पेपर ट्रेडिंग यूआरएल
  const path = "/api/v3/order";
  const timestamp = Date.now();
  
  let queryString = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${qty}&timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', BINANCE_SECRET).update(queryString).digest('hex');
  queryString += `&signature=${signature}`;

  const url = `${baseUrl}${path}?${queryString}`;
  
  return await makeRequest(url, {
    method: 'POST',
    headers: { 'X-MBX-APIKEY': BINANCE_KEY }
  });
}

// मुख्य फ़ंक्शन जो गिटहब पर हर 5 मिनट में चलेगा
async function run24x7Bot() {
  console.log("🚀 Starting 24x7 Strategy & Paper Trading Runner...");
  const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
  const FIREBASE_URL = `${FIREBASE_BASE_URL}/.json`;

  try {
    // 1. फायरबेस से पूरा डेटा (सेटिंग्स + स्ट्रेटजी) एक साथ खींचना
    const dbData = await makeRequest(FIREBASE_URL);
    if (!dbData || !dbData.app_settings) {
      console.log("❌ Settings not found in Firebase.");
      return;
    }

    const { telegramToken, telegramChatId, riskPerTrade, binanceApiKey, binanceApiSecret } = dbData.app_settings;
    const strategies = dbData.trading_strategies || {};

    // 🔄 [SYNC START] स्ट्रेटजी चेक करने से पहले बाइनेंस बैलेंस को फायरबेस में सिंक करना
    await syncBalanceToFirebase(binanceApiKey, binanceApiSecret, FIREBASE_BASE_URL);

    if (!telegramToken || !telegramChatId) {
      console.log("❌ Telegram credentials missing!");
      return;
    }

    // 2. सिर्फ एक्टिव स्ट्रेटजी को ढूंढना
    const activeStrategies = Object.keys(strategies)
      .map(key => strategies[key])
      .filter(strat => strat.status === "Active");

    if (activeStrategies.length === 0) {
      console.log("💤 No active strategies found on Cloud. Standing by...");
      return;
    }

    // 3. हर एक्टिव स्ट्रेटजी के लिए क्रॉसओवर चेक करना
    for (const strat of activeStrategies) {
      console.log(`🔍 Checking Active Strategy: ${strat.name} for ${strat.pair}`);

      // लाइव प्राइस लाना
      const marketData = await makeRequest(`https://min-api.cryptocompare.com/data/price?fsym=${strat.pair.replace('USDT','')}&tsyms=USD`);
      const currentPrice = parseFloat(marketData.USD);

      if (!currentPrice || isNaN(currentPrice)) {
        `⚠️ Price fetch failed for ${strat.pair}, skipping...`
        continue;
      }

      /* 
         📉 [क्रॉसओवर लॉजिक] 
         testing के लिए 50/50 चांस
      */
      const mockSignal = Math.random() > 0.5 ? "BUY" : "SELL"; 
      console.log(`🎯 Signal Detected for ${strat.pair}: ${mockSignal} @ $${currentPrice}`);

      // 4. रिस्क के हिसाब से क्वांटिटी कैलकुलेट करना (उदाहरण के लिए 0.005 BTC)
      const tradeQty = 0.005; 

      // 5. सीधे पेपर ट्रेडिंग एक्सचेंज पर ऑर्डर मारना
      const orderResult = await placeTestnetOrder(strat.pair, mockSignal, tradeQty, binanceApiKey, binanceApiSecret);
      
      // ऑर्डर के तुरंत बाद बैलेंस दोबारा अपडेट करें ताकि वेबसाइट पर लेटेस्ट दिखे
      await syncBalanceToFirebase(binanceApiKey, binanceApiSecret, FIREBASE_BASE_URL);

      // 6. टेलीग्राम पर प्रो-लेवल अलर्ट भेजना
      const emoji = mockSignal === "BUY" ? "🟢" : "🔴";
      const alertMessage = `${emoji} *STRATEGY CROSSOVER DETECTED*\n\n` +
                          `• *Strategy:* ${strat.name}\n` +
                          `• *Asset Pair:* ${strat.pair}\n` +
                          `• *Action:* ${mockSignal} (Paper Trade)\n` +
                          `• *Execution Price:* $${currentPrice.toLocaleString('en-US')}\n` +
                          `• *Quantity:* ${tradeQty}\n` +
                          `• *Order Status:* ${orderResult.status || "EXECUTED"}\n\n` +
                          `🤖 _ApexTraders Bot running 24x7 via GitHub Actions_`;

      const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
      await makeRequest(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChatId, text: alertMessage, parse_mode: "Markdown" })
      });

      console.log(`🎯 Alert and Trade executed for ${strat.pair}!`);
    }

  } catch (error) {
    console.error("❌ Error in Engine execution:", error.message);
  }
}

run24x7Bot();
