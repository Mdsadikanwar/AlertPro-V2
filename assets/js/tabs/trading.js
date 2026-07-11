let autoTrade = localStorage.getItem('autoTrade') === 'true';
let lastTradeTime = 0;
const TRADE_COOLDOWN = 300000; // 5 min

// 1. AUTO TOGGLE
function toggleAutoTrade(status) {
  autoTrade = status;
  localStorage.setItem('autoTrade', status);
  document.getElementById('toggleSlider').style.background = status? "#10b981" : "#334155";
}

// 2. AUTO CHECK - हर 1 min में चलेगा
async function runAutoStrategy() {
  const now = Date.now();
  if(now - lastTradeTime < TRADE_COOLDOWN) return; // Cooldown

  const activeStrat = JSON.parse(localStorage.getItem('activeStrategy') || "null");
  if(!activeStrat || !autoTrade) return;

  const coinId = document.getElementById('tradeCoinSelect').value;
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true`);
  const data = await res.json();
  const change24h = data.market_data.price_change_percentage_24h;

  if(change24h > activeStrat.buy) {
    placeTrade('BUY'); 
    lastTradeTime = now;
  }
  else if(change24h < activeStrat.sell) {
    placeTrade('SELL');
    lastTradeTime = now;
  }
}

// Page load पर शुरू करो
setInterval(runAutoStrategy, 60000);
