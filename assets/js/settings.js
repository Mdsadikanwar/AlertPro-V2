(function() {
    // Helper to get settings from LocalStorage
    function getStoredSettings() {
        return JSON.parse(localStorage.getItem('apex_settings') || '{}');
    }

    // Helper to update visual Badges (Gateway Status)
    function updateGatewayBadges(config) {
        const fbBadge = document.getElementById('status-firebase-badge');
        const tgBadge = document.getElementById('status-telegram-badge');

        // Check Firebase Connection Status
        if (fbBadge) {
            if (config.firebaseUrl && config.firebaseUrl.startsWith('https://')) {
                fbBadge.className = "badge bg-success";
                fbBadge.innerText = "Connected";
            } else {
                fbBadge.className = "badge bg-danger";
                fbBadge.innerText = "Disconnected";
            }
        }

        // Check Telegram Connection Status
        if (tgBadge) {
            if (config.tgToken && config.tgChatId) {
                tgBadge.className = "badge bg-success";
                tgBadge.innerText = "Connected";
            } else {
                tgBadge.className = "badge bg-danger";
                tgBadge.innerText = "Disconnected";
            }
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

    // Master Load Function (Called on page load / tab switch)
    window.loadSettings = function() {
        console.log("Loading System Settings & Gateway Status...");
        const config = getStoredSettings();

        // Populate System & Telegram Inputs
        if (document.getElementById('cfg-firebase')) document.getElementById('cfg-firebase').value = config.firebaseUrl || '';
        if (document.getElementById('cfg-tg-token')) document.getElementById('cfg-tg-token').value = config.tgToken || '';
        if (document.getElementById('cfg-tg-chatid')) document.getElementById('cfg-tg-chatid').value = config.tgChatId || '';

        // Populate New Dedicated Exchange API Inputs
        if (document.getElementById('cfg-api-enable')) document.getElementById('cfg-api-enable').checked = config.apiEnable || false;
        if (document.getElementById('cfg-exchange-select')) document.getElementById('cfg-exchange-select').value = config.selectedExchange || 'binance';
        if (document.getElementById('cfg-api-key')) document.getElementById('cfg-api-key').value = config.apiKey || '';
        if (document.getElementById('cfg-api-secret')) document.getElementById('cfg-api-secret').value = config.apiSecret || '';

        // Populate Cron Provider Dropdown
        if (config.cronProvider && document.getElementById('cfg-cron-provider')) {
            document.getElementById('cfg-cron-provider').value = config.cronProvider;
        }

        // Populate Global Rules Switches (Default: true if undefined)
        if (document.getElementById('rule-tg-enable')) document.getElementById('rule-tg-enable').checked = config.ruleTgEnable !== false;
        if (document.getElementById('rule-autotrade-enable')) document.getElementById('rule-autotrade-enable').checked = config.ruleAutoTradeEnable !== false;
        if (document.getElementById('rule-paper-mode')) document.getElementById('rule-paper-mode').checked = config.rulePaperMode !== false;
        if (document.getElementById('rule-sltp-guard')) document.getElementById('rule-sltp-guard').checked = config.ruleSltpGuard !== false;

        // Sync API Form State (Disabled/Enabled Placeholders)
        updateApiUIState();

        // Update Status Badges
        updateGatewayBadges(config);
    };

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('master-settings-form');
        const testTgBtn = document.getElementById('btn-test-tg');
        const tgStatus = document.getElementById('tg-test-status');

        const apiToggle = document.getElementById('cfg-api-enable');
        const exchangeSelect = document.getElementById('cfg-exchange-select');

        // Dynamic listeners for API Toggle & Dropdown
        if (apiToggle) apiToggle.addEventListener('change', updateApiUIState);
        if (exchangeSelect) exchangeSelect.addEventListener('change', updateApiUIState);

        // Initial Load Call
        window.loadSettings();

        // Form Submit: Save All Master Settings
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const newConfig = {
                    // DB & Alerts
                    firebaseUrl: document.getElementById('cfg-firebase').value.trim(),
                    tgToken: document.getElementById('cfg-tg-token').value.trim(),
                    tgChatId: document.getElementById('cfg-tg-chatid').value.trim(),

                    // Dedicated Exchange API Config
                    apiEnable: document.getElementById('cfg-api-enable').checked,
                    selectedExchange: document.getElementById('cfg-exchange-select').value,
                    apiKey: document.getElementById('cfg-api-key').value.trim(),
                    apiSecret: document.getElementById('cfg-api-secret').value.trim(),

                    // Engine Cron Choice
                    cronProvider: document.getElementById('cfg-cron-provider').value,

                    // Master Rules Switches
                    ruleTgEnable: document.getElementById('rule-tg-enable').checked,
                    ruleAutoTradeEnable: document.getElementById('rule-autotrade-enable').checked,
                    rulePaperMode: document.getElementById('rule-paper-mode').checked,
                    ruleSltpGuard: document.getElementById('rule-sltp-guard').checked
                };

                // Save to localStorage
                localStorage.setItem('apex_settings', JSON.stringify(newConfig));

                // Refresh Status Badges Immediately
                updateGatewayBadges(newConfig);

                // UI Feedback on Save Button
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.innerText;
                    submitBtn.innerText = "All Configurations Saved!";
                    submitBtn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                    submitBtn.style.color = "#ffffff";

                    setTimeout(() => {
                        submitBtn.innerText = originalText;
                        submitBtn.style.background = "";
                        submitBtn.style.color = "";
                    }, 1800);
                }
            });
        }

        // Live Change Event for Cron Provider Dropdown
        const cronSelect = document.getElementById('cfg-cron-provider');
        if (cronSelect) {
            cronSelect.addEventListener('change', () => {
                const config = getStoredSettings();
                config.cronProvider = cronSelect.value;
                localStorage.setItem('apex_settings', JSON.stringify(config));
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
                        const tgBadge = document.getElementById('status-telegram-badge');
                        if (tgBadge) {
                            tgBadge.className = "badge bg-success";
                            tgBadge.innerText = "Connected";
                        }
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
