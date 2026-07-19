async function renderCryptoSettings() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 30px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
            <h2 style="color: #38bdf8; margin-bottom: 20px;">🛠️ Alert Settings</h2>
            <div style="background: #111827; padding: 25px; border-radius: 12px; border: 1px solid #1e293b; max-width: 600px;">
                <h3 style="color: white; margin-top: 0;">📲 Telegram Notification System</h3>
                <div style="margin-top: 15px;">
                    <label style="color: #94a3b8; display: block; margin-bottom: 5px; font-size: 12px;">TELEGRAM BOT TOKEN</label>
                    <input type="text" id="tgToken" placeholder="Enter Bot Token" style="width: 96%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px;">
                </div>
                <div style="margin-top: 15px;">
                    <label style="color: #94a3b8; display: block; margin-bottom: 5px; font-size: 12px;">TELEGRAM CHAT ID</label>
                    <input type="text" id="tgId" placeholder="Enter Chat ID" style="width: 96%; background: #1e293b; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px;">
                </div>
                <button onclick="saveCryptoSettings()" style="width: 100%; background: #22c55e; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 20px;">Save Credentials</button>
            </div>
        </div>
    `;
}

async function saveCryptoSettings() {
    const token = document.getElementById('tgToken').value;
    const chatId = document.getElementById('tgId').value;
    try {
        await fetch(`${FIREBASE_BASE_URL}/app_settings.json`, {
            method: 'PUT',
            body: JSON.stringify({ telegramToken: token, telegramChatId: chatId })
        });
        alert("🔑 Telegram configuration updated successfully!");
    } catch(e) { alert("❌ Error saving settings."); }
}
