import time
import requests
from datetime import datetime

# 🔥 आपका फायरबेस URL
FIREBASE_BASE_URL = "https://alertpro-bot-default-rtdb.firebaseio.com"

print("🚀 ApexTraders Python Engine Initialized... Starting 24/7 background trade monitoring...")

while True:
    try:
        # 1. फायरबेस से लाइव सेटिंग्स और स्ट्रेटेजी लोड करना
        res = requests.get(f"{FIREBASE_BASE_URL}/.json")
        db_data = res.json()
        
        if not db_data or 'app_settings' not in db_data:
            print("⏳ Waiting for website configurations in Firebase...")
            time.sleep(10)
            continue

        settings = db_data['app_settings']
        tg_token = settings.get('telegramToken')
        tg_id = settings.get('telegramChatId')
        
        strategies = db_data.get('trading_strategies', {})
        last_trades = db_data.get('last_executed_prices', {})

        # सिर्फ एक्टिव स्ट्रेटेजी फिल्टर करना
        active_strats = [strategies[k] for k in strategies if strategies[k].get('status') == 'Active']
        
        if not active_strats:
            print("💤 No active strategies on website. Waiting...")
            time.sleep(10)
            continue

        for strat in active_strats:
            pair = strat.get('pair', 'BTCUSDT')
            crypto_symbol = pair.replace('USDT', '')
            
            # 2. लाइव मार्केट प्राइस खींचना
            price_res = requests.get(f"https://min-api.cryptocompare.com/data/price?fsym={crypto_symbol}&tsyms=USD")
            current_price = float(price_res.json().get('USD', 0))
            if not current_price:
                continue

            # वेबसाइट से आपकी सेटिंग्स (% वैल्यूज)
            buy_threshold = float(strat.get('buyLowPercent', -1.0))
            sell_threshold = float(strat.get('sellHighPercent', 0.1))

            last_trade = last_trades.get(pair, {"price": current_price, "action": "SELL"})
            last_price = float(last_trade.get('price', current_price))
            last_action = last_trade.get('action', 'SELL')

            # लाइव प्राइस चेंज कैलकुलेट करना
            price_change_percent = ((current_price - last_price) / last_price) * 100
            
            signal = None
            if price_change_percent <= buy_threshold and last_action != "BUY":
                signal = "BUY"
            elif price_change_percent >= sell_threshold and last_action == "BUY":
                signal = "SELL"

            # 🎯 अगर प्राइस मैच हुआ -> तुरंत ट्रेड!
            if signal:
                print(f"🎯 Strategy Triggered: {signal} for {pair} @ ${current_price}")
                trade_qty = 0.005

                # 📝 नया ट्रेड रिकॉर्ड
                trade_record = {
                    "strategyName": strat.get('name', 'Strategy'),
                    "pair": pair,
                    "action": signal,
                    "price": current_price,
                    "quantity": trade_qty,
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "status": "FILLED"
                }

                # 3. फायरबेस में ट्रेड एंट्री ठोकना
                requests.post(f"{FIREBASE_BASE_URL}/live_trades.json", json=trade_record)

                # 🔄 लास्ट प्राइस अपडेट करना
                last_price_payload = {
                    "price": current_price,
                    "action": signal,
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
                requests.put(f"{FIREBASE_BASE_URL}/last_executed_prices/{pair}.json", json=last_price_payload)

                # 📲 टेलीग्राम अलर्ट भेजना
                if tg_token and tg_id:
                    emoji = "🟢" if signal == "BUY" else "🔴"
                    msg = f"{emoji} *TRADE EXECUTED (PYTHON)*\n\n• *Pair:* {pair}\n• *Action:* {signal}\n• *Price:* ${current_price}\n• *Change:* {price_change_percent:.2f}%"
                    requests.post(f"https://api.telegram.org/bot{tg_token}/sendMessage", json={"chat_id": tg_id, "text": msg, "parse_mode": "Markdown"})
            else:
                print(f"ℹ️ {pair}: Live ${current_price} | Change: {price_change_percent:.2f}% (Buy Target: {buy_threshold}%, Sell Target: +{sell_threshold}%)")

    except Exception as e:
        print(f"⚠️ Loop Error: {e}")
    
    # हर 10 सेकंड में लाइव मार्केट चेक करेगा
    time.sleep(10)
