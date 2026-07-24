document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    const form = document.getElementById('settings-form');
    const tokenInput = document.getElementById('tg-token');
    const chatIdInput = document.getElementById('tg-chatid');

    // 1. Load Current Settings
    async function loadSettings() {
        try {
            const res = await fetch(`${FIREBASE_URL}/app_settings.json`);
            if (!res.ok) return;
            const data = await res.json() || {};

            if (tokenInput && data.tgToken) tokenInput.value = data.tgToken;
            if (chatIdInput && data.tgChatId) chatIdInput.value = data.tgChatId;
        } catch (err) {
            console.warn("Settings fetch warning:", err);
        }
    }

    // 2. Save Settings
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                tgToken: tokenInput?.value?.trim() || "",
                tgChatId: chatIdInput?.value?.trim() || "",
                updatedAt: new Date().toISOString()
            };

            try {
                await fetch(`${FIREBASE_URL}/app_settings.json`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                alert("Settings saved successfully!");
            } catch (err) {
                alert("Error saving settings");
            }
        });
    }

    loadSettings();
});
