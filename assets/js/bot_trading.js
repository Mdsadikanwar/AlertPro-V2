(function() {
    const LOCAL_SETTINGS_KEY = 'apex_settings';
    const LOCAL_TRADES_KEY = 'apex_bot_trades';
    const LOCAL_STRATS_KEY = 'apex_strategies';

    function getStoredSettings() {
        return JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || '{}');
    }

    function getStoredTrades() {
        return JSON.parse(localStorage.getItem(LOCAL_TRADES_KEY) || '[]');
    }

    function getStoredStrategies() {
        return JSON.parse(localStorage.getItem(LOCAL_STRATS_KEY) || '[]');
    }

    function saveTrades(trades) {
        localStorage.setItem(LOCAL_TRADES_KEY, JSON.stringify(trades));
        
        // Sync to Firebase Realtime DB if enabled
        const config = getStoredSettings();
        if (config.cfgFbEnable && config.cfgFirebase && config.cfgFirebase.startsWith('https://')) {
            const baseUrl = config.cfgFirebase.replace(/\/$/, "");
            fetch(`${baseUrl}/bot_trades.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trades)
            }).catch(err => console.error("Firebase Sync Error:", err));
        }
    }

    async function sendTelegramNotification(message) {
        const config = getStoredSettings();
        if (!config.cfgTgEnable || !config.cfgTgToken || !config.cfgTgChatid) return;

        try {
            await fetch(`https://api.telegram.org/bot${config.cfgTgToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: config.cfgTgChatid,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
        } catch (err) {
            console.error("Telegram Alert Failed:", err);
        }
    }

    function updatePnLSummary(trades) {
        let totalMargin = 0;
        let totalUnrealizedPnL = 0;
        let totalRealizedPnL = 0;

        trades.forEach(trade => {
            const margin = parseFloat(trade.margin || trade.amount || 0);
            const pnl = parseFloat(trade.pnl || 0);

            if (trade.status === 'OPEN') {
                totalMargin += margin;
                totalUnrealizedPnL += pnl;
            } else if (trade.status === 'CLOSED') {
                totalRealizedPnL += pnl;
            }
        });

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

    function renderTradesTable(trades) {
        const tableBody = document.getElementById('bot-trades-table');
        if (!tableBody) return;

        if (!trades || trades.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">🤖 Auto-Trading Engine Active... Waiting for positions.</td></tr>`;
            updatePnLSummary([]);
            return;
        }

        let html = '';
        trades.forEach(trade => {
            let badgeClass = 'bg-secondary text-white';
            if (trade.status === 'OPEN') badgeClass = 'bg-success text-white';
            else if (trade.status === 'CLOSED') badgeClass = 'bg-info text-dark';

            const actionClass = trade.action === 'BUY' ? 'text-success' : 'text-danger';
            const pnlVal = parseFloat(trade.pnl || 0);
            const pnlClass = pnlVal >= 0 ? 'text-success' : 'text-danger';
            const pnlSign = pnlVal >= 0 ? '+' : '';

            html += `
                <tr>
                    <td class="text-muted small">${trade.time || '--:--:--'}</td>
                    <td class="fw-bold text-white">${trade.strategy || 'Custom Strategy'}</td>
                    <td><span class="badge bg-secondary border border-secondary">${trade.symbol || 'N/A'}</span></td>
                    <td class="${actionClass} fw-bold">${trade.action || 'BUY'}</td>
                    <td class="fw-bold">
                        <div>Entry: $${parseFloat(trade.entryPrice || 0).toFixed(2)}</div>
                        <small class="text-muted fw-normal">Live: $${parseFloat(trade.livePrice || trade.entryPrice || 0).toFixed(2)}</small>
                    </td>
                    <td class="${pnlClass} fw-bold">${pnlSign}$${pnlVal.toFixed(2)}</td>
                    <td><span class="badge ${badgeClass} fw-bold small">${trade.status || 'OPEN'} (${trade.mode})</span></td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        updatePnLSummary(trades);
    }

    // CORE AUTO-TRADING STRATEGY EXECUTION ENGINE
    window.triggerStrategyExecution = function(stratName, action = 'BUY') {
        const settings = getStoredSettings();
        const strategies = getStoredStrategies();
        const strat = strategies.find(s => s.name === stratName);

        if (!strat) return;

        const symbol = strat.coin.toUpperCase();
        
        fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
            .then(res => res.json())
            .then(data => {
                const currentPrice = parseFloat(data.price);
                const trades = getStoredTrades();
                const now = new Date();

                const newTrade = {
                    id: Date.now(),
                    time: now.toTimeString().split(' ')[0],
                    strategy: strat.name,
                    symbol: symbol,
                    action: action,
                    entryPrice: currentPrice,
                    livePrice: currentPrice,
                    amount: parseFloat(strat.amount || 100),
                    leverage: parseFloat(strat.leverage || 10),
                    margin: parseFloat(strat.amount || 100),
                    sl: parseFloat(strat.sl || 1.5),
                    tp: parseFloat(strat.tp || 3.0),
                    pnl: 0,
                    status: 'OPEN',
                    mode: settings.rulePaperMode ? 'PAPER' : 'REAL'
                };

                trades.unshift(newTrade);
                saveTrades(trades);
                renderTradesTable(trades);

                const modeTag = settings.rulePaperMode ? '[PAPER MODE]' : '[REAL TRADE]';
                sendTelegramNotification(
                    `🚀 <b>AUTOMATED STRATEGY EXECUTED</b> ${modeTag}\n` +
                    `Strategy Name: <b>${strat.name}</b>\n` +
                    `Symbol: <b>${symbol}</b>\n` +
                    `Side: <b>${action}</b>\n` +
                    `Entry Price: <b>$${currentPrice}</b>\n` +
                    `Leverage: <b>${strat.leverage}x</b>\n` +
                    `Stop Loss: <b>${strat.sl}%</b> | Take Profit: <b>${strat.tp}%</b>`
                );
            })
            .catch(err => console.error("Price fetch error:", err));
    };

    // AUTOMATED SCANNER FOR ACTIVE STRATEGIES & LIVE POSITIONS
    function startAutoEngineScanner() {
        setInterval(async () => {
            const settings = getStoredSettings();
            if (!settings.ruleAutotradeEnable) return; // Master Switch Check

            const strategies = getStoredStrategies();
            const activeStrats = strategies.filter(s => s.active);
            const trades = getStoredTrades();

            // 1. Check if Active Strategy needs an Auto-Position Open
            activeStrats.forEach(strat => {
                const hasOpenTrade = trades.some(t => t.strategy === strat.name && t.status === 'OPEN');
                if (!hasOpenTrade) {
                    // Automatically trigger trade for active strategies
                    window.triggerStrategyExecution(strat.name, 'BUY');
                }
            });

            // 2. Track & Manage Open Positions (SL / TP Guard)
            const openTrades = trades.filter(t => t.status === 'OPEN');
            if (openTrades.length === 0) return;

            for (const trade of openTrades) {
                try {
                    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${trade.symbol}`);
                    if (res.ok) {
                        const data = await res.json();
                        const currentPrice = parseFloat(data.price);
                        trade.livePrice = currentPrice;

                        const entry = parseFloat(trade.entryPrice);
                        const leverage = parseFloat(trade.leverage || 1);
                        const margin = parseFloat(trade.margin || trade.amount || 100);

                        let priceRatio = (currentPrice - entry) / entry;
                        if (trade.action === 'SELL') priceRatio = (entry - currentPrice) / entry;

                        const livePnL = margin * priceRatio * leverage;
                        trade.pnl = livePnL;

                        // Check SL / TP Guard
                        if (settings.ruleSltpGuard) {
                            const pnlPercent = (livePnL / margin) * 100;
                            if (pnlPercent <= -parseFloat(trade.sl)) {
                                trade.status = 'CLOSED';
                                sendTelegramNotification(`⚠️ <b>STOP LOSS HIT</b>\nStrategy: ${trade.strategy}\nSymbol: ${trade.symbol}\nLoss: -$${Math.abs(livePnL).toFixed(2)}`);
                            } else if (pnlPercent >= parseFloat(trade.tp)) {
                                trade.status = 'CLOSED';
                                sendTelegramNotification(`🎯 <b>TAKE PROFIT HIT</b>\nStrategy: ${trade.strategy}\nSymbol: ${trade.symbol}\nProfit: +$${livePnL.toFixed(2)}`);
                            }
                        }
                    }
                } catch (e) {
                    console.error("Position update error:", e);
                }
            }

            saveTrades(trades);
            renderTradesTable(trades);
        }, 3000);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const clearLogsBtn = document.getElementById('btn-clear-logs');
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => {
                if (confirm("Clear all trades history?")) {
                    saveTrades([]);
                    renderTradesTable([]);
                }
            });
        }

        renderTradesTable(getStoredTrades());
        startAutoEngineScanner();
    });
})();
