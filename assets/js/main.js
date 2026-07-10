document.addEventListener('DOMContentLoaded', () => {
  render_hub();
  setupTabs();
});

function setupTabs() {
  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      loadTab(e.target.dataset.tab);
    });
  });
}

function loadTab(tabName) {
  document.getElementById('main-header').classList.remove('hidden'); // HEADER SHOW
  if(typeof stopDashboard === 'function') stopDashboard();

  if(tabName === 'dashboard') render_dashboard();
  if(tabName === 'trading') render_trading();
  if(tabName === 'strategies') render_strategies();
  if(tabName === 'backtest') render_backtest();
  if(tabName === 'settings') render_settings();
  if(tabName === 'logs') render_logs();
}

function backToHub() {
  document.getElementById('main-header').classList.add('hidden'); // HEADER HIDE
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('top-tabs').classList.add('hidden');
  render_hub();
}
