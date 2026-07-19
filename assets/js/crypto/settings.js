async function renderCryptoSettings() {
    const root = document.getElementById('app');
    if (!root) return;

    // 📱 प्रीमियम और डार्क-थीम मोबाइल रिस्पॉन्सिव सेटिंग्स पैनल
    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 15px; max-width: 100%; margin: 0 auto; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #f8fafc; padding-bottom: 80px;">
            
            <!-- हेडर और मास्टर स्टेटस -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h2 style="color: #38bdf8; margin: 0; font-size: 20px; font-weight: bold;">⚙️ System Settings</h2>
                    <span style="color: #64748b; font-size: 11px;">Central Control Panel & API Infrastructure</span>
                </div>
            </div>

            <!-- 🟢 LIVE SYSTEM HEALTH & CORE CONNECTORS -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 14px; padding: 15px; margin-bottom: 15px;">
                <h3 style="color: #94a3b8; margin-top: 0; margin-bottom: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">🌐 Integration Gateway Status</h3>
                
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <!-- Firebase Connection -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 10px 12px; border-radius: 8px;">
                        <span style="font-size: 13px; color: #e2e8f0;">🔥 Firebase Realtime DB</span>
                        <span id="statusFirebase" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">CONNECTED</span>
                    </div>

                    <!-- Telegram Connection -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 10px 12px; border-radius: 8px;">
                        <span style="font-size: 13px; color: #e2e8f0;">📢 Telegram Signal Bot</span>
                        <span id="statusTelegram" style="background: rgba(234, 179, 8, 0.2); color: #eab308; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">CHECKING...</span>
                    </div>

                    <!-- Binance Engine Connection -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 10px 12px; border-radius: 8px;">
                        <span style="font-size: 13px; color: #e2e8f0;">⚡ Binance Spot API</span>
                        <span id="statusBinance" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ONLINE (PUBLIC)</span>
                    </div>
                </div>
            </div>

            <!-- 🔑 1. DATABASE & SECURE API CREDENTIALS FORM -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 14px; padding: 15px; margin-bottom: 15px;">
                <h3 style="color: #38bdf8; margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">🔐 Cloud & Core API Keys</h3>
                
                <div style="margin-bottom: 12px;">
                    <label style="color: #64748b; display: block; margin-bottom: 4px; font-size: 10px; font-weight: bold;">FIREBASE BASE URL</label>
                    <input type="text" id="setFirebaseUrl" style="width: 93%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 13px; outline: none;">
                </div>

                <div style="margin-bottom: 12px;">
                    <label style="color: #64748b; display: block; margin-bottom: 4px; font-size: 10px; font-weight: bold;">BINANCE API KEY (FOR LIVE EXECUTION)</label>
                    <input type="password" id="setBinanceKey" placeholder="Paste your Binance API key" style="width: 93%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 13px; outline: none;">
                </div>

                <div style="margin-bottom: 4px;">
                    <label style="color: #64748b; display: block; margin-bottom: 4px; font-size: 10px; font-weight: bold;">BINANCE SECRET KEY</label>
                    <input type="password" id="setBinanceSecret" placeholder="Paste your Binance Secret key" style="width: 93%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 13px; outline: none;">
                </div>
            </div>

            <!-- 📢 2. TELEGRAM ALERTS CONFIGURATION -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 14px; padding: 15px; margin-bottom: 15px;">
                <h3 style="color: #38bdf8; margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">📢 Telegram Bot Alerts</h3>
                
                <div style="margin-bottom: 12px;">
                    <label style="color: #64748b; display: block; margin-bottom: 4px; font-size: 10px; font-weight: bold;">TELEGRAM BOT TOKEN</label>
                    <input type="text" id="setTgToken" placeholder="123456789:ABCdefGhI..." style="width: 93%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 13px; outline: none;">
                </div>

                <div style="margin-bottom: 4px;">
                    <label style="color: #64748b; display: block; margin-bottom: 4px; font-size: 10px; font-weight: bold;">TELEGRAM CHAT ID</label>
                    <input type="text" id="setTgChatId" placeholder="987654321" style="width: 93%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 13px; outline: none;">
                </div>
            </div>

            <!-- 🎛️ 3. GLOBAL RISK & BOT SWITCHES (ALL TABS CONFIG) -->
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 14px; padding: 15px; margin-bottom: 20px;">
                <h3 style="color: #38bdf8; margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">🎛️ Global Engine Rules</h3>
                
                <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 13px; display: block; color: #fff; font-weight: bold;">Auto Trading Bot</span>
                        <span style="color: #64748b; font-size: 10px;">पूरी तरह से ऑटोबाय/सेल ऑन या ऑफ करें</span>
                    </div>
                    <select id="setBotSwitch" style="background: #1e293b; border: 1px solid #334155; color: white; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                        <option value="ON">🟢 ENABLED</option>
                        <option value="OFF">🔴 DISABLED</option>
                    </select>
                </div>

                <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 13px; display: block; color: #fff; font-weight: bold;">Paper Trading Mode</span>
                        <span style="color: #64748b; font-size: 10px;">मैनुअल पेपर ट्रेडिंग सिमुलेशन अलाउ करें</span>
                    </div>
                    <select id="setPaperSwitch" style="background: #1e293b; border: 1px solid #334155; color: white; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; outline: none;">
                        <option value="ON">🟢 ON</option>
                        <option value="OFF">🔴 OFF</option>
                    </select>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 13px; display: block; color: #fff; font-weight: bold;">Max Allocation Per Trade</span>
                        <span style="color: #64748b; font-size: 10px;">एक सिंगल ऑटो सिग्नल पर मैक्सिमम रिस्क ($)</span>
                    </div>
                    <input type="number" id="setMaxRisk" value="1000" style="width: 80px; background: #1e293b; border: 1px solid #334155; color: #38bdf8; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 12px; text-align: center; outline: none;">
                </div>
            </div>

            <!-- ACTION BUTTONS -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button onclick="testTelegramAlert()" style="background: #1e293b; color: #38bdf8; border: 1px solid #334155; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer;">⚡ Test Telegram</button>
                <button onclick="saveAllSettings()" style="background: #22c55e; color: #0f172a; border: none; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer;">💾 Save Config</button>
            </div>

        </div>
    `;

    // इनपुट्स में मौजूदा वैल्यूज लोड करें
    loadSettingsFromDatabase();
}

async function loadSettingsFromDatabase() {
    // ग्लोबल कॉन्स्टेंट यूआरएल को सेटिंग इनपुट में सेट करें
    document.getElementById('setFirebaseUrl').value = FIREBASE_BASE_URL || '';

    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/app_settings.json`);
        const s = await res.json();

        if (s) {
            if (s.binanceKey) document.getElementById('setBinanceKey').value = s.binanceKey;
            if (s.binanceSecret) document.getElementById('setBinanceSecret').value = s.binanceSecret;
            if (s.tgToken) document.getElementById('setTgToken').value = s.tgToken;
            if (s.tgChatId) document.getElementById('setTgChatId').value = s.tgChatId;
            if (s.botSwitch) document.getElementById('setBotSwitch').value = s.botSwitch;
            if (s.paperSwitch) document.getElementById('setPaperSwitch').value = s.paperSwitch;
            if (s.maxRisk) document.getElementById('setMaxRisk').value = s.maxRisk;
            
            // अगर टोकन और चैट आईडी मौजूद है, तो टेलीग्राम का स्टेटस "ACTIVE" दिखाएं
            if (s.tgToken && s.tgChatId) {
                const tgBadge = document.getElementById('statusTelegram');
                if(tgBadge) {
                    tgBadge.innerText = "ACTIVE";
                    tgBadge.style.background = "rgba(34, 197, 94, 0.2)";
                    tgBadge.style.color = "#22c55e";
                }
            }
        } else {
            document.getElementById('statusTelegram').innerText = "NOT CONFIGURED";
        }
    } catch (e) {
        console.log("Settings loading failed, using defaults.");
        document.getElementById('statusTelegram').innerText = "DISCONNECTED";
    }
}

