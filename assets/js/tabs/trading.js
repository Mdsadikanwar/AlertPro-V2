let tradeBalance = parseFloat(localStorage.getItem('balance') || "1000");
let tradeHistory = JSON.parse(localStorage.getItem('tradeHistory') || "[]");

function renderTrading() {
  showScreen(`
    ${getNavbar()}
    <div class="card">
      <div style="font-size:18px; font-weight:700; margin-bottom:15px;">Trading Panel</div>

      <div style="background:#1e293b; padding:15px; border-radius:10px; margin-bottom:15px;">
        <div style="color:#94a3b8; font-size:12px;">Available Balance</div>
        <div style="font-size:24px; font-weight:800;">$${tradeBalance.toFixed(2)} USDT</div>
      </div>

      <div style="margin-bottom:15px;">
        <div style="color:#94a3b8; font-size:12px; margin-bottom:5px;">Coin</div>
        <select id="tradeCoinSelect" style="width:100%; padding:12px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px;">
          ${top10Coins.map(c => `<option value="${c.id}">${c.name} (${c.symbol})</option>`).join('')}
        </select>
      </div>

      <div style="margin-bottom:15px;">
        <div style="color:#94a3b8; font-size:12px; margin-bottom:5px;">Amount in USDT</div>
        <input type="number" id="tradeAmount" placeholder="100" style="width:100%; padding:12px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px;">
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <button id="buyBtn" style="background:#10b981; color:white; padding:14px; border:none; border-radius:8px; font-weight:700; font-size:16px;">BUY</button>
        <button id="sellBtn" style="background:#ef4444; color:white; padding:14px; border:none; border-radius:8px; font-weight:700; font-size:16px;">SELL</button>
      </div>
    </div>

    <!-- Order History -->
    <div class="card" style="margin-top:15px;">
      <div style="font-size:16px; font-weight:700; margin-bottom:15px;">Order History</div>
      <div id="orderHistory">
        ${tradeHistory.length === 0? '<div style="color:#94a3b8; text-align:center;">No trades yet</div>' : ''}
        ${tradeHistory.map(h => `
          <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #1e293b;">
            <div>
              <div style="font-weight:600; color:${h.type === 'BUY'? '#10b981' : '#ef4444'};">${h.type} ${h.coin}</div>
              <div style="font-size:11px; color:#94a3b8;">${h.time}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:600;">$${h.amount}</div>
              <div style="font-size:11px; color:#94a3b8;">@${h.price}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `);

  document.getElementById('buyBtn').onclick = () => placeTrade('BUY');
  document.getElementById('sellBtn').onclick = () => placeTrade('SELL');
}

async function placeTrade(type) {
  const coinId = document.getElementById('tradeCoinSelect').value;
  const amount = parseFloat(document.getElementById('tradeAmount').value);
  const coin = top10Coins.find(c => c.id === coinId);

  if(!amount || amount <= 0){
    alert("Enter valid amount");
    return;
  }

  // Get current price
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
  const data = await res.json();
  const price = data[coinId].usd;

  if(type === "BUY" && amount > tradeBalance){
    alert("Insufficient Balance");
    return;
  }

  // Update balance
  if(type === "BUY") tradeBalance -= amount;
  if(type === "SELL") tradeBalance += amount;
  localStorage.setItem('balance', tradeBalance);

  // Save to history
  tradeHistory.unshift({
    type: type,
    coin: coin.symbol,
    amount: amount.toFixed(2),
    price: price.toFixed(2),
    time: new Date().toLocaleString()
  });
  tradeHistory = tradeHistory.slice(0, 5);
  localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));

  alert(`${type} Order Placed for ${coin.name} - $${amount}`);
  renderTrading(); // Refresh
}
