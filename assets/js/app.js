function loadTab(tabName) {
  // Sab tabs se active class hatao
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  // Jispe click kiya usko active karo
  let activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if(activeBtn) activeBtn.classList.add('active');
  
  // Uss tab ka function call karo jaise render_dashboard()
  if(typeof window[`render_${tabName}`] === 'function') {
    window[`render_${tabName}`]();
  }
}

// YE FUNCTION BAHUT IMPORTANT HAI - Tabs pe click lagata hai
function attachTabEvents() {
  document.querySelectorAll('.tab[data-tab]').forEach(btn => {
    btn.onclick = () => loadTab(btn.dataset.tab);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Page load pe check karo market select hai ya nahi
  let market = localStorage.getItem('selectedMarket');
  if(market) {
    loadMarketTabs(market); // Tabs बना दो
    attachTabEvents();      // Tabs pe click event lagao
    loadTab('dashboard');   // सीधा Dashboard खोलो
  } else {
    loadTab('hub'); // Pehle Hub
  }
  
  setInterval(fetchCoinData, 60000); // हर 1 min पे price update
});
