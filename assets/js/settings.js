(function() {
    function getStoredSettings() {
        return JSON.parse(localStorage.getItem('apex_settings') || '{}');
    }

    window.loadSettings = function() {
        console.log("Loading System Settings...");
        const config = getStoredSettings();

        const firebaseInput = document.getElementById('cfg-firebase');
        const tgTokenInput = document.getElementById('cfg-tg-token');
        const tgChatInput = document.getElementById('cfg-tg-chatid');
        const binanceKeyInput = document.getElementById('cfg-binance-key');
        const binanceSecretInput = document.getElementById('cfg-binance-secret');

        if (firebaseInput) firebaseInput.value = config.firebaseUrl || '';
        if (tgTokenInput) tgTokenInput.value = config.tgToken || '';
        if (tgChatInput) tgChatInput.value = config.tgChatId || '';
        if (binanceKeyInput) binanceKeyInput.value = config.binanceKey || '';
        if (binanceSecretInput) binanceSecretInput.value = config.binanceSecret || '';
    };

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('master-settings-form');
        const testTgBtn = document.getElementById('btn-test-tg');
        const tgStatus = document.getElementById('tg-test-status');
        
        // Save Settings Event
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const newConfig = {
                    firebaseUrl: document.getElementById('cfg-firebase').value.trim(),
                    tgToken: document.getElementById('cfg-tg-token').value.trim(),
                    tgChatId: document.getElementById('cfg-tg-chatid').value.trim(),
                    binanceKey: document.getElementById('cfg-binance-key').value.trim(),
                    binanceSecret: document.getElementById('cfg-binance-secret').value.trim()
                };

                localStorage.setItem('apex_settings', JSON.stringify(newConfig));

                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.innerText;
                    submitBtn.innerText = "Saved Successfully!";
                    submitBtn.style.background = "#10b981";

                    setTimeout(() => {
                        submitBtn.innerText = originalText;
                        submitBtn.style.background = "";
                    }, 1800);
                }
            });
        }

        // Test Telegram Message Event
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
                    const message = encodeURIComponent("🚀 ApexTraders Bot: Connection Successful!");
                    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`;

                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.ok) {
                        tgStatus.innerHTML = `<span class="text-success">Message sent! Check Telegram.</span>`;
                    } else {
                        tgStatus.innerHTML = `<span class="text-danger">Error: ${data.description}</span>`;
                    }
                } catch (err) {
                    tgStatus.innerHTML = `<span class="text-danger">Failed to send. Check internet/token.</span>`;
                }
            });
        }
    });
})();
