(function() {
    const DEFAULT_FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com/";
    const MASTER_LOCAL_KEY = 'apex_master_data';
    let firebaseSyncTimer = null;

    function getMasterData() {
        const raw = localStorage.getItem(MASTER_LOCAL_KEY);
        if (raw) {
            try { return JSON.parse(raw); } catch(e) {}
        }
        return {
            settings: JSON.parse(localStorage.getItem('apex_settings') || '{}'),
            strategies: JSON.parse(localStorage.getItem('apex_strategies') || '[]'),
            botState: JSON.parse(localStorage.getItem('apex_bot_state') || '{}')
        };
    }

    function saveMasterDataLocally(data) {
        localStorage.setItem(MASTER_LOCAL_KEY, JSON.stringify(data));
        if (data.settings) localStorage.setItem('apex_settings', JSON.stringify(data.settings));
        if (data.strategies) localStorage.setItem('apex_strategies', JSON.stringify(data.strategies));
    }

    // 🔴 100% REAL NETWORK HEALTH CHECK FOR FIREBASE & TELEGRAM
    async function checkRealGatewayHealth(config) {
        const fbBadge = document.getElementById('status-firebase-badge');
        const tgBadge = document.getElementById('status-telegram-badge');

        // 1. REAL FIREBASE PING
        if (fbBadge) {
            if (!config.fbEnable || !config.firebaseUrl) {
                fbBadge.className = "badge bg-secondary";
                fbBadge.innerText = "Disabled";
            } else {
                try {
                    const cleanUrl = config.firebaseUrl.replace(/\/$/, "");
                    const res = await fetch(`${cleanUrl}/.json?shallow=true`);
                    if (res.ok) {
                        fbBadge.className = "badge bg-success";
                        fbBadge.innerText = "Connected (Live)";
                    } else {
                        fbBadge.className = "badge bg-danger";
                        fbBadge.innerText = "Permission Denied";
                    }
                } catch (e) {
                    fbBadge.className = "badge bg-danger";
                    fbBadge.innerText = "Network Error";
                }
            }
        }

        // 2. 🔴 100% REAL TELEGRAM BOT PING (Checks Telegram API Live)
        if (tgBadge) {
            if (!config.tgEnable) {
                tgBadge.className = "badge bg-secondary";
                tgBadge.innerText = "Disabled";
            } else if (!config.tgToken || !config.tgChatId) {
                tgBadge.className = "badge bg-danger";
                tgBadge.innerText = "Disconnected (Missing Keys)";
            } else {
                tgBadge.className = "badge bg-warning text-dark";
                tgBadge.innerText = "Checking Network...";

                try {
                    // Real Telegram API Request to check Token Validity
                    const res = await fetch(`https://api.telegram.org/bot${config.tgToken.trim()}/getMe`);
                    const data = await res.json();

                    if (res.ok && data.ok) {
                        tgBadge.className = "badge bg-success";
                        tgBadge.innerText = "Connected (Live)";
                    } else {
                        tgBadge.className = "badge bg-danger";
                        tgBadge.innerText = "Invalid Token/Auth Error";
                    }
                } catch (err) {
                    tgBadge.className = "badge bg-danger";
                    tgBadge.innerText = "Disconnected (Network Error)";
                }
            }
        }
    }

    // PUSH ALL MASTER DATA TO FIREBASE
    async function pushMasterToFirebase() {
        const master = getMasterData();
        const settings = master.settings || {};
        const fbUrl = settings.firebaseUrl || DEFAULT_FIREBASE_URL;
        const fbStatusText = document.getElementById('fb-sync-status');

        if (!settings.fbEnable || !fbUrl || !fbUrl.startsWith('https://')) return;

        if (fbStatusText) fbStatusText.innerHTML = `<span class="text-warning">⏳ Syncing data to Firebase...</span>`;

        try {
            const cleanUrl = fbUrl.replace(/\/$/, "");
            const res = await fetch(`${cleanUrl}/app_master_data.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(master)
            });

            if (res.ok) {
                if (fbStatusText) fbStatusText.innerHTML = `<span class="text-success fw-bold">✓ Website Synced Completely!</span>`;
                checkRealGatewayHealth(settings);
            } else {
                if (fbStatusText) fbStatusText.innerHTML = `<span class="text-danger">❌ Firebase Push Failed</span>`;
            }
        } catch (err) {
            if (fbStatusText) fbStatusText.innerHTML = `<span class="text-danger">❌ Sync Connection Error!</span>`;
        }
    }

    // FETCH MASTER DATA FROM FIREBASE
    async function fetchMasterFromFirebase() {
        const master = getMasterData();
        const settings = master.settings || {};
        const fbUrl = settings.firebaseUrl || DEFAULT_FIREBASE_URL;

        if (!fbUrl || !fbUrl.startsWith('https://')) return;

        try {
            const cleanUrl = fbUrl.replace(/\/$/, "");
            const res = await fetch(`${cleanUrl}/app_master_data.json`);
            if (res.ok) {
                const remoteMaster = await res.json();
                if (remoteMaster && typeof remoteMaster === 'object') {
                    saveMasterDataLocally(remoteMaster);
                    if (window.loadSettings) window.loadSettings();
                    if (window.loadStrategies) window.loadStrategies();
                }
            }
        } catch (err) {
            console.error("Master Sync Load Error:", err);
        }
    }

    window.loadSettings = function() {
        const master = getMasterData();
        const config = master.settings || {};

        if (document.getElementById('cfg-fb-enable')) document.getElementById('cfg-fb-enable').checked = config.fbEnable !== false;
        if (document.getElementById('cfg-firebase')) document.getElementById('cfg-firebase').value = config.firebaseUrl || DEFAULT_FIREBASE_URL;
        if (document.getElementById('cfg-tg-enable')) document.getElementById('cfg-tg-enable').checked = config.tgEnable !== false;
        if (document.getElementById('cfg-tg-token')) document.getElementById('cfg-tg-token').value = config.tgToken || '';
        if (document.getElementById('cfg-tg-chatid')) document.getElementById('cfg-tg-chatid').value = config.tgChatId || '';

        checkRealGatewayHealth(config);
    };

    window.triggerGlobalSave = function() {
        if (firebaseSyncTimer) clearTimeout(firebaseSyncTimer);
        firebaseSyncTimer = setTimeout(() => {
            pushMasterToFirebase();
        }, 1500);
    };

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('master-settings-form');

        window.loadSettings();
        fetchMasterFromFirebase();

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const master = getMasterData();
                master.settings = {
                    fbEnable: document.getElementById('cfg-fb-enable').checked,
                    firebaseUrl: document.getElementById('cfg-firebase').value.trim() || DEFAULT_FIREBASE_URL,
                    tgEnable: document.getElementById('cfg-tg-enable').checked,
                    tgToken: document.getElementById('cfg-tg-token').value.trim(),
                    tgChatId: document.getElementById('cfg-tg-chatid').value.trim()
                };

                saveMasterDataLocally(master);
                checkRealGatewayHealth(master.settings);
                window.triggerGlobalSave();
            });
        }
    });
})();
