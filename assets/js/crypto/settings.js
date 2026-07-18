async function renderCryptoSettings() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 30px; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
            <h2 style="color: #38bdf8; margin-bottom: 20px;">⚙️ System Core Settings</h2>
            
            <div style="background: #111827; padding: 25px; border-radius: 12px; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 20px;">
                <div>
                    <label style="color:#94a3b8; font-size:12px; display:block; margin-bottom:5px;">BINANCE API KEY</label>
                    <input type="password" id="setBinanceKey" style="width:95%; background:#1e293b; border:1px solid #334155; color:white; padding:10px; border-radius:6px;">
                </div>
                <div>
                    <label style="color:#94a3b8; font-size:12px; display:block; margin-bottom:5px;">BINANCE API SECRET</label>
                    <input type="password" id="setBinanceSecret" style="width:95%; background:#1e293b; border:1px solid #334155; color:white; padding:10px; border-radius:6px;">
                </div>
                <div>
                    <label style="color:#94a3b8; font-size:12px; display:block; margin-bottom:5px;">TELEGRAM BOT TOKEN</label>
                    <input type="password" id="setTgToken" style="width:95%; background:#1e293b; border:1px solid #334155; color:white; padding:10px; border-radius:6px;">
                </div>
                <div>
                    <label style="color:#94a3b8; font-size:12px; display:block; margin-bottom:5px;">TELEGRAM CHAT ID</label>
                    <input type="text" id="setTgId" style="width:95%; background:#1e293b; border:1px solid #334155; color:white; padding:10px; border-radius:6px;">
                </div>
                <button onclick="saveSettings()" style="background: #22c55e; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px;">💾 Save Engine Configuration</button>
            </div>
        </div>
    `;

    // पहले से सेव सेटिंग्स लोड करें
    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/app_settings.json`);
        const config = await res.json();
        if (config) {
            document.getElementById('setBinanceKey').value = config.binanceApiKey || '';
            document.getElementById('setBinanceSecret').value = config.binanceApiSecret || '';
            document.getElementById('setTgToken').value = config.telegramToken || '';
            document.getElementById('setTgId').value = config.telegramChatId || '';
        }
    } catch(e){}
}

async function saveSettings() {
    const payload = {
        binanceApiKey: document.getElementById('setBinanceKey').value,
        binanceApiSecret: document.getElementById('setBinanceSecret').value,
        telegramToken: document.getElementById('setTgToken').value,
        telegramChatId: document.getElementById('setTgId').value
    };

    await fetch(`${FIREBASE_BASE_URL}/app_settings.json`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    alert("🔒 Secure credentials dispatched to Firebase config cluster!");
}
