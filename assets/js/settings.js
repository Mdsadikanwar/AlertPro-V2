// Master Settings Module
(function() {
    // Helper to get saved config
    function getStoredSettings() {
        return JSON.parse(localStorage.getItem('apex_settings') || '{}');
    }

    // Load Settings into Input Fields
    window.loadSettings = function() {
        console.log("Loading System Settings...");
        const config = getStoredSettings();

        const firebaseInput = document.getElementById('cfg-firebase');
        const tgTokenInput = document.getElementById('cfg-tg-token');
        const tgChatInput = document.getElementById('cfg-tg-chatid');

        if (firebaseInput) firebaseInput.value = config.firebaseUrl || '';
        if (tgTokenInput) tgTokenInput.value = config.tgToken || '';
        if (tgChatInput) tgChatInput.value = config.tgChatId || '';
    };

    // Save Settings Form Event Listener
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('master-settings-form');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const newConfig = {
                    firebaseUrl: document.getElementById('cfg-firebase').value.trim(),
                    tgToken: document.getElementById('cfg-tg-token').value.trim(),
                    tgChatId: document.getElementById('cfg-tg-chatid').value.trim()
                };

                // Save to localStorage
                localStorage.setItem('apex_settings', JSON.stringify(newConfig));

                // Quick feedback
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.innerText;
                    submitBtn.innerText = "Saved Successfully!";
                    submitBtn.classList.replace('btn-accent', 'btn-success');

                    setTimeout(() => {
                        submitBtn.innerText = originalText;
                        submitBtn.classList.replace('btn-success', 'btn-accent');
                    }, 1800);
                }
            });
        }
    });
})();
