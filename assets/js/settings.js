(function() {
    // Storage Keys
    const LOCAL_SETTINGS_KEY = 'apex_settings';
    let firebaseSyncTimer = null; // 2-Second Delay Timer Reference

    // Helper to get settings from LocalStorage
    function getStoredSettings() {
        return JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || '{}');
    }

    // Helper to update visual Badges (Gateway Status)
    function updateGatewayBadges(config) {
        const fbBadge = document.getElementById('status-firebase-badge');
        const tgBadge = document.getElementById('status-telegram-badge');
        const cronBadge = document.getElementById('status-cron-badge');
        const cronLabel = document.getElementById('status-cron-provider-label');

        // 1. Check Firebase Connection / Sync Status
        if (fbBadge) {
            if (config.fbEnable === false) {
                fbBadge.className = "badge bg-secondary";
                fbBadge.innerText = "Disabled (Local Only)";
            } else if (config.firebaseUrl && config.firebaseUrl.startsWith('https://')) {
                fbBadge.className = "badge bg-success";
                fbBadge.innerText = "Active (Dual-Sync)";
            } else {
                fbBadge.className = "badge bg-danger";
                fbBadge.innerText = "Disconnected";
            }
        }

        // 2. Check Telegram Status
        if (tgBadge) {
            if (config.tgEnable !== false && config.tgToken && config.tgChatId) {
                tgBadge.className = "badge bg-success";
                tgBadge.innerText = "Active";
            } else if (config.tgEnable === false) {
                tgBadge.className = "badge bg-warning text-dark";
                tgBadge.innerText = "Paused";
            } else {
                tgBadge.className = "badge bg-danger";
                tgBadge.innerText = "Disconnected";
            }
        }

        // 3. Check Cron Provider & Health Status
        if (cronBadge) {
            const providerNames = {
                'vercel': 'Vercel Cron',
                'cronjob_org': 'Cron-Job.org',
                'github_actions': 'GitHub Actions'
            };

            if (cronLabel) {
                cronLabel.innerText = providerNames[config.cronProvider] || 'Vercel Cron';
            }

            if (config.cronEnable === false) {
                cronBadge.className = "badge bg-danger";
                cronBadge.innerText = "Inactive";
            } else {
                cronBadge.className = "badge bg-success";
                cronBadge.innerText = "Active";
            }
        }
    }

    // Dynamic UI Update for Cron Switch
    function updateCronUIState() {
        const cronToggle = document.getElementById('cfg-cron-enable');
        const cronSelect = document.getElementById('cfg-cron-provider');

        if (!cronToggle || !cronSelect) return;

        const isEnabled = cronToggle.checked;
        cronSelect.disabled = !isEnabled;
    }

    // Dynamic UI Update for Firebase Switch
    function updateFirebaseUIState() {
        const fbToggle = document.getElementById('cfg-fb-enable');
        const fbUrlInput = document.getElementById('cfg-firebase');
        const fbStatusText = document.getElementById('fb-sync-status');

        if (!fbToggle || !fbUrlInput) return;

        const isEnabled = fbToggle.checked;
        fbUrlInput.disabled = !isEnabled;

        if (!isEnabled) {
            fbUrlInput.placeholder = "Firebase Sync Disabled (Data stored in LocalStorage only)";
            if (fbStatusText) fbStatusText.innerHTML = `<span class="text-warning">⚡ Offline Mode: Operating purely on LocalStorage.</span>`;
        } else {
            fbUrlInput.placeholder = "https://your-app.firebaseio.com";
            if (fbStatusText) fbStatusText.innerHTML = `<span class="text-info">🔄 Dual Storage: Save to LocalStorage -> 2s Delay -> Push to Firebase.</span>`;
        }
    }

    // Dynamic UI Update for Telegram Switch
    function updateTelegramUIState() {
        const tgToggle = document.getElementById('cfg-tg-enable');
        const tgTokenInput = document.getElementById('cfg-tg-token');
        const tgChatIdInput = document.getElementById('cfg-tg-chatid');
        const testTgBtn = document.getElementById('btn-test-tg');

        if (!tgToggle || !tgTokenInput || !tgChatIdInput || !testTgBtn) return;

        const isEnabled = tgToggle.checked;
        tgTokenInput.disabled = !isEnabled;
        tgChatIdInput.disabled = !isEnabled;
        testTgBtn.disabled = !isEnabled;

        if (!isEnabled) {
            tgTokenInput.placeholder = "Telegram Alerts Disabled";
            tgChatIdInput.placeholder = "Telegram Alerts Disabled";
        } else {
            tgTokenInput.placeholder = "123456789:ABC...";
            tgChatIdInput.placeholder = "-100123456789";
        }
    }

    // Dynamic UI Update for API Switch & Exchange Dropdown
    function updateApiUIState() {
        const apiToggle = document.getElementById('cfg-api-enable');
        const apiKeyInput = document.getElementById('cfg-api-key');
        const apiSecretInput = document.getElementById('cfg-api-secret');
        const exchangeSelect = document.getElementById('cfg-exchange-select');

        if (!apiToggle || !apiKeyInput || !apiSecretInput || !exchangeSelect) return;

        const isEnabled = apiToggle.checked;
        apiKeyInput.disabled = !isEnabled;
        apiSecretInput.disabled = !isEnabled;

        if (!isEnabled) {
            apiKeyInput.placeholder = "API Trading Disabled";
            apiSecretInput.placeholder = "API Trading Disabled";
        } else {
            const selectedExchangeName = exchangeSelect.options[exchangeSelect.selectedIndex].text.split(' ')[0];
            apiKeyInput.placeholder = `Enter ${selectedExchangeName} API Key`;
            apiSecretInput.placeholder = `Enter ${selectedExchangeName} Secret Key`;
        }
    }

    // Function to sync config to Firebase Realtime DB (REST API Put)
    async function syncToFirebase(config) {
        const fbStatusText = document.getElementById('fb-sync-status');

        if (!config.fbEnable || !config.firebaseUrl || !config.firebaseUrl.startsWith('https://')) {
            return;
        }

        if (fbStatusText) fbStatusText.innerHTML = `<span class="text-warning">⏳ Syncing data to Firebase Database...</span>`;

        try {
            // Clean URL and attach JSON endpoint
            const baseUrl = config.firebaseUrl.replace(/\/$/, "");
            const firebaseUrl = `${baseUrl}/settings.json`;

            const response = await fetch(firebaseUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                if (fbStatusText) fbStatusText.innerHTML = `<span class="text-success fw-bold">✓ Synced with Firebase (2s delay completed).</span>`;
            } else {
                if (fbStatusText) fbStatusText.innerHTML = `<span class="text-danger">❌ Firebase Sync Failed: HTTP ${response.status}</span>`;
            }
        } catch (err) {
            if (fbStatusText) fbStatusText.innerHTML = `<span class="text-danger">❌ Firebase Connection Error!</span>`;
        }
    }

    // Master Load Function
    window.loadSettings = function() {
        console.log("Loading Master Configurations...");
        const config = getStoredSettings();

        // Firebase Controls
        if (document.getElementById('cfg-fb-enable')) document.getElementById('cfg-fb-enable').checked = config.fbEnable !== false;
        if (document.getElementById('cfg-firebase')) document.getElementById('cfg-firebase').value = config.firebaseUrl || '';

        // Telegram Controls
        if (document.getElementById('cfg-tg-enable')) document.getElementById('cfg-tg-enable').checked = config.tgEnable !== false;
        if (document.getElementById('cfg-tg-token')) document.getElementById('cfg-tg-token').value = config.tgToken || '';
        if (document.getElementById('cfg-tg-chatid')) document.getElementById('cfg-tg-chatid').value = config.tgChatId || '';

        // Dedicated Exchange API Config
        if (document.getElementById('cfg-api-enable')) document.getElementById('cfg-api-enable').checked = config.apiEnable || false;
        if (document.getElementById('cfg-exchange-select')) document.getElementById('cfg-exchange-select').value = config.selectedExchange || 'binance';
        if (document.getElementById('cfg-api-key')) document.getElementById('cfg-api-key').value = config.apiKey || '';
        if (document.getElementById('cfg-api-secret')) document.getElementById('cfg-api-secret').value = config.apiSecret || '';

        // Cron Execution Config
        if (document.getElementById('cfg-cron-enable')) document.getElementById('cfg-cron-enable').checked = config.cronEnable !== false;
        if (config.cronProvider && document.getElementById('cfg-cron-provider')) {
            document.getElementById('cfg-cron-provider').value = config.cronProvider;
        }

        // Global Engine Rules
        if (document.getElementById('rule-autotrade-enable')) document.getElementById('rule-autotrade-enable').checked = config.ruleAutoTradeEnable !== false;
        if (document.getElementById('rule-paper-mode')) document.getElementById('rule-paper-mode').checked = config.rulePaperMode !== false;
        if (document.getElementById('rule-sltp-guard')) document.getElementById('rule-sltp-guard').checked = config.ruleSltpGuard !== false;

        // Sync Dynamic UI States
        updateCronUIState();
        updateFirebaseUIState();
        updateTelegramUIState();
        updateApiUIState();

        // Update Status Badges
        updateGatewayBadges(config);
    };

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('master-settings-form');
        const testTgBtn = document.getElementById('btn-test-tg');
        const tgStatus = document.getElementById('tg-test-status');

        const cronToggle = document.getElementById('cfg-cron-enable');
        const cronSelect = document.getElementById('cfg-cron-provider');
        const fbToggle = document.getElementById('cfg-fb-enable');
        const tgToggle = document.getElementById('cfg-tg-enable');
        const apiToggle = document.getElementById('cfg-api-enable');
        const exchangeSelect = document.getElementById('cfg-exchange-select');

        // Dynamic Event Listeners
        if (cronToggle) cronToggle.addEventListener('change', () => {
            updateCronUIState();
            const config = getStoredSettings();
            config.cronEnable = cronToggle.checked;
            config.cronProvider = cronSelect ? cronSelect.value : 'vercel';
            updateGatewayBadges(config);
        });

        if (cronSelect) cronSelect.addEventListener('change', () => {
            const config = getStoredSettings();
            config.cronEnable = cronToggle ? cronToggle.checked : true;
            config.cronProvider = cronSelect.value;
            updateGatewayBadges(config);
        });

        if (fbToggle) fbToggle.addEventListener('change', () => {
            updateFirebaseUIState();
            const config = getStoredSettings();
            config.fbEnable = fbToggle.checked;
            updateGatewayBadges(config);
        });

        if (tgToggle) tgToggle.addEventListener('change', () => {
            updateTelegramUIState();
            const config = getStoredSettings();
            config.tgEnable = tgToggle.checked;
            updateGatewayBadges(config);
        });

        if (apiToggle) apiToggle.addEventListener('change', updateApiUIState);
        if (exchangeSelect) exchangeSelect.addEventListener('change', updateApiUIState);

        // Initial Load Call
        window.loadSettings();

        // Form Submit: Save All Master Settings
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const newConfig = {
                    // Firebase Settings
                    fbEnable: document.getElementById('cfg-fb-enable').checked,
                    firebaseUrl: document.getElementById('cfg-firebase').value.trim(),

                    // Telegram Settings
                    tgEnable: document.getElementById('cfg-tg-enable').checked,
                    tgToken: document.getElementById('cfg-tg-token').value.trim(),
                    tgChatId: document.getElementById('cfg-tg-chatid').value.trim(),

                    // Exchange API Config
                    apiEnable: document.getElementById('cfg-api-enable').checked,
                    selectedExchange: document.getElementById('cfg-exchange-select').value,
                    apiKey: document.getElementById('cfg-api-key').value.trim(),
                    apiSecret: document.getElementById('cfg-api-secret').value.trim(),

                    // Cron Provider Settings
                    cronEnable: document.getElementById('cfg-cron-enable') ? document.getElementById('cfg-cron-enable').checked : true,
                    cronProvider: document.getElementById('cfg-cron-provider').value,

                    // Master Engine Rules
                    ruleAutoTradeEnable: document.getElementById('rule-autotrade-enable').checked,
                    rulePaperMode: document.getElementById('rule-paper-mode').checked,
                    ruleSltpGuard: document.getElementById('rule-sltp-guard').checked
                };

                // STEP 1: Instant LocalStorage Save
                localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(newConfig));
                updateGatewayBadges(newConfig);

                // UI Button Immediate Instant Local Storage Feedback
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerText = "Saved to LocalStorage!";
                    submitBtn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                    submitBtn.style.color = "#ffffff";
                }

                // STEP 2: Delayed Firebase Sync (2 Seconds Delay)
                if (firebaseSyncTimer) clearTimeout(firebaseSyncTimer);

                const fbStatusText = document.getElementById('fb-sync-status');
                if (newConfig.fbEnable) {
                    if (fbStatusText) fbStatusText.innerHTML = `<span class="text-info">⚡ Saved locally. Firebase sync queued in 2s...</span>`;

                    firebaseSyncTimer = setTimeout(() => {
                        syncToFirebase(newConfig);

                        if (submitBtn) {
                            submitBtn.innerText = "All Configs & Firebase Synced!";
                            setTimeout(() => {
                                submitBtn.innerText = "Save All Master Settings";
                                submitBtn.style.background = "";
                                submitBtn.style.color = "";
                            }, 1800);
                        }
                    }, 2000); // 2000ms = 2 Seconds Delay
                } else {
                    if (fbStatusText) fbStatusText.innerHTML = `<span class="text-warning">Saved locally only (Firebase disabled).</span>`;
                    setTimeout(() => {
                        if (submitBtn) {
                            submitBtn.innerText = "Save All Master Settings";
                            submitBtn.style.background = "";
                            submitBtn.style.color = "";
                        }
                    }, 1500);
                }
            });
        }

        // Telegram Live Test Button
        if (testTgBtn) {
            testTgBtn.addEventListener('click', async () => {
                const token = document.getElementById('cfg-tg-token').value.trim();
                const chatId = document.getElementById('cfg-tg-chatid').value.trim();

                if (!token || !chatId) {
                    tgStatus.innerHTML = `<span class="text-danger fw-bold">Enter Bot Token & Chat ID first!</span>`;
                    return;
                }

                tgStatus.innerHTML = `<span class="text-warning">Sending test alert...</span>`;

                try {
                    const message = encodeURIComponent("🚀 ApexTraders Bot: Gateway Connected Successfully!");
                    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`;

                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.ok) {
                        tgStatus.innerHTML = `<span class="text-success fw-bold">Connected! Test message sent to Telegram.</span>`;
                    } else {
                        tgStatus.innerHTML = `<span class="text-danger fw-bold">Error: ${data.description}</span>`;
                    }
                } catch (err) {
                    tgStatus.innerHTML = `<span class="text-danger fw-bold">Failed to send. Check Internet/Token.</span>`;
                }
            });
        }
    });
})();
