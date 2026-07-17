const fetch = require('node-fetch');

// Sadiq's Firebase Config to fetch settings
const FIREBASE_DB_URL = "https://alertpro-bot-default-rtdb.firebaseio.com/app_settings.json";

async function run24x7Bot() {
  console.log("🚀 Starting 24x7 GitHub Runner Check...");

  try {
    // 1. Firebase से आपकी लाइव सेटिंग्स डाउनलोड करें
    const response = await fetch(FIREBASE_DB_URL);
    const settings = await response.json();

    if (!settings) {
      console.log("❌ No settings found in Firebase. Please save settings in your web app first!");
      return;
    }

    const { telegramToken, telegramChatId, riskPerTrade } = settings;
    console.log(`✅ Loaded Settings: Risk = ${riskPerTrade}%, ChatID = ${telegramChatId}`);

    // 2. लाइव मार्केट प्राइस फेच करें (उदा. BTCUSDT Binance API से)
    const marketRes = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
    const marketData = await marketRes.json();
    const currentPrice = parseFloat(marketData.price);
    
    console.log(`📈 Current BTC Price: $${currentPrice}`);

    // 3. यहाँ हम कल सिंपल स्ट्रेटजी (जैसे क्रॉसओवर) का लॉजिक फिट करेंगे।
    // अभी टेस्टिंग के लिए हम सीधे एक लाइव रन अलर्ट आपके टेलीग्राम पर भेज रहे हैं:
    
    const testMessage = `🤖 *ApexTraders 24x7 Server Runner Active* \n\n` +
                        `• Status: Running via GitHub Actions\n` +
                        `• Current BTC Price: *$${currentPrice}*\n` +
                        `• Saved Risk Parameter: *${riskPerTrade}%*\n\n` +
                        `🚀 System is online, waiting for Strategy Crossover...`;

    // 4. टेलीग्राम पर अलर्ट भेजें
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const telRes = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: testMessage,
        parse_mode: "Markdown"
      })
    });

    const telData = await telRes.json();
    if (telData.ok) {
      console.log("🎯 Alert successfully sent to Sadiq's Telegram!");
    } else {
      console.log("❌ Telegram Alert Failed:", telData.description);
    }

  } catch (error) {
    console.error("❌ Error in background execution:", error.message);
  }
}

run24x7Bot();
