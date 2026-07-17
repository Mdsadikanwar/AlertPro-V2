const https = require('https');

// Helper function to make HTTP requests (100% compatible with all Node versions)
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          // अगर रिस्पॉन्स JSON है तो पार्स करें, नहीं तो स्ट्रिंग ही रहने दें
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Sadiq's Firebase Config to fetch settings
const FIREBASE_DB_URL = "https://alertpro-bot-default-rtdb.firebaseio.com/app_settings.json";

async function run24x7Bot() {
  console.log("🚀 Starting 24x7 GitHub Runner Check...");

  try {
    // 1. Fetch settings from Firebase
    const rawSettings = await makeRequest(FIREBASE_DB_URL);
    const settings = typeof rawSettings === 'string' ? JSON.parse(rawSettings) : rawSettings;

    if (!settings) {
      console.log("❌ No settings found in Firebase.");
      return;
    }

    const { telegramToken, telegramChatId, riskPerTrade } = settings;
    console.log(`✅ Loaded Settings: Risk = ${riskPerTrade || "2.0"}%, ChatID = ${telegramChatId}`);

    if (!telegramToken || telegramToken.includes("mock") || !telegramChatId) {
      console.log("❌ Real Telegram credentials are not configured in Firebase!");
      return;
    }

    // 2. Fetch Live Market Price from Binance API
    const rawMarketData = await makeRequest("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
    const marketData = typeof rawMarketData === 'string' ? JSON.parse(rawMarketData) : rawMarketData;
    const currentPrice = parseFloat(marketData.price);
    
    console.log(`📈 Current BTC Price: $${currentPrice}`);

    // 3. Craft the Alert Message
    const testMessage = `🤖 *ApexTraders 24x7 Server Runner Active* \n\n` +
                        `• Status: Running via GitHub Actions\n` +
                        `• Current BTC Price: *$${currentPrice.toLocaleString('en-US')}*\n` +
                        `• Saved Risk Parameter: *${riskPerTrade || "2.0"}%*\n\n` +
                        `🚀 System is online, waiting for Strategy Crossover...`;

    // 4. Send Telegram Alert
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const payload = JSON.stringify({
      chat_id: telegramChatId,
      text: testMessage,
      parse_mode: "Markdown"
    });

    const rawTelRes = await makeRequest(telegramUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      body: payload
    });

    const telRes = typeof rawTelRes === 'string' ? JSON.parse(rawTelRes) : rawTelRes;

    if (telRes.ok) {
      console.log("🎯 Alert successfully sent to Sadiq's Telegram!");
    } else {
      console.log("❌ Telegram API Rejected Request:", telRes.description);
    }

  } catch (error) {
    console.error("❌ Error in background execution:", error.message);
  }
}

run24x7Bot();
