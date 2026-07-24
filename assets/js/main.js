document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab');

            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Hide all tabs & show target
            tabContents.forEach(tab => {
                if (tab.id === `tab-${targetTab}`) {
                    tab.classList.remove('d-none');
                } else {
                    tab.classList.add('d-none');
                }
            });
        });
    });
});
