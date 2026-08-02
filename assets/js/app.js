// assets/js/app.js - Navigation, Swipe Engine & Central Tab Switcher

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 ApexTraders App Engine Ready");

    const tabKeys = ['bot_trading', 'strategies', 'settings'];
    let currentTabIndex = 0;
    let autoRefreshInterval = null;

    const navButtons = document.querySelectorAll('#app-nav-tabs .nav-link');

    // Central Function to handle Section Visibility, Active Tabs & Loader Triggers
    function switchTab(targetIndex) {
        if (targetIndex < 0 || targetIndex >= tabKeys.length) return;
        currentTabIndex = targetIndex;

        const targetKey = tabKeys[targetIndex];

        // 1. Update Navigation Buttons Active State
        navButtons.forEach((btn, idx) => {
            if (idx === targetIndex) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 2. Hide All Tab Sections
        document.querySelectorAll('.tab-section').forEach(sec => sec.classList.add('d-none'));

        // 3. Clear existing auto-refresh interval on switch
        if (autoRefreshInterval) clearInterval(autoRefreshInterval);

        // 4. Activate Target Tab & Trigger Dynamic Loaders
        if (targetKey === 'bot_trading') {
            const botTab = document.getElementById('bot-tab');
            if (botTab) botTab.classList.remove('d-none');
            
            if (typeof window.loadBotLogs === 'function') {
                window.loadBotLogs();
            }

            // Auto-refresh bot trades every 5 seconds while viewing
            autoRefreshInterval = setInterval(() => {
                if (typeof window.loadBotLogs === 'function') {
                    window.loadBotLogs();
                }
            }, 5000);

        } else if (targetKey === 'strategies') {
            const stratTab = document.getElementById('strategies-tab');
            if (stratTab) stratTab.classList.remove('d-none');

            if (typeof window.loadStrategies === 'function') {
                window.loadStrategies();
            }

        } else if (targetKey === 'settings') {
            const setTab = document.getElementById('settings-tab');
            if (setTab) setTab.classList.remove('d-none');

            if (typeof window.loadSettings === 'function') {
                window.loadSettings();
            }
        }
    }

    // Nav Bar Click Listeners
    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(index);
        });
    });

    // TOUCH SWIPE SLIDING LOGIC (Smooth Left / Right Mobile Gestures)
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    const swipeContainer = document.getElementById('swipe-container');

    if (swipeContainer) {
        swipeContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        swipeContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipeGesture();
        }, { passive: true });
    }

    function handleSwipeGesture() {
        const minSwipeDistance = 60; // Minimum distance for horizontal swipe
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Ensure horizontal swipe is dominant over vertical scrolling
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
            if (diffX < 0) {
                // Swiped Left -> Move to Next Tab
                if (currentTabIndex < tabKeys.length - 1) {
                    switchTab(currentTabIndex + 1);
                }
            } else {
                // Swiped Right -> Move to Previous Tab
                if (currentTabIndex > 0) {
                    switchTab(currentTabIndex - 1);
                }
            }
        }
    }

    // Global Expose for Switching Tabs programmatically if needed
    window.apexSwitchTab = switchTab;

    // Initial App Load (Bot Trading by default)
    switchTab(0);
});
