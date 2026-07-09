function loadTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  let activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if(activeBtn) activeBtn.classList.add('active');
  
  // Agar function hai to call karo
  if(typeof window[`render_${tabName}`] === 'function') {
    window[`render_${tabName}`]();
  } else {
    document.getElementById('tab-content').innerHTML = `<div class="card"><h3>Tab Not Found</h3></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => loadTab(btn.dataset.tab));
  });
  
  loadTab('hub'); // AB PEHLE HUB KHOLEGA
  setInterval(fetchCoinData, 60000);
});
