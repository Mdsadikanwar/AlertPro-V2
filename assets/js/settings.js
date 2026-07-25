document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    const form = document.getElementById('master-settings-form');

    // Load Settings
    async function loadSettings() {
        try {
            const res = await fetch(`${FIREBASE_URL}/settings.json`);
            if (!res.ok) return;
            const cfg = await res.json() || {};

            if (document.getElementById('cfg-firebase')) document.getElementById('cfg-firebase').value = cfg.firebaseUrl || FIREBASE_URL;
            if (document.getElementById('cfg-tg-token')) document.getElementById('cfg-tg-token').value = cfg.tgToken || '';
            if (document.getElementById('cfg-tg-chatid')) document.getElementById('cfg-tg-chatid').value = cfg.tgChatId || '';
            if (document.getElementById('cfg-cron-url')) document.getElementById('cfg-cron-url').value = cfg.cronUrl || '';
        } catch (err) { console.error("Error loading settings:", err); }
    }

    // Save Settings
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const config = {
                firebaseUrl: document.getElementById('cfg-firebase').value,
                tgToken: document.getElementById('cfg-tg-token').value,
                tgChatId: document.getElementById('cfg-tg-chatid').value,
                cronUrl: document.getElementById('cfg-cron-url').value,
                updatedAt: new Date().toISOString()
            };

            await fetch(`${FIREBASE_URL}/settings.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            alert("Master Settings Saved Successfully!");
        });
    }

    loadSettings();
});
