async function renderCryptoDashboard() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 30px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
            <h2 style="color: #38bdf8; margin-bottom: 20px;">📊 JS Engine Dashboard</h2>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
                <div style="background: #111827; padding: 20px; border-radius: 10px; border: 1px solid #1e293b;">
                    <span style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Engine Status</span>
                    <h1 style="color: #22c55e; margin: 10px 0 0 0; font-size: 24px;">🟢 JS ENGINE ACTIVE</h1>
                </div>
                <div style="background: #111827; padding: 20px; border-radius: 10px; border: 1px solid #1e293b;">
                    <span style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">System Mode</span>
                    <h1 style="color: #fff; margin: 10px 0 0 0; font-size: 24px;">100% Cloud / No Python</h1>
                </div>
            </div>
        </div>
    `;
}
