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
}

function toggleBot(){
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
  botInterval = setInterval(checkSignal, 10000);
}

function stopBot(){
  clearInterval(botInterval);
  document.getElementById('botSignal').innerText = "Waiting for signal...";
}

function checkSignal(){
  let rand = Math.random();
  let signalDiv = document.getElementById('botSignal');

  if(rand > 0.7){
    signalDiv.innerText = "BUY SIGNAL! Placing order...";
    signalDiv.style.color = "#22c55e";
    placeAutoTrade('BUY');
  } else if(rand < 0.3){
    signalDiv.innerText = "SELL SIGNAL! Placing order...";
    signalDiv.style.color = "#ef4444";
    placeAutoTrade('SELL');
  } else {
    signalDiv.innerText = "No Signal. Waiting...";
    signalDiv.style.color = "#94a3b8";
  }
}

function placeAutoTrade(type){
  let coinName = currentSymbol.split(":")[1].replace("USDT","");
  let price = livePrices?.usdt || 69420; // dummy price agar live na ho

  botStats.trades++;
  botStats.pnl += (Math.random() - 0.4) * 10; // dummy pnl

  addToHistory(type, coinName.toLowerCase(), price, 100);

  document.getElementById('totalTrades').innerText = botStats.trades;
  document.getElementById('botPnl').innerText = `$${botStats.pnl.toFixed(2)}`;
  document.getElementById('botPnl').style.color = botStats.pnl >= 0? '#22c55e' : '#ef4444';

  let winRate = Math.floor(Math.random() * 100);
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
