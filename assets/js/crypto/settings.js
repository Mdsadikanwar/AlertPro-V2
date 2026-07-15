// Global Settings State (इसे अपने कोड के सबसे ऊपर ग्लोबल रख सकते हैं)
var appSettings = {
  telegramToken: "876543210:AAH_mock_token_goes_here",
  telegramChatId: "123456789",
  riskPerTrade: "2.0",
  maxDailyLoss: "5.0",
  defaultLeverage: "10x",
  mockApiKey: "ap_key_89234xxxxxx",
  mockApiSecret: "ap_sec_99345xxxxxx"
};

function renderCryptoSettings() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <div style="margin-bottom: 25px;">
        <h2 style="color: #38bdf8; margin: 0;">System Settings</h2>
        <p style="color: #94a3b8; margin: 5px 0 0 0;">Configure your bot execution parameters, API connections, and risk rules</p>
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

        <!-- Risk Management Card -->
        <div style="flex: 1; min-width: 300px; background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #374151; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
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

          <div style="margin-top: 30px;">
            <button onclick="saveCryptoSettings()" style="width: 100%; padding: 14px; background: #38bdf8; color: #0f172a; border: none; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer;">
              Save Configuration
            </button>
          </div>
        </div>

      </div>

    </div>
  `;
}

function saveCryptoSettings() {
  appSettings.telegramToken = document.getElementById('setTelegramToken').value;
  appSettings.telegramChatId = document.getElementById('setTelegramChatId').value;
  appSettings.mockApiKey = document.getElementById('setApiKey').value;
  appSettings.mockApiSecret = document.getElementById('setApiSecret').value;
  appSettings.riskPerTrade = document.getElementById('setRiskPerTrade').value;
  appSettings.maxDailyLoss = document.getElementById('setMaxDailyLoss').value;
  appSettings.defaultLeverage = document.getElementById('setLeverage').value;

  // Logs में भी सेव होने का इवेंट डाल देते हैं
  addSystemLog("SYSTEM", "System configurations updated by user.");
  addSystemLog("SUCCESS", `Risk Rules updated: Risk ${appSettings.riskPerTrade}%, Max Loss ${appSettings.maxDailyLoss}%`);

  alert("⚙️ Settings saved successfully!");
  renderCryptoSettings();
}
