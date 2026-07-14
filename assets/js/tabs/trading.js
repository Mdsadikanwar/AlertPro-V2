var selectedCoin = 'btc';
var tradeAmount = 100;
var tradeType = 'BUY';

function renderTrading() {
  showScreen(`${getNavbar()}
    <div class="container">
      <div class="card">
        <h3>💵 Trading Terminal</h3>
        <p>Live Trading with ${tradeBalance.usdt.toFixed(2)} USDT</p>
      </div>

      <div class="card">
        <h4>Select Coin</h4>
        <div style="display:flex; gap:10px;">
          <button onclick="selectCoin('btc')" class="btn ${selectedCoin=='btc'?'active':''}">BTC</button>
          <button onclick="selectCoin('eth')" class="btn ${selectedCoin=='eth'?'active':''}">ETH</button>
          <button onclick="selectCoin('sol')" class="btn ${selectedCoin=='sol'?'active':''}">SOL</button>
        </div>
      </div>

      <div class="card">
        <h4>Live Price: $${livePrices[selectedCoin]?.usdt?.toFixed(2) || '0.00'}</h4>
        <div id="activeStrategyText" style="color:#22c55e; margin:10px 0; font-size:14px;">No Active Strategy</div>
        <p style="color:#94a3b8; font-size:12px;">Amount in USDT</p>
        <input type="number" id="tradeAmountInput" value="${tradeAmount}" oninput="tradeAmount=this.value" style="width:100%; padding:10px; background:#1f2937; border:1px solid #374151; color:white; border-radius:6px; margin-bottom:10px;">

        <div style="display:flex; gap:10px;">
          <button onclick="placeTrade('BUY')" style="flex:1; background:#22c55e; color:white; border:none; padding:12px; border-radius:6px; font-weight:600;">BUY</button>
          <button onclick="placeTrade('SELL')" style="flex:1; background:#ef4444; color:white; border:none; padding:12px; border-radius:6px; font-weight:600;">SELL</button>
        </div>
      </div>

      <div class="card">
        <h4>Your Holdings</h4>
        <p>BTC: ${(tradeBalance.btc || 0).toFixed(4)}</p>
        <p>ETH: ${(tradeBalance.eth || 0).toFixed(4)}</p>
        <p>SOL: ${(tradeBalance.sol || 0).toFixed(4)}</p>
      </div>
    </div>
  `);
}

function selectCoin(coin){
    selectedCoin = coin;
    renderTrading();
}

function placeTrade(type){
    let price = livePrices[selectedCoin].usdt;
    let amount = parseFloat(tradeAmount);

    if(amount <= 0){
        alert("Enter valid amount");
        return;
    }

    if(type == 'BUY'){
        if(tradeBalance.usdt >= amount){
            tradeBalance.usdt -= amount;
            tradeBalance[selectedCoin] = (tradeBalance[selectedCoin] || 0) + (amount / price);
            addToHistory('BUY', selectedCoin, price, amount);
            alert(`${type} Order Placed: ${amount} USDT of ${selectedCoin.toUpperCase()}`);
        } else {
            alert("Not enough USDT balance");
        }
    } else {
        if((tradeBalance[selectedCoin] || 0) >= (amount / price)){
            tradeBalance.usdt += amount;
            tradeBalance[selectedCoin] -= (amount / price);
            addToHistory('SELL', selectedCoin, price, amount);
            alert(`${type} Order Placed: ${amount} USDT of ${selectedCoin.toUpperCase()}`);
        } else {
            alert(`Not enough ${selectedCoin.toUpperCase()} balance`);
        }
    }
    renderTrading();
}

// YE WALA FUNCTION FIX KIYA HAI
function updateActiveStrategyText(text){
    let el = document.getElementById('activeStrategyText'); // <- NULL CHECK
    if(el){
        el.innerText = text;
    }
}
