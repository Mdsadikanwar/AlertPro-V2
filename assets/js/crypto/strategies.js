// Global State
var cryptoStrategies = [];
var liveSignals = []; 
var editingStrategyId = null; 

// 🔐 अपनी टेलीग्राम डिटेल्स यहाँ डालें (ताकि सीधे फ्रंटएंड से अलर्ट जाए)
const TELEGRAM_BOT_TOKEN = "8943911868:AAFO8lOBAfdjdR0muq5bFCWeW-jx1Gz6BQk"; // <-- यहाँ अपना बोट टोकन डालें
const TELEGRAM_CHAT_ID = "1797453650";     // <-- यहाँ अपनी चैट आईडी डालें

// 1. फायरबेस से डेटा लाइव लोड करना
function loadStrategiesFromFirebase() {
  if (typeof firebase === 'undefined') return;
  
  firebase.database().ref('trading_strategies').on('value', (snapshot) => {
    const data = snapshot.val();
    cryptoStrategies = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
    renderCryptoStrategies();
  });

  firebase.database().ref('live_signals').limitToLast(5).on('value', (snapshot) => {
    const data = snapshot.val();
    liveSignals = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : [];
    renderCryptoStrategies();
  });
}

// 2. मुख्य रेंडर फंक्शन (Form + List + Live Signals Panel)
function renderCryptoStrategies() {
  const root = document.getElementById('app');
  if (!root) return;
  
  root.innerHTML = `
    ${typeof getMarketNavbar === 'function' ? getMarketNavbar('CRYPTO', '#38bdf8') : ''}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff; max-width: 800px; margin: 0 auto;">
      
      <!-- Header -->
      <div style="margin-bottom: 25px;">
        <h2 style="color: #38bdf8; margin: 0; font-size: 24px;">ApexTraders V2 Engine</h2>
        <p style="color: #94a3b8; margin: 5px 0 0 0;">Configure modules & track running automation scripts</p>
      </div>

      <!-- 📥 STRATEGY CONFIGURATION FORM -->
      <div style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 30px;">
        <h3 id="formTitle" style="margin-top: 0; margin-bottom: 15px; color: #38bdf8; font-size: 18px;">
          ${editingStrategyId ? '✏️ Edit Strategy' : '➕ Configure New Strategy'}
        </h3>
        
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div>
            <label style="display: block; font-size: 14px; color: #94a3b8; margin-bottom: 5px;">Select Strategy Module:</label>
            <select id="stratType" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 6px;">
              <option value="Indicator Strategy">📈 Indicator Cross Strategy (EMA, RSI, MACD)</option>
              <option value="Candle Pattern Strategy">🕯️ Candle Pattern Strategy (Hammer, Engulfing)</option>
              <option value="Code Script Paste">💻 Custom JavaScript/Script Paste</option>
              <option value="AI Text-to-Strategy">🤖 AI Text-to-Strategy (Natural Language)</option>
              <option value="Pre-set Template">⚡ Pre-set Optimized Template</option>
            </select>
          </div>

          <div style="display: flex; gap: 15px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 140px;">
              <label style="display: block; font-size: 14px; color: #94a3b8; margin-bottom: 5px;">Asset Pair:</label>
              <input type="text" id="stratPair" value="BTCUSDT" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 6px; text-transform: uppercase;">
            </div>
            <div style="flex: 1; min-width: 140px;">
              <label style="display: block; font-size: 14px; color: #94a3b8; margin-bottom: 5px;">Timeframe:</label>
              <select id="stratTimeframe" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 6px;">
                <option value="1m">1 Minute</option>
                <option value="5m" selected>5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
              </select>
            </div>
            <div style="flex: 1; min-width: 140px;">
              <label style="display: block; font-size: 14px; color: #94a3b8; margin-bottom: 5px;">Risk:Reward Ratio:</label>
              <input type="text" id="stratRR" value="1:2" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 6px;">
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 5px;">
            <button onclick="saveStrategyData()" style="flex: 2; background: #38bdf8; color: #0f172a; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">
              ${editingStrategyId ? 'Update Config' : 'Save & Deploy Strategy'}
            </button>
            ${editingStrategyId ? `<button onclick="cancelEditMode()" style="flex: 1; background: #475569; color: #fff; border: none; padding: 12px; border-radius: 6px; cursor: pointer;">Cancel</button>` : ''}
          </div>
        </div>
      </div>

      <!-- 📋 LIVE ACTIVE DEPLOYMENTS LIST -->
      <div style="margin-bottom: 15px;">
        <h3 style="color: #fff; font-size: 18px; margin: 0;">Live Script Deployments</h3>
      </div>

      <div id="strategiesList" style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 40px;">
        ${cryptoStrategies.length === 0 ? `
          <div style="text-align: center; padding: 30px; color: #94a3b8; border: 1px dashed #334155; border-radius: 12px;">No scripts deployed yet.</div>
        ` : cryptoStrategies.map(strat => `
          <div style="background: #1e293b; padding: 16px; border-radius: 12px; border: 1px solid ${strat.status === 'Active' ? 'rgba(34, 197, 94, 0.4)' : '#334155'}; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <h4 style="margin: 0; color: #fff; font-size: 16px;">${strat.name}</h4>
                  <span style="font-size: 11px; background: #0f172a; color: #38bdf8; padding: 2px 8px; border-radius: 4px;">${strat.pair}</span>
                </div>
                <div style="display: flex; gap: 15px; font-size: 13px; color: #94a3b8;">
                  <span><b>TF:</b> ${strat.timeframe}</span>
                  <span><b>R:R:</b> ${strat.riskReward}</span>
                  <span style="color: ${strat.autoTrading === 'ON' ? '#22c55e' : '#94a3b8'}"><b>Auto-Trade:</b> ${strat.autoTrading || 'OFF'}</span>
                </div>
              </div>
              <div>
                <span style="color: ${strat.status === 'Active' ? '#22c55e' : '#ef4444'}; font-size: 13px; font-weight: bold;">
                  ${strat.status === 'Active' ? '🟢 RUNNING' : '🔴 PAUSED'}
                </span>
              </div>
            </div>
            <div style="border-top: 1px solid #334155; width: 100%;"></div>
            <div style="display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
              <div style="display: flex; gap: 8px;">
                <button onclick="triggerTestSignal('${strat.id}')" style="background: #eab308; color: #0f172a; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">⚡ Test Signal</button>
                <button onclick="toggleAutoTrading('${strat.id}')" style="background: ${strat.autoTrading === 'ON' ? '#15803d' : '#475569'}; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">Auto Trade: ${strat.autoTrading === 'ON' ? 'ON' : 'OFF'}</button>
              </div>
              <div style="display: flex; gap: 6px;">
                <button onclick="toggleCryptoStrategy('${strat.id}')" style="background: ${strat.status === 'Active' ? '#475569' : '#22c55e'}; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">${strat.status === 'Active' ? 'Pause' : 'Start'}</button>
                <button onclick="startEditMode('${strat.id}')" style="background: #3b82f6; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">✏️ Edit</button>
                <button onclick="deleteCryptoStrategy('${strat.id}')" style="background: transparent; color: #64748b; border: 1px solid #334155; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px;">🗑️</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 🚥 STRATEGY TESTER & LIVE SIGNAL RECEIVER -->
      <div style="margin-bottom: 15px; border-top: 2px dashed #334155; padding-top: 25px;">
        <h3 style="color: #eab308; font-size: 18px; margin: 0;">⚡ Strategy Tester Terminal</h3>
        <p style="color: #64748b; font-size: 13px; margin: 3px 0 0 0;">सिग्नल जनरेट होते ही फायरबेस और टेलीग्राम पर तुरंत जाएगा:</p>
      </div>

      <div style="background: #111827; border: 1px solid #334155; border-radius: 12px; padding: 15px; min-height: 150px;">
        ${liveSignals.length === 0 ? `
          <div style="text-align: center; padding: 40px 10px; color: #4b5563; font-size: 14px;">
            🚥 No signals captured yet. Click "⚡ Test Signal" button above.
          </div>
        ` : liveSignals.map(sig => `
          <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid ${sig.signalType.includes('BUY') ? '#22c55e' : '#ef4444'}; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="background: ${sig.signalType.includes('BUY') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${sig.signalType.includes('BUY') ? '#22c55e' : '#ef4444'}; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                ${sig.signalType}
              </span>
              <strong style="margin-left: 10px; color: #fff;">${sig.pair}</strong>
              <span style="color: #94a3b8; font-size: 12px; margin-left: 10px;">(TF: ${sig.timeframe})</span>
            </div>
            <div style="text-align: right; font-size: 13px;">
              <span style="color: #eab308; font-weight: bold;">$${sig.price}</span>
              <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${new Date(sig.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

// 3. सेव या अपडेट
function saveStrategyData() {
  const typeEl = document.getElementById('stratType');
  const pairEl = document.getElementById('stratPair');
  const timeframeEl = document.getElementById('stratTimeframe');
  const rrEl = document.getElementById('stratRR');
  if (!typeEl || !pairEl || !timeframeEl || !rrEl) return;

  const pair = pairEl.value.trim().toUpperCase();
  if (!pair) { alert("Please enter pair!"); return; }

  if (editingStrategyId) {
    firebase.database().ref(`trading_strategies/${editingStrategyId}`).update({
      name: typeEl.value, pair: pair, timeframe: timeframeEl.value, riskReward: rrEl.value.trim()
    }).then(() => cancelEditMode());
  } else {
    firebase.database().ref('trading_strategies').push({
      name: typeEl.value, pair: pair, timeframe: timeframeEl.value, riskReward: rrEl.value.trim() || "1:2", status: "Inactive", autoTrading: "OFF"
    }).then(() => { pairEl.value = "BTCUSDT"; });
  }
}

// 4. एडिट मोड्स
function startEditMode(id) {
  const strat = cryptoStrategies.find(s => s.id === id);
  if (!strat) return;
  editingStrategyId = id;
  renderCryptoStrategies(); 
  setTimeout(() => {
    if(document.getElementById('stratType')) document.getElementById('stratType').value = strat.name;
    if(document.getElementById('stratPair')) document.getElementById('stratPair').value = strat.pair;
    if(document.getElementById('stratTimeframe')) document.getElementById('stratTimeframe').value = strat.timeframe;
    if(document.getElementById('stratRR')) document.getElementById('stratRR').value = strat.riskReward;
  }, 50);
}
function cancelEditMode() { editingStrategyId = null; renderCryptoStrategies(); }

// 5. कंट्रोल्स
function toggleCryptoStrategy(id) {
  const strat = cryptoStrategies.find(s => s.id === id);
  if (!strat) return;
  firebase.database().ref(`trading_strategies/${id}`).update({ status: strat.status === 'Active' ? 'Inactive' : 'Active' });
}

function toggleAutoTrading(id) {
  const strat = cryptoStrategies.find(s => s.id === id);
  if (!strat) return;
  const newAuto = (strat.autoTrading || 'OFF') === 'ON' ? 'OFF' : 'ON';
  firebase.database().ref(`trading_strategies/${id}`).update({ autoTrading: newAuto });
}

// ⚡ [स्ट्रैटेजी टेस्टर लॉन्चर + टेलीग्राम इंटीग्रेटर]
function triggerTestSignal(id) {
  const strat = cryptoStrategies.find(s => s.id === id);
  if (!strat) return;

  const isBuy = Math.random() > 0.5;
  const signalType = isBuy ? "🚀 BUY_CROSSOVER" : "💥 SELL_CROSSOVER";
  const price = (Math.random() * 1500 + 62000).toFixed(2);
  const timeString = new Date().toLocaleTimeString();

  const testSignal = {
    strategyId: id,
    strategyName: strat.name,
    pair: strat.pair,
    timeframe: strat.timeframe,
    signalType: isBuy ? "BUY_CROSSOVER" : "SELL_CROSSOVER",
    price: price,
    timestamp: new Date().toISOString(),
    isTest: true
  };

  // A. फायरबेस में पुश
  firebase.database().ref('live_signals').push(testSignal);

  // B. 📢 [नया] सीधे टेलीग्राम पर इंस्टेंट अलर्ट भेजना
  if (TELEGRAM_BOT_TOKEN !== "YOUR_BOT_TOKEN_HERE" && TELEGRAM_CHAT_ID !== "YOUR_CHAT_ID_HERE") {
    
    // टेलीग्राम मैसेज फॉर्मेट (सुंदर दिखने के लिए HTML फॉर्मेट)
    const messageText = `
⚠️ <b>[TEST SIGNAL DETECTED]</b> ⚠️
────────────────
<b>Module:</b> ${strat.name}
<b>Signal:</b> ${signalType}
<b>Asset Pair:</b> ${strat.pair}
<b>Timeframe:</b> ${strat.timeframe}
<b>Execution Price:</b> $${price}
<b>Trigger Time:</b> ${timeString}
<b>Auto-Trading:</b> ${strat.autoTrading || 'OFF'}
────────────────
<i>ApexTraders V2 Engine Testing...</i>
    `.trim();

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: messageText,
        parse_mode: 'HTML'
      })
    })
    .then(res => {
      if(!res.ok) console.log("Telegram API Error");
    })
    .catch(err => console.error("Telegram Fetch Failed:", err));
  } else {
    console.log("⚠️ टेलीग्राम क्रेडेंशियल्स कोड में ऊपर सेट नहीं हैं!");
  }
}

function deleteCryptoStrategy(id) {
  if (confirm("Delete?")) firebase.database().ref(`trading_strategies/${id}`).remove();
}

// DOM Setup
document.addEventListener("DOMContentLoaded", () => { setTimeout(() => { loadStrategiesFromFirebase(); }, 500); });
if (document.readyState === "complete" || document.readyState === "interactive") { loadStrategiesFromFirebase(); }
