<div id="dashboard">
  <div class="card">
    <div class="select-row">
      <select class="input" id="coinSelect" onchange="changeCoin()">
        <option value="bitcoin">Bitcoin (BTC)</option>
        <option value="ethereum">Ethereum (ETH)</option>
        <option value="binancecoin">BNB (BNB)</option>
        <option value="solana">Solana (SOL)</option>
        <option value="dogecoin">Dogecoin (DOGE)</option>
      </select>
      <select class="input" id="currencySelect" onchange="updatePrices()" style="max-width: 120px;">
        <option value="usd">USD</option>
        <option value="inr">INR</option>
      </select>
    </div>
  </div>

  <div class="card price-box">
    <div class="price-label" id="pairLabel">BTC/USD</div>
    <div class="price-main" id="coinPrice">$64079.00</div>
    <div class="price-change green" id="coinChange">▲ 1.63% (24h)</div>
    <div style="margin-top:8px;font-size:12px;color:#64748b;" id="countdown">Cooldown: 62s</div>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-label">24h High</div>
        <div class="stat-value" id="high24h">$64554.00</div>
      </div>
      <div class="stat">
        <div class="stat-label">24h Low</div>
        <div class="stat-value" id="low24h">$62618.00</div>
      </div>
    </div>
  </div>
</div>
