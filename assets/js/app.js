document.addEventListener('DOMContentLoaded', () => {
    console.log("ApexTraders App Initialized");

    // Tab Switching Logic with Dynamic JS Function Triggers
    const tabButtons = document.querySelectorAll('#mainTab button[data-bs-toggle="tab"]');

    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', (event) => {
            const targetTab = event.target.getAttribute('data-tab');
            console.log("Tab Switched To:", targetTab);

            // Trigger Specific Module Loads based on Tab Clicked
            switch(targetTab) {
                case 'dashboard':
                    if (typeof window.loadDashboard === 'function') window.loadDashboard();
                    break;
                case 'strategies':
                    if (typeof window.loadStrategies === 'function') window.loadStrategies();
                    break;
                case 'paper_trading':
                    if (typeof window.loadPaperTrading === 'function') window.loadPaperTrading();
                    break;
                case 'bot_trading':
                    if (typeof window.loadBotLogs === 'function') window.loadBotLogs();
                    break;
                case 'backtest':
                    if (typeof window.loadBacktest === 'function') window.loadBacktest();
                    break;
                case 'settings':
                    if (typeof window.loadSettings === 'function') window.loadSettings();
                    break;
            }
        });
    });

    // Initial Load for Dashboard
    if (typeof window.loadDashboard === 'function') {
        window.loadDashboard();
    }
});
