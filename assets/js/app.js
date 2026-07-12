function showScreen(html){document.getElementById('app').innerHTML=html;}
function getNavbar(){return`<div class="topbar"><div class="logo" onclick="renderHome()" style="cursor:pointer;">⚡ ApexTraders</div><div class="nav"><button class="nav-item" onclick="renderDashboard()">Dashboard</button><button class="nav-item" onclick="renderTrading()">Trading</button><button class="nav-item" onclick="renderStrategies()">Strategies</button><button class="nav-item" onclick="renderBacktest()">Backtest</button><button class="nav-item" onclick="renderSettings()">Settings</button><button class="nav-item" onclick="renderLogs()">Logs</button><button class="nav-item" onclick="renderHub()">Hub</button></div></div>`;}
function renderHome(){showScreen(`<div class="topbar"><div class="logo">⚡ ApexTraders</div><div style="color: #94a3b8;">Professional AI</div></div><div class="container"><h1>⚡ ApexTraders</h1><p style="color:#94a3b8; margin-bottom:30px;">AI Powered Trading Terminal</p><div class="btn-group"><button class="main-btn btn-crypto" onclick="renderDashboard()">📊 CRYPTO TERMINAL</button></div></div>`);}
function renderDashboard(){showScreen(`${getNavbar()}<div class="card"><h2>📊 Dashboard</h2></div>`);}
function renderStrategies(){showScreen(`${getNavbar()}<div class="card"><h2>🎯 Strategies</h2></div>`);}
function renderBacktest(){showScreen(`${getNavbar()}<div class="card"><h2>📈 Backtest</h2></div>`);}
function renderSettings(){showScreen(`${getNavbar()}<div class="card"><h2>⚙️ Settings</h2></div>`);}
function renderLogs(){showScreen(`${getNavbar()}<div class="card"><h2>📝 Logs</h2></div>`);}
function renderHub(){showScreen(`${getNavbar()}<div class="card"><h2>🔧 Hub</h2></div>`);}
renderHome();
