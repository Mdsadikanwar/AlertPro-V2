function renderCryptoLogs() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
        ${getMarketNavbar()}
        <div id="logs-tab-marker" data-active-tab="LOGS" style="padding: 30px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
            <h2 style="color: #38bdf8; margin-bottom: 20px;">📜 Live Execution Orders</h2>
            
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 10px; padding: 20px;">
                <div id="real-api-logs-container">
                    <p style="color:#94a3b8;">Awaiting live engine handshake...</p>
                </div>
            </div>
        </div>
    `;
    fetchLiveOrderHistory();
}

async function fetchLiveOrderHistory() {
    const container = document.getElementById('real-api-logs-container');
    if (!container) return;

    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/live_trades.json`);
        const trades = await res.json();
        
        if (!trades) {
            container.innerHTML = "<p style='color:#64748b;'>No execution signals logged. Terminal idle...</p>";
            return;
        }

        let html = `<table style="width:100%; color:#fff; border-collapse:collapse; text-align:left;">
                      <tr style="border-bottom:1px solid #334155; color:#38bdf8; height:35px;">
                        <th>Timestamp</th><th>Strategy</th><th>Action</th><th>Pair</th><th>Status</th>
                      </tr>`;

        Object.keys(trades).reverse().slice(0, 15).forEach(key => {
            const t = trades[key];
            const sideColor = t.action === "BUY" ? "#22c55e" : "#ef4444";
            html += `<tr style="border-bottom:1px solid #1e293b; height:40px; font-family:monospace; font-size:13px;">
                        <td style="color:#64748b;">${t.timestamp ? t.timestamp.split('T')[1].substring(0,8) : 'N/A'}</td>
                        <td>${t.strategyName || 'Manual'}</td>
                        <td style="color:${sideColor}; font-weight:bold;">${t.action}</td>
                        <td>${t.pair}</td>
                        <td style="color:#eab308;">${t.status}</td>
                     </tr>`;
        });
        html += `</table>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = "<p style='color:#ef4444;'>Sync error.</p>";
    }
}

// वेबसाइट को क्रैश-फ्री रखने के लिए केवल हर 30 सेकंड में रिफ्रेश
setInterval(() => {
    const marker = document.getElementById('logs-tab-marker');
    if (marker) fetchLiveOrderHistory();
}, 30000);
