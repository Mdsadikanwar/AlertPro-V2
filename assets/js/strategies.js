document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    const container = document.getElementById('strategies-container');
    const stratForm = document.getElementById('add-strat-form');

    // 1. Fetch & Render Strategies
    window.loadStrategies = async function() {
        if (!container) return;
        try {
            const res = await fetch(`${FIREBASE_URL}/trading_strategies.json`);
            if (!res.ok) return;
            const data = await res.json() || {};

            container.innerHTML = '';
            const entries = Object.entries(data);

            if (entries.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center text-muted py-5">
                        <i class="fa-solid fa-chess-board fa-3x mb-3 text-secondary"></i>
                        <p>No active strategies. Use AI Prompt or PineScript below to create one!</p>
                    </div>`;
                return;
            }

            entries.forEach(([id, strat]) => {
                const coin = (strat.coin || "BTC").toUpperCase().replace("USDT", "");
                const typeBadge = strat.pineCode ? 'bg-info text-dark' : 'bg-warning text-dark';
                
                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4';
                card.innerHTML = `
                    <div class="card bg-black text-white border-secondary h-100 shadow-sm">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <h5 class="card-title m-0 text-warning fw-bold">${strat.name || 'Strategy'}</h5>
                                    <span class="badge ${typeBadge}">${strat.pineCode ? 'PINESCRIPT' : 'STANDARD'}</span>
                                </div>
                                
                                <div class="small text-light mt-3">
                                    <p class="mb-1"><i class="fa-solid fa-coins text-warning me-2"></i><strong>Asset:</strong> ${coin}/USDT</p>
                                    <p class="mb-1"><i class="fa-solid fa-wave-square text-info me-2"></i><strong>RSI Buy:</strong> ≤ ${strat.rsiBuyLevel || 45}</p>
                                    <p class="mb-1"><i class="fa-solid fa-chart-line text-primary me-2"></i><strong>EMAs:</strong> Fast (${strat.emaFast || 9}) / Slow (${strat.emaSlow || 21})</p>
                                    ${strat.buyTarget ? `<p class="mb-1 text-success"><i class="fa-solid fa-circle-arrow-up me-2"></i><strong>Buy Target:</strong> $${strat.buyTarget}</p>` : ''}
                                    ${strat.sellTarget ? `<p class="mb-1 text-danger"><i class="fa-solid fa-circle-arrow-down me-2"></i><strong>Sell Target:</strong> $${strat.sellTarget}</p>` : ''}
                                    ${strat.pineCode ? `<div class="p-2 mt-2 bg-dark rounded font-monospace text-muted small text-truncate">Code: ${strat.pineCode.substring(0, 35)}...</div>` : ''}
                                </div>
                            </div>
                            <div class="d-flex gap-2 mt-3">
                                <button class="btn btn-sm btn-outline-danger w-100" onclick="deleteStrategy('${id}')">
                                    <i class="fa-solid fa-trash me-1"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

        } catch (err) {
            console.warn("Strategies load error:", err);
        }
    };

    // 2. AI Strategy Generator Engine (Auto-Fills Form)
    window.parseAIStrategy = function() {
        const promptInput = document.getElementById('ai-prompt-input');
        const promptText = promptInput ? promptInput.value.toLowerCase() : '';
        
        if (!promptText.trim()) {
            alert("Please enter a strategy description in the AI prompt box!");
            return;
        }

        // Detect Coin Name
        if (promptText.includes("btc") || promptText.includes("bitcoin")) document.getElementById('strat-coin').value = "BTC";
        else if (promptText.includes("eth") || promptText.includes("ethereum")) document.getElementById('strat-coin').value = "ETH";
        else if (promptText.includes("sol") || promptText.includes("solana")) document.getElementById('strat-coin').value = "SOL";

        // Detect RSI
        const rsiMatch = promptText.match(/rsi\s*(<|<=|under|below)?\s*(\d+)/i);
        if (rsiMatch && rsiMatch[2]) {
            document.getElementById('strat-rsi').value = rsiMatch[2];
        }

        // Set Default Strategy Name if empty
        const nameInput = document.getElementById('strat-name');
        if (!nameInput.value) {
            nameInput.value = "AI Custom " + (document.getElementById('strat-coin').value || "BTC");
        }

        alert("✨ AI Strategy parameters generated and filled into the form!");
    };

    // 3. Save Strategy Form Handler
    if (stratForm) {
        stratForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newStrat = {
                name: document.getElementById('strat-name').value,
                coin: document.getElementById('strat-coin').value.toUpperCase().replace("USDT", ""),
                rsiBuyLevel: parseFloat(document.getElementById('strat-rsi').value) || 45,
                emaFast: parseInt(document.getElementById('strat-fast').value) || 9,
                emaSlow: parseInt(document.getElementById('strat-slow').value) || 21,
                buyTarget: document.getElementById('strat-buy-target').value || null,
                sellTarget: document.getElementById('strat-sell-target').value || null,
                pineCode: document.getElementById('strat-pine').value || "",
                createdAt: new Date().toISOString()
            };

            try {
                const res = await fetch(`${FIREBASE_URL}/trading_strategies.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newStrat)
                });

                if (res.ok) {
                    stratForm.reset();
                    // Close Bootstrap Modal
                    const modalEl = document.getElementById('addStratModal');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();

                    // Reload Strategies
                    window.loadStrategies();
                } else {
                    alert("Failed to save strategy to Firebase.");
                }
            } catch (err) {
                alert("Error saving strategy: " + err.message);
            }
        });
    }

    // 4. Delete Strategy
    window.deleteStrategy = async (id) => {
        if (!confirm("Are you sure you want to delete this strategy?")) return;
        try {
            await fetch(`${FIREBASE_URL}/trading_strategies/${id}.json`, { method: 'DELETE' });
            window.loadStrategies();
        } catch (e) {
            alert("Error deleting strategy");
        }
    };

    window.loadStrategies();
});
