let currentSymbol = "BINANCE:BTCUSDT";
let botRunning = false;
let botInterval = null;
let botStats = { trades: 0, pnl: 0 };

function renderTrading() {
  let coin = currentSymbol.split(":")[1].replace("USDT","");

  showScreen(`${getNavbar()}
    <div class="container">

      <div class="card">
        <h3>Select Coin for Auto Trading</h3>
        <select id="coinSelect" onchange="changeCoin(this.value)" style="width:100%; padding:10px; background:#1f2937; color:white; border:1px solid #374151; border-radius:8px; font-size:16px;">
          <option value="BINANCE:BTCUSDT">BTC / USDT</option>
          <option value="BINANCE:ETHUSDT">ETH / USDT</option>
          <option value="BINANCE:SOLUSDT">SOL / USDT</option>
          <option value="BINANCE:BNBUSDT">BNB / USDT</option>
          <option value="BINANCE:XRPUSDT">XRP / USDT</option>
        </select>
      </div>

      <!-- CHART -->
      <div class="card">
        <h3 id="chartTitle">Live Chart - ${coin}/USDT</h3>
        <div id="tradingview_chart" style="height: 500px;"></div>
      </div>

      <!-- AUTO BOT PANEL -->
      <div class="card" style="padding:15px; text-align:center;">
        <h2 id="botStatus" style="color:#ef4444; margin-bottom:15px;">Bot: STOPPED</h2>

        <div id="activeStratText" style="font-size:14px; color:#94a3b8; margin-bottom:8px;">Strategy: None</div>

        <div id="botSignal" style="font-size:18px; font-weight:bold; margin-bottom:15px; color:#94a3b8;">
          Waiting for signal...
        </div>

        <button id="botBtn" onclick="toggleBot()" style="width:100%; padding:18px; background:#22c55e; color:white; border:none; border-radius:10px; font-size:18px; font-weight:bold;">
          START AUTO TRADING
        </button>
      </div>

      <!-- BOT STATS -->
      <div class="card">
        <h3>Bot Statistics</h3>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span>Total Trades</span> <b id="totalTrades">0</b>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span>Bot PNL</span> <b id="botPnl" style="color:#22c55e;">$0.00</b>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>Win Rate</span> <b id="winRate">0%</b>
        </div>
      </div>

    </div>
  `);

  loadTradingViewWidget();
  updateActiveStrategyText();
  setInterval(updateActiveStrategyText, 2000);
}

function updateActiveStrategyText(){
  let text = document.getElementById('activeStratText');
  if(typeof activeStrategy!= 'undefined' && activeStrategy!= 'none'){
    text.innerText = `Strategy: ${activeStrategy.toUpperCase()}`;
    text.style.color = '#22c55e';
  } else {
    text.innerText = 'Strategy: None - Go to Strategy Tab';
    text.style.color = '#ef4444';
  }
}

function toggleBot(){
  if(typeof activeStrategy == 'undefined' || activeStrategy == 'none'){
    alert("पहले Strategy tab से कोई strategy ON करो!");
    return;
  }

  botRunning =!botRunning;
  let btn = document.getElementById('botBtn');
  let status = document.getElementById('botStatus');

  if(botRunning){
    btn.innerText = "STOP AUTO TRADING";
    btn.style.background = "#ef4444";
    status.innerText = "Bot: RUNNING";
    status.style.color = "#22c55e";
    startBot();
  } else {
    btn.innerText = "START AUTO TRADING";
    btn.style.background = "#22c55e";
    status.innerText = "Bot: STOPPED";
    status.style.color = "#ef4444";
    stopBot();
  }
}

function startBot(){
  document.getElementById('botSignal').innerText = "Scanning market...";
  botInterval = setInterval(checkSignal, 10000); // 10 sec me 1 signal check
}

function stopBot(){
  clearInterval(botInterval);
  document.getElementById('botSignal').innerText = "Waiting for signal...";
}

// STRATEGY SE SIGNAL
function checkSignal(){
  let signal = getSignalFromStrategy(activeStrategy);
  let signalDiv = document.getElementById('botSignal');

  if(signal == 'BUY'){
    signalDiv.innerText = "BUY SIGNAL! Placing order...";
    signalDiv.style.color = "#22c55e";
    placeAutoTrade('BUY');
  } else if(signal == 'SELL'){
    signalDiv.innerText = "SELL SIGNAL! Placing order...";
    signalDiv.style.color = "#ef4444";
    placeAutoTrade('SELL');
  } else {
    signalDiv.innerText = "No Signal. Waiting...";
    signalDiv.style.color = "#94a3b8";
  }
}

// 3 STRATEGY KA DUMMY LOGIC
function getSignalFromStrategy(strategy){
  if(!strategy || strategy == 'none') return 'NONE';
  let r = Math.random();

  if(strategy == 'rsi'){
    if(r > 0.7) return 'SELL'; // RSI > 70
    if(r < 0.3) return 'BUY'; // RSI < 30
  }
  if(strategy == 'ma'){
    if(r > 0.6) return 'BUY'; // MA 50 > 200
    if(r < 0.4) return 'SELL'; // MA 50 < 200
  }
  if(strategy == 'bb'){
    if(r > 0.6) return 'BUY'; // Lower band touch
    if(r < 0.4) return 'SELL'; // Upper band touch
  }
  return 'NONE';
}

function placeAutoTrade(type){
  let coinName = currentSymbol.split(":")[1].replace("USDT","").toLowerCase();
  let price = livePrices[coinName]?.usdt || 65000;

  botStats.trades++;
  let tradePnl = (Math.random() - 0.4) * 10; // 60% win chance
  botStats.pnl += tradePnl;

  addToHistory(type, coinName, price, 100);

  document.getElementById('totalTrades').innerText = botStats.trades;
  document.getElementById('botPnl').innerText = `$${botStats.pnl.toFixed(2)}`;
  document.getElementById('botPnl').style.color = botStats.pnl >= 0? '#22c55e' : '#ef4444';

  let winRate = botStats.pnl > 0? 60 : 40;
  document.getElementById('winRate').innerText = winRate + '%';

  setTimeout(()=>{
    document.getElementById('botSignal').innerText = "Order Placed. Scanning again...";
    document.getElementById('botSignal').style.color = "#94a3b8";
  }, 2000);
}

function loadTradingViewWidget() {
  document.getElementById('tradingview_chart').innerHTML = "";
  new TradingView.widget({
    "width": "100%",
    "height": 500,
    "symbol": currentSymbol,
    "interval": "1",
    "timezone": "Asia/Kolkata",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "toolbar_bg": "#1f2937",
    "enable_publishing": false,
    "allow_symbol_change": true,
    "container_id": "tradingview_chart"
  });
}

function changeCoin(symbol) {
  currentSymbol = symbol;
  let coin = symbol.split(":")[1].replace("USDT","");
  document.getElementById('chartTitle').innerText = `Live Chart - ${coin}/USDT`;
  loadTradingViewWidget();
}
