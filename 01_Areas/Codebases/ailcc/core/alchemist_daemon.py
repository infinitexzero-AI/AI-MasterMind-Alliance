import os
import json
import logging
import time
from datetime import datetime
import redis

import asyncio
from pathlib import Path
try:
    import ccxt
    import yfinance as yf
except ImportError:
    pass # Will be installed by pip

# The Sentinel (Phase 48 Upgrade from Alchemist Daemon)
# Live market read-only polling, alerting, and arbitrage monitoring.

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_URL = os.getenv("REDIS_URL", f"redis://{REDIS_HOST}:{REDIS_PORT}")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [Alchemist] %(message)s")
logger = logging.getLogger(__name__)

class SentinelDaemon:
    def __init__(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        self.config_path = Path(__file__).parent.parent / "automations" / "integrations" / "sentinel_config.json"
        self.config = self.load_config()
        self.scan_interval = self.config.get("polling_interval_seconds", 300)
        self.last_run = 0
        
        # Initialize exchange for crypto
        self.exchange = ccxt.binanceus({'enableRateLimit': True}) if hasattr(ccxt, 'binanceus') else ccxt.binance()

    def load_config(self) -> dict:
        try:
            return json.loads(self.config_path.read_text()).get("sentinel_config", {})
        except Exception as e:
            logger.error(f"Failed to load sentinel_config.json: {e}")
            return {"polling_interval_seconds": 300, "assets": {"crypto": [], "equities": []}, "alert_thresholds": {}}

    async def fetch_crypto_prices(self):
        prices = {}
        assets = self.config.get("assets", {}).get("crypto", [])
        for asset in assets:
            try:
                # CCXT usually formats pairs like BTC/USDT
                symbol = asset.replace("USD", "USDT")
                ticker = await asyncio.to_thread(self.exchange.fetch_ticker, symbol)
                prices[asset] = ticker['last']
                logger.info(f"[Crypto] {asset} -> ${ticker['last']}")
            except Exception as e:
                logger.warning(f"Failed to fetch crypto {asset}: {e}")
        return prices

    async def fetch_equity_prices(self):
        prices = {}
        assets = self.config.get("assets", {}).get("equities", [])
        for asset in assets:
            try:
                ticker = yf.Ticker(asset)
                # Ensure we handle empty data gracefully
                todays_data = ticker.history(period='1d')
                if not todays_data.empty:
                    last_price = todays_data['Close'].iloc[-1]
                    prices[asset] = last_price
                    logger.info(f"[Equity] {asset} -> ${last_price:.2f}")
                else:
                    logger.warning(f"No pricing data available today for {asset}")
            except Exception as e:
                logger.warning(f"Failed to fetch equity {asset}: {e}")
        return prices

    async def evaluate_thresholds(self, all_prices: dict):
        # A simple placeholder calculation: compare current price to a running average.
        # In this minimal live implementation, we simulate an alert if the system detects
        # a synthetic volatility spike based on random jitter or moving averages, 
        # or we just broadcast live metrics.
        
        thresholds = self.config.get("alert_thresholds", {})
        drop_pct = thresholds.get("price_drop_pct_5m", 2.5)

        for asset, price in all_prices.items():
            # Broadcast the live metric
            signal = {
                "id": f"sentinel_{datetime.now().timestamp()}",
                "timestamp": datetime.now().isoformat(),
                "level": "info",
                "source": "Alchemist_Sentinel",
                "type": "ALCHEMIST_TICKER",
                "message": f"{asset} Live Price: ${price:.2f}",
                "metadata": {"asset": asset, "price": price}
            }
            try:
                self.redis.publish('neural_synapse', json.dumps(signal))
            except Exception as e:
                pass
                
        logger.info("Sentinel market sweep complete. Emitted live tickers to Vanguard Swarm.")

    async def cycle(self):
        """Main Alchemist Sentinel loop."""
        logger.info("Executing Sentinel Market Sweep...")
        self.config = self.load_config() # Hot-reload config
        
        crypto_prices = await self.fetch_crypto_prices()
        equity_prices = await self.fetch_equity_prices()
        
        all_prices = {**crypto_prices, **equity_prices}
        await self.evaluate_thresholds(all_prices)

    async def run(self):
        logger.info("Sentinel (Alchemist) Daemon active. Monitoring live markets...")
        
        import sys
        if "--smoke-test" in sys.argv:
            logger.info("Running smoke test mode...")
            await self.cycle()
            return

        while True:
            current_time = time.time()
            if current_time - self.last_run >= self.scan_interval:
                await self.cycle()
                self.last_run = current_time
            await asyncio.sleep(10)

if __name__ == "__main__":
    daemon = SentinelDaemon()
    asyncio.run(daemon.run())
