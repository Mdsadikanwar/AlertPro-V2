// ApexTraders Safe Load - Strategies
(function() {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";
        const stratList = document.getElementById('strategyListContainer') || document.getElementById('strategies-list');

        async function fetchStrategies() {
            if (!stratList) return;
            try {
                const res = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`);
                if (!res.ok) return;
                const data = await res.json() || {};
                renderStrategies(data);
            } catch (e) {
                console.warn("Strategies load issue:", e);
            }
        }

        function renderStrategies(data) {
            if (!stratList) return;
            stratList.innerHTML = '';
            const keys = Object.keys(data);
            if (keys.length === 0) {
                stratList.innerHTML = `<p class="text-muted text-center py-4">No active strategies found.</p>`;
                return;
            }

            keys.forEach(key => {
                const item = data[key];
                const card = document.createElement('div');
                card.className = 'glass-card mb-3 p-3 position-relative';
                card.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="m-0 font-weight-bold text-gradient">${item.name || 'Strategy'}</h5>
                        <span class="badge badge-soft-${item.status === 'active' ? 'success' : 'secondary'}">${item.status || 'Active'}</span>
                    </div>
                    <div class="row text-muted small">
                        <div class="col-6">Asset: <strong class="text-white">${item.coin || 'BTC'}</strong></div>
                        <div class="col-6">Timeframe: <strong class="text-white">${item.entryTF || '1h'}</strong></div>
                    </div>
                `;
                stratList.appendChild(card);
            });
        }

        fetchStrategies();
    });
})();
