document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    const paperContainer = document.getElementById('tab-paper_trading');

    window.loadPaperTrading = async function() {
        if (!paperContainer) return;

        try {
            // Fetch trades from Firebase to calculate paper P&L
            const res = await fetch(`${FIREBASE_URL}/bot_trades.json`);
            const trades = await res.json() || {};
            const tradeEntries = Object.values(trades);

            let virtualBalance = 10000.00; // Starting Capital
            let totalProfit = 0;

            tradeEntries.forEach(t => {
                totalProfit += parseFloat(t.pnl || 0);
            });

            const currentBalance = virtualBalance + totalProfit;

            paperContainer.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4 class="m-0"><i class="fa-solid fa-wallet text-info me-2"></i>Paper Trading Simulator</h4>
                    <span class="badge bg-info text-dark fw-bold px-3 py-2">SIMULATED MODE</span>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="card bg-black text-white border-secondary p-3">
                            <span class="text-muted small">Virtual Starting Capital</span>
                            <h3 class="m-0 font-monospace text-light">$10,000.00</h3>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-black text-white border-secondary p-3">
                            <span class="text-muted small">Current Balance</span>
                            <h3 class="m-0 font-monospace ${currentBalance >= 10000 ? 'text-success' : 'text-danger'}">
                                $${currentBalance.toFixed(2)}
                            </h3>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-black text-white border-secondary p-3">
                            <span class="text-muted small">Total Simulated P&L</span>
                            <h3 class="m-0 font-monospace ${totalProfit >= 0 ? 'text-success' : 'text-danger'}">
                                ${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}
                            </h3>
                        </div>
                    </div>
                </div>

                <div class="card bg-black border-secondary p-3">
                    <h5 class="text-warning mb-3"><i class="fa-solid fa-list-check me-2"></i>Simulated Trade Executions</h5>
                    <div class="table-responsive">
                        <table class="table table-dark table-hover align-middle m-0">
                            <thead>
                                <tr class="text-muted">
                                    <th>Time</th>
                                    <th>Symbol</th>
                                    <th>Type</th>
                                    <th>Execution Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tradeEntries.length === 0 ? `
                                    <tr>
                                        <td colspan="5" class="text-center text-muted py-4">
                                            No simulated trades executed yet. Run strategies to test paper performance.
                                        </td>
                                    </tr>
                                ` : tradeEntries.reverse().slice(0, 10).map(t => `
                                    <tr>
                                        <td class="small text-muted">${new Date(t.timestamp).toLocaleTimeString()}</td>
                                        <td><span class="badge bg-dark border border-secondary">${t.symbol}</span></td>
                                        <td><span class="badge ${t.type === 'BUY' ? 'bg-success' : 'bg-danger'}">${t.type}</span></td>
                                        <td class="fw-bold">$${parseFloat(t.price).toFixed(2)}</td>
                                        <td><span class="badge bg-soft-success text-success"><i class="fa-solid fa-check me-1"></i>Filled</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (err) {
            console.warn("Paper trading load warning:", err);
        }
    };

    window.loadPaperTrading();
});
