function loadTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  let activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if(activeBtn) activeBtn.classList.add('active');
  
  if(typeof window[`render_${tabName}`] === 'function') {
    window[`render_${tabName}`]();
  }
}

// YE NAYA FUNCTION ADD KARO - Tabs pe click lagane ke liye
function attachTabEvents() {
  document.querySelectorAll('.tab[data-tab]').forEach(btn => {
    btn.onclick = () => loadTab(btn.dataset.tab); // purana event hata ke naya lagao
  });
}

document.addEventListener('DOMContentLoaded', () => {
  let market = localStorage.getItem('selectedMarket');
  if(market) {
    loadMarketTabs(market); 
    attachTabEvents(); // yahan bhi lagao
    loadTab('dashboard');
  } else {
    loadTab('hub');
  }
  
  setInterval(fetchCoinData, 60000);
});
