document.addEventListener('DOMContentLoaded', () => {
    const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

    const addStratBtn = document.getElementById('addStrategyBtn');
    const stratModal = document.getElementById('strategyModal');
    const stratForm = document.getElementById('strategyForm');
    const stratList = document.getElementById('strategyListContainer');

    async function fetchStrategies() {
        if (!stratList) return;
        try {
            const res = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`);
            const data = await res.json() || {};
            renderStrategies(data);
        } catch (e) {
            console.error("Error fetching strategies:", e);
        }
    }

    function renderStrategies(data) {
        if (!stratList) return;
        stratList.innerHTML = '';
        const keys = Object.keys(data);
        if (keys.length === 0) {
            stratList.innerHTML = `<p class="text-muted text-center py-4">No active strategies found. Click "Add Strategy" to create one.</p>`;
            return;
        }

        keys.forEach(key => {
            const item = data[key];
            const card = document.createElement('div');
            card.className = 'glass-card mb-3 p-3 position-relative';
            card.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="m-0 font-weight-bold text-gradient">${item.name || 'Unnamed Strategy'}</h5>
                    <span class="badge badge-soft-${item.status === 'active' ? 'success' : 'secondary'}">${item.status || 'Active'}</span>
                </div>
                <div class="row text-muted small">
                    <div class="col-6">Asset: <strong class="text-white">${item.coin || 'BTC'}</strong></div>
                    <div class="col-6">Timeframe: <strong class="text-white">${item.entryTF || '1h'}</strong></div>
                    <div class="col-6 mt-1">Buy Target: <strong class="text-success">$${item.buyTarget || 'N/A'}</strong></div>
                    <div class="col-6 mt-1">Sell Target: <strong class="text-danger">$${item.sellTarget || 'N/A'}</strong></div>
                </div>
                <button class="btn btn-sm btn-outline-danger position-absolute" style="top:10px; right:10px;" onclick="deleteStrategy('${key}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            stratList.appendChild(card);
        });
    }

    if (stratForm) {
        stratForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('stratName')?.value || 'Strategy',
                coin: document.getElementById('stratCoin')?.value || 'BTC',
                entryTF: document.getElementById('stratTF')?.value || '1h',
                buyTarget: document.getElementById('stratBuy')?.value || '',
                sellTarget: document.getElementById('stratSell')?.value || '',
                status: 'active',
                createdAt: new Date().toISOString()
            };

            try {
                await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (window.jQuery && stratModal) $(stratModal).modal('hide');
                stratForm.reset();
                fetchStrategies();
            } catch (err) {
                alert('Error saving strategy');
            }
        });
    }

    window.deleteStrategy = async (id) => {
        if (!confirm('Are you sure you want to delete this strategy?')) return;
        try {
            await fetch(`${FIREBASE_BASE_URL}/trading_strategies/${id}.json`, { method: 'DELETE' });
            fetchStrategies();
        } catch (e) {
            console.error(e);
        }
    };

    fetchStrategies();
});
