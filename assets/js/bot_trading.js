// assets/js/bot_trading.js
(function() {
    let tradesList = [];

    function getTrades() {
        return JSON.parse(localStorage.getItem('apex_trades') || '[]');
    }

    function saveTrades(trades) {
        tradesList = trades;
        localStorage.setItem('apex_trades', JSON.stringify(trades));

        const masterRaw = localStorage.getItem('apex_master_data');
        let master = masterRaw ? JSON.parse(masterRaw) : {};
        master.trades = trades;
        localStorage.setItem('apex_master_data', JSON.stringify(master));

        if (window.triggerGlobalSave) {
            window.triggerGlobalSave();
        }
    }

    // Render Table Rows
    window.renderBotTable = function() {
        const tbody = document.getElementById('bot-trades-table');
        if (!tbody) return;

        tradesList = getTrades();

        if (tradesList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        No active trades executing currently. Make sure Auto-Trading is Enabled in Settings and Strategies are RUNNING.
                    </td>
                </tr>
            `;
            updatePnLCards();
            return;
        }

        let html = '';
        tradesList.forEach((trade, index) => {
            const isProfit = trade.pnl >= 0;
            const pnlClass = isProfit ? 'text-success' : 'text-danger';
            const actionBadge = trade.action === 'BUY' ? 'bg-success' : 'bg-danger';
            const statusBadge = trade.status.includes('PAPER') ? 'bg-info text-dark' : 'bg-warning text-dark';

            html += `
                <tr>
                    <td class="small text-muted">${trade.time || 'N/A'}</td>
                    <td class="fw-bold text-accent">${trade.strategy || 'AI Strategy'}</td>
                    <td class="fw-bold">${trade.symbol}</td>
                    <td><span class="badge ${actionBadge}">${trade.action}</span></td>
                    <td>
                        <div><strong>Entry:</strong> $${parseFloat(trade.entryPrice || 0).toFixed(4)}</div>
                        <div class="small text-muted"><strong>Live:</strong> <span id="live-price-${index}">$${parseFloat(trade.livePrice || trade.entryPrice || 0).toFixed(4)}</span></div>
                    </td>
                    <td class="fw-bold ${pnlClass}" id="live-pnl-${index}">
                        ${isProfit ? '+' : ''}$${parseFloat(trade.pnl || 0).toFixed(2)}
                    </td>
                    <td>
                        <span class="badge ${statusBadge}">${trade.status}</span>
                        <button class="btn btn-outline-danger btn-xs py-0 px-1 ms-1" style="font-size:10px;" onclick="closeTradeManual(${index})">Close</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        updatePnLCards();
    };

    // Live Market Price Updater via Binance Public API
    async function updateLivePrices() {
        if (tradesList.length === 0) return;

        let totalMargin = 0;
        let totalUnrealizedPnL = 0;

        for (let i = 0; i < tradesList.length; i++) {
            const trade = tradesList[i];
            if (trade.status === 'CLOSED') continue;

            try {
                const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${trade.symbol}`);
                if (res.ok) {
                    const data = await res.json();
                    const livePrice = parseFloat(data.price);
                    const entryPrice = parseFloat(trade.entryPrice);

                    // P&L Calculation (BUY / SELL)
                    let pnl = 0;
                    if (trade.action === 'BUY') {
                        pnl = ((livePrice - entryPrice) / entryPrice) * 100 * 10; // 10x Margin Simulation
                    } else {
                        pnl = ((entryPrice - livePrice) / entryPrice) * 100 * 10;
                    }

                    trade.livePrice = livePrice;
                    trade.pnl = pnl;

                    // Update UI Directly
                    const priceEl = document.getElementById(`live-price-${i}`);
                    const pnlEl = document.getElementById(`live-pnl-${i}`);

                    if (priceEl) priceEl.innerText = `$${livePrice.toFixed(4)}`;
                    if (pnlEl) {
                        pnlEl.innerText = `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`;
                        pnlEl.className = `fw-bold ${pnl >= 0 ? 'text-success' : 'text-danger'}`;
                    }

                    totalMargin += 100; // Simulated $100 per position
                    totalUnrealizedPnL += pnl;
                }
            } catch (err) {
                console.error('Error fetching live price for ' + trade.symbol, err);
            }
        }

        saveTrades(tradesList);
        updatePnLCards(totalMargin, totalUnrealizedPnL);
    }

    function updatePnLCards(margin = 0, unrealized = 0) {
        const marginEl = document.getElementById('pnl-total-margin');
        const unrealizedEl = document.getElementById('pnl-unrealized');
        const realizedEl = document.getElementById('pnl-realized');

        if (marginEl) marginEl.innerText = `$${margin.toFixed(2)}`;
        if (unrealizedEl) {
            unrealizedEl.innerHTML = `$${unrealized.toFixed(2)} <small class="fs-6 text-muted">(${margin > 0 ? ((unrealized/margin)*100).toFixed(2) : '0.00'}%)</small>`;
            unrealizedEl.className = `m-0 fw-bold mt-1 ${unrealized >= 0 ? 'text-success' : 'text-danger'}`;
        }

        // Calculate closed trades realized PnL
        const realizedTotal = tradesList.filter(t => t.status === 'CLOSED').reduce((acc, curr) => acc + (curr.pnl || 0), 0);
        if (realizedEl) realizedEl.innerText = `$${realizedTotal.toFixed(2)}`;
    }

    window.closeTradeManual = function(index) {
        if (tradesList[index]) {
            tradesList[index].status = 'CLOSED';
            saveTrades(tradesList);
            renderBotTable();
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        renderBotTable();

        // Clear Logs Button Handler
        const btnClearLogs = document.getElementById('btn-clear-logs');
        if (btnClearLogs) {
            btnClearLogs.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all trade logs?')) {
                    saveTrades([]);
                    renderBotTable();
                }
            });
        }

        // Start Live Price Ticker (Every 3 Seconds)
        setInterval(updateLivePrices, 3000);
    });
})();
