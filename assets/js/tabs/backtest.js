function render_backtest(){
  document.getElementById('tab-content').innerHTML = `
    <div class="box">
      <h3>📈 Backtest - EMA Crossover</h3>
      <label>Coin</label>
      <select id="bcoin"><option value="bitcoin">BTC</option><option value="ethereum">ETH</option></select>
      <label>Days</label>
      <input id="days" type="number" value="90">
      <button class="btn" id="runBacktestBtn">Run Backtest</button>
      <div id="result" style="margin-top:15px; padding:10px; background:var(--bg); border-radius:6px;">Click Run to see result</div>
    </div>
  `;
  document.getElementById('runBacktestBtn').addEventListener('click', runBacktestFn);
}

async function runBacktestFn(){ /* पिछला वाला backtest code */ }
