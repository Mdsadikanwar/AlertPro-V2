async function renderCryptoDashboard() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 30px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
            <h2 style="color: #38bdf8; margin-bottom: 20px;">📊 Dashboard Overview</h2>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                <div style="background: #111827; padding: 20px; border-radius: 10px; border: 1px solid #1e293b;">
                    <span style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">USDT Wallet Balance</span>
                    <h1 id="dashUSDT" style="color: #fff; margin: 10px 0 0 0;">$0.00</h1>
                </div>
                <div style="background: #111827; padding: 20px; border-radius: 10px; border: 1px solid #1e293b;">
                    <span style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">BTC Holdings</span>
                    <h1 id="dashBTC" style="color: #fff; margin: 10px 0 0 0;">0.000000 BTC</h1>
                </div>
                <div style="background: #111827; padding: 20px; border-radius: 10px; border: 1px solid #1e293b;">
                    <span style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Engine Engine Status</span>
                    <h1 style="color: #22c55e; margin: 10px 0 0 0; font-size: 24px;">ACTIVE (24x7)</h1>
                </div>
            </div>
        </div>
    `;

    // पायथन द्वारा सिंक किया हुआ बैलेंस लोड करें
    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/account_balance.json`);
        const data = await res.json();
        if (data) {
            document.getElementById('dashUSDT').innerText = `$${data.usdt || '0.00'}`;
            document.getElementById('dashBTC').innerText = `${data.btc || '0.000000'} BTC`;
        }
    } catch (e) {
        print("Error fetching balance info.");
    }
}
