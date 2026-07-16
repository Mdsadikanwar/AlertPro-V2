// Global Firebase Setup Check
var firebaseConfig = window.firebaseConfig || {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

if (typeof firebase !== 'undefined' && !firebase.apps.length && firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
}

// Global Settings State with Auto-Load
var appSettings = {
  telegramToken: localStorage.getItem('app_telegramToken') || "876543210:AAH_mock_token_goes_here",
  telegramChatId: localStorage.getItem('app_telegramChatId') || "123456789",
  riskPerTrade: localStorage.getItem('app_riskPerTrade') || "2.0",
  maxDailyLoss: localStorage.getItem('app_maxDailyLoss') || "5.0",
  defaultLeverage: localStorage.getItem('app_defaultLeverage') || "10x",
  mockApiKey: localStorage.getItem('app_mockApiKey') || "ap_key_89234xxxxxx",
  mockApiSecret: localStorage.getItem('app_mockApiSecret') || "ap_sec_99345xxxxxx",
  syncMode: localStorage.getItem('app_syncMode') || "local_first"
};

// Crypto Settings tab render function
function renderCryptoSettings() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <div style="margin-bottom: 25px;">
        <h2 style="color: #38bdf8; margin: 0;">System Settings</h2>
        <p style="color: #94a3b8; margin: 5px 0 0 0;">Configure your bot execution parameters, API connections, and risk rules</p>
      </div>

      <div id="syncIndicator" style="display: none; justify-content: space-between; align-items: center; background: #1e293b; border: 1px solid #10b981; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px;">
        <span style="color: #10b981; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 8px;">
          🟢 Real-Time Cloud Sync Active
        </span>
        <button onclick="pullDataFromFirebase()" style="background: #10b981; color: #0f172a; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 12px; cursor: pointer;">
          Force Pull Cloud Data
        </button>
      </div>

      <div style="display: flex; gap: 25px; flex-wrap: wrap;">
        
        <!-- Integrations (Telegram & APIs) -->
        <div style="flex: 1.2; min-width: 320px; background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #374151;">
          <h3 style="color: #38bdf8; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #374151; padding-bottom: 10px;">🔌 Integrations</h3>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 14px;">Telegram Bot Token</label>
            <input type="password" id="setTelegramToken" value="${appSettings.telegramToken}" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 14px;">Telegram Chat ID</label>
            <input type="text" id="setTelegramChatId" value="${appSettings.telegramChatId}" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; box-sizing: border-box;">
          </div>

          <h3 style="color: #38bdf8; margin-top: 25px; margin-bottom: 20px; border-bottom: 1px solid #374151; padding-bottom: 10px;">🔑 Exchange API Keys</h3>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 14px;">Mock API Key</label>
            <input type="text" id="setApiKey" value="${appSettings.mockApiKey}" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 14px;">Mock API Secret</label>
            <input type="password" id="setApiSecret" value="${appSettings.mockApiSecret}" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; box-sizing: border-box;">
          </div>
        </div>

        <!-- Right Column: Risk & Sync Settings -->
        <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Risk Management Card -->
          <div style="background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #374151;">
            <h3 style="color: #f43f5e; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #374151; padding-bottom: 10px;">🛡️ Risk Management</h3>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 14px;">Default Risk Per Trade (%)</label>
              <input type="number" id="setRiskPerTrade" value="${appSettings.riskPerTrade}" step="0.1" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; box-sizing: border-box;">
            </div>

            <div style="margin-bottom: 15px;">
              <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 14px;">Max Daily Drawdown/Loss (%)</label>
              <input type="number" id="setMaxDailyLoss" value="${appSettings.maxDailyLoss}" step="0.1" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; box-sizing: border-box;">
            </div>

            <div style="margin-bottom: 15px;">
              <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 14px;">Default Leverage</label>
              <select id="setLeverage" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff;">
                <option value="1x" ${appSettings.defaultLeverage === '1x' ? 'selected' : ''}>1x (Spot)</option>
                <option value="5x" ${appSettings.defaultLeverage === '5x' ? 'selected' : ''}>5x</option>
                <option value="10x" ${appSettings.defaultLeverage === '10x' ? 'selected' : ''}>10x</option>
                <option value="20x" ${appSettings.defaultLeverage === '20x' ? 'selected' : ''}>20x</option>
              </select>
            </div>
          </div>

          <!-- Backup & Cloud Sync Card -->
          <div style="background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #374151;">
            <h3 style="color: #10b981; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #374151; padding-bottom: 10px;">💾 Backup & Cloud Sync</h3>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; color: #94a3b8; margin-bottom: 8px; font-size: 14px;">Data Saving Mode</label>
              <select id="setSyncMode" onchange="toggleSyncUI(this.value)" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff;">
                <option value="local_first" ${appSettings.syncMode === 'local_first' ? 'selected' : ''}>📱 Local Storage Only (Offline)</option>
                <option value="cloud_sync" ${appSettings.syncMode === 'cloud_sync' ? 'selected' : ''}>☁️ Firebase Real-time Cloud Sync</option>
              </select>
            </div>

            <p id="syncModeDesc" style="color: #94a3b8; font-size: 12px; line-height: 1.4; margin: 0 0 15px 0;">
              Your data remains saved only on this device.
            </p>
          </div>

          <div>
            <button onclick="saveCryptoSettings()" style="width: 100%; padding: 14px; background: #38bdf8; color: #0f172a; border: none; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer;">
              Save Configuration
            </button>
          </div>

        </div>

      </div>

    </div>
  `;

  toggleSyncUI(appSettings.syncMode);

  if (typeof addSystemLog === 'function') {
    addSystemLog("SYSTEM", "Settings configuration panel loaded.");
  }
}

function toggleSyncUI(mode) {
  const desc = document.getElementById('syncModeDesc');
  const indicator = document.getElementById('syncIndicator');
  if (!desc) return;

  if (mode === 'cloud_sync') {
    desc.innerHTML = "<strong>Firebase Sync Active:</strong> Changes are saved locally instantly, and backed up on the cloud 1 second later. You can log in anywhere and your settings will automatically sync.";
    if (indicator) indicator.style.display = 'flex';
  } else {
    desc.innerHTML = "<strong>Local Storage Only:</strong> Your settings will be saved securely on this browser only. Cloud multi-device backup is disabled.";
    if (indicator) indicator.style.display = 'none';
  }
}

function saveCryptoSettings() {
  appSettings.telegramToken = document.getElementById('setTelegramToken').value;
  appSettings.telegramChatId = document.getElementById('setTelegramChatId').value;
  appSettings.mockApiKey = document.getElementById('setApiKey').value;
  appSettings.mockApiSecret = document.getElementById('setApiSecret').value;
  appSettings.riskPerTrade = document.getElementById('setRiskPerTrade').value;
  appSettings.maxDailyLoss = document.getElementById('setMaxDailyLoss').value;
  appSettings.defaultLeverage = document.getElementById('setLeverage').value;
  appSettings.syncMode = document.getElementById('setSyncMode').value;

  localStorage.setItem('app_telegramToken', appSettings.telegramToken);
  localStorage.setItem('app_telegramChatId', appSettings.telegramChatId);
  localStorage.setItem('app_mockApiKey', appSettings.mockApiKey);
  localStorage.setItem('app_mockApiSecret', appSettings.mockApiSecret);
  localStorage.setItem('app_riskPerTrade', appSettings.riskPerTrade);
  localStorage.setItem('app_maxDailyLoss', appSettings.maxDailyLoss);
  localStorage.setItem('app_defaultLeverage', appSettings.defaultLeverage);
  localStorage.setItem('app_syncMode', appSettings.syncMode);

  if (typeof addSystemLog === 'function') {
    addSystemLog("SUCCESS", "Settings saved locally to browser storage.");
  }

  if (appSettings.syncMode === 'cloud_sync') {
    if (typeof addSystemLog === 'function') {
      addSystemLog("SYSTEM", "Queuing Firebase cloud sync in 1 second...");
    }
    setTimeout(() => {
      pushDataToFirebase();
    }, 1000);
  } else {
    alert("⚙️ Settings saved successfully (Offline Mode)!");
    renderCryptoSettings();
  }
}

function pushDataToFirebase() {
  if (typeof firebase === 'undefined' || !firebase.apps.length) {
    if (typeof addSystemLog === 'function') {
      addSystemLog("ERROR", "Firebase SDK not found! Unable to backup data online.");
    }
    alert("⚠️ Local save successful, but Firebase cloud backup failed because SDK is missing.");
    return;
  }

  const database = firebase.database();
  database.ref('app_settings').set({
    telegramToken: appSettings.telegramToken,
    telegramChatId: appSettings.telegramChatId,
    mockApiKey: appSettings.mockApiKey,
    mockApiSecret: appSettings.mockApiSecret,
    riskPerTrade: appSettings.riskPerTrade,
    maxDailyLoss: appSettings.maxDailyLoss,
    defaultLeverage: appSettings.defaultLeverage,
    lastSynced: new Date().toISOString()
  })
  .then(() => {
    if (typeof addSystemLog === 'function') {
      addSystemLog("SUCCESS", "Cloud backup updated successfully! All devices synchronized.");
    }
    alert("☁️ Settings saved locally & synced to Firebase Cloud successfully!");
    renderCryptoSettings();
  })
  .catch((error) => {
    if (typeof addSystemLog === 'function') {
      addSystemLog("ERROR", `Firebase Sync failed: ${error.message}`);
    }
    alert(`❌ Firebase sync error: ${error.message}`);
  });
}

function pullDataFromFirebase() {
  if (typeof firebase === 'undefined' || !firebase.apps.length) {
    return;
  }

  if (typeof addSystemLog === 'function') {
    addSystemLog("SYSTEM", "Fetching latest configurations from Firebase Cloud...");
  }

  const database = firebase.database();
  database.ref('app_settings').once('value')
    .then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        appSettings.telegramToken = data.telegramToken || appSettings.telegramToken;
        appSettings.telegramChatId = data.telegramChatId || appSettings.telegramChatId;
        appSettings.mockApiKey = data.mockApiKey || appSettings.mockApiKey;
        appSettings.mockApiSecret = data.mockApiSecret || appSettings.mockApiSecret;
        appSettings.riskPerTrade = data.riskPerTrade || appSettings.riskPerTrade;
        appSettings.maxDailyLoss = data.maxDailyLoss || appSettings.maxDailyLoss;
        appSettings.defaultLeverage = data.defaultLeverage || appSettings.defaultLeverage;

        localStorage.setItem('app_telegramToken', appSettings.telegramToken);
        localStorage.setItem('app_telegramChatId', appSettings.telegramChatId);
        localStorage.setItem('app_mockApiKey', appSettings.mockApiKey);
        localStorage.setItem('app_mockApiSecret', appSettings.mockApiSecret);
        localStorage.setItem('app_riskPerTrade', appSettings.riskPerTrade);
        localStorage.setItem('app_maxDailyLoss', appSettings.maxDailyLoss);
        localStorage.setItem('app_defaultLeverage', appSettings.defaultLeverage);

        if (typeof addSystemLog === 'function') {
          addSystemLog("SUCCESS", "Settings successfully pulled from Firebase. Interface refreshed.");
        }
        renderCryptoSettings();
      } else {
        if (typeof addSystemLog === 'function') {
          addSystemLog("SYSTEM", "No cloud backup found on Firebase database. Starting fresh.");
        }
      }
    })
    .catch((error) => {
      if (typeof addSystemLog === 'function') {
        addSystemLog("ERROR", `Failed to retrieve data from Firebase: ${error.message}`);
      }
    });
}

window.addEventListener('DOMContentLoaded', () => {
  if (appSettings.syncMode === 'cloud_sync') {
    pullDataFromFirebase();
  }
});
