(function() {
    // Storage Keys
    const LOCAL_SETTINGS_KEY = 'apex_settings';
    const LOCAL_TRADES_KEY = 'apex_bot_trades';

    // Helper: Get Settings
    function getStoredSettings() {
        return JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || '{}');
    }

    // Helper: Get Trades from LocalStorage (No Dummy Data)
    function getStoredTrades() {
        return JSON.parse(localStorage.getItem(LOCAL_TRADES_KEY) || '[]');
    }

    // Save Trades to LocalStorage & Sync to Firebase
    function saveTrades(trades) {
        localStorage.setItem(LOCAL_TRADES_KEY, JSON.stringify(trades));
        
        const config = getStoredSettings();
        if (config.fbEnable && config.firebaseUrl && config.firebaseUrl.startsWith('https://')) {
            const baseUrl = config.firebaseUrl.replace(/\/$/, "");
            fetch(`${baseUrl}/bot_trades.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trades)
            }).catch(err => console.error("Firebase Sync Error (Trades):", err));
        }
    }

    // 1. CALCULATE & UPDATE LIVE P&L SUMMARY
    function updatePnLSummary(trades) {
        let totalMargin = 0;
        let totalUnrealizedPnL = 0;
        let totalRealizedPnL = 0;

        trades.forEach(trade => {
            const margin = parseFloat(trade.margin || trade.amount || 0);
            const pnl = parseFloat(trade.pnl || 0);

            if (trade.status === 'OPEN' || trade.status === 'EXECUTED' || trade.status === 'SUCCESS') {
                totalMargin += margin;
                totalUnrealizedPnL += pnl;
            } else if (trade.status === 'CLOSED') {
                totalRealizedPnL += pnl;
            }
        });

        // Update DOM Elements
        const marginEl = document.getElementById('pnl-total-margin');
        const unrealizedEl = document.getElementById('pnl-unrealized');
        const realizedEl = document.getElementById('pnl-realized');

        if (marginEl) marginEl.innerText = `$${totalMargin.toFixed(2)}`;
        
        if (unrealizedEl) {
            const pnlClass = totalUnrealizedPnL >= 0 ? 'text-success' : 'text-danger';
            const pnlSign = totalUnrealizedPnL >= 0 ? '+' : '';
            const pnlPercentage = totalMargin > 0 ? ((totalUnrealizedPnL / totalMargin) * 100).toFixed(2) : '0.00';
            
            unrealizedEl.className = `m-0 fw-bold mt-1 ${pnlClass}`;
            unrealizedEl.innerHTML = `${pnlSign}$${totalUnrealizedPnL.toFixed(2)} <small class="fs-6">(${pnlSign}${pnlPercentage}%)</small>`;
        }

        if (realizedEl) {
            const relClass = totalRealizedPnL >= 0 ? 'text-success' : 'text-danger';
            const relSign = totalRealizedPnL >= 0 ? '+' : '';
            realizedEl.className = `m-0 fw-bold mt-1 ${relClass}`;
            realizedEl.innerText = `${relSign}$${totalRealizedPnL.toFixed(2)}`;
        }
    }

    // 2. RENDER TRADES & LIVE POSITIONS TABLE
    function renderTradesTable(trades) {
        const tableBody = document.getElementById('bot-trades-table');
        if (!tableBody) return;

        if (!trades || trades.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No active or past executions found. Waiting for real signal...</td></tr>`;
            updatePnLSummary([]);
            return;
        }

        let html = '';
        trades.forEach(trade => {
            // Status Badges
            let badgeClass = 'bg-secondary text-white';
            if (trade.status === 'SUCCESS' || trade.status === 'EXECUTED' || trade.status === 'OPEN') badgeClass = 'bg-success text-white';
            else if (trade.status === 'PENDING') badgeClass = 'bg-warning text-dark';
            else if (trade.status === 'FAILED' || trade.status === 'CANCELLED') badgeClass = 'bg-danger text-white';
            else if (trade.status === 'CLOSED') badgeClass = 'bg-info text-dark';

            const actionClass = (trade.action && trade.action.includes('BUY')) ? 'text-success' : 'text-danger';

            // P&L Styling
            const pnlVal = parseFloat(trade.pnl || 0);
            const pnlClass = pnlVal >= 0 ? 'text-success' : 'text-danger';
            const pnlSign = pnlVal >= 0 ? '+' : '';
            const displayPnL = (trade.status === 'PENDING' || trade.status === 'FAILED') ? '--' : `${pnlSign}$${pnlVal.toFixed(2)}`;

            html += `
                <tr>
                    <td class="text-muted small">${trade.time || '--:--:--'}</td>
                    <td class="fw-bold text-white">${trade.strategy || 'Manual Signal'}</td>
                    <td><span class="badge bg-secondary border border-secondary">${trade.symbol || 'N/A'}</span></td>
                    <td class="${actionClass} fw-bold">${trade.action || 'BUY'}</td>
                    <td class="fw-bold">
                        <div>$${trade.entryPrice || trade.price || '0.00'}</div>
                        <small class="text-muted fw-normal">Live: $${trade.livePrice || trade.entryPrice || '0.00'}</small>
                    </td>
                    <td class="${pnlClass} fw-bold">${displayPnL}</td>
                    <td><span class="badge ${badgeClass} fw-bold small">${trade.status || 'PENDING'}</span></td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        updatePnLSummary(trades);
    }

    // 3. MAIN LOAD FUNCTION
    window.loadBotLogs = async function() {
        console.log("Loading Real Bot Trades & Live PnL...");
        let trades = getStoredTrades();

        // Sync from Firebase if connected
        const config = getStoredSettings();
        if (config.fbEnable && config.firebaseUrl && config.firebaseUrl.startsWith('https://')) {
            try {
                const baseUrl = config.firebaseUrl.replace(/\/$/, "");
                const res = await fetch(`${baseUrl}/bot_trades.json`);
                if (res.ok) {
                    const fbData = await res.json();
                    if (fbData && Array.isArray(fbData)) {
                        trades = fbData;
                        localStorage.setItem(LOCAL_TRADES_KEY, JSON.stringify(trades));
                    }
                }
            } catch (err) {
                console.warn("Could not fetch trades from Firebase, using LocalStorage.");
            }
        }

        renderTradesTable(trades);
    };

    // 4. EXPOSED HELPER: Add Real Trade from Exchange/Webhook Signal
    window.addNewBotLog = function(tradeData) {
        const trades = getStoredTrades();
        
        if (!tradeData.time) {
            const now = new Date();
            tradeData.time = now.toTimeString().split(' ')[0];
        }

        tradeData.id = Date.now();
        tradeData.pnl = tradeData.pnl || 0; // Default P&L
        tradeData.status = tradeData.status || 'OPEN';

        trades.unshift(tradeData); // Top per add karein

        if (trades.length > 100) trades.pop(); // Max 100 real logs limit

        saveTrades(trades);
        renderTradesTable(trades);
    };

    // 5. EXPOSED HELPER: Update Live Price & Live P&L dynamically
    window.updateTradeLivePrice = function(symbol, currentPrice) {
        const trades = getStoredTrades();
        let updated = false;

        trades.forEach(trade => {
            if ((trade.status === 'OPEN' || trade.status === 'EXECUTED') && trade.symbol === symbol) {
                trade.livePrice = currentPrice;
                
                // Real Live P&L Calculation Formula
                const entryPrice = parseFloat(trade.entryPrice || trade.price || 0);
                const leverage = parseFloat(trade.leverage || 1);
                const margin = parseFloat(trade.margin || trade.amount || 0);

                if (entryPrice > 0) {
                    let priceDiffRatio = (currentPrice - entryPrice) / entryPrice;
                    if (trade.action && trade.action.includes('SELL')) {
                        priceDiffRatio = (entryPrice - currentPrice) / entryPrice; // SHORT Position
                    }
                    trade.pnl = margin * priceDiffRatio * leverage;
                    updated = true;
                }
            }
        });

        if (updated) {
            saveTrades(trades);
            renderTradesTable(trades);
        }
    };

    // Event Listeners
    document.addEventListener('DOMContentLoaded', () => {
        const clearLogsBtn = document.getElementById('btn-clear-logs');
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => {
                if (confirm("Are you sure you want to clear all real execution logs?")) {
                    saveTrades([]);
                    renderTradesTable([]);
                }
            });
        }

        window.loadBotLogs();
    });

})();
