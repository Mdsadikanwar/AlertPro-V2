function render_dashboard() {
  document.getElementById('tab-content').innerHTML = `
    <div class="card">
      <select class="input" id="coinSelect" onchange="changeCoin()">
        <option value="bitcoin">Bitcoin (BTC)</option>
        <option value="ethereum">Ethereum (ETH)</option>
      </select>
    </div>
    <div class="card price-box">
      <div class="price-label" id="pairLabel">BTC/USD</div>
      <div class="price-main" id="coinPrice">$0.00</div>
      <div class="price-change" id="coinChange">Loading...</div>
      <canvas id="priceChart" style="margin-top:15px; max-height:250px;"></canvas>
    </div>
  `;
  fetchCoinData();
}

function changeCoin() {
  STATE.coinId = document.getElementById('coinSelect').value;
  STATE.coinSymbol = COIN_DATA[STATE.coinId].symbol;
  saveAllToLocal(); fetchCoinData();
}
