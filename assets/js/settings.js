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
    });
})();
