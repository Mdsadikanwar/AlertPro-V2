const DEVICE_ID = 'apextraders_v5';
const STATE = { coinId: 'bitcoin', coinSymbol: 'BTC', currency: 'usd', price: 0, high24h: 0, low24h: 0, change24h: 0, signal: 'HOLD', balance: 10000, coinHolding: 0, trades: 0, autoTrade: false, tgToken: '', tgChat: '', lastTradeTime: 0 };
const COIN_DATA = {
  'bitcoin': { symbol: 'BTC', cgId: 'bitcoin' }, 'ethereum': { symbol: 'ETH', cgId: 'ethereum' }, 'binancecoin': { symbol: 'BNB', cgId: 'binancecoin' },
  'solana': { symbol: 'SOL', cgId: 'solana' }, 'dogecoin': { symbol: 'DOGE', cgId: 'dogecoin' }
};
let STRATEGIES = [];
let storageMode = localStorage.getItem("storageMode") || "local";

function log(msg) {
  const logBox = document.getElementById('logBox');
  if(logBox) logBox.innerHTML = `<div class="log-item">${new Date().toLocaleTimeString()} - ${msg}</div>` + logBox.innerHTML;
}

async function fetchCoinData() {
  try {
    let url = `https://api.coingecko.com/api/v3/coins/${COIN_DATA[STATE.coinId].cgId}?localization=false&market_data=true`;
    let res = await fetch(url); 
    const data = await res.json(); const m = data.market_data;
    STATE.price = m.current_price[STATE.currency]; STATE.high24h = m.high_24h[STATE.currency]; STATE.low24h = m.low_24h[STATE.currency]; STATE.change24h = m.price_change_percentage_24h;
    document.getElementById('coinPrice').textContent = (STATE.currency==='usd'?'$':'₹') + STATE.price.toFixed(2);
    document.getElementById('coinChange').textContent = (STATE.change24h >= 0? '▲ ' : '▼ ') + STATE.change24h.toFixed(2) + '% (24h)';
    log(`✅ Price Updated: ${STATE.price.toFixed(2)}`);
  } catch(e) { log('❌ API Error'); }
}

function saveAllToLocal() {
  localStorage.setItem('apextraders_state', JSON.stringify(STATE));
  localStorage.setItem('apextraders_strategies', JSON.stringify(STRATEGIES));
}

function loadConfig() {
  let state = localStorage.getItem('apextraders_state');
  let strats = localStorage.getItem('apextraders_strategies');
  if(state) Object.assign(STATE, JSON.parse(state));
  if(strats) STRATEGIES = JSON.parse(strats);
}
loadConfig();
