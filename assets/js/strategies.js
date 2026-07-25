document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
    const container = document.getElementById('strategies-container');
    const stratForm = document.getElementById('add-strat-form');

    // 1. Fetch & Render All Advanced Strategies
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
                        <i class="fa-solid fa-chess-board fa-4x mb-3 text-secondary"></i>
                        <h5>No Active Strategies Found</h5>
                        <p class="small">Click <strong>"Add Strategy"</strong> above to build one using AI Prompts or PineScript!</p>
                    </div>`;
                return;
            }

            entries.forEach(([id, strat]) => {
                const coin = (strat.coin || "BTC").toUpperCase().replace("USDT", "");
                const isPine = Boolean(strat.pineCode && strat.pineCode.trim() !== "");
                
                const typeBadge = isPine 
                    ? '<span class="badge bg-info text-dark"><i class="fa-solid fa-code me-1"></i>PINESCRIPT</span>' 
                    : '<span class="badge bg-warning text-dark"><i class="fa-solid fa-robot me-1"></i>AI / CUSTOM</span>';

                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4 mb-3';
                card.innerHTML = `
                    <div class="card bg-black text-white border-secondary h-100 shadow-sm">
                        <div class="card-header bg-dark border-secondary d-flex justify-content-between align-items-center">
                            <h5 class="m-0 text-warning fw-bold text-truncate" style="max-width: 60%;">${strat.name || 'Strategy'}</h5>
                            ${typeBadge}
                        </div>
                        <div class="card-body d-flex flex-column justify-content-between">
                            <div>
                                <div class="p-2 mb-3 bg-dark rounded border border-secondary d-flex justify-content-between align-items-center">
                                    <span class="fw-bold text-white"><i class="fa-solid fa-coins text-warning me-2"></i>${coin}/USDT</span>
                                    <span class="badge bg-success"><i class="fa-solid fa-bolt me-1"></i>Active Engine</span>
                                </div>

                                <div class="small text-light">
                                    <div class="row g-2 mb-2">
                                        <div class="col-6"><strong>Timeframe:</strong> ${strat.timeframe || '1h'}</div>
                                        <div class="col-6"><strong>RSI Target:</strong> ≤ ${strat.rsiBuyLevel || 40}</div>
                                    </div>
                                    <div class="row g-2 mb-2">
                                        <div class="col-6"><strong>Fast EMA:</strong> ${strat.emaFast || 9}</div>
                                        <div class="col-6"><strong>Slow EMA:</strong> ${strat.emaSlow || 21}</div>
                                    </div>

                                    ${strat.buyTarget ? `<p class="mb-1 text-success"><i class="fa-solid fa-circle-arrow-up me-2"></i><strong>Buy Trigger Price:</strong> $${strat.buyTarget}</p>` : ''}
                                    ${strat.sellTarget ? `<p class="mb-1 text-danger"><i class="fa-solid fa-circle-arrow-down me-2"></i><strong>Sell Trigger Price:</strong> $${strat.sellTarget}</p>` : ''}
                                    
                                    ${isPine ? `
                                        <div class="mt-3">
                                            <span class="text-info small fw-bold"><i class="fa-solid fa-terminal me-1"></i>PineScript Snippet:</span>
                                            <div class="p-2 mt-1 bg-dark rounded font-monospace text-muted small text-truncate border border-secondary">
                                                ${strat.pineCode.substring(0, 45)}...
                                            </div>
                                        </div>` : ''
                                    }
                                </div>
                            </div>

                            <div class="pt-3 border-top border-secondary mt-3 d-flex gap-2">
                                <button class="btn btn-sm btn-outline-danger w-100 fw-bold" onclick="deleteStrategy('${id}')">
                                    <i class="fa-solid fa-trash me-1"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

        } catch (err) {
            console.warn("Strategies loading error:", err);
        }
    };

    // 2. Advanced AI Strategy Parser Engine
    window.parseAIStrategy = function() {
        const promptInput = document.getElementById('ai-prompt-input');
        const promptText = promptInput ? promptInput.value.toLowerCase() : '';
        
        if (!promptText.trim()) {
            alert("⚠️ कृपया AI Prompt बॉक्‍स में कोई डिस्क्रिप्शन लिखें! (जैसे: 'Buy BTC when RSI under 30')");
            return;
        }

        // Auto Extract Coin
        if (promptText.includes("btc") || promptText.includes("bitcoin")) document.getElementById('strat-coin').value = "BTC";
        else if (promptText.includes("eth") || promptText.includes("ethereum")) document.getElementById('strat-coin').value = "ETH";
        else if (promptText.includes("sol") || promptText.includes("solana")) document.getElementById('strat-coin').value = "SOL";
        else if (promptText.includes("bnb")) document.getElementById('strat-coin').value = "BNB";

        // Auto Extract RSI
        const rsiMatch = promptText.match(/rsi\s*(<|<=|under|below)?\s*(\d+)/i);
        if (rsiMatch && rsiMatch[2]) {
            document.getElementById('strat-rsi').value = rsiMatch[2];
        }

        // Auto Extract EMAs
        const emaMatch = promptText.match(/ema\s*(\d+)/gi);
        if (emaMatch && emaMatch.length >= 1) {
            const num1 = emaMatch[0].replace(/\D/g, '');
            if (num1) document.getElementById('strat-fast').value = num1;
        }

        // Auto Set Name
        const nameInput = document.getElementById('strat-name');
        if (!nameInput.value) {
            const coinVal = document.getElementById('strat-coin').value || "Crypto";
            nameInput.value = `AI ${coinVal} Strategy`;
        }

        alert("✨ AI ने आपके प्रॉम्ट से पैरामीटर्स (Asset, RSI, Name) पहचानकर फॉर्म में ऑटो-फिल कर दिए हैं!");
    };

    // 3. Save Strategy Form Handler
    if (stratForm) {
        stratForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = stratForm.querySelector('button[type="submit"]');
            if(submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> Saving Strategy...`;
            }

            const newStrat = {
                name: document.getElementById('strat-name').value,
                coin: document.getElementById('strat-coin').value.toUpperCase().replace("USDT", ""),
                rsiBuyLevel: parseFloat(document.getElementById('strat-rsi').value) || 40,
                emaFast: parseInt(document.getElementById('strat-fast').value) || 9,
                emaSlow: parseInt(document.getElementById('strat-slow').value) || 21,
                buyTarget: document.getElementById('strat-buy-target').value || null,
                sellTarget: document.getElementById('strat-sell-target').value || null,
                pineCode: document.getElementById('strat-pine') ? document.getElementById('strat-pine').value : "",
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
                    // Close Modal Safely
                    const modalEl = document.getElementById('addStratModal');
                    if (modalEl && window.bootstrap) {
                        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                        modal.hide();
                    }
                    window.loadStrategies();
                } else {
                    alert("Failed to save strategy to Firebase.");
                }
            } catch (err) {
                alert("Error saving strategy: " + err.message);
            } finally {
                if(submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `Save & Activate Strategy`;
                }
            }
        });
    }

    // 4. Delete Strategy
    window.deleteStrategy = async (id) => {
        if (!confirm("क्या आप वाकई इस स्ट्रेटजी को डिलीट करना चाहते हैं?")) return;
        try {
            await fetch(`${FIREBASE_URL}/trading_strategies/${id}.json`, { method: 'DELETE' });
            window.loadStrategies();
        } catch (e) {
            alert("Error deleting strategy");
        }
    };

    window.loadStrategies();
});
