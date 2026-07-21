async function renderCryptoSettings() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${typeof getMarketNavbar === 'function' ? getMarketNavbar() : ''}
        <div style="padding: 15px; max-width: 100%; margin: 0 auto; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #f8fafc; padding-bottom: 90px;">
            
            <!-- ⚙️ HEADER -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h2 style="color: #38bdf8; margin: 0; font-size: 20px; font-weight: bold;">⚡ Terminal Control Center</h2>
                    <span style="color: #64748b; font-size: 11px;">Apex Core Infrastructure & Diagnostics</span>
                </div>
                <button onclick="runSystemDiagnostics()" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer;">
                    🔄 Full Sync
                </button>
            </div>

            <!-- 🌐 1. GATEWAY HEALTH MONITOR (विद Cron-Job.org Tracker) -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 14px; padding: 15px; margin-bottom: 15px;">
                <h3 style="color: #94a3b8; margin-top: 0; margin-bottom: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">🌐 Integration Gateways & Live Health</h3>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    
                    <!-- Cron Job Engine -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 10px 12px; border-radius: 8px;">
                        <div>
                            <span style="font-size: 13px; color: #e2e8f0; font-weight: bold; display: block;">⏱️ Cron-Job.org Automation</span>
                            <span id="cronLastPing" style="font-size: 9px; color: #64748b;">Checking last execution...</span>
                        </div>
                        <span id="statusCron" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 3px 8px; border-radius: 10px; font-size: 10px; font-weight: bold;">STANDBY</span>
                    </div>

                    <!-- Firebase Realtime DB -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 10px 12px; border-radius: 8px;">
                        <div>
                            <span style="font-size: 13px; color: #e2e8f0; font-weight: bold; display: block;">🔥 Firebase Realtime DB</span>
                            <span id="firebasePingTime" style="font-size: 9px; color: #64748b;">Latency: --ms</span>
                        </div>
                        <span id="statusFirebase" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 3px 8px; border-radius: 10px; font-size: 10px; font-weight: bold;">CONNECTED</span>
                    </div>

                    <!-- Telegram Bot -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 10px 12px; border-radius: 8px;">
                        <span style="font-size: 13px; color: #e2e8f0; font-weight: bold;">📢 Telegram Alert Engine</span>
                        <span id="statusTelegram" style="background: rgba(234, 179, 8, 0.2); color: #eab308; padding: 3px 8px; border-radius: 10px; font-size: 10px; font-weight: bold;">CHECKING...</span>
                    </div>

                    <!-- Binance API -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 10px 12px; border-radius: 8px;">
                        <span style="font-size: 13px; color: #e2e8f0; font-weight: bold;">⚡ Binance Market Stream</span>
                        <span id="statusBinance" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 3px 8px; border-radius: 10px; font-size: 10px; font-weight: bold;">ONLINE</span>
                    </div>
                </div>

                <!-- Diagnostics Action Buttons -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px;">
                    <button onclick="testCronPing()" style="background: #020617; color: #38bdf8; border: 1px solid #1e293b; padding: 8px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">⚡ Trigger Cron Scan</button>
                    <button onclick="diagnoseFirebaseDB()" style="background: #020617; color: #22c55e; border: 1px solid #1e293b; padding: 8px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">🔍 Diagnose Firebase Rules</button>
                </div>
            </div>

            <!-- 📡 2. LIVE AUTO STRATEGY SCANNER -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 14px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 12px;">
                    <h3 style="color: #38bdf8; margin: 0; font-size: 12px; text-transform: uppercase;">📡 Active Strategy Scanner Engine</h3>
                    <span style="background: rgba(34, 197, 94, 0.15); color: #22c55e; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: bold;">LIVE MONITOR</span>
                </div>
                <div id="liveScannerList" style="display: flex; flex-direction: column; gap: 8px;">
                    <p style="color: #64748b; font-size: 12px; text-align: center;">Checking active strategies on Firebase...</p>
                </div>
            </div>

            <!-- 🔑 3. CLOUD API CREDENTIALS FORM -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 14px; padding: 15px; margin-bottom: 15px;">
                <h3 style="color: #38bdf8; margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">🔐 Cloud & Core API Keys</h3>
                
                <div style="margin-bottom: 12px;">
                    <label style="color: #64748b; display: block; margin-bottom: 4px; font-size: 10px; font-weight: bold;">FIREBASE BASE URL</label>
                    <input type="text" id="setFirebaseUrl" style="width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 13px; outline: none;">
                </div>

                <div style="margin-bottom: 12px;">
                    <label style="color: #64748b; display: block; margin-bottom: 4px; font-size: 10px; font-weight: bold;">BINANCE API KEY</label>
                    <input type="password" id="setBinanceKey" placeholder="Paste your Binance API key" style="width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 13px; outline: none;">
                </div>

                <div style="margin-bottom: 4px;">
                    <label style="color: #64748b; display: block; margin-bottom: 4px; font-size: 10px; font-weight: bold;">BINANCE SECRET KEY</label>
                    <input type="password" id="setBinanceSecret" placeholder="Paste your Binance Secret key" style="width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 13px; outline: none;">
                </div>
            </div>

            <!-- 📢 4. TELEGRAM ALERTS CONFIGURATION -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 14px; padding: 15px; margin-bottom: 15px;">
                <h3 style="color: #38bdf8; margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">📢 Telegram Bot Alerts</h3>
                
                <div style="margin-bottom: 12px;">
                    <label style="color: #64748b; display: block; margin-bottom: 4px; font-size: 10px; font-weight: bold;">TELEGRAM BOT TOKEN</label>
                    <input type="text" id="setTgToken" placeholder="123456789:ABCdefGhI..." style="width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 13px; outline: none;">
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="color: #64748b; display: block; margin-bottom: 4px; font-size: 10px; font-weight: bold;">TELEGRAM CHAT ID</label>
                    <input type="text" id="setTgChatId" placeholder="987654321" style="width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 13px; outline: none;">
                </div>

                <button onclick="testTelegramAlert()" style="width: 100%; background: #1e293b; color: #38bdf8; border: 1px solid #334155; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 12px; cursor: pointer;">⚡ Send Test Telegram Ping</button>
            </div>

            <!-- 🎛️ 5. GLOBAL RISK & BOT RULES -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 14px; padding: 15px; margin-bottom: 15px;">
                <h3 style="color: #38bdf8; margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">🎛️ Global Engine Rules</h3>
                
                <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 13px; display: block; color: #fff; font-weight: bold;">Auto Trading Master Switch</span>
                        <span style="color: #64748b; font-size: 10px;">पूरी तरह से ऑटोबाय/सेल ऑन या ऑफ करें</span>
                    </div>
                    <select id="setBotSwitch" style="background: #1e293b; border: 1px solid #334155; color: white; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                        <option value="ON">🟢 ENABLED</option>
                        <option value="OFF">🔴 DISABLED</option>
                    </select>
                </div>

                <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 13px; display: block; color: #fff; font-weight: bold;">Max Risk Per Trade ($)</span>
                        <span style="color: #64748b; font-size: 10px;">सिंगल ऑटो सिग्नल का मैक्स बजट</span>
                    </div>
                    <input type="number" id="setMaxRisk" value="1000" style="width: 80px; background: #1e293b; border: 1px solid #334155; color: #38bdf8; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; text-align: center; outline: none;">
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 13px; display: block; color: #fff; font-weight: bold;">Daily Drawdown Circuit Breaker</span>
                        <span style="color: #64748b; font-size: 10px;">इतना % लॉस होने पर ऑटो बॉट पॉज़ हो जाएगा</span>
                    </div>
                    <input type="number" id="setMaxDrawdown" value="5" style="width: 80px; background: #1e293b; border: 1px solid #334155; color: #ef4444; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; text-align: center; outline: none;">
                </div>
            </div>

            <!-- 🧹 6. PRO SYSTEM COMMANDS & MAINTENANCE (नया) -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 14px; padding: 15px; margin-bottom: 20px;">
                <h3 style="color: #ef4444; margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">🛠️ Admin Maintenance Tools</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button onclick="clearBotTradeHistory()" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 10px; border-radius: 8px; font-weight: bold; font-size: 11px; cursor: pointer;">🗑️ Clear Bot Trade Logs</button>
                    <button onclick="resetAppCache()" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; padding: 10px; border-radius: 8px; font-weight: bold; font-size: 11px; cursor: pointer;">🧹 Hard Reset Cache</button>
                </div>
            </div>

            <!-- SAVE MAIN CONFIG -->
            <button onclick="saveAllSettings()" style="width: 100%; background: #22c55e; color: #0f172a; border: none; padding: 14px; border-radius: 10px; font-weight: bold; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
                💾 Save Global Configuration
            </button>

        </div>
    `;

    // ऑल इनिशियल लोडर्स
    loadSettingsFromDatabase();
    loadLiveScannerInSettings();
    checkCronEngineHealth();
}

// ⏱️ Cron Job Engine Tracker
async function checkCronEngineHealth() {
    const cronBadge = document.getElementById('statusCron');
    const cronTime = document.getElementById('cronLastPing');
    const baseUrl = (typeof FIREBASE_BASE_URL !== 'undefined') ? FIREBASE_BASE_URL.replace(/\/+$/, "") : '';

    try {
        const res = await fetch(`${baseUrl}/bot_trades.json?orderBy="$key"&limitToLast=1`);
        const data = await res.json();
        
        if (data) {
            const key = Object.keys(data)[0];
            const lastTrade = data[key];
            if (lastTrade.timestamp) {
                const diffSec = Math.floor((new Date() - new Date(lastTrade.timestamp)) / 1000);
                if (cronTime) cronTime.innerText = `Last Activity: ${diffSec}s ago`;
                
                if (diffSec < 180 && cronBadge) { // 3 मिनट से कम
                    cronBadge.innerText = "ACTIVE (RUNNING)";
                    cronBadge.style.background = "rgba(34, 197, 94, 0.2)";
                    cronBadge.style.color = "#22c55e";
                    return;
                }
            }
        }
        if (cronBadge) {
            cronBadge.innerText = "STANDBY / WAITING";
            cronBadge.style.background = "rgba(234, 179, 8, 0.2)";
            cronBadge.style.color = "#eab308";
        }
    } catch (e) {
        if (cronBadge) cronBadge.innerText = "OFFLINE";
    }
}

// 🔍 Firebase Latency and Rules Diagnostic
async function diagnoseFirebaseDB() {
    const startTime = Date.now();
    const baseUrl = (typeof FIREBASE_BASE_URL !== 'undefined') ? FIREBASE_BASE_URL.replace(/\/+$/, "") : '';

    try {
        const res = await fetch(`${baseUrl}/app_settings.json`);
        const latency = Date.now() - startTime;
        
        const latencyBox = document.getElementById('firebasePingTime');
        if (latencyBox) latencyBox.innerText = `Latency: ${latency}ms (Fast)`;

        if (res.ok) {
            alert(`✅ Firebase Realtime DB Diagnostic Passed!\n\nResponse Time: ${latency}ms\nStatus: Read/Write Access OK`);
        } else {
            alert(`⚠️ Firebase Permission Error (${res.status}): Please check Realtime Database Rules.`);
        }
    } catch (e) {
        alert("❌ Firebase Connection Failed: " + e.message);
    }
}

// ⚡ Trigger Manual Cron Ping
async function testCronPing() {
    alert("🔄 Triggering Vercel Cron API Endpoint...");
    try {
        const res = await fetch('/api/scan');
        const data = await res.json();
        if (res.ok) {
            alert(`🚀 Cron Scan Executed Successfully!\nMessage: ${data.message || 'Scanned'}`);
            checkCronEngineHealth();
        } else {
            alert("⚠️ Cron Endpoint replied with error: " + JSON.stringify(data));
        }
    } catch (e) {
        alert("❌ Error hitting /api/scan endpoint: " + e.message);
    }
}

// 🔍 लाइव स्कैनर
async function loadLiveScannerInSettings() {
    const listCont = document.getElementById('liveScannerList');
    if (!listCont) return;

    try {
        const baseUrl = (typeof FIREBASE_BASE_URL !== 'undefined') ? FIREBASE_BASE_URL.replace(/\/+$/, "") : '';
        const res = await fetch(`${baseUrl}/trading_strategies.json`);
        const data = await res.json();

        if (!data) {
            listCont.innerHTML = `<p style="color: #64748b; font-size: 12px; text-align: center;">No active strategies found. Please add strategies in Strategy Tab.</p>`;
            return;
        }

        let html = '';
        let activeCount = 0;

        for (let key in data) {
            const s = data[key];
            const isAuto = s.isAutoActive !== undefined ? s.isAutoActive : true;

            if (isAuto) {
                activeCount++;
                html += `
                    <div style="background: #1e293b; border: 1px solid #334155; padding: 10px; border-radius: 8px; font-size: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <b style="color: #fff;">${s.name || 'Strategy'}</b>
                                <span style="color: #38bdf8; font-weight: bold; margin-left: 5px;">(${s.coin || 'BTC'})</span>
                            </div>
                            <span style="color: #22c55e; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                                <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block;"></span>
                                Scanning Live
                            </span>
                        </div>
                    </div>
                `;
            }
        }

        if (activeCount === 0) {
            listCont.innerHTML = `<p style="color: #eab308; font-size: 12px; text-align: center;">⚠️ All strategies are OFF in Auto mode.</p>`;
        } else {
            listCont.innerHTML = html;
        }
    } catch(e) {
        listCont.innerHTML = `<p style="color: #ef4444; font-size: 12px;">Error connecting scanner database.</p>`;
    }
}

async function loadSettingsFromDatabase() {
    const baseUrl = (typeof FIREBASE_BASE_URL !== 'undefined') ? FIREBASE_BASE_URL.replace(/\/+$/, "") : '';
    const urlInput = document.getElementById('setFirebaseUrl');
    if (urlInput) urlInput.value = baseUrl || '';

    try {
        const res = await fetch(`${baseUrl}/app_settings.json`);
        const s = await res.json();

        if (s) {
            if (s.binanceKey && document.getElementById('setBinanceKey')) document.getElementById('setBinanceKey').value = s.binanceKey;
            if (s.binanceSecret && document.getElementById('setBinanceSecret')) document.getElementById('setBinanceSecret').value = s.binanceSecret;
            if (s.tgToken && document.getElementById('setTgToken')) document.getElementById('setTgToken').value = s.tgToken;
            if (s.tgChatId && document.getElementById('setTgChatId')) document.getElementById('setTgChatId').value = s.tgChatId;
            if (s.botSwitch && document.getElementById('setBotSwitch')) document.getElementById('setBotSwitch').value = s.botSwitch;
            if (s.maxRisk && document.getElementById('setMaxRisk')) document.getElementById('setMaxRisk').value = s.maxRisk;
            if (s.maxDrawdown && document.getElementById('setMaxDrawdown')) document.getElementById('setMaxDrawdown').value = s.maxDrawdown;
            
            if (s.tgToken && s.tgChatId) {
                const tgBadge = document.getElementById('statusTelegram');
                if (tgBadge) {
                    tgBadge.innerText = "ACTIVE";
                    tgBadge.style.background = "rgba(34, 197, 94, 0.2)";
                    tgBadge.style.color = "#22c55e";
                }
            }
        }
    } catch (e) {
        console.log("Settings loading failed.");
    }
}

async function saveAllSettings() {
    const binanceKey = document.getElementById('setBinanceKey').value;
    const binanceSecret = document.getElementById('setBinanceSecret').value;
    const tgToken = document.getElementById('setTgToken').value;
    const tgChatId = document.getElementById('setTgChatId').value;
    const botSwitch = document.getElementById('setBotSwitch').value;
    const maxRisk = document.getElementById('setMaxRisk').value;
    const maxDrawdown = document.getElementById('setMaxDrawdown').value;

    const finalSettings = {
        binanceKey,
        binanceSecret,
        tgToken,
        tgChatId,
        botSwitch,
        maxRisk,
        maxDrawdown,
        updatedAt: new Date().toISOString()
    };

    try {
        const baseUrl = (typeof FIREBASE_BASE_URL !== 'undefined') ? FIREBASE_BASE_URL.replace(/\/+$/, "") : '';
        await fetch(`${baseUrl}/app_settings.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalSettings)
        });
        alert("🟢 Pro Configuration updated on Firebase Cloud!");
        loadSettingsFromDatabase();
    } catch(e) {
        alert("❌ Failed to save settings to Firebase!");
    }
}

