// Global State
var cryptoStrategies = [];
var editingStrategyId = null; 

// 1. फायरबेस से स्ट्रेटजी लाइव लोड करना
function loadStrategiesFromFirebase() {
  if (typeof firebase === 'undefined') return;
  
  const dbRef = firebase.database().ref('trading_strategies');
  dbRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      cryptoStrategies = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } else {
      cryptoStrategies = [];
    }
    renderCryptoStrategies();
  });
}

// 2. मुख्य रेंडर फंक्शन (Auto Trading & Tester Buttons के साथ)
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
          
          <!-- Dropdown: Strategy Type -->
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
            <!-- Asset Pair -->
            <div style="flex: 1; min-width: 140px;">
              <label style="display: block; font-size: 14px; color: #94a3b8; margin-bottom: 5px;">Asset Pair:</label>
              <input type="text" id="stratPair" placeholder="e.g. BTCUSDT" value="BTCUSDT" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 6px; text-transform: uppercase;">
            </div>
            
            <!-- Timeframe Dropdown -->
            <div style="flex: 1; min-width: 140px;">
              <label style="display: block; font-size: 14px; color: #94a3b8; margin-bottom: 5px;">Timeframe:</label>
              <select id="stratTimeframe" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 6px;">
                <option value="1m">1 Minute</option>
                <option value="5m" selected>5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
              </select>
            </div>

            <!-- Risk Reward -->
            <div style="flex: 1; min-width: 140px;">
              <label style="display: block; font-size: 14px; color: #94a3b8; margin-bottom: 5px;">Risk:Reward Ratio:</label>
              <input type="text" id="stratRR" placeholder="e.g. 1:1.5" value="1:2" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 6px;">
            </div>
          </div>

          <!-- Form Buttons -->
          <div style="display: flex; gap: 10px; margin-top: 5px;">
            <button onclick="saveStrategyData()" style="flex: 2; background: #38bdf8; color: #0f172a; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px;">
              ${editingStrategyId ? 'Update Config' : 'Save & Deploy Strategy'}
            </button>
            ${editingStrategyId ? `
              <button onclick="cancelEditMode()" style="flex: 1; background: #475569; color: #fff; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-size: 14px;">Cancel</button>
            ` : ''}
          </div>

        </div>
      </div>

      <!-- 📋 LIVE ACTIVE DEPLOYMENTS LIST -->
      <div style="margin-bottom: 15px;">
        <h3 style="color: #fff; font-size: 18px; margin: 0;">Live Script Deployments</h3>
        <p style="color: #64748b; font-size: 13px; margin: 3px 0 0 0;">Real-time sync with Firebase database server</p>
      </div>

      <div id="strategiesList" style="display: flex; flex-direction: column; gap: 15px;">
        ${cryptoStrategies.length === 0 ? `
          <div style="text-align: center; padding: 40px 20px; color: #94a3b8; border: 1px dashed #334155; border-radius: 12px;">
            <p style="margin: 0; font-size: 14px;">No scripts deployed yet. Configure the panel above to start.</p>
          </div>
        ` : cryptoStrategies.map(strat => `
          <div style="background: #1e293b; padding: 16px; border-radius: 12px; border: 1px solid ${strat.status === 'Active' ? 'rgba(34, 197, 94, 0.4)' : '#334155'}; display: flex; flex-direction: column; gap: 12px;">
            
            <!-- Top Section: Info & Status -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; width: 100%;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <h4 style="margin: 0; color: #fff; font-size: 16px;">${strat.name}</h4>
                  <span style="font-size: 11px; background: #0f172a; color: #38bdf8; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
                    ${strat.pair}
                  </span>
                </div>
                <div style="display: flex; gap: 15px; font-size: 13px; color: #94a3b8; flex-wrap: wrap;">
                  <span><b>TF:</b> ${strat.timeframe}</span>
                  <span><b>R:R:</b> ${strat.riskReward}</span>
                  <span style="color: ${strat.autoTrading === 'ON' ? '#22c55e' : '#94a3b8'}">
                    <b>Auto-Trade:</b> ${strat.autoTrading || 'OFF'}
                  </span>
                </div>
              </div>
              
              <!-- Status Trigger Display -->
              <div>
                <span style="color: ${strat.status === 'Active' ? '#22c55e' : '#ef4444'}; font-size: 13px; font-weight: bold;">
                  ${strat.status === 'Active' ? '🟢 RUNNING' : '🔴 PAUSED'}
                </span>
              </div>
            </div>

            <!-- Horizontal Divider -->
            <div style="border-top: 1px solid #334155; width: 100%; margin: 2px 0;"></div>

            <!-- Bottom Section: Control Action Buttons -->
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 10px;">
              
              <!-- Left: Tester & Auto Trade Toggles -->
              <div style="display: flex; gap: 8px;">
                <!-- ⚡ STRATEGY TESTER BUTTON -->
                <button onclick="triggerTestSignal('${strat.id}')" style="background: #eab308; color: #0f172a; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">
                  ⚡ Test Signal
                </button>

                <!-- AUTO TRADING TOGGLE -->
                <button onclick="toggleAutoTrading('${strat.id}')" style="background: ${strat.autoTrading === 'ON' ? '#15803d' : '#475569'}; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">
                  Auto Trade: ${strat.autoTrading === 'ON' ? 'ON' : 'OFF'}
                </button>
              </div>

              <!-- Right: Core Script Actions -->
              <div style="display: flex; gap: 6px;">
                <button onclick="toggleCryptoStrategy('${strat.id}')" style="background: ${strat.status === 'Active' ? '#475569' : '#22c55e'}; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; min-width: 60px;">
                  ${strat.status === 'Active' ? 'Pause' : 'Start'}
                </button>

                <button onclick="startEditMode('${strat.id}')" style="background: #3b82f6; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                  ✏️ Edit
                </button>

                <button onclick="deleteCryptoStrategy('${strat.id}')" style="background: transparent; color: #64748b; border: 1px solid #334155; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                  🗑️
                </button>
              </div>

            </div>

          </div>
        `).join('')}
      </div>

    </div>
  `;
}

// 3. सेव या अपडेट करने का कंबाइंड फंक्शन
function saveStrategyData() {
  const typeEl = document.getElementById('stratType');
  const pairEl = document.getElementById('stratPair');
  const timeframeEl = document.getElementById('stratTimeframe');
  const rrEl = document.getElementById('stratRR');

  if (!typeEl || !pairEl || !timeframeEl || !rrEl) return;

  const type = typeEl.value;
  const pair = pairEl.value.trim().toUpperCase();
  const timeframe = timeframeEl.value;
  const riskReward = rrEl.value.trim();

  if (!pair) {
    alert("Please enter an asset pair!");
    return;
  }

  if (editingStrategyId) {
    firebase.database().ref(`trading_strategies/${editingStrategyId}`).update({
      name: type,
      pair: pair,
      timeframe: timeframe,
      riskReward: riskReward
    }).then(() => {
      if (typeof addSystemLog === 'function') addSystemLog("SUCCESS", `Updated config for ${pair}`);
      cancelEditMode();
    });
  } else {
    const payload = {
      name: type,
      pair: pair,
      timeframe: timeframe,
      riskReward: riskReward || "1:2",
      status: "Inactive",
      autoTrading: "OFF" // शुरुआत में ऑफ रहेगा
    };

    firebase.database().ref('trading_strategies').push(payload).then(() => {
      if (typeof addSystemLog === 'function') addSystemLog("SUCCESS", `New ${type} deployed for ${pair}`);
      document.getElementById('stratPair').value = "BTCUSDT";
    });
  }
}

// 4. एडिट मोड
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
    
    const titleEl = document.getElementById('formTitle');
    if (titleEl) titleEl.scrollIntoView({ behavior: 'smooth' });
  }, 50);
}

function cancelEditMode() {
  editingStrategyId = null;
  renderCryptoStrategies();
}

// 5. स्टार्ट / पॉज़ (Toggle) फंक्शन
function toggleCryptoStrategy(id) {
  const strat = cryptoStrategies.find(s => s.id === id);
  if (!strat) return;

  const newStatus = strat.status === 'Active' ? 'Inactive' : 'Active';
  firebase.database().ref(`trading_strategies/${id}`).update({ status: newStatus });
}

// 🔥 [नया फीचर]: ऑटो ट्रेडिंग ऑन/ऑफ स्विच
function toggleAutoTrading(id) {
  const strat = cryptoStrategies.find(s => s.id === id);
  if (!strat) return;

  const currentAuto = strat.autoTrading || 'OFF';
  const newAuto = currentAuto === 'ON' ? 'OFF' : 'ON';

  firebase.database().ref(`trading_strategies/${id}`).update({
    autoTrading: newAuto
  }).then(() => {
    alert(`Auto Trading turned ${newAuto} for ${strat.pair}!`);
  });
}

// ⚡ [नया फीचर]: 'स्ट्रैटेजी टेस्टर' फेक सिग्नल ट्रिगर करने के लिए
function triggerTestSignal(id) {
  const strat = cryptoStrategies.find(s => s.id === id);
  if (!strat) return;

  // नकली क्रॉसओवर सिग्नल जनरेट करना
  const testSignal = {
    strategyId: id,
    strategyName: strat.name,
    pair: strat.pair,
    timeframe: strat.timeframe,
    signalType: Math.random() > 0.5 ? "BUY_CROSSOVER" : "SELL_CROSSOVER",
    price: (Math.random() * 100 + 60000).toFixed(2), // रैंडम डमी प्राइस
    timestamp: new Date().toISOString(),
    isTest: true
  };

  // इसे फायरबेस के एक अलग नोड 'live_signals' में पुश करेंगे ताकि बोट इसे रीड कर सके
  firebase.database().ref('live_signals').push(testSignal).then(() => {
    alert(`⚡ Test Crossover Signal Sent for ${strat.pair}!\nType: ${testSignal.signalType}\nPrice: $${testSignal.price}\n\nअब चेक करो टेलीग्राम अलर्ट और बोट लॉग्स!`);
  }).catch(err => alert("Tester Error: " + err.message));
}

// 6. डिलीट फंक्शन
function deleteCryptoStrategy(id) {
  if (confirm("Are you sure you want to delete this deployment?")) {
    firebase.database().ref(`trading_strategies/${id}`).remove();
  }
}

// DOM Safety Triggers
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => { loadStrategiesFromFirebase(); }, 500);
});

if (document.readyState === "complete" || document.readyState === "interactive") {
  loadStrategiesFromFirebase();
}
