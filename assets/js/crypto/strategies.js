// Global State
var cryptoStrategies = [];
var liveSignals = []; 
var editingStrategyId = null; 

// 🔐 टेलीग्राम डिटेल्स (फिक्स्ड)
const TELEGRAM_BOT_TOKEN = "8943911868:AAFO8lOBAfdjdR0muq5bFCWeW-jx1Gz6BQk"; 
const TELEGRAM_CHAT_ID = "1797453650";     

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

// 2. मुख्य रेंडर फंक्शन (सिर्फ काम की चीजें - नो शो पीस)
function renderCryptoStrategies() {
  const root = document.getElementById('app');
  if (!root) return;
  
  root.innerHTML = `
    ${typeof getMarketNavbar === 'function' ? getMarketNavbar('CRYPTO', '#38bdf8') : ''}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff; max-width: 600px; margin: 0 auto;">
      
      <!-- Header -->
      <div style="margin-bottom: 25px;">
        <h2 style="color: #38bdf8; margin: 0; font-size: 22px;">⚙️ Strategy Configurator</h2>
        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">अपनी ऑटो ट्रेडिंग स्ट्रेटजी यहाँ सेट और सेव करें</p>
      </div>

      <!-- 📥 STRATEGY CONFIGURATION FORM -->
      <div style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 30px;">
        <h3 id="formTitle" style="margin-top: 0; margin-bottom: 15px; color: #a855f7; font-size: 16px;">
          ${editingStrategyId ? '✏️ Edit Saved Strategy' : '➕ Core Strategy Settings'}
        </h3>
        
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div>
            <label style="display: block; font-size: 13px; color: #94a3b8; margin-bottom: 5px; font-weight: bold;">Strategy Logic:</label>
            <select id="stratType" style="width: 100%; padding: 11px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 8px; font-size: 13px; outline: none;">
              <option value="EMA_Crossover">📈 Moving Average Crossover (EMA 9/21)</option>
              <option value="RSI_Divergence">📊 RSI Extreme (Oversold < 30 / Overbought > 70)</option>
              <option value="Telegram_Signals">📡 External Telegram Signals Feed</option>
            </select>
          </div>

          <div style="display: flex; gap: 12px;">
            <div style="flex: 1;">
              <label style="display: block; font-size: 13px; color: #94a3b8; margin-bottom: 5px; font-weight: bold;">Asset Pair:</label>
              <input type="text" id="stratPair" value="BTCUSDT" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 8px; text-transform: uppercase; font-family: monospace; font-size: 14px; outline: none;">
            </div>
            <div style="flex: 1;">
              <label style="display: block; font-size: 13px; color: #94a3b8; margin-bottom: 5px; font-weight: bold;">Timeframe:</label>
              <select id="stratTimeframe" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 8px; font-size: 13px; outline: none;">
                <option value="1m">1 Minute</option>
                <option value="5m" selected>5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
              </select>
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 5px;">
            <button onclick="saveStrategyData()" style="flex: 2; background: #38bdf8; color: #0f172a; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px;">
              ${editingStrategyId ? 'Update Config' : '💾 Save Setup Settings'}
            </button>
            ${editingStrategyId ? `<button onclick="cancelEditMode()" style="flex: 1; background: #475569; color: #fff; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px;">Cancel</button>` : ''}
          </div>
        </div>
      </div>

      <!-- 📋 CURRENT SAVED SETTINGS FOR BOT -->
      <div style="margin-bottom: 15px;">
        <h3 style="color: #fff; font-size: 16px; margin: 0;">⚙️ Saved Bot Parameters</h3>
      </div>

      <div id="strategiesList" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 35px;">
        ${cryptoStrategies.length === 0 ? `
          <div style="text-align: center; padding: 25px; color: #64748b; border: 1px dashed #334155; border-radius: 12px; font-size: 13px; font-style: italic;">No strategies configured yet. Setup above.</div>
        ` : cryptoStrategies.map(strat => `
          <div style="background: #1e293b; padding: 14px; border-radius: 10px; border: 1px solid ${strat.status === 'Active' ? '#22c55e' : '#334155'}; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-size: 14px; font-weight: bold; color: #fff;">${strat.name.replace('_', ' ')}</span>
                  <span style="font-size: 11px; background: #0f172a; color: #38bdf8; padding: 1px 6px; border-radius: 4px; font-family: monospace;">${strat.pair}</span>
                </div>
                <div style="display: flex; gap: 12px; font-size: 12px; color: #94a3b8;">
                  <span><b>TF:</b> ${strat.timeframe}</span>
                  <span style="color: ${strat.autoTrading === 'ON' ? '#22c55e' : '#94a3b8'}"><b>Auto-Trade:</b> ${strat.autoTrading || 'OFF'}</span>
                </div>
              </div>
              <div>
                <span style="color: ${strat.status === 'Active' ? '#22c55e' : '#ef4444'}; font-size: 12px; font-weight: bold;">
                  ${strat.status === 'Active' ? '🟢 LIVE SCANNING' : '🔴 PAUSED'}
                </span>
              </div>
            </div>
            <div style="border-top: 1px solid #233146;"></div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
              <div style="display: flex; gap: 6px;">
                <button onclick="triggerTestSignal('${strat.id}')" style="background: rgba(234, 179, 8, 0.15); border: 1px solid #eab308; color: #fef08a; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold;">⚡ Test Signal</button>
                <button onclick="toggleAutoTrading('${strat.id}')" style="background: ${strat.autoTrading === 'ON' ? 'rgba(34, 197, 94, 0.2)' : '#475569'}; color: #fff; border: ${strat.autoTrading === 'ON' ? '1px solid #22c55e' : 'none'}; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold;">Bot: ${strat.autoTrading === 'ON' ? 'ON' : 'OFF'}</button>
              </div>
              <div style="display: flex; gap: 4px;">
                <button onclick="toggleCryptoStrategy('${strat.id}')" style="background: ${strat.status === 'Active' ? '#475569' : '#10b981'}; color: #fff; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 11px;">${strat.status === 'Active' ? 'Pause' : 'Run'}</button>
                <button onclick="startEditMode('${strat.id}')" style="background: #3b82f6; color: #fff; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 11px;">Edit</button>
                <button onclick="deleteCryptoStrategy('${strat.id}')" style="background: transparent; color: #475569; border: 1px solid #334155; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-size: 11px;">🗑️</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 🚥 LIVE SIGNAL RECEIVER TERMINAL -->
      <div style="margin-bottom: 12px; border-top: 1px solid #334155; padding-top: 20px;">
        <h3 style="color: #eab308; font-size: 16px; margin: 0;">📡 Signal Scanner Feed</h3>
      </div>

      <div style="background: #090d16; border: 1px solid #1e293b; border-radius: 12px; padding: 12px; min-height: 120px;">
        ${liveSignals.length === 0 ? `
          <div style="text-align: center; padding: 35px 10px; color: #4b5563; font-size: 12px; font-style: monospace;">
            [Listening for signals... Click Test Signal to mock trigger]
          </div>
        ` : liveSignals.map(sig => `
          <div style="background: #1e293b; padding: 10px; border-radius: 6px; border-left: 4px solid ${sig.signalType.includes('BUY') ? '#22c55e' : '#ef4444'}; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
            <div>
              <span style="color: ${sig.signalType.includes('BUY') ? '#22c55e' : '#ef4444'}; font-weight: bold;">
                ${sig.signalType === 'BUY_CROSSOVER' ? '🚀 BUY' : '💥 SELL'}
              </span>
              <strong style="margin-left: 8px; color: #fff; font-family: monospace;">${sig.pair}</strong>
              <span style="color: #64748b; font-size: 11px; margin-left: 6px;">(${sig.timeframe})</span>
            </div>
            <div style="text-align: right;">
              <span style="color: #38bdf8; font-weight: bold; font-family: monospace;">$${parseFloat(sig.price).toLocaleString()}</span>
              <span style="color: #475569; font-size: 10px; margin-left: 6px;">${new Date(sig.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

// 3. सेव या अपडेट (फायरबेस पर भेजना)
function saveStrategyData() {
  const typeEl = document.getElementById('stratType');
  const pairEl = document.getElementById('stratPair');
  const timeframeEl = document.getElementById('stratTimeframe');
  if (!typeEl || !pairEl || !timeframeEl) return;

  const pair = pairEl.value.trim().toUpperCase();
  if (!pair) { alert("Asset pair missing!"); return; }

  if (editingStrategyId) {
    firebase.database().ref(`trading_strategies/${editingStrategyId}`).update({
      name: typeEl.value, pair: pair, timeframe: timeframeEl.value
    }).then(() => cancelEditMode());
  } else {
    firebase.database().ref('trading_strategies').push({
      name: typeEl.value, pair: pair, timeframe: timeframeEl.value, status: "Inactive", autoTrading: "OFF"
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
  }, 40);
}
function cancelEditMode() { editingStrategyId = null; renderCryptoStrategies(); }

// 5. कंट्रोल्स टोगल्स
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

// ⚡ [रियल-टाइम सिग्नल टेस्ट ट्रिगर]
function triggerTestSignal(id) {
  const strat = cryptoStrategies.find(s => s.id === id);
  if (!strat) return;

  const isBuy = Math.random() > 0.5;
  const signalType = isBuy ? "BUY_CROSSOVER" : "SELL_CROSSOVER";
  const price = (Math.random() * 1500 + 64000).toFixed(2);

  const testSignal = {
    strategyId: id,
    strategyName: strat.name,
    pair: strat.pair,
    timeframe: strat.timeframe,
    signalType: signalType,
    price: price,
    timestamp: new Date().toISOString()
  };

  // फायरबेस डेटाबेस में सिंक
  firebase.database().ref('live_signals').push(testSignal);

  // टेलीग्राम इंस्टेंट अलर्ट
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const messageText = `
⚠️ <b>[BOT STRATEGY SIGNAL]</b>
────────────────
<b>Strategy:</b> ${strat.name.replace('_', ' ')}
<b>Signal action:</b> ${isBuy ? '🚀 BUY ALERT' : '💥 SELL ALERT'}
<b>Target Asset:</b> ${strat.pair}
<b>Chart Interval:</b> ${strat.timeframe}
<b>Trigger Price:</b> $${parseFloat(price).toLocaleString()}
────────────────
<i>ApexTraders V2 Automated Core...</i>
    `.trim();

    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: messageText, parse_mode: 'HTML' })
    }).catch(err => console.error("Telegram error:", err));
  }
}

function deleteCryptoStrategy(id) {
  if (confirm("Delete this config permanently?")) firebase.database().ref(`trading_strategies/${id}`).remove();
}

// DOM Init
document.addEventListener("DOMContentLoaded", () => { setTimeout(() => { loadStrategiesFromFirebase(); }, 500); });
if (document.readyState === "complete" || document.readyState === "interactive") { loadStrategiesFromFirebase(); }
