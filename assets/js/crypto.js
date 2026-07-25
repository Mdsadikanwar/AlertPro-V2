document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

    // ==========================================
    // 1. TAB SWITCHING SYSTEM
    // ==========================================
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            tabContents.forEach(content => {
                content.classList.add('d-none');
                content.classList.remove('active');
            });

            const activeSection = document.getElementById(`tab-${targetTab}`);
            if (activeSection) {
                activeSection.classList.remove('d-none');
                activeSection.classList.add('active');
            }

            if (targetTab === 'strategies') window.loadStrategies();
        });
    });

    // ==========================================
    // 2. PRO STRATEGIES RENDERER (TAB 2)
    // ==========================================
    const container = document.getElementById('strategies-container');
    const stratForm = document.getElementById('add-strat-form');

    window.loadStrategies = async function() {
        if (!container) return;
        try {
            const res = await fetch(`${FIREBASE_URL}/trading_strategies.json`);
            if (!res.ok) return;
            const data = await res.json() || {};

            container.innerHTML = '';
            const entries = Object.entries(data);

            const activeBadge = document.getElementById('dash-active-strats');
            if (activeBadge) activeBadge.innerText = entries.length;

            if (entries.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center text-muted py-5">
                        <div class="mb-3">
                            <i class="fa-solid fa-microchip fa-4x text-secondary opacity-50"></i>
                        </div>
                        <h5 class="fw-bold text-white">No Active Strategies Deployed</h5>
                        <p class="small text-muted">Click <strong>"Create Strategy"</strong> above to construct your automated engine!</p>
                    </div>`;
                return;
            }

            entries.forEach(([id, strat]) => {
                const coin = (strat.coin || "BTC").toUpperCase().replace("USDT", "");
                const isPine = Boolean(strat.pineCode && strat.pineCode.trim() !== "");
                
                const typeBadge = isPine 
                    ? '<span class="badge badge-pine"><i class="fa-solid fa-code me-1"></i>PINESCRIPT</span>' 
                    : '<span class="badge badge-ai"><i class="fa-solid fa-robot me-1"></i>AI ENGINE</span>';

                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4 mb-3';
                card.innerHTML = `
                    <div class="strat-card h-100 d-flex flex-column justify-content-between">
                        <div>
                            <!-- Header -->
                            <div class="strat-card-header d-flex justify-content-between align-items-center">
                                <span class="fw-bold text-warning text-truncate me-2 fs-6" style="max-width: 65%;">
                                    <i class="fa-solid fa-bolt text-warning me-1"></i>${strat.name || 'Strategy'}
                                </span>
                                ${typeBadge}
                            </div>

                            <!-- Body -->
                            <div class="p-3">
                                <!-- Coin & Status Row -->
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div class="d-flex align-items-center">
                                        <span class="fs-5 fw-bold text-white me-2">${coin}/USDT</span>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <span class="pulse-dot me-2"></span>
                                        <span class="text-success small fw-bold">Monitoring</span>
                                    </div>
                                </div>

                                <!-- Parameters Grid -->
                                <div class="parameter-box mb-3">
                                    <div class="row g-2 text-center">
                                        <div class="col-6 border-end border-secondary">
                                            <small class="text-muted d-block small">RSI TRIGGER</small>
                                            <span class="fw-bold text-info">≤ ${strat.rsiBuyLevel || 35}</span>
                                        </div>
                                        <div class="col-6">
                                            <small class="text-muted d-block small">EMA CROSS</small>
                                            <span class="fw-bold text-warning">${strat.emaFast || 9} / ${strat.emaSlow || 21}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Triggers -->
                                ${strat.buyTarget ? `
                                    <div class="d-flex justify-content-between align-items-center mb-1 px-1">
                                        <small class="text-muted">Buy Limit Target:</small>
                                        <span class="fw-bold text-success">$${strat.buyTarget}</span>
                                    </div>` : ''}
                                ${strat.sellTarget ? `
                                    <div class="d-flex justify-content-between align-items-center mb-2 px-1">
                                        <small class="text-muted">Sell Limit Target:</small>
                                        <span class="fw-bold text-danger">$${strat.sellTarget}</span>
                                    </div>` : ''}

                                <!-- PineScript Block -->
                                ${isPine ? `
                                    <div class="mt-2">
                                        <small class="text-muted d-block mb-1 font-monospace" style="font-size:0.75rem;">PineScript Logic:</small>
                                        <div class="code-snippet-box text-truncate">
                                            ${strat.pineCode.substring(0, 45)}...
                                        </div>
                                    </div>` : ''}
                            </div>
                        </div>

                        <!-- Footer Actions -->
                        <div class="p-3 border-top border-secondary bg-black bg-opacity-25">
                            <button class="btn btn-sm btn-outline-danger w-100 rounded-pill fw-bold" onclick="deleteStrategy('${id}')">
                                <i class="fa-solid fa-trash-can me-1"></i> Delete Engine
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

        } catch (err) {
            console.warn("Error loading strategies:", err);
        }
    };

    // AI Prompt Parser
    window.parseAIStrategy = function() {
        const promptInput = document.getElementById('ai-prompt-input');
        const promptText = promptInput ? promptInput.value.toLowerCase() : '';
        
        if (!promptText.trim()) {
            alert("⚠️ कृपया AI Prompt बॉक्‍स में कोई प्रॉम्ट दर्ज करें!");
            return;
        }

        if (promptText.includes("btc") || promptText.includes("bitcoin")) document.getElementById('strat-coin').value = "BTC";
        else if (promptText.includes("eth") || promptText.includes("ethereum")) document.getElementById('strat-coin').value = "ETH";
        else if (promptText.includes("sol") || promptText.includes("solana")) document.getElementById('strat-coin').value = "SOL";

        const rsiMatch = promptText.match(/rsi\s*(<|<=|under|below)?\s*(\d+)/i);
        if (rsiMatch && rsiMatch[2]) {
            document.getElementById('strat-rsi').value = rsiMatch[2];
        }

        const nameInput = document.getElementById('strat-name');
        if (!nameInput.value) {
            const coinVal = document.getElementById('strat-coin').value || "Crypto";
            nameInput.value = `AI ${coinVal} Scalper`;
        }

        alert("✨ AI ने प्रॉम्ट से डेटा रीड करके फॉर्म भर दिया है!");
    };

    // Submit Handler
    if (stratForm) {
        stratForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('save-strat-btn');
            if(submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> Deploying...`;
            }

            const newStrat = {
                name: document.getElementById('strat-name').value,
                coin: document.getElementById('strat-coin').value.toUpperCase().replace("USDT", ""),
                rsiBuyLevel: parseFloat(document.getElementById('strat-rsi').value) || 35,
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
                    const modalEl = document.getElementById('addStratModal');
                    if (modalEl && window.bootstrap) {
                        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                        modal.hide();
                    }
                    window.loadStrategies();
                }
            } catch (err) {
                alert("Error saving: " + err.message);
            } finally {
                if(submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `Deploy Strategy Engine`;
                }
            }
        });
    }

    // Delete Strategy
    window.deleteStrategy = async (id) => {
        if (!confirm("क्या आप इस स्ट्रेटजी को हटाना चाहते हैं?")) return;
        try {
            await fetch(`${FIREBASE_URL}/trading_strategies/${id}.json`, { method: 'DELETE' });
            window.loadStrategies();
        } catch (e) {
            alert("Error deleting strategy");
        }
    };

    // Initial Load
    window.loadStrategies();
});
