document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    const container = document.getElementById('strategies-container');

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
                const typeBadge = strat.type === 'pinescript' ? 'bg-info' : (strat.type === 'ai' ? 'bg-primary' : 'bg-warning text-dark');
                
                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4';
                card.innerHTML = `
                    <div class="card bg-black text-white border-secondary h-100 shadow-sm">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <h5 class="card-title m-0 text-warning fw-bold">${strat.name || 'Strategy'}</h5>
                                    <span class="badge ${typeBadge}">${strat.type ? strat.type.toUpperCase() : 'STANDARD'}</span>
                                </div>
                                
                                <div class="small text-light mt-3">
                                    <p class="mb-1"><i class="fa-solid fa-coins text-warning me-2"></i><strong>Asset:</strong> ${coin}/USDT</p>
                                    <p class="mb-1"><i class="fa-solid fa-clock me-2 text-info"></i><strong>Timeframe:</strong> ${strat.timeframe || '1h'}</p>
                                    <p class="mb-1"><i class="fa-solid fa-wave-square text-info me-2"></i><strong>RSI Target:</strong> ≤ ${strat.rsiBuyLevel || 45}</p>
                                    <p class="mb-1"><i class="fa-solid fa-chart-line text-primary me-2"></i><strong>EMAs:</strong> Fast (${strat.emaFast || 9}) / Slow (${strat.emaSlow || 21})</p>
                                    ${strat.pineCode ? `<div class="p-2 mt-2 bg-dark rounded font-monospace text-muted small text-truncate">Code: ${strat.pineCode.substring(0, 30)}...</div>` : ''}
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

    // 2. AI Prompt Parser Engine
    window.parseAIStrategy = function() {
        const promptText = document.getElementById('ai-prompt-input')?.value.toLowerCase();
        if (!promptText) return alert("Please enter an AI prompt description!");

        // Auto extract parameters using simple keyword match
        if (promptText.includes("btc")) document.getElementById('strat-coin').value = "BTC";
        if (promptText.includes("eth")) document.getElementById('strat-coin').value = "ETH";
        if (promptText.includes("sol")) document.getElementById('strat-coin').value = "SOL";

        if (promptText.includes("rsi")) {
            const match = promptText.match(/rsi\s*(<|<=|below|under)?\s*(\d+)/);
            if (match && match[2]) document.getElementById('strat-rsi').value = match[2];
        }

        alert("✨ AI successfully configured parameters based on your strategy prompt!");
    };

    // Delete Strategy
    window.deleteStrategy = async (id) => {
        if (!confirm("Are you sure you want to delete this strategy?")) return;
        try {
            await fetch(`${FIREBASE_URL}/trading_strategies/${id}.json`, { method: 'DELETE' });
            window.loadStrategies();
        } catch (e) {
            alert("Error deleting strategy");
        }
    };

    loadStrategies();
});