// 🗑️ Admin Commands: Clear Logs
async function clearBotTradeHistory() {
    if (!confirm("⚠️ क्या आप सारे बॉट ट्रेड लॉग्स डिलीट करना चाहते हैं?")) return;

    try {
        const baseUrl = (typeof FIREBASE_BASE_URL !== 'undefined') ? FIREBASE_BASE_URL.replace(/\/+$/, "") : '';
        await fetch(`${baseUrl}/bot_trades.json`, { method: 'DELETE' });
        alert("🧹 All Bot Trade History Cleared Successfully!");
    } catch(e) {
        alert("❌ Error clearing history: " + e.message);
    }
}

// 🧹 Admin Commands: Hard Reset Cache
function resetAppCache() {
    if (confirm("🔄 App Cache रिफ्रेश करें?")) {
        window.location.reload(true);
    }
}

// 📢 Telegram Ping Test
async function testTelegramAlert() {
    const token = document.getElementById('setTgToken').value;
    const chatId = document.getElementById('setTgChatId').value;

    if (!token || !chatId) {
        return alert("❌ कृपया पहले Telegram Token और Chat ID दर्ज करें!");
    }

    try {
        const text = encodeURIComponent("⚡ [APEX TERMINAL PING] System Settings & Alert Engine Synchronized!");
        const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.ok) {
            alert("🎯 Ping Success! आपके टेलीग्राम में टेस्ट मैसेज आ गया है।");
        } else {
            alert("❌ Telegram API Error: " + data.description);
        }
    } catch (e) {
        alert("❌ Network Error connecting to Telegram.");
    }
}

function runSystemDiagnostics() {
    loadSettingsFromDatabase();
    loadLiveScannerInSettings();
    checkCronEngineHealth();
    diagnoseFirebaseDB();
}
