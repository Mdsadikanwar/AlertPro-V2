(function() {
    // Storage Keys
    const LOCAL_SETTINGS_KEY = 'apex_settings';
    const LOCAL_TRADES_KEY = 'apex_bot_trades';

    // Helper: Get Settings
    function getStoredSettings() {
        return JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || '{}');
    }

    // Helper: Get Trades from LocalStorage
    function getStoredTrades() {
        return JSON.parse(localStorage.getItem(LOCAL_TRADES_KEY) || '[]');
    }

    // Helper: Save Trades to LocalStorage & Firebase (if enabled)
    function saveTrades(trades) {
        localStorage.setItem(LOCAL_TRADES_KEY, JSON.stringify(trades));
        
        const config = getStoredSettings();
        if (config.fbEnable && config.firebaseUrl && config.firebaseUrl.startsWith('https://')) {
            const baseUrl = config.firebaseUrl.replace(/\/$/, "");
            fetch(`${baseUrl}/bot_trades.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trades)
            }).catch(err => console.error("Firebase Sync Error (Trades):", err));
        }
    }

    // Default Seed Data (अगर पहली बार खोल रहे हैं तो दिखेगा)
    function initializeDefaultLogs() {
        const existing = getStoredTrades();
        if (existing.length === 0) {
            const initialLogs = [
                { id: Date.now() - 3000, time: '21:35:10', strategy: 'BTC Crossover', symbol: 'BTCUSDT', action: 'BUY (LONG)', price: '$64,250.00', status: 'SUCCESS' },
                { id: Date.now() - 2000, time: '20:12:45', strategy: 'ETH RSI Dip', symbol: 'ETHUSDT', action: 'SELL (SHORT)', price: '$3,480.50', status: 'PENDING' },
                { id: Date.now() - 1000, time: '19:00:22', strategy: 'SOL Scalper', symbol: 'SOLUSDT', action: 'BUY (LONG)', price: '$142.10', status: 'CLOSED' }
            ];
            saveTrades(initialLogs);
            return initialLogs;
        }
        return existing;
    }

    // 1. MAIN LOAD LOGS FUNCTION
    window.loadBotLogs = async function() {
        console.log("Loading Bot Trading Logs...");
        const tableBody = document.getElementById('bot-trades-table');
        if (!tableBody) return;

        let logs = getStoredTrades();

        // अगर LocalStorage खाली है तो डिफ़ॉल्ट डेटा भरें
        if (!logs || logs.length === 0) {
            logs = initializeDefaultLogs();
        }

        // Firebase से ताज़ा डेटा लाने की कोशिश करें (यदि Sync Enabled है)
        const config = getStoredSettings();
        if (config.fbEnable && config.firebaseUrl && config.firebaseUrl.startsWith('https://')) {
            try {
                const baseUrl = config.firebaseUrl.replace(/\/$/, "");
                const res = await fetch(`${baseUrl}/bot_trades.json`);
                if (res.ok) {
                    const fbData = await res.json();
                    if (fbData && Array.isArray(fbData)) {
                        logs = fbData;
                        localStorage.setItem(LOCAL_TRADES_KEY, JSON.stringify(logs));
                    }
                }
            } catch (err) {
                console.warn("Could not fetch trades from Firebase, using LocalStorage.");
            }
        }

        renderTradesTable(logs);
    };

    // 2. RENDER TRADES TABLE
    function renderTradesTable(logs) {
        const tableBody = document.getElementById('bot-trades-table');
        if (!tableBody) return;

        if (logs.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No execution logs found.</td></tr>`;
            return;
        }

        let html = '';
        logs.forEach(log => {
            // Badge Styles
            let badgeClass = 'bg-secondary text-white';
            if (log.status === 'SUCCESS' || log.status === 'EXECUTED') badgeClass = 'bg-success text-white';
            else if (log.status === 'PENDING') badgeClass = 'bg-warning text-dark';
            else if (log.status === 'FAILED' || log.status === 'CANCELLED') badgeClass = 'bg-danger text-white';
            else if (log.status === 'CLOSED') badgeClass = 'bg-info text-dark';

            const actionClass = (log.action && log.action.includes('BUY')) ? 'text-success' : 'text-danger';

            html += `
                <tr>
                    <td class="text-muted small">${log.time || '--:--:--'}</td>
                    <td class="fw-bold text-white">${log.strategy || 'Manual Trigger'}</td>
                    <td><span class="badge bg-secondary border border-secondary">${log.symbol || 'N/A'}</span></td>
                    <td class="${actionClass} fw-bold">${log.action || 'BUY'}</td>
                    <td class="fw-bold">${log.price || '$0.00'}</td>
                    <td><span class="badge ${badgeClass} fw-bold small">${log.status || 'PENDING'}</span></td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    }

    // 3. EXPOSED GLOBAL HELPER: Add new Log dynamically from webhook/engine
    window.addNewBotLog = function(logData) {
        const logs = getStoredTrades();
        
        // Auto Time Format if missing
        if (!logData.time) {
            const now = new Date();
            logData.time = now.toTimeString().split(' ')[0];
        }

        logData.id = Date.now();
        logs.unshift(logData); // Top पर नया लॉग जोड़ें

        // Max 50 Logs तक सीमित रखें
        if (logs.length > 50) logs.pop();

        saveTrades(logs);
        renderTradesTable(logs);
    };

    // Initial Event Listener
    document.addEventListener('DOMContentLoaded', () => {
        // अगर Bot Tab Active है तो ऑटो लोड करें
        window.loadBotLogs();
    });

})();
