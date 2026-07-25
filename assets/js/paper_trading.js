document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    let wsConnections = {};

    window.loadPaperTrading = async function() {
        const positionsContainer = document.getElementById('paper-positions-container');
        if (!positionsContainer) return;

        try {
            const res = await fetch(`${FIREBASE_URL}/paper_positions.json`);
            if (!res.ok) return;
            const data = await res.json() || {};
            positionsContainer.innerHTML = '';
            
            const positions = Object.entries(data);
            if (positions.length === 0) {
                positionsContainer.innerHTML = `<div class="col-12 text-center text-muted py-5">
                    <h5>No Active Paper Trading Positions</h5>
                    <small>Deploy a strategy with Auto-Trade ON to trigger test positions.</small>
                </div>`;
                return;
            }

            // Close existing WebSockets before reconnecting
            Object.values(wsConnections).forEach(ws => ws.close());
            wsConnections = {};

            positions.forEach(([id, pos]) => {
                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4 mb-3';
                card.innerHTML = `
                    <div class="card bg-card text-white p-3 border-secondary">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="m-0 text-warning fw-bold">${pos.symbol}/USDT</h5>
                            <span class="badge ${pos.side === 'BUY' ? 'bg-success' : 'bg-danger'}">${pos.side} ${pos.leverage || 10}x</span>
                        </div>
                        <div class="small text-muted mb-1">Entry Price: <strong class="text-white">$${parseFloat(pos.entryPrice).toFixed(2)}</strong></div>
                        <div class="small text-muted mb-1">Live Market Price: <strong id="price-${id}" class="text-info">Connecting...</strong></div>
                        <div class="mt-3 pt-2 border-top border-secondary d-flex justify-content-between align-items-center">
                            <span>Unrealized P&L:</span>
                            <strong id="pnl-${id}" class="fs-5 text-white">$0.00 (0.00%)</strong>
                        </div>
                        <button class="btn btn-sm btn-outline-danger w-100 mt-3" onclick="closePaperPosition('${id}')">Close Position</button>
                    </div>`;
                positionsContainer.appendChild(card);

                // Start Binance WebSocket Live Feed for this symbol
                connectSymbolWebSocket(id, pos);
            });

        } catch (err) {
            console.error("Paper trading load error:", err);
        }
    };

    function connectSymbolWebSocket(posId, pos) {
        const symbol = (pos.symbol + "usdt").toLowerCase();
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);
        wsConnections[posId] = ws;

        ws.onmessage = (event) => {
            const ticker = JSON.parse(event.data);
            const currentPrice = parseFloat(ticker.c);
            const entryPrice = parseFloat(pos.entryPrice);
            const amount = parseFloat(pos.amount || 50);
            const leverage = parseFloat(pos.leverage || 10);

            // Price UI update
            const priceElem = document.getElementById(`price-${posId}`);
            if (priceElem) priceElem.innerText = `$${currentPrice.toFixed(2)}`;

            // Live PnL Calculation
            let pnlPct = 0;
            if (pos.side === 'BUY') {
                pnlPct = ((currentPrice - entryPrice) / entryPrice) * 100 * leverage;
            } else {
                pnlPct = ((entryPrice - currentPrice) / entryPrice) * 100 * leverage;
            }

            const pnlUsdt = (amount * (pnlPct / 100));
            const pnlElem = document.getElementById(`pnl-${posId}`);

            if (pnlElem) {
                const sign = pnlUsdt >= 0 ? '+' : '';
                pnlElem.innerText = `${sign}$${pnlUsdt.toFixed(2)} (${sign}${pnlPct.toFixed(2)}%)`;
                pnlElem.className = `fs-5 fw-bold ${pnlUsdt >= 0 ? 'text-success' : 'text-danger'}`;
            }

            updateTotalLivePnL();
        };
    }

    function updateTotalLivePnL() {
        let totalPnL = 0;
        document.querySelectorAll('[id^="pnl-"]').forEach(elem => {
            const val = parseFloat(elem.innerText.replace('$', '').split(' ')[0]);
            if (!isNaN(val)) totalPnL += val;
        });
        const totalElem = document.getElementById('paper-live-pnl');
        if (totalElem) {
            const sign = totalPnL >= 0 ? '+' : '';
            totalElem.innerText = `${sign}$${totalPnL.toFixed(2)}`;
            totalElem.className = `fw-bold my-1 ${totalPnL >= 0 ? 'text-success' : 'text-danger'}`;
        }
    }

    window.closePaperPosition = async function(id) {
        if (wsConnections[id]) wsConnections[id].close();
        await fetch(`${FIREBASE_URL}/paper_positions/${id}.json`, { method: 'DELETE' });
        window.loadPaperTrading();
    };

    if (document.getElementById('tab-paper_trading')?.classList.contains('active')) {
        window.loadPaperTrading();
    }
});
