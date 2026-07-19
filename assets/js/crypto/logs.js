async function renderCryptoLogs() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div style="padding: 30px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
            <h2 style="color: #38bdf8; margin-bottom: 20px;">📜 Live Execution Logs</h2>
            <div id="logTerminal" style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; font-family: monospace; font-size: 13px; color: #38bdf8; height: 300px; overflow-y: auto;">
                [SYSTEM] ApexTraders JS Cluster Loaded... Ready.<br>
                [SYSTEM] Python Core Removed. Web Loop initialized every 10 seconds.
            </div>
        </div>
    `;
}
