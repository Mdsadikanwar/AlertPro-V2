function renderHistory() {
    let totalPNL = orderHistory.reduce((sum, order) => sum + order.pnl, 0);
    let rows = orderHistory.map(o => `
        <tr>
          <td>${o.time}</td>
          <td style="color:${o.type==='BUY'?'#10b981':'#ef4444'}">${o.type}</td>
          <td>${o.coin.toUpperCase()}</td>
          <td>$${o.price.toFixed(2)}</td>
          <td>$${o.amount}</td>
        </tr>
    `).join('');

    showScreen(getNavbar() + `
      <div class="container">
        <h1>💰 PNL & History</h1>
        <div class="card" style="text-align:center;">
          <div style="color:#94a3b8;">Total PNL</div>
          <div style="font-size:32px; font-weight:800; color:${totalPNL >= 0? '#10b981' : '#ef4444'}">
            ${totalPNL >= 0? '+' : ''}$${totalPNL.toFixed(2)}
          </div>
          <button onclick="clearHistory()" style="margin-top:10px;">Clear All</button>
        </div>
        <div class="card">
          <h3>Order History</h3>
          <table width="100%">${rows || '<tr><td>No trades yet</td></tr>'}</table>
        </div>
      </div>
    `);
}
