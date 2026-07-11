function renderDashboard() {
  showScreen(`
    ${getNavbar()}
    <div class="card">
      <div style="text-align:center; color:#94a3b8;">BTC/USD</div>
      <div class="price">$63798.00</div>
      <div class="change">▲ 0.98% (24h)</div>
      <div style="text-align:center; margin: 10px 0;">Active: <span style="background:#10b981; padding:4px 10px; border-radius:6px;">Hiw</span></div>
    </div>
  `);
}
