document.addEventListener('DOMContentLoaded', () => {
    console.log("ApexTraders Bot Engine Ready");

    // Load active tab data on start
    if (typeof window.loadStrategies === 'function') {
        window.loadStrategies();
    }

    // Switch Tab Listener
    const tabButtons = document.querySelectorAll('#mainTab button[data-bs-toggle="tab"]');
    
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', (event) => {
            const targetTab = event.target.getAttribute('data-tab');
            
            if (targetTab === 'strategies' && typeof window.loadStrategies === 'function') {
                window.loadStrategies();
            }
            if (targetTab === 'bot_trading' && typeof window.loadBotLogs === 'function') {
                window.loadBotLogs();
            }
            if (targetTab === 'settings' && typeof window.loadSettings === 'function') {
                window.loadSettings();
            }
        });
    });
});
