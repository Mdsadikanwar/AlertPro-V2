(function() {
    // Helper to get settings
    function getStoredSettings() {
        return JSON.parse(localStorage.getItem('apex_settings') || '{}');
    }

    // Helper to update visual Badges (Gateway Status)
    function updateGatewayBadges(config) {
        const fbBadge = document.getElementById('status-firebase-badge');
        const tgBadge = document.getElementById('status-telegram-badge');

        // Check Firebase
        if (fbBadge) {
            if (config.firebaseUrl && config.firebaseUrl.startsWith('https://')) {
                fbBadge.className = "badge bg-success";
                fbBadge.innerText = "Connected";
            } else {
                fbBadge.className = "badge bg-danger";
                fbBadge.innerText = "Disconnected";
            }
        }

        // Check Telegram
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

    // Master Load Function
    window.loadSettings = function() {
        console.log("Loading System Settings & Gateway Status...");
        const config = getStoredSettings();

        // Populate API Fields
        document.getElementById('cfg-firebase').value = config.firebaseUrl || '';
        document.getElementById('cfg-tg-token').value = config.tgToken || '';
        document.getElementById('cfg-tg-chatid').value = config.tgChatId || '';
        document.getElementById('cfg-binance-key').value = config.binanceKey || '';
        document.getElementById('cfg-binance-secret').value = config.binanceSecret || '';

        // Populate Cron Provider Dropdown
        if (config.cronProvider) {
            document.getElementById('cfg-cron-provider').value = config.cronProvider;
        }

        // Populate Global Rules Switches (Default: true if undefined)
        document.getElementById('rule-tg-enable').checked = config.ruleTgEnable !== false;
        document.getElementById('rule-autotrade-enable').checked = config.ruleAutoTradeEnable !== false;
        document.getElementById('rule-paper-mode').checked = config.rulePaperMode !== false;
        document.getElementById('rule-sltp-guard').checked = config.ruleSltpGuard !== false;

        // Update Badges UI
        updateGatewayBadges(config);
    };

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('master-settings-form');
        const testTgBtn = document.getElementById('btn-test-tg');
        const tgStatus = document.getElementById('tg-test-status');

        // Form Submit: Save Credentials + Rules
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const newConfig = {
                    firebaseUrl: document.getElementById('cfg-firebase').value.trim(),
                    tgToken: document.getElementById('cfg-tg-token').value.trim(),
                    tgChatId: document.getElementById('cfg-tg-chatid').value.trim(),
                    binanceKey: document.getElementById('cfg-binance-key').value.trim(),
                    binanceSecret: document.getElementById('cfg-binance-secret').value.trim(),
                    
                    // Save Cron Engine Choice
                    cronProvider: document.getElementById('cfg-cron-provider').value,

                    // Save Master Switches
                    ruleTgEnable: document.getElementById('rule-tg-enable').checked,
                    ruleAutoTradeEnable: document.getElementById('rule-autotrade-enable').checked,
                    rulePaperMode: document.getElementById('rule-paper-mode').checked,
                    ruleSltpGuard: document.getElementById('rule-sltp-guard').checked
                };

                localStorage.setItem('apex_settings', JSON.stringify(newConfig));

                // Refresh Status Badges Immediately
                updateGatewayBadges(newConfig);

                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.innerText;
                    submitBtn.innerText = "All Configurations Saved!";
                    submitBtn.style.background = "#10b981";

                    setTimeout(() => {
                        submitBtn.innerText = originalText;
                        submitBtn.style.background = "";
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
                    tgStatus.innerHTML = `<span class="text-danger">Enter Bot Token & Chat ID first!</span>`;
                    return;
                }

                tgStatus.innerHTML = `<span class="text-warning">Sending test alert...</span>`;

                try {
                    const message = encodeURIComponent("🚀 ApexTraders Bot: Gateway Connected Successfully!");
                    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`;

                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.ok) {
                        tgStatus.innerHTML = `<span class="text-success">Connected! Test message sent to Telegram.</span>`;
                        // Update Telegram badge to success
                        const tgBadge = document.getElementById('status-telegram-badge');
                        if (tgBadge) {
                            tgBadge.className = "badge bg-success";
                            tgBadge.innerText = "Connected";
                        }
                    } else {
                        tgStatus.innerHTML = `<span class="text-danger">Error: ${data.description}</span>`;
                    }
                } catch (err) {
                    tgStatus.innerHTML = `<span class="text-danger">Failed to send. Check Internet/Token.</span>`;
                }
            });
        }
    });
})();
