function loadTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  let activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if(activeBtn) activeBtn.classList.add('active');
  
  if(typeof window[`render_${tabName}`] === 'function') {
    window[`render_${tabName}`]();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Page load pe check karo market select hai ya nahi
  let market = localStorage.getItem('selectedMarket');
  if(market) {
    loadMarketTabs(market);
    loadTab('dashboard');
  } else {
    loadTab('hub'); // Pehle Hub
  }
  
  setInterval(fetchCoinData, 60000);
});
