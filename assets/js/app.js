function renderDashboard() {
    showScreen(`
        ${getNavbar()}
        <div class="card">
            <h2>Dashboard</h2>
            <p>Dashboard code yaha aayega</p>
        </div>
    `);
}

function renderTrading() {
    showScreen(`
        ${getNavbar()}
        <div class="card">
            <h2>Trading Panel</h2>
            <p style="color:#94a3b8;">Auto Trading: OFF</p>
            
            <div style="background:#1e293b; padding:15px; border-radius:10px; margin:15px 0;">
                <div>Balance: $1000.00</div>
            </div>

            <select style="width:100%; padding:10px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px; margin-bottom:15px;">
                <option>Bitcoin (BTC)</option>
                <option>Ethereum (ETH)</option>
            </select>

            <div style="background:#0f172a; height:200px; border-radius:10px; margin-bottom:15px; display:flex; align-items:center; justify-content:center; color:#94a3b8;">
                Chart Yaha Aayega
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <button onclick="alert('BUY')" style="background:#10b981; color:white; padding:14px; border:none; border-radius:8px; font-weight:700;">BUY</button>
                <button onclick="alert('SELL')" style="background:#ef4444; color:white; padding:14px; border:none; border-radius:8px; font-weight:700;">SELL</button>
            </div>
        </div>
    `);
}

function renderStrategies() {
    showScreen(`
        ${getNavbar()}
        <div class="card">
            <h2>Strategies</h2>
            <p>Yaha strategies banayenge</p>
        </div>
    `);
}

function renderBacktest() {
    showScreen(`
        ${getNavbar()}
        <div class="card">
            <h2>Backtest</h2>
            <p>Yaha backtest hoga</p>
        </div>
    `);
}
