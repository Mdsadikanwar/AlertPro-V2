function render_dashboard(){
  document.getElementById('tab-content').innerHTML = `
    <div class="box">
      <h3>📊 Live Price & Chart</h3>
      <select id="coin">
        <option value="bitcoin">BTC - Bitcoin</option>
        <option value="ethereum">ETH - Ethereum</option>
        <option value="solana">SOL - Solana</option>
      </select>
      <h2 id="price" style="color:var(--accent); font-size:28px;">$62,850</h2>
      <canvas id="priceChart"></canvas>
    </div>
  `;
  loadCryptoData();
}

let chart;
async function loadCryptoData(){
  let coin = document.getElementById('coin').value;
  let res1 = await fetch(`${CONFIG.COINGECKO_API}/coins/${coin}`);
  let data1 = await res1.json();
  document.getElementById('price').innerText = '$' + data1.market_data.current_price.usd.toLocaleString();

  let res2 = await fetch(`${CONFIG.COINGECKO_API}/coins/${coin}/market_chart?vs_currency=usd&days=7`);
  let data2 = await res2.json();
  let prices = data2.prices.map(p => p[1]);
  let labels = data2.prices.map(p => new Date(p[0]).toLocaleDateString());

  if(chart) chart.destroy();
  chart = new Chart(document.getElementById('priceChart'), {
    type: 'line',
    data: { labels, datasets: [{ data: prices, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.3 }] },
    options: { plugins: { legend: { display: false } }
  });
}
document.getElementById('coin')?.addEventListener('change', loadCryptoData);
