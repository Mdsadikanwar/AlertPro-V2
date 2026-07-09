function render_dashboard(){
  document.getElementById('tab-content').innerHTML = `
    <div class="box">
      <h3>📊 Live Price & Chart</h3>
      <select id="coin"><option value="bitcoin">BTC</option><option value="ethereum">ETH</option></select>
      <h2 id="price">Loading...</h2>
      <canvas id="priceChart"></canvas>
    </div>
  `;
  loadCryptoData();
  document.getElementById('coin').addEventListener('change', loadCryptoData);
}

let chart;
async function loadCryptoData(){
  let coin = document.getElementById('coin').value;
  let res = await fetch(`${CONFIG.COINGECKO_API}/coins/${coin}`);
  let data = await res.json();
  document.getElementById('price').innerText = '$' + data.market_data.current_price.usd.toLocaleString();
}
