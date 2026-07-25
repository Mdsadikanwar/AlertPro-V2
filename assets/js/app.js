document.addEventListener('DOMContentLoaded', () => {
    console.log("ApexTraders App Ready");

    const tabDropdown = document.getElementById('tab-dropdown');
    
    // Function to handle Section Visibility
    function switchTab(target) {
        document.querySelectorAll('.tab-section').forEach(sec => sec.classList.add('d-none'));

        if (target === 'bot_trading') {
            document.getElementById('bot-tab').classList.remove('d-none');
            if (typeof window.loadBotLogs === 'function') window.loadBotLogs();
        } else if (target === 'strategies') {
            document.getElementById('strategies-tab').classList.remove('d-none');
            if (typeof window.loadStrategies === 'function') window.loadStrategies();
        } else if (target === 'settings') {
            document.getElementById('settings-tab').classList.remove('d-none');
            if (typeof window.loadSettings === 'function') window.loadSettings();
        }
    }

    // Dropdown Change Listener
    if (tabDropdown) {
        tabDropdown.addEventListener('change', (e) => {
            switchTab(e.target.value);
        });
    }

    // Initial Load (Bot Trading by default)
    switchTab('bot_trading');
});
