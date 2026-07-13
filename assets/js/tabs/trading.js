function renderTrading() {
    showScreen(getNavbar() + `
      <div class="container">
        <h1>💵 Trading</h1>
        <div class="card">
          <h3>Current Coin: BTC/USDT</h3>
          <div>Price: $<span id="tradePrice">${livePrices.btc.usdt.toFixed(2)}</span></div>
          <input id="tradeAmount" type="number" placeholder="Amount in USDT" value="100">
          <div style="margin-top:10px;">
            <button onclick="buyCoin()" style="background:#10b981;">BUY</button>
            <button onclick="sellCoin()" style="background:#ef4444;">SELL</button>
          </div>
        </div>
      </div>
    `);
    updateTradePrice();
}

let currentCoin = 'btc';
let tradeAmount = 100;

function updateTradePrice(){
    document.getElementById('tradePrice').innerText = livePrices[currentCoin].usdt.toFixed(2);
    tradeAmount = document.getElementById('tradeAmount').value || 100;
    setTimeout(updateTradePrice, 2000);
}

function buyCoin(){
    tradeAmount = document.getElementById('tradeAmount').value;
    
    // YE LINE NAYI ADD KI
    addToHistory('BUY', currentCoin, livePrices[currentCoin].usdt, tradeAmount);
    
    alert(`BUY Order Placed: ${tradeAmount} USDT of ${currentCoin.toUpperCase()}`);
    renderHistory(); // direct history page pe bhej de
}

function sellCoin(){
    tradeAmount = document.getElementById('tradeAmount').value;

    // YE LINE NAYI ADD KI
    addToHistory('SELL', currentCoin, livePrices[currentCoin].usdt, tradeAmount);

    alert(`SELL Order Placed: ${tradeAmount} USDT of ${currentCoin.toUpperCase()}`);
    renderHistory(); // direct history page pe bhej de
}
