// ग्लोबल स्टेट - यह याद रखेगा कि अभी कौन सा टैब खुला है
var currentTab = 'DASHBOARD'; 

// मास्टर रेंडर फंक्शन - यह डिसाइड करेगा कि क्या दिखाना है
function renderApp(tabName) {
  currentTab = tabName || currentTab;
  const root = document.getElementById('app');

  // सबसे पहले फिक्स्ड नेविगेशन रेंडर करो
  root.innerHTML = `
    <div style="background: #111827; padding: 15px 20px; display: flex; gap: 15px; border-bottom: 2px solid #1e293b;">
      ${['DASHBOARD', 'STRATEGIES', 'BACKTEST', 'LOGS', 'SETTINGS'].map(tab => `
        <button onclick="renderApp('${tab}')" style="
          padding: 8px 16px; 
          border-radius: 6px; 
          border: none; 
          cursor: pointer;
          background: ${currentTab === tab ? '#38bdf8' : '#1e293b'};
          color: ${currentTab === tab ? '#0f172a' : '#94a3b8'};
          font-weight: bold;
        ">${tab}</button>
      `).join('')}
    </div>
    <div id="view-container"></div>
  `;

  // अब जो टैब सिलेक्टेड है, उसका फंक्शन कॉल करो
  // हमने पुराने 'getMarketNavbar' को हटा दिया क्योंकि नेविगेशन अब ग्लोबल हो गया है
  const viewContainer = document.getElementById('view-container');
  
  switch(currentTab) {
    case 'DASHBOARD': renderCryptoDashboard(); break;
    case 'STRATEGIES': renderCryptoStrategies(); break;
    case 'BACKTEST': renderCryptoBacktest(); break;
    case 'LOGS': renderCryptoLogs(); break;
    case 'SETTINGS': renderCryptoSettings(); break;
  }
}
