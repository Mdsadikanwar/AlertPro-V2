// Global State Balance Reference
var cryptoBalance = { usdt: 10000, btc: 0.15, eth: 1.2 };

// Crypto Trading tab render function
function renderCryptoTrading() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <div style="margin-bottom: 20px;">
        <h2 style="color: #38bdf8; margin: 0;">Crypto Trading Desk</h2>
        <p style="color: #94a3b8; margin: 5px 0 0 0;">Buy and sell digital assets instantly</p>
      </div>

      <!-- Account Balance & Asset Stats -->
      <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
        
        <div style="flex: 1; min-width: 200px; background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0;">USDT Balance</h4>
          <h2 style="color: #22c55e; margin: 0; font-size: 24px;">$${cryptoBalance.usdt.toFixed(2)}</h2>
        </div>

        <div style="flex: 1; min-width: 200px; background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0;">BTC Holdings</h4>
          <h2 style="color: #38bdf8; margin: 0; font-size: 24px;">${cryptoBalance.btc} BTC</h2>
        </div>

        <div style="flex: 1; min-width: 200px; background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #374151;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0;">ETH Holdings</h4>
          <h2 style="color: #a855f7; margin: 0; font-size: 24px;">${cryptoBalance.eth} ETH</h2>
        </div>

      </div>

      <!-- Main Trading Form Panel -->
      <div style="background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #374151; max-width: 600px; margin: 0 auto;">
        <h3 style="color: #fff; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #374151; padding-bottom: 10px;">Place Instant Order</h3>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; color: #94a3b8; margin-bottom: 8px;">Select Coin</label>
          <select id="tradeCoin" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff;">
            <option value="btc">Bitcoin (BTC) - Price: $65,000</option>
            <option value="eth">Ethereum (ETH) - Price: $3,500</option>
            <option value="sol">Solana (SOL) - Price: $150</option>
          </select>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: block; color: #94a3b8; margin-bottom: 8px;">Order Type</label>
          <div style="display: flex; gap: 10px;">
            <button id="buyBtn" onclick="setOrderSide('BUY')" style="flex: 1; padding: 12px; background: #22c55e; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; opacity: 1;">BUY</button>
            <button id="sellBtn" onclick="setOrderSide('SELL')" style="flex: 1; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; opacity: 0.5;">SELL</button>
          </div>
          <input type="hidden" id="orderSide" value="BUY">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; color: #94a3b8; margin-bottom: 8px;">Amount (in Coins)</label>
          <input type="number" id="tradeAmount" placeholder="0.00" step="any" min="0" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; box-sizing: border-box;">
        </div>

        <button onclick="executeCryptoOrder()" style="width: 100%; padding: 14px; background: #38bdf8; color: #0f172a; border: none; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer;">Execute Order</button>
      </div>

    </div>
  `;
}

// Side selector toggler
function setOrderSide(side) {
  document.getElementById('orderSide').value = side;
  const buyBtn = document.getElementById('buyBtn');
  const sellBtn = document.getElementById('sellBtn');
  
  if (side === 'BUY') {
    buyBtn.style.opacity = '1';
    sellBtn.style.opacity = '0.5';
  } else {
    buyBtn.style.opacity = '0.5';
    sellBtn.style.opacity = '1';
  }
}

// Trade Simulation Handler
function executeCryptoOrder() {
  const coin = document.getElementById('tradeCoin').value;
  const side = document.getElementById('orderSide').value;
  const amount = parseFloat(document.getElementById('tradeAmount').value);
  
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount!");
    return;
  }

  let price = 0;
  if (coin === 'btc') price = 65000;
  if (coin === 'eth') price = 3500;
  if (coin === 'sol') price = 150;

  const totalCost = amount * price;

  if (side === 'BUY') {
    if (cryptoBalance.usdt < totalCost) {
      alert("Insufficient USDT Balance!");
      return;
    }
    cryptoBalance.usdt -= totalCost;
    cryptoBalance[coin] += amount;
  } else {
    if (cryptoBalance[coin] < amount) {
      alert(`Insufficient ${coin.toUpperCase()} Balance!`);
      return;
    }
    cryptoBalance[coin] -= amount;
    cryptoBalance.usdt += totalCost;
  }

  alert(`Order Placed successfully!\n${side} ${amount} ${coin.toUpperCase()} @ $${price}`);
  renderCryptoTrading(); // Page refresh to show updated balance
}
