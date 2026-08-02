// ApexTraders - Strategy & Signal Rules Manager (100% Production Ready)

document.addEventListener('DOMContentLoaded', () => {
    initStrategiesModule();
});

function getMasterData() {
    try {
        const local = localStorage.getItem('apex_master_data');
        return local ? JSON.parse(local) : {};
    } catch (e) {
        console.error("Localstorage read error:", e);
        return {};
    }
}

function saveMasterDataLocally(data) {
    try {
        localStorage.setItem('apex_master_data', JSON.stringify(data));
    } catch (e) {
        console.error("Localstorage save error:", e);
    }
}

function initStrategiesModule() {
    renderStrategiesList();

    const saveBtn = document.getElementById('save-strategy-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveStrategy);
    }
}

function renderStrategiesList() {
    const container = document.getElementById('strategies-container') || document.getElementById('strategy-list');
    if (!container) return;

    const master = getMasterData();
    const strategies = master.strategies || [];

    if (strategies.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4 text-muted">
                <i class="bi bi-diagram-3 display-6"></i>
                <p class="mt-2">No active strategies found. Click "Add New Strategy" to configure signal generators.</p>
            </div>
        `;
        return;
    }

    let html = '';
    strategies.forEach((strat, index) => {
        const isActive = strat.active !== false;
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card h-100 shadow-sm border-${isActive ? 'primary' : 'secondary'}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title m-0 font-weight-bold">${escapeHtml(strat.name || 'Unnamed Strategy')}</h5>
                            <span class="badge ${isActive ? 'bg-success' : 'bg-secondary'}">
                                ${isActive ? 'Active' : 'Paused'}
                            </span>
                        </div>
                        <h6 class="card-subtitle mb-3 text-muted">Pairs: <code>${escapeHtml(strat.coin || 'BTCUSDT')}</code></h6>
                        
                        <div class="row text-center mb-3">
                            <div class="col-6">
                                <small class="text-muted d-block">Stop Loss</small>
                                <span class="fw-bold text-danger">${strat.sl || 1.5}%</span>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">Take Profit</small>
                                <span class="fw-bold text-success">${strat.tp || 3.0}%</span>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="strat-toggle-${index}" ${isActive ? 'checked' : ''} onchange="toggleStrategyState(${index})">
                                <label class="form-check-label small" for="strat-toggle-${index}">Signals ${isActive ? 'ON' : 'OFF'}</label>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteStrategy(${index})">
                                    <i class="bi bi-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function handleSaveStrategy() {
    const nameInput = document.getElementById('strat-name');
    const coinInput = document.getElementById('strat-coin');
    const slInput = document.getElementById('strat-sl');
    const tpInput = document.getElementById('strat-tp');

    if (!nameInput || !coinInput) return;

    const name = nameInput.value.trim();
    const coin = coinInput.value.trim().toUpperCase();
    const sl = parseFloat(slInput ? slInput.value : 1.5) || 1.5;
    const tp = parseFloat(tpInput ? tpInput.value : 3.0) || 3.0;

    if (!name || !coin) {
        alert("Strategy Name and Trading Pair(s) are required!");
        return;
    }

    const master = getMasterData();
    if (!master.strategies) master.strategies = [];

    master.strategies.push({
        id: 'STRAT_' + Date.now(),
        name: name,
        coin: coin,
        sl: sl,
        tp: tp,
        active: true
    });

    saveMasterDataLocally(master);

    // Sync to Firebase if master setup is active
    syncMasterToFirebase(master);

    // Reset Form & Close Modal
    nameInput.value = '';
    coinInput.value = '';
    if (slInput) slInput.value = '1.5';
    if (tpInput) tpInput.value = '3.0';

    const modalElem = document.getElementById('addStrategyModal');
    if (modalElem && window.bootstrap) {
        const modal = bootstrap.Modal.getInstance(modalElem);
        if (modal) modal.hide();
    }

    renderStrategiesList();
    if (typeof window.triggerGlobalSave === 'function') window.triggerGlobalSave();
}

window.toggleStrategyState = function(index) {
    const master = getMasterData();
    if (master.strategies && master.strategies[index]) {
        master.strategies[index].active = !master.strategies[index].active;
        saveMasterDataLocally(master);
        syncMasterToFirebase(master);
        renderStrategiesList();
        if (typeof window.triggerGlobalSave === 'function') window.triggerGlobalSave();
    }
};

window.deleteStrategy = function(index) {
    if (!confirm("Are you sure you want to delete this signal strategy?")) return;

    const master = getMasterData();
    if (master.strategies && master.strategies[index]) {
        master.strategies.splice(index, 1);
        saveMasterDataLocally(master);
        syncMasterToFirebase(master);
        renderStrategiesList();
        if (typeof window.triggerGlobalSave === 'function') window.triggerGlobalSave();
    }
};

async function syncMasterToFirebase(masterData) {
    const settings = masterData.settings || {};
    if (settings.fbEnable && settings.firebaseUrl) {
        try {
            const cleanUrl = settings.firebaseUrl.replace(/\/+$/, "");
            await fetch(`${cleanUrl}/app_master_data/strategies.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(masterData.strategies || [])
            });
        } catch (err) {
            console.error("Firebase strategy sync failed:", err);
        }
    }
}

function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
