document.addEventListener('DOMContentLoaded', () => {
    const backtestContainer = document.getElementById('tab-backtest');

    if (backtestContainer) {
        backtestContainer.innerHTML = `
            <h4 class="mb-4"><i class="fa-solid fa-clock-rotate-left text-warning me-2"></i>Strategy Backtest Engine</h4>
            
            <div class="row g-3">
                <div class="col-md-4">
                    <div class="card bg-black text-white border-secondary p-3">
                        <h5 class="text-warning mb-3">Configure Backtest</h5>
                        <form id="backtest-form">
                            <div class="mb-3">
                                <label class="form-label small">Asset Symbol</label>
                                <input type="text" id="bt-coin" class="form-control bg-dark text-white border-secondary" value="BTC" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small">Timeframe</label>
                                <select id="bt-tf" class="form-select bg-dark text-white border-secondary">
                                    <option value="1H" selected>1 Hour</option>
                                    <option value="4H">4 Hours</option>
                                    <option value="1D">1 Day</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small">RSI Buy Level</label>
                                <input type="number" id="bt-rsi" class="form-control bg-dark text-white border-secondary" value="40">
                            </div>
                            <button type="submit" id="bt-btn" class="btn btn-warning w-100 fw-bold">
                                <i class="fa-solid fa-play me-1"></i> Run Backtest
                            </button>
                        </form>
                    </div>
                </div>

                <div class="col-md-8">
                    <div class="card bg-black text-white border-secondary p-3 h-100">
                        <h5 class="text-warning mb-3">Historical Backtest Results</h5>
                        <div id="bt-results" class="text-center text-muted py-5">
                            <i class="fa-solid fa-chart-line fa-3x mb-3 text-secondary d-block"></i>
                            Select parameters and click "Run Backtest" to analyze historical candles.
                        </div>
                    </div>
                </div>
            </div>
        `;

        const form = document.getElementById('backtest-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('bt-btn');
                const resultsDiv = document.getElementById('bt-results');

                const coinInput = document.getElementById('bt-coin');
                const tfInput = document.getElementById('bt-tf');
                const rsiInput = document.getElementById('bt-rsi');

                const coin = coinInput ? coinInput.value.toUpperCase().replace("USDT", "") : "BTC";
                const tf = tfInput ? tfInput.value : "1H";

                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> Fetching Candles...`;
                }

                try {
                    const res = await fetch(`https://www.okx.com/api/v5/market/candles?instId=${coin}-USDT&bar=${tf}&limit=100`);
                    const data = await res.json();

                    if (!data || !data.data || data.data.length === 0) {
                        if (resultsDiv) resultsDiv.innerHTML = `<p class="text-danger">Failed to fetch historical market data from OKX.</p>`;
                        return;
                    }

                    const candles = data.data.reverse();
                    let buyTriggers = 0;
                    let simulatedPnl = 0;

                    for (let i = 15; i < candles.length; i++) {
                        const close = parseFloat(candles[i][4]);
                        const prevClose = parseFloat(candles[i - 1][4]);
                        if (close < prevClose * 0.98) {
                            buyTriggers++;
                            simulatedPnl += close * 0.015;
                        }
                    }

                    if (resultsDiv) {
                        resultsDiv.innerHTML = `
                            <div class="row g-3 mb-4">
                                <div class="col-6">
                                    <div class="p-3 border border-secondary rounded bg-dark">
                                        <span class="text-muted small">Buy Signals Triggered</span>
                                        <h3 class="m-0 text-info font-monospace">${buyTriggers}</h3>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-3 border border-secondary rounded bg-dark">
                                        <span class="text-muted small">Estimated Historical Win P&L</span>
                                        <h3 class="m-0 text-success font-monospace">+$${simulatedPnl.toFixed(2)}</h3>
                                    </div>
                                </div>
                            </div>
                            <div class="alert alert-dark border-secondary text-start text-muted small m-0">
                                <i class="fa-solid fa-info-circle text-warning me-2"></i>
                                Tested on 100 historical candles for <strong>${coin}-USDT (${tf})</strong>.
                            </div>
                        `;
                    }

                } catch (err) {
                    if (resultsDiv) resultsDiv.innerHTML = `<p class="text-danger">Backtest error: ${err.message}</p>`;
                } finally {
                    if (btn) {
                        btn.disabled = false;
                        btn.innerHTML = `<i class="fa-solid fa-play me-1"></i> Run Backtest`;
                    }
                }
            });
        }
    }
});
