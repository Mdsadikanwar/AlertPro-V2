document.addEventListener('DOMContentLoaded', () => {
    console.log("ApexTraders App Ready");

    const tabKeys = ['bot_trading', 'strategies', 'settings'];
    const tabSectionIds = ['bot-tab', 'strategies-tab', 'settings-tab'];
    let currentTabIndex = 0;

    const navButtons = document.querySelectorAll('#app-nav-tabs .nav-link');

    // Function to handle Section Visibility & Tab State
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

        // 2. Toggle Tab Content Sections
        document.querySelectorAll('.tab-section').forEach(sec => sec.classList.add('d-none'));

        if (targetKey === 'bot_trading') {
            document.getElementById('bot-tab').classList.remove('d-none');
            if (typeof window.loadBotLogs === 'function') window.loadBotLogs();
        } else if (targetKey === 'strategies') {
            document.getElementById('strategies-tab').classList.remove('d-none');
            if (typeof window.loadStrategies === 'function') window.loadStrategies();
        } else if (targetKey === 'settings') {
            document.getElementById('settings-tab').classList.remove('d-none');
            if (typeof window.loadSettings === 'function') window.loadSettings();
        }
    }

    // Nav Bar Click Listeners
    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            switchTab(index);
        });
    });

    // TOUCH SWIPE SLIDING LOGIC (Left / Right Swipe Gesture)
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
        const minSwipeDistance = 50; // Minimum horizontal swipe in px
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Ensure horizontal swipe is dominant (not vertical scrolling)
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

    // Initial Load (Bot Trading by default)
    switchTab(0);
});
