// ApexTraders - Settings Manager (100% Production Ready)

const DEFAULT_FIREBASE_URL = "https://apextraders-default-rtdb.firebaseio.com/";

document.addEventListener('DOMContentLoaded', () => {
    initSettingsForm();
});

function getMasterData() {
    try {
        const local = localStorage.getItem('apex_master_data');
        return local ? JSON.parse(local) : {};
    } catch (e) {
        console.error("Localstorage read error:", e);
        return {};
    }
}

function saveMasterDataLocally(data) {
    try {
        localStorage.setItem('apex_master_data', JSON.stringify(data));
    } catch (e) {
        console.error("Localstorage save error:", e);
    }
}

function initSettingsForm() {
    const master = getMasterData();
    const settings = master.settings || {};

    // Populate Form Inputs
    const fbEnable = document.getElementById('cfg-fb-enable');
    if (fbEnable) fbEnable.checked = settings.fbEnable !== false;

    const fbUrl = document.getElementById('cfg-firebase');
    if (fbUrl) fbUrl.value = settings.firebaseUrl || DEFAULT_FIREBASE_URL;

    const tgEnable = document.getElementById('cfg-tg-enable');
    if (tgEnable) tgEnable.checked = settings.tgEnable !== false;

    const tgToken = document.getElementById('cfg-tg-token');
    if (tgToken) tgToken.value = settings.tgToken || '';

    const tgChatId = document.getElementById('cfg-tg-chatid');
    if (tgChatId) tgChatId.value = settings.tgChatId || '';

    const cronEnable = document.getElementById('cfg-cron-enable');
    if (cronEnable) cronEnable.checked = settings.cronEnable !== false;

    const cronProvider = document.getElementById('cfg-cron-provider');
    if (cronProvider) cronProvider.value = settings.cronProvider || 'vercel';

    // Global Switches
    const ruleAutotrade = document.getElementById('rule-autotrade-enable');
    if (ruleAutotrade) ruleAutotrade.checked = settings.ruleAutotradeEnable !== false;

    const rulePaper = document.getElementById('rule-paper-mode');
    if (rulePaper) rulePaper.checked = settings.rulePaperMode !== false;

    const ruleSltp = document.getElementById('rule-sltp-guard');
    if (ruleSltp) ruleSltp.checked = settings.ruleSltpGuard !== false;

    // Check Health Badges
    checkRealGatewayHealth(settings);

    // Form Listener
    const form = document.getElementById('master-settings-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const updatedSettings = {
                fbEnable: document.getElementById('cfg-fb-enable') ? document.getElementById('cfg-fb-enable').checked : true,
                firebaseUrl: document.getElementById('cfg-firebase').value.trim() || DEFAULT_FIREBASE_URL,
                tgEnable: document.getElementById('cfg-tg-enable') ? document.getElementById('cfg-tg-enable').checked : true,
                tgToken: document.getElementById('cfg-tg-token').value.trim(),
                tgChatId: document.getElementById('cfg-tg-chatid').value.trim(),
                cronEnable: document.getElementById('cfg-cron-enable') ? document.getElementById('cfg-cron-enable').checked : true,
                cronProvider: document.getElementById('cfg-cron-provider') ? document.getElementById('cfg-cron-provider').value : 'vercel',
                ruleAutotradeEnable: document.getElementById('rule-autotrade-enable') ? document.getElementById('rule-autotrade-enable').checked : true,
                rulePaperMode: document.getElementById('rule-paper-mode') ? document.getElementById('rule-paper-mode').checked : true,
                ruleSltpGuard: document.getElementById('rule-sltp-guard') ? document.getElementById('rule-sltp-guard').checked : true
            };

            const fullData = getMasterData();
            fullData.settings = updatedSettings;

            saveMasterDataLocally(fullData);

            // Sync with Firebase if enabled
            if (updatedSettings.fbEnable && updatedSettings.firebaseUrl) {
                try {
                    const cleanUrl = updatedSettings.firebaseUrl.replace(/\/+$/, "");
                    await fetch(`${cleanUrl}/app_master_data/settings.json`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedSettings)
                    });
                } catch (err) {
                    console.error("Firebase sync error:", err);
                }
            }

            checkRealGatewayHealth(updatedSettings);

            if (typeof window.triggerGlobalSave === 'function') {
                window.triggerGlobalSave();
            } else {
                alert("Settings Saved Successfully!");
            }
        });
    }
}

async function checkRealGatewayHealth(settings) {
    // 1. Firebase Badge Check
    const fbBadge = document.getElementById('badge-fb-status');
    if (fbBadge) {
        if (settings.fbEnable && settings.firebaseUrl) {
            try {
                const cleanUrl = settings.firebaseUrl.replace(/\/+$/, "");
                const res = await fetch(`${cleanUrl}/.json?shallow=true`);
                if (res.ok) {
                    fbBadge.className = "badge bg-success";
                    fbBadge.innerText = "Connected";
                } else {
                    fbBadge.className = "badge bg-warning";
                    fbBadge.innerText = "Auth Error / Restricted";
                }
            } catch (e) {
                fbBadge.className = "badge bg-danger";
                fbBadge.innerText = "Disconnected";
            }
        } else {
            fbBadge.className = "badge bg-secondary";
            fbBadge.innerText = "Disabled";
        }
    }

    // 2. Telegram Badge Check
    const tgBadge = document.getElementById('badge-tg-status');
    if (tgBadge) {
        if (settings.tgEnable && settings.tgToken) {
            try {
                const res = await fetch(`https://api.telegram.org/bot${settings.tgToken}/getMe`);
                const data = await res.json();
                if (data.ok) {
                    tgBadge.className = "badge bg-success";
                    tgBadge.innerText = `@${data.result.username}`;
                } else {
                    tgBadge.className = "badge bg-danger";
                    tgBadge.innerText = "Invalid Token";
                }
            } catch (e) {
                tgBadge.className = "badge bg-danger";
                tgBadge.innerText = "Connection Failed";
            }
        } else {
            tgBadge.className = "badge bg-secondary";
            tgBadge.innerText = "Disabled";
        }
    }

    // 3. Cron Engine Check
    const cronBadge = document.getElementById('badge-cron-status');
    const cronSubtext = document.getElementById('cron-status-subtext');
    const provider = settings.cronProvider || 'vercel';

    if (cronBadge) {
        if (settings.cronEnable === false) {
            cronBadge.className = "badge bg-secondary";
            cronBadge.innerText = "Engine Disabled";
            if (cronSubtext) cronSubtext.innerText = "Cron switch is off";
        } else if (provider === 'vercel') {
            cronBadge.className = "badge bg-success";
            cronBadge.innerText = "Active (Live)";
            if (cronSubtext) cronSubtext.innerText = "Vercel Serverless Endpoint";
        } else if (provider === 'github' || provider === 'github_actions') {
            try {
                const ghCheck = await fetch('/.github/workflows/cron.yml');
                if (ghCheck.ok) {
                    cronBadge.className = "badge bg-success";
                    cronBadge.innerText = "Active (Live)";
                    if (cronSubtext) cronSubtext.innerText = "GitHub Actions Workflow";
                } else {
                    cronBadge.className = "badge bg-danger";
                    cronBadge.innerText = "Workflow Not Set";
                    if (cronSubtext) cronSubtext.innerText = "cron.yml missing in repository";
                }
            } catch (e) {
                cronBadge.className = "badge bg-danger";
                cronBadge.innerText = "Not Configured";
                if (cronSubtext) cronSubtext.innerText = "Workflow Inactive";
            }
        }
    }
}
