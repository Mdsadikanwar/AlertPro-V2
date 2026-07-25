document.addEventListener('DOMContentLoaded', () => {
    // 1. Tab Switching Logic
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab');

            // Toggle active classes on links
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Hide all tab contents and show active
            tabContents.forEach(content => {
                content.classList.add('d-none');
                content.classList.remove('active');
            });

            const activeSection = document.getElementById(`tab-${targetTab}`);
            if (activeSection) {
                activeSection.classList.remove('d-none');
                activeSection.classList.add('active');
            }

            // Trigger specific tab loaders if they exist
            if (targetTab === 'strategies' && typeof window.loadStrategies === 'function') {
                window.loadStrategies();
            }
            if (targetTab === 'bot_trading' && typeof window.loadBotTrades === 'function') {
                window.loadBotTrades();
            }
        });
    });
});
