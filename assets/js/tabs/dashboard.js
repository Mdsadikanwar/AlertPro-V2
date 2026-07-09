function render_dashboard(){
  document.getElementById('tab-content').innerHTML = `
    <div class="box">
      <h3>📊 Live Dashboard</h3>
      <select id="coin"><option value="bitcoin">BTC</option><option value="ethereum">ETH</option></select>
      <h2 id="price">Loading...</h2>
      <p id="change"></p>
      <canvas id="priceChart"></canvas>
      <div class="box"><h3>🏆 Top 10 Coins</h3><table id="topCoins"><tr><th>Coin</th><th>Price</th><th>24h</th></tr></table></div>
    </div>
  `;
  loadCryptoData(); // Is tab ka function
}

let chart;
async function loadCryptoData(){
  // Yaha pura dashboard.js wala code
}
