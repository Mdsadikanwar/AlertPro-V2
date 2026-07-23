const FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com";

// Save Strategy to Firebase
async function saveStrategy(strategyData) {
    try {
        const payload = {
            name: strategyData.name || "My Strategy",
            coin: strategyData.coin || strategyData.symbol || "BTC",
            symbol: (strategyData.coin || "BTC").toUpperCase() + "USDT",
            rsiBuyLevel: parseFloat(strategyData.rsiBuyLevel) || 45,
            emaFast: parseInt(strategyData.emaFast) || 9,
            emaSlow: parseInt(strategyData.emaSlow) || 21,
            rsiPeriod: parseInt(strategyData.rsiPeriod) || 14,
            buyTarget: strategyData.buyTarget ? parseFloat(strategyData.buyTarget) : null,
            sellTarget: strategyData.sellTarget ? parseFloat(strategyData.sellTarget) : null,
            entryTF: strategyData.entryTF || "1h",
            isAutoActive: true,
            status: "active",
            createdAt: new Date().toISOString()
        };

        const response = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("✅ Strategy Saved and Activated Successfully!");
            loadStrategies();
        } else {
            alert("❌ Failed to Save Strategy");
        }
    } catch (err) {
        console.error("Error saving strategy:", err);
    }
}

// Fetch & Display Saved Strategies
async function loadStrategies() {
    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/trading_strategies.json`);
        const data = await res.json() || {};
        
        const container = document.getElementById("saved-strategies-list");
        if (!container) return;

        container.innerHTML = "";
        Object.entries(data).forEach(([id, strat]) => {
            container.innerHTML += `
                <div class="strategy-card border p-3 mb-2 rounded bg-dark text-white">
                    <h5>${strat.name} (${strat.coin || strat.symbol})</h5>
                    <p class="mb-1">RSI Buy Level: <b>${strat.rsiBuyLevel}</b> | Fast/Slow EMA: <b>${strat.emaFast}/${strat.emaSlow}</b></p>
                    <span class="badge bg-success">Status: ${strat.status || 'Active'}</span>
                </div>
            `;
        });
    } catch (err) {
        console.error("Error loading strategies:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadStrategies);
