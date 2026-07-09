document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContent = document.getElementById('tab-content');

  function loadTab(tabName) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Har tab ka apna render function call hoga
    window[`render_${tabName}`]();
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => loadTab(btn.dataset.tab));
  });

  loadTab('dashboard'); // Default pehla tab
});
