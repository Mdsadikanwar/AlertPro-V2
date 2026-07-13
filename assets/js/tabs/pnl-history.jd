// pnl-history.js
let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || []; // save रहे इसलिए localStorage

function renderHistory() {
    let totalPNL = orderHistory.reduce((sum, order) => sum + order.pnl, 0);

    showScreen(getNavbar() + `
      <div class="container">
        <h1>PNL & History</h1>

        <div class="card" style="text-align:center; margin-bottom:20px;">
          <div style="color:#94a3b8; font-size:14px;">Total PNL</div>
          <div style="font-size:32px; font-weight:800; color:${totalPNL >= 0? '#10b981' : '#ef4444'}">
            ${totalPNL >= 0? '+' : ''}$${totalPNL.toFixed(2)}
          </div>
          <button onclick="clearHistory()" style="margin-top:10px; padding:6px 12px; background:#334155; color:white; border:none; border-radius:6px; font-size:12px;">Clear History</button>
        </div>

        <div class="card">
          <h3 style="margin-bottom:15px;">Order History</h3>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="border-bottom:1px solid #334155; color:#94a3b8; font-size:12px;">
                  <th style="padding:10px; text-align:left;">Time</th>
                  <th style="padding:10px; text-align:left;">Type</th>
                  <th style="padding:10px; text-align:left;">Coin</th>
                  <th style="padding:10px; text-align:right;">Price</th>
                  <th style="padding:10px; text-align:right;">Amount</th>
                  <th style="padding:10px; text-align:right;">PNL</th>
                </tr>
              </thead>
              <tbody>
                ${orderHistory.length === 0?
                  `<tr><td colspan="6" style="text-align:center; padding:20px; color:#64748b;">No trades yet</td></tr>` :
                  orderHistory.map(order => `
                    <tr style="border-bottom:1px solid #1e293b;">
                      <td style="padding:10px; font-size:12px;">${order.time}</td>
                      <td style="padding:10px; color:${order.type === 'BUY'? '#10b981' : '#ef4444'}; font-weight:600;">${order.type}</td>
                      <td style="padding:10px;">${order.coin.toUpperCase()}</td>
                      <td style="padding:10px; text-align:right;">$${order.price.toFixed(2)}</td>
                      <td style="padding:10px; text-align:right;">$${order.amount}</td>
                      <td style="padding:10px; text-align:right; color:${order.pnl >= 0? '#10b981' : '#ef4444'}">$${order.pnl.toFixed(2)}</td>
                    </tr>
                  `).join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `);
}

function clearHistory(){
  orderHistory = [];
  localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
  renderHistory();
}

// ये function trading.js से call होगा
function addToHistory(type, coin, price, amount){
  orderHistory.unshift({
    type: type,
    coin: coin,
    price: price,
    amount: amount,
    time: new Date().toLocaleString(),
    pnl: 0 // अभी 0, TP/SL में calculate करेंगे
  });
  localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
}
