document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

    // ==========================================
    // 1. TAB SWITCHING SYSTEM (ALL 6 TABS)
    // ==========================================
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab');

            // Toggle active classes on links
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Hide all tabs and show selected tab
            tabContents.forEach(content => {
                content.classList.add('d-none');
                content.classList.remove('active');
            });

            const activeSection = document.getElementById(`tab-${targetTab}`);
            if (activeSection) {
                activeSection.classList.remove('d-none');
                activeSection.classList.add('active');
            }

            // Trigger specific tab handlers
            if (targetTab === 'strategies') window.loadStrategies();
            if (targetTab === 'dashboard') window.loadDashboardStats();
        });
    });

    // ==========================================
    // 2. STRATEGIES ENGINE (TAB 2)
    // ==========================================
    const container = document.getElementById('strategies-container');
    const stratForm = document.getElementById('add-strat-form');

    // Fetch & Render Strategies
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
                    <div class="card bg-card text-white h-100 shadow-sm">
                        <div class="card-header bg-black border-secondary d-flex justify-content-between align-items-center">
                            <h5 class="m-0 text-warning fw-bold text-truncate" style="max-width: 60%;">${strat.name || 'Strategy'}</h5>
                            ${typeBadge}
                        </div>
                        <div class="card-body d-flex flex-column justify-content-between">
                            <div>
                                <div class="p-2 mb-3 bg-black rounded border border-secondary d-flex justify-content-between align-items-center">
                                    <span class="fw-bold text-white"><i class="fa-solid fa-coins text-warning me-2"></i>${coin}/USDT</span>
                                    <span class="badge bg-success"><i class="fa-solid fa-bolt me-1"></i>Active Engine</span>
                                </div>

                                <div class="small text-light">
                                    <div class="row g-2 mb-2">
                                        <div class="col-6"><strong>RSI Target:</strong> ≤ ${strat.rsiBuyLevel || 40}</div>
                                        <div class="col-6"><strong>Fast/Slow EMA:</strong> ${strat.emaFast || 9}/${strat.emaSlow || 21}</div>
                                    </div>

                                    ${strat.buyTarget ? `<p class="mb-1 text-success"><i class="fa-solid fa-circle-arrow-up me-2"></i><strong>Buy Trigger:</strong> $${strat.buyTarget}</p>` : ''}
                                    ${strat.sellTarget ? `<p class="mb-1 text-danger"><i class="fa-solid fa-circle-arrow-down me-2"></i><strong>Sell Trigger:</strong> $${strat.sellTarget}</p>` : ''}
                                    
                                    ${isPine ? `
                                        <div class="mt-3">
                                            <span class="text-info small fw-bold"><i class="fa-solid fa-terminal me-1"></i>PineScript Snippet:</span>
                                            <div class="p-2 mt-1 bg-black rounded font-monospace text-muted small text-truncate border border-secondary">
                                                ${strat.pineCode.substring(0, 40)}...
                                            </div>
                                        </div>` : ''
                                    }
                                </div>
                            </div>

                            <div class="pt-3 border-top border-secondary mt-3">
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

    // AI Prompt Auto-Parser Engine
    window.parseAIStrategy = function() {
        const promptInput = document.getElementById('ai-prompt-input');
        const promptText = promptInput ? promptInput.value.toLowerCase() : '';
        
        if (!promptText.trim()) {
            alert("⚠️ कृपया AI Prompt बॉक्‍स में कोई टेक्स्ट लिखें!");
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
            nameInput.value = `AI ${coinVal} Strategy`;
        }

        alert("✨ AI ने आपके प्रॉम्ट से फ़ील्ड्स पहचानकर फॉर्म भर दिया है!");
    };

    // Save Strategy Form
    if (stratForm) {
        stratForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('save-strat-btn');
            if(submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> Saving...`;
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
                    const modalEl = document.getElementById('addStratModal');
                    if (modalEl && window.bootstrap) {
                        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                        modal.hide();
                    }
                    window.loadStrategies();
                } else {
                    alert("Failed to save strategy.");
                }
            } catch (err) {
                alert("Error: " + err.message);
            } finally {
                if(submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `Save & Activate Strategy`;
                }
            }
        });
    }

    // Delete Strategy
    window.deleteStrategy = async (id) => {
        if (!confirm("क्या आप वाकई इस स्ट्रेटजी को डिलीट करना चाहते हैं?")) return;
        try {
            await fetch(`${FIREBASE_URL}/trading_strategies/${id}.json`, { method: 'DELETE' });
            window.loadStrategies();
        } catch (e) {
            alert("Error deleting strategy");
        }
    };

    // ==========================================
    // 3. DASHBOARD STATS LOGIC (TAB 1)
    // ==========================================
    window.loadDashboardStats = function() {
        console.log("Dashboard loaded.");
    };

    // ==========================================
    // 4. SETTINGS FORM HANDLER (TAB 6)
    // ==========================================
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const token = document.getElementById('tg-token').value;
            const chatid = document.getElementById('tg-chatid').value;
            localStorage.setItem('tg_token', token);
            localStorage.setItem('tg_chatid', chatid);
            alert("✅ System & Telegram Settings Saved!");
        });
    }

    // Initial Startup Load
    window.loadStrategies();
});
