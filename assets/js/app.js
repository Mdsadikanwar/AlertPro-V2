// App Initializer (Jaise hi page load hoga, check karega ki last time konsa page khula tha)
window.onload = function() {  
  // Browser memory se check karenge ki koi saved market hai ya nahi
  const savedMarket = localStorage.getItem('last_active_market');
  const savedTab = localStorage.getItem('last_active_tab');

  if (savedMarket) {
    // Agar pehle se koi market (jaise crypto ya stocks) select thi, toh wahi khulegi
    navigateToMarket(savedMarket);
    
    // Agar koi specific tab (jaise dashboard, trading) active tha, toh wo load hoga
    if (savedTab) {
      setTimeout(() => {
        switchTab(savedTab);
      }, 50); // thoda sa delay taaki navbar load ho sake
    }
  } else {
    // Agar pehli baar site kholi hai, toh home page khulega
    navigateToMarket('home');  
  }
};  
  
// Render home landing screen (Main entry dashboard)
function renderLandingPage() {  
  const root = document.getElementById('app');  
  root.innerHTML = `  
    <div class="landing-container" style="text-align: center; padding: 50px 20px; font-family: sans-serif; background: #0f172a; min-height: 100vh; color: #fff;">  
      <h1 style="color: #38bdf8; font-size: 36px; margin-bottom: 10px;">Welcome to ApexTraders V2</h1>  
      <p style="color: #94a3b8; font-size: 18px; margin-bottom: 40px;">Select your preferred market ecosystem to begin trading:</p>  
        
      <div class="market-selection-grid" style="display: flex; justify-content: center; gap: 20px; max-width: 1200px; margin: 0 auto; flex-wrap: wrap;">  
        
        <!-- CRYPTO CARD -->
        <div class="market-card" onclick="navigateToMarket('crypto')" style="flex: 1; min-width: 280px; max-width: 350px; cursor: pointer; transition: transform 0.2s;">  
          <div style="background: #1e293b; padding: 30px; border-radius: 12px; border: 2px solid #38bdf8; height: 100%; box-sizing: border-box;">  
            <div style="font-size: 50px; margin-bottom: 15px;">🪙</div>  
            <h2 style="color: #38bdf8; margin-bottom: 10px;">Cryptocurrency</h2>  
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">Trade BTC, ETH, SOL with live Binance API feed integration.</p>  
          </div>  
        </div>  
        
        <!-- STOCKS CARD -->
        <div class="market-card" onclick="navigateToMarket('stocks')" style="flex: 1; min-width: 280px; max-width: 350px; cursor: pointer; transition: transform 0.2s;">  
          <div style="background: #1e293b; padding: 30px; border-radius: 12px; border: 2px solid #22c55e; height: 100%; box-sizing: border-box;">  
            <div style="font-size: 50px; margin-bottom: 15px;">📈</div>  
            <h2 style="color: #22c55e; margin-bottom: 10px;">Share Market</h2>  
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">Analyze, trading, and backtest top equity and stock pairs.</p>  
          </div>  
        </div>  
        
        <!-- COMMODITIES CARD -->
        <div class="market-card" onclick="navigateToMarket('commodities')" style="flex: 1; min-width: 280px; max-width: 350px; cursor: pointer; transition: transform 0.2s;">  
          <div style="background: #1e293b; padding: 30px; border-radius: 12px; border: 2px solid #eab308; height: 100%; box-sizing: border-box;">  
            <div style="font-size: 50px; margin-bottom: 15px;">🏆</div>  
            <h2 style="color: #eab308; margin-bottom: 10px;">Commodities</h2>  
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">Trade Gold, Silver, and Crude Oil with specialized metrics.</p>  
          </div>  
        </div>  
        
      </div>  
    </div>  
  `;  
}
