document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            tabContents.forEach(content => {
                content.classList.add('d-none');
                content.classList.remove('active');
            });

            const activeSection = document.getElementById(`tab-${targetTab}`);
            if (activeSection) {
                activeSection.classList.remove('d-none');
                activeSection.classList.add('active');
            }

            // Trigger Tab Specific Loaders
            if (targetTab === 'strategies' && typeof window.loadStrategies === 'function') window.loadStrategies();
            if (targetTab === 'dashboard' && typeof window.loadDashboard === 'function') window.loadDashboard();
            if (targetTab === 'paper_trading' && typeof window.loadPaperTrading === 'function') window.loadPaperTrading();
        });
    });
});