async function saveAllSettings() {
    const binanceKey = document.getElementById('setBinanceKey').value;
    const binanceSecret = document.getElementById('setBinanceSecret').value;
    const tgToken = document.getElementById('setTgToken').value;
    const tgChatId = document.getElementById('setTgChatId').value;
    const botSwitch = document.getElementById('setBotSwitch').value;
    const paperSwitch = document.getElementById('setPaperSwitch').value;
    const maxRisk = document.getElementById('setMaxRisk').value;

    const finalSettings = {
        binanceKey,
        binanceSecret,
        tgToken,
        tgChatId,
        botSwitch,
        paperSwitch,
        maxRisk
    };

    try {
        await fetch(`${FIREBASE_BASE_URL}/app_settings.json`, {
            method: 'PUT',
            body: JSON.stringify(finalSettings)
        });
        alert("🟢 System configurations updated successfully on Firebase cloud!");
        loadSettingsFromDatabase();
    } catch(e) {
        alert("❌ कॉन्फ़िगरेशन सेव करने में एरर आया!");
    }
}

async function testTelegramAlert() {
    const token = document.getElementById('setTgToken').value;
    const chatId = document.getElementById('setTgChatId').value;

    if (!token || !chatId) {
        return alert("❌ पहले टेलीग्राम टोकन और चैट आईडी भरें भाई!");
    }

    alert("🔄 Sending test ping to your Telegram...");

    try {
        const text = encodeURIComponent("🚀 Crypto Trading Bot: Integration Test Successful! Settings are now synced. 🔥");
        const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.ok) {
            alert("🎯 Success! अपने टेलीग्राम ऐप में चेक करो, बोट का मैसेज आ गया होगा।");
        } else {
            alert("❌ टेलीग्राम API ने एरर दिया: " + data.description);
        }
    } catch (e) {
        alert("❌ नेटवर्क एरर! टेलीग्राम कनेक्ट नहीं हो सका।");
    }
}
