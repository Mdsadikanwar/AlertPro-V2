function render_backtest(){
  document.getElementById('tab-content').innerHTML = `
    <div class="box">
      <h3>📈 Backtest - EMA Crossover</h3>
      <select id="bcoin"><option value="bitcoin">BTC</option></select>
      <input id="days" type="number" value="90">
      <button class="btn" id="runBacktestBtn">Run Backtest</button>
      <div id="result"></div>
    </div>
  `;
  document.getElementById('runBacktestBtn').addEventListener('click', runBacktestFn);
}

async function runBacktestFn(){
  // Yaha pura backtest wala code + Telegram
}
