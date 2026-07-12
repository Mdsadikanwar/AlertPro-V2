let tradeBalance = { usdt: 1000, inr: 83000 };
let currentCurrency = 'usdt';
let chartData = [];
let selectedCoin = 'bitcoin';
let autoTrade = false;

function renderTrading() {
    showScreen(`
        ${getNavbar()}
        <div class="card">
            <!-- HEADER -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <div>
                    <h2>⚡ Trading Terminal</h2>
                    <div style="font-size:12px; color:#94a3b8;">Auto Bot: <span id="autoStatus" style="color:#ef4444; font-weight:700;">OFF</span></div>
                </div>
                <!-- AUTO TOGGLE -->
                <label style="position:relative; display:inline-block; width:50px; height:26px;">
                    <input type="checkbox" id="autoToggle" style="opacity:0; width:0; height:0;">
                    <span id="toggleSlider" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#334155; border-radius:26px; transition:0.3s;"></span>
                    <span id="toggleDot" style="position:absolute; height:22px; width:22px; left:2px; bottom:2px; background:white; border-radius:50%; transition:0.3s;"></span>
                </label>
            </div>

            <!-- BALANCE -->
            <div style="background:#1e293b; padding:15px; border-radius:12px; margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="color:#94a3b8; font-size:12px;">Available Balance</div>
                        <div style="font-size:24px; font-weight:800;" id="balanceText">$1000.00</div>
                    </div>
                    <div style="display:flex; gap:5px; background:#0f172a; padding:4px; border-radius:8px;">
                        <button id="btnUsdt" style="padding:6px 12px; border:none; border-radius:6px; background:#0ea5e9; color:white; font-weight:600;">USDT</button>
                        <button id="btnInr" style="padding:6px 12px; border:none; border-radius:6px; background:transparent; color:#94a3b8;">INR</button>
                    </div>
                </div>
            </div>

            <!-- COIN + TIMEFRAME -->
            <div style="margin-bottom:15px;">
                <select id="tradeCoinSelect" style="width:100%; padding:12px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px; margin-bottom:10px;">
                    <option value="bitcoin">Bitcoin (BTC)</option>
                    <option value="ethereum">Ethereum (ETH)</option>
                    <option value="solana">Solana (SOL)</option>
                    <option value="binancecoin">BNB (BNB)</option>
                    <option value="ripple">XRP (XRP)</option>
                </select>
                <div style="display:flex; gap:6px;">
                    <button class="tfBtn active" data-days="1" style="flex:1; padding:8px; background:#0ea5e9; color:white; border:none; border-radius:6px;">1D</button>
                    <button class="tfBtn" data-days="7" style="flex:1; padding:8px; background:#334155; color:white; border:none; border-radius:6px;">7D</button>
                    <button class="tfBtn" data-days="30" style="flex:1; padding:8px; background:#334155; color:white; border:none; border-radius:6px;">30D</button>
                </div>
            </div>

            <!-- CHART -->
            <div style="background:#0f172a; padding:10px; border-radius:12px; margin-bottom:15px;">
                <canvas id="tradingChart" style="width:100%; height:280px;"></canvas>
            </div>

            <!-- BUY/SELL -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <button id="buyBtn" style="background:#10b981; color:white; padding:16px; border:none; border-radius:10px; font-weight:800; font-size:16px;">BUY</button>
                <button id="sellBtn" style="background:#ef4444; color:white; padding:16px; border:none; border-radius:10px; font-weight:800; font-size:16px;">SELL</button>
            </div>
        </div>
    `);

    setupTradingEvents();
    fetchChart(1);
    updateBalanceUI();
}

function setupTradingEvents() {
    document.getElementById('buyBtn').onclick = () => placeTrade('BUY');
    document.getElementById('sellBtn').onclick = () => placeTrade('SELL');
    document.getElementById('autoToggle').onchange = (e) => toggleAuto(e.target.checked);
    document.getElementById('btnUsdt').onclick = () => switchCurrency('usdt');
    document.getElementById('btnInr').onclick = () => switchCurrency('inr');
    document.getElementById('tradeCoinSelect').onchange = (e) => { selectedCoin = e.target.value; fetchChart(1); };

    document.querySelectorAll('.tfBtn').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll('.tfBtn').forEach(b => b.style.background = '#334155');
            e.target.style.background = '#0ea5e9';
            fetchChart(e.target.dataset.days);
        }
    });
}

// COINGECKO CHART
async function fetchChart(days) {
    try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart?vs_currency=usd&days=${days}`);
        const data = await res.json();
        chartData = data.prices;
        drawChart();
    } catch(e) { console.log(e) }
}

function drawChart() {
    const canvas = document.getElementById('tradingChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth; canvas.height = 280; ctx.clearRect(0, 0, canvas.width, canvas.height);

    const prices = chartData.map(p => p[1]);
    const max = Math.max(...prices);
    const min = Math.min(...prices);

    ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 2; ctx.beginPath();
    chartData.forEach((p, i) => {
        const x = (i / chartData.length) * canvas.width;
        const y = canvas.height - ((p[1] - min) / (max - min)) * canvas.height;
        if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
}

// AUTO TOGGLE
function toggleAuto(status) {
    autoTrade = status;
    document.getElementById('toggleSlider').style.background = status? "#10b981" : "#334155";
    document.getElementById('toggleDot').style.left = status? "26px" : "2px";
    document.getElementById('autoStatus').innerText = status? "ON" : "OFF";
    document.getElementById('autoStatus').style.color = status? "#10b981" : "#ef4444";
    alert(status? "Auto Trading ON" : "Auto Trading OFF");
}

// BALANCE + TRADE
function switchCurrency(curr) {
    currentCurrency = curr;
    document.getElementById('btnUsdt').style.background = curr === 'usdt'? '#0ea5e9' : 'transparent';
    document.getElementById('btnInr').style.background = curr === 'inr'? '#0ea5e9' : 'transparent';
    updateBalanceUI();
}

function updateBalanceUI() {
    const symbol = currentCurrency === 'usdt'? '$' : '₹';
    document.getElementById('balanceText').innerText = symbol + tradeBalance[currentCurrency].toFixed(2);
}

function placeTrade(type) {
    const amount = 100;
    if(type === 'BUY' && tradeBalance[currentCurrency] >= amount) tradeBalance[currentCurrency] -= amount;
    if(type === 'SELL') tradeBalance[currentCurrency] += amount;
    updateBalanceUI();
    alert(`${type} Order Placed: ${amount} ${currentCurrency.toUpperCase()}`);
}
