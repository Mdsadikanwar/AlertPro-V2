function loadTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  window[`render_${tabName}`]();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => loadTab(btn.dataset.tab));
  });
  loadTab('dashboard');
  setInterval(fetchCoinData, 60000);
});
