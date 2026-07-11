let tradeBalance = { usdt: 1000, inr: 83000 };
let tradeHistory = JSON.parse(localStorage.getItem('tradeHistory') || "[]");

function renderTrading() {
    console.log("Trading tab clicked"); // Debug के लिए
    
    showScreen(`
        ${getNavbar()}
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <div style="font-size:18px; font-weight:700;">Trading Panel</div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="font-size:11px; font-weight:600;">Auto</div>
                    <label style="position:relative; display:inline-block; width:44px; height:24px;">
                        <input type="checkbox" id="autoToggle" style="opacity:0; width:0; height:0;">
                        <span id="toggleSlider" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#334155; border-radius:24px;"></span>
                    </label>
                </div>
            </div>

            <div style="background:#1e293b; padding:15px; border-radius:10px; margin-bottom:15px;">
                <div style="color:#94a3b8; font-size:12px;">Balance</div>
                <div style="font-size:22px; font-weight:800;">$1000.00</div>
            </div>

            <div style="margin-bottom:15px;">
                <select id="tradeCoinSelect" style="width:100%; padding:10px; background:#0f172a; color:white; border:1px solid #334155; border-radius:8px;">
                    <option value="bitcoin">Bitcoin (BTC)</option>
                    <option value="ethereum">Ethereum (ETH)</option>
                    <option value="solana">Solana (SOL)</option>
                </select>
            </div>

            <div style="background:#0f172a; padding:10px; border-radius:10px; margin-bottom:15px; text-align:center; color:#94a3b8; height:200px;">
                Chart yaha aayega
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <button id="buyBtn" style="background:#10b981; color:white; padding:14px; border:none; border-radius:8px; font-weight:700;">BUY</button>
                <button id="sellBtn" style="background:#ef4444; color:white; padding:14px; border:none; border-radius:8px; font-weight:700;">SELL</button>
            </div>
        </div>
    `);

    // Events lagao
    document.getElementById('buyBtn').onclick = () => alert("BUY Clicked");
    document.getElementById('sellBtn').onclick = () => alert("SELL Clicked");
    document.getElementById('autoToggle').onchange = (e) => {
        document.getElementById('toggleSlider').style.background = e.target.checked? "#10b981" : "#334155";
    }
}
