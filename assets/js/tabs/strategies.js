var activeStrategy = 'none'; // GLOBAL - let ki jagah var

function renderStrategy() {
  showScreen(`${getNavbar()}
    <div class="container">

      <div class="card">
        <h3>Trading Strategy</h3>
        <p style="color:#94a3b8; font-size:14px;">यहां से अपने Auto Bot की strategy चुनो</p>
      </div>

      <!-- STRATEGY 1 -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4>RSI + EMA Crossover</h4>
            <p style="color:#94a3b8; font-size:12px; margin:4px 0;">Popular scalping strategy. RSI<30 Buy, RSI>70 Sell</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="rsiStrategy" onchange="toggleStrategy('rsi', this.checked)">
            <span class="slider"></span>
          </label>
        </div>
        <div id="rsiSettings" style="display:none; margin-top:12px;">
          <label>RSI Period: <input type="number" value="14" style="width:60px; background:#1f2937; color:white; border:1px solid #374151; border-radius:4px; padding:4px;"></label>
        </div>
      </div>

      <!-- STRATEGY 2 -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4>MA Crossover 50/200</h4>
            <p style="color:#94a3b8; font-size:12px; margin:4px 0;">Long term trend following</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="maStrategy" onchange="toggleStrategy('ma', this.checked)">
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- STRATEGY 3 -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4>Bollinger Band Bounce</h4>
            <p style="color:#94a3b8; font-size:12px; margin:4px 0;">Buy at lower band, Sell at upper band</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="bbStrategy" onchange="toggleStrategy('bb', this.checked)">
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="card" style="background:#1f2937;">
        <h4>Active Strategy: <span id="activeStrategy" style="color:#22c55e;">None</span></h4>
      </div>

    </div>

    <style>
    .switch { position: relative; display: inline-block; width: 50px; height: 28px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #374151; transition: .4s; border-radius: 28px; }
    .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: #22c55e; }
    input:checked + .slider:before { transform: translateX(22px); }
    </style>
  `);
}

function toggleStrategy(type, isOn){
  if(isOn){
    // बाकी सब बंद कर दो
    document.getElementById('rsiStrategy').checked = false;
    document.getElementById('maStrategy').checked = false;
    document.getElementById('bbStrategy').checked = false;
    document.getElementById(type + 'Strategy').checked = true;
    
    document.getElementById('rsiSettings').style.display = 'none';
    if(type == 'rsi') document.getElementById('rsiSettings').style.display = 'block';

    activeStrategy = type; // GLOBAL me save
    document.getElementById('activeStrategy').innerText = type.toUpperCase();
    alert(`${type.toUpperCase()} Strategy Activated!`);
  } else {
    activeStrategy = 'none';
    document.getElementById('activeStrategy').innerText = 'None';
  }
}
