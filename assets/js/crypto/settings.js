// Local Storage Settings State
var cryptoSettings = {
  telegramToken: localStorage.getItem('crypto_tg_token') || '',
  telegramChatId: localStorage.getItem('crypto_tg_chatid') || '',
  maxRiskPerTrade: localStorage.getItem('crypto_max_risk') || '2',
  binanceApiKey: localStorage.getItem('crypto_api_key') || ''
};

// Crypto Settings tab render function
function renderCryptoSettings() {
  const root = document.getElementById('app');
  root.innerHTML = `
    ${getMarketNavbar('CRYPTO', '#38bdf8')}
    <div class="container" style="padding: 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">
      
      <div style="margin-bottom: 25px;">
        <h2 style="color: #38bdf8; margin: 0;">Configuration Settings</h2>
        <p style="color: #94a3b8; margin: 5px 0 0 0;">Manage Telegram alerts, API integrations, and risk boundaries</p>
      </div>

      <div style="max-width: 700px; background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #374151; margin: 0 auto;">
        
        <!-- Telegram Alerts Config -->
        <h3 style="color: #38bdf8; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #374151; padding-bottom: 8px;">✈️ Telegram Integration</h3>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; color: #94a3b8; margin-bottom: 8px;">Telegram Bot Token</label>
          <input type="password" id="setTgToken" value="${cryptoSettings.telegramToken}" placeholder="Enter Bot Token (123456:ABC...)" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; box-sizing: border-box;">
        </div>

        <div style="margin-bottom: 25px;">
          <label style="display: block; color: #94a3b8; margin-bottom: 8px;">Telegram Chat ID</label>
          <input type="text" id="setTgChatId" value="${cryptoSettings.telegramChatId}" placeholder="Enter Chat ID" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; box-sizing: border-box;">
        </div>

        <!-- Risk Management Config -->
        <h3 style="color: #22c55e; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #374151; padding-bottom: 8px;">⚠️ Risk Control</h3>
        
        <div style="margin-bottom: 25px;">
          <label style="display: block; color: #94a3b8; margin-bottom: 8px;">Max Risk Per Trade (%)</label>
          <input type="number" id="setRisk" value="${cryptoSettings.maxRiskPerTrade}" min="0.1" max="10" step="0.1" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; box-sizing: border-box;">
        </div>

        <!-- API Exchange Integration -->
        <h3 style="color: #eab308; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #374151; padding-bottom: 8px;">🔑 Exchange API Key</h3>
        
        <div style="margin-bottom: 25px;">
          <label style="display: block; color: #94a3b8; margin-bottom: 8px;">Binance API Key</label>
          <input type="password" id="setApiKey" value="${cryptoSettings.binanceApiKey}" placeholder="Enter Binance API Key" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #4b5563; border-radius: 6px; color: #fff; box-sizing: border-box;">
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 15px;">
          <button onclick="saveCryptoSettings()" style="flex: 1; padding: 14px; background: #22c55e; color: #fff; border: none; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer;">Save Settings</button>
          <button onclick="testTelegramAlert()" style="flex: 1; padding: 14px; background: #374151; color: #fff; border: 1px solid #4b5563; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer;">Test Telegram Alert</button>
        </div>

      </div>

    </div>
  `;
}

// Save to LocalStorage
function saveCryptoSettings() {
  const token = document.getElementById('setTgToken').value;
  const chatid = document.getElementById('setTgChatId').value;
  const risk = document.getElementById('setRisk').value;
  const apiKey = document.getElementById('setApiKey').value;

  localStorage.setItem('crypto_tg_token', token);
  localStorage.setItem('crypto_tg_chatid', chatid);
  localStorage.setItem('crypto_max_risk', risk);
  localStorage.setItem('crypto_api_key', apiKey);

  cryptoSettings = { telegramToken: token, telegramChatId: chatid, maxRiskPerTrade: risk, binanceApiKey: apiKey };

  alert("Settings saved successfully to browser local storage!");
}

// Simulated Test Alert
function testTelegramAlert() {
  const token = document.getElementById('setTgToken').value;
  const chatid = document.getElementById('setTgChatId').value;

  if (!token || !chatid) {
    alert("Please fill both Telegram Token and Chat ID to test!");
    return;
  }

  // Real API Request to Telegram Bot
  const message = "⚡ ApexTraders V2 Test Alert: Connection Verified!";
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatid}&text=${encodeURIComponent(message)}`;

  fetch(url)
    .then(response => {
      if (response.ok) {
        alert("Success! Test Telegram alert sent successfully.");
      } else {
        alert("Error: Unable to send alert. Please check your Bot Token or Chat ID.");
      }
    })
    .catch(error => {
      alert("Error: Network issue or invalid credentials.");
      console.error(error);
    });
}
