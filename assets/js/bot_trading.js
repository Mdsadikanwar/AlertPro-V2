(function() {
    // Storage Keys
    const LOCAL_SETTINGS_KEY = 'apex_settings';
    const LOCAL_TRADES_KEY = 'apex_bot_trades';
    const LOCAL_STRATS_KEY = 'apex_strategies';

    // Live Price Storage (Symbol -> Price)
    const livePrices = {};
    const priceHistories = {}; // Moving Average crossover calculation ke liye

    // Helper: Get Stored Data
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

    // TELEGRAM ALERT SENDER
    async function sendTelegramNotification(message) {
        const config = getStoredSettings();
        if (!config.tgEnable || !config.tgToken || !config.tgChatId) return;

        try {
            await fetch(`https://api.telegram.org/bot${config.tgToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: config.tgChatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
        } catch (err) {
            console.error("Telegram Alert Failed:", err);
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

            if (trade.status === 'OPEN' || trade.status === 'EXECUTED') {
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

    // 2. RENDER TRADES & POSITIONS TABLE
    function renderTradesTable(trades) {
        const tableBody = document.getElementById('bot-trades-table');
        if (!tableBody) return;

        if (!trades || trades.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Scanner Active... Waiting for Strategy Signals.</td></tr>`;
            updatePnLSummary([]);
            return;
        }

        let html = '';
        trades.forEach(trade => {
            let badgeClass = 'bg-secondary text-white';
            if (trade.status === 'OPEN' || trade.status === 'EXECUTED') badgeClass = 'bg-success text-white';
            else if (trade.status === 'CLOSED') badgeClass = 'bg-info text-dark';
            else if (trade.status === 'FAILED') badgeClass = 'bg-danger text-white';

            const actionClass = (trade.action && trade.action.includes('BUY')) ? 'text-success' : 'text-danger';
            const pnlVal = parseFloat(trade.pnl || 0);
            const pnlClass = pnlVal >= 0 ? 'text-success' : 'text-danger';
            const pnlSign = pnlVal >= 0 ? '+' : '';

            html += `
                <tr>
                    <td class="text-muted small">${trade.time || '--:--:--'}</td>
                    <td class="fw-bold text-white">${trade.strategy || 'Auto Strategy'}</td>
                    <td><span class="badge bg-secondary border border-secondary">${trade.symbol || 'N/A'}</span></td>
                    <td class="${actionClass} fw-bold">${trade.action || 'BUY'}</td>
                    <td class="fw-bold">
                        <div>Entry: $${parseFloat(trade.entryPrice || 0).toFixed(2)}</div>
                        <small class="text-muted fw-normal">Live: $${parseFloat(trade.livePrice || trade.entryPrice || 0).toFixed(2)}</small>
                    </td>
                    <td class="${pnlClass} fw-bold">${pnlSign}$${pnlVal.toFixed(2)}</td>
                    <td><span class="badge ${badgeClass} fw-bold small">${trade.status || 'OPEN'}</span></td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        updatePnLSummary(trades);
    }

    // 3. EXECUTE REAL OR PAPER ORDER
    function executeOrder(strat, action, currentPrice) {
        const settings = getStoredSettings();
        const trades = getStoredTrades();
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];

        // Check active open trade for same symbol to avoid over-trading
        const existingOpen = trades.find(t => t.symbol === strat.coin && t.status === 'OPEN');
        if (existingOpen && existingOpen.action === action) {
            return; // Already holding this position
        }

        const newTrade = {
            id: Date.now(),
            time: timeStr,
            strategy: strat.name,
            symbol: strat.coin.toUpperCase(),
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

        // Close opposite position if exists
        if (existingOpen && existingOpen.action !== action) {
            existingOpen.status = 'CLOSED';
            sendTelegramNotification(`🔴 <b>POSITION CLOSED</b>\nSymbol: ${existingOpen.symbol}\nClosed P&L: $${existingOpen.pnl.toFixed(2)}`);
        }

        trades.unshift(newTrade);
        if (trades.length > 100) trades.pop();

        saveTrades(trades);
        renderTradesTable(trades);

        // Send Telegram Signal Notification
        const modeTag = settings.rulePaperMode ? '[PAPER TRADING]' : '[REAL TRADE]';
        const msg = `🤖 <b>STRATEGY SIGNAL EXECUTED</b> ${modeTag}\n` +
                    `Strategy: <b>${strat.name}</b>\n` +
                    `Action: <b>${action}</b>\n` +
                    `Symbol: <b>${strat.coin}</b>\n` +
                    `Price: <b>$${currentPrice}</b>\n` +
                    `Leverage: <b>${strat.leverage}x</b>`;
        
        sendTelegramNotification(msg);
    }

    // 4. STRATEGY CROSSOVER SCANNER ENGINE
    function scanStrategies(symbol, currentPrice) {
        const settings = getStoredSettings();
        if (!settings.ruleAutotradeEnable) return; // Master Autotrade OFF

        const strategies = getStoredStrategies();
        const activeStrats = strategies.filter(s => s.coin.toUpperCase() === symbol.toUpperCase());

        if (!priceHistories[symbol]) priceHistories[symbol] = [];
        priceHistories[symbol].push(currentPrice);
        if (priceHistories[symbol].length > 20) priceHistories[symbol].shift();

        const prices = priceHistories[symbol];
        if (prices.length < 5) return; // Need minimal history to scan crossover

        // Fast & Slow Moving Average logic for Crossover
        const fastMA = prices.slice(-3).reduce((a, b) => a + b, 0) / 3;
        const slowMA = prices.reduce((a, b) => a + b, 0) / prices.length;

        activeStrats.forEach(strat => {
            // Bullish Crossover (Fast MA > Slow MA) -> BUY
            if (fastMA > slowMA) {
                executeOrder(strat, 'BUY', currentPrice);
            } 
            // Bearish Crossover (Fast MA < Slow MA) -> SELL
            else if (fastMA < slowMA) {
                executeOrder(strat, 'SELL', currentPrice);
            }
        });
    }

    // 5. LIVE TICKER & P&L TRACKER (BINANCE PUBLIC API)
    function startMarketScanner() {
        setInterval(async () => {
            const strats = getStoredStrategies();
            if (!strats || strats.length === 0) return;

            // Extract unique symbols from strategies
            const symbols = [...new Set(strats.map(s => s.coin.toUpperCase()))];

            for (const sym of symbols) {
                try {
                    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}`);
                    if (res.ok) {
                        const data = await res.json();
                        const currentPrice = parseFloat(data.price);
                        livePrices[sym] = currentPrice;

                        // 1. Live Price & PnL Update for Open Positions
                        updateLivePositionsPnL(sym, currentPrice);

                        // 2. Scan Crossover Signals
                        scanStrategies(sym, currentPrice);
                    }
                } catch (e) {
                    console.warn(`Scanner fetch error for ${sym}:`, e);
                }
            }
        }, 3000); // Scans every 3 seconds
    }

    // 6. SL/TP GUARD & LIVE P&L CALCULATOR
    function updateLivePositionsPnL(symbol, currentPrice) {
        const trades = getStoredTrades();
        const settings = getStoredSettings();
        let updated = false;

        trades.forEach(trade => {
            if (trade.status === 'OPEN' && trade.symbol === symbol) {
                trade.livePrice = currentPrice;
                
                const entry = parseFloat(trade.entryPrice);
                const leverage = parseFloat(trade.leverage || 1);
                const margin = parseFloat(trade.margin || trade.amount || 100);

                let priceRatio = (currentPrice - entry) / entry;
                if (trade.action === 'SELL') priceRatio = (entry - currentPrice) / entry;

                const livePnL = margin * priceRatio * leverage;
                trade.pnl = livePnL;
                updated = true;

                // Enforce Stop Loss / Take Profit Guard
                if (settings.ruleSltpGuard) {
                    const pnlPercent = (livePnL / margin) * 100;
                    if (pnlPercent <= -parseFloat(trade.sl)) {
                        trade.status = 'CLOSED';
                        sendTelegramNotification(`⚠️ <b>STOP LOSS HIT</b>\nSymbol: ${trade.symbol}\nLoss: $${livePnL.toFixed(2)}`);
                    } else if (pnlPercent >= parseFloat(trade.tp)) {
                        trade.status = 'CLOSED';
                        sendTelegramNotification(`🎯 <b>TAKE PROFIT HIT</b>\nSymbol: ${trade.symbol}\nProfit: +$${livePnL.toFixed(2)}`);
                    }
                }
            }
        });

        if (updated) {
            saveTrades(trades);
            renderTradesTable(trades);
        }
    }

    // 7. INITIALIZATION
    window.loadBotLogs = function() {
        const trades = getStoredTrades();
        renderTradesTable(trades);
    };

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

        window.loadBotLogs();
        startMarketScanner(); // Bot Execution Loop Start
    });

})();
