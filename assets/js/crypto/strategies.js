// Global Strategies State - अब यह डिफ़ॉल्ट रूप से खाली रहेगा, क्योंकि डेटा फायरबेस से लाइव आएगा
var cryptoStrategies = [];

// 1. फायरबेस से स्ट्रेटजी लाइव लोड करने का फंक्शन
function loadStrategiesFromFirebase() {
  if (typeof firebase === 'undefined') {
    console.log("⚠️ Firebase initialize नहीं हुआ है।");
    return;
  }
  
  const dbRef = firebase.database().ref('trading_strategies');
  dbRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // फायरबेस के ऑब्जेक्ट डेटा को एरे (Array) में बदलना ताकि आपका पुराना .map() काम कर सके
      cryptoStrategies = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } else {
      cryptoStrategies = [];
    }
    // डेटा आते ही स्क्रीन पर रेंडर करना
    renderCryptoStrategies();
  });
}

// Crypto Strategies tab render function (आपका ओरिजिनल डिज़ाइन - 100% सेम)
function renderCryptoStrategies() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
        <div>
          <h2 style="color: #38bdf8; margin: 0;">Trading Strategies</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">Manage and launch automated trading scripts</p>
        </div>
        <button onclick="addNewCryptoStrategy()" style="background: #38bdf8; color: #0f172a; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer;">+ Create Strategy</button>
      </div>

      <!-- Strategy List Grid -->
      <div id="strategiesList" style="display: flex; flex-direction: column; gap: 15px;">
        ${cryptoStrategies.length === 0 ? '<p style="color: #94a3b8;">No strategies found. Click "+ Create Strategy" to add one.</p>' : cryptoStrategies.map(strat => `
          <div style="background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
              <h3 style="margin: 0 0 8px 0; color: #fff;">${strat.name}</h3>
              <div style="display: flex; gap: 15px; font-size: 14px; color: #94a3b8;">
                <span><b>Pair:</b> ${strat.pair}</span>
                <span><b>Timeframe:</b> ${strat.timeframe}</span>
                <span><b>R:R Ratio:</b> ${strat.riskReward}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
              <span style="background: ${strat.status === 'Active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${strat.status === 'Active' ? '#22c55e' : '#ef4444'}; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                ${strat.status}
              </span>
              <!-- यहाँ आईडी स्ट्रिंग हो सकती है इसलिए सिंगल कोट में पास किया है -->
              <button onclick="toggleCryptoStrategy('${strat.id}')" style="background: #374151; color: #fff; border: 1px solid #4b5563; padding: 8px 14px; border-radius: 6px; cursor: pointer;">
                ${strat.status === 'Active' ? 'Pause' : 'Start'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;

  // [LOG] Strategies View Loaded
  if (typeof addSystemLog === 'function') {
    addSystemLog("SYSTEM", "Strategies management panel rendered.");
  }
}

// 2. Toggle active status (अब यह सीधे फायरबेस क्लाउड में स्टेटस अपडेट करेगा)
function toggleCryptoStrategy(id) {
  const strat = cryptoStrategies.find(s => s.id === id);
  if (!strat) return;

  const newStatus = strat.status === 'Active' ? 'Inactive' : 'Active';
  
  firebase.database().ref(`trading_strategies/${id}`).update({
    status: newStatus
  }).then(() => {
    // [LOG] Strategy Status Toggle
    if (typeof addSystemLog === 'function') {
      const logType = newStatus === 'Active' ? 'SUCCESS' : 'SYSTEM';
      addSystemLog(logType, `Strategy [${strat.name}] status changed to: ${newStatus.toUpperCase()}`);
    }
  }).catch(err => console.error("Firebase Update Error:", err));
}

// 3. नई स्ट्रेटजी बनाकर सीधे फायरबेस में पुश (Save) करना
function addNewCryptoStrategy() {
  const name = prompt("Enter Strategy Name:", "EMA Cross (9 / 21)");
  if (!name) return;
  const pair = prompt("Enter Pair (e.g. BTCUSDT):", "BTCUSDT").toUpperCase();
  const timeframe = prompt("Enter Timeframe (e.g. 5m, 15m, 1h):", "5m");
  
  // फायरबेस में एक नया ऑटोमैटिक यूनिक आईडी जेनरेट करना
  const newStratRef = firebase.database().ref('trading_strategies').push();
  
  const newStratData = {
    name: name,
    status: "Inactive",
    timeframe: timeframe || "5m",
    riskReward: "1:1.5",
    pair: pair
  };
  
  newStratRef.set(newStratData).then(() => {
    // [LOG] New Strategy Created
    if (typeof addSystemLog === 'function') {
      addSystemLog("SUCCESS", `New strategy successfully created: "${name}" for pair ${pair} on Firebase.`);
    }
  }).catch(err => console.error("Firebase Set Error:", err));
}

// जैसे ही यह स्क्रिप्ट लोड हो, फायरबेस से डेटा सुनना (Listen) शुरू कर दे
if (typeof firebase !== 'undefined') {
  loadStrategiesFromFirebase();
}
