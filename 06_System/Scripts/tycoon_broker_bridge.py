import os
import json
import logging
import sys
from datetime import datetime

# Mock Alpaca implementation for Paper Trading
class TycoonBroker:
    def __init__(self, api_key=None, secret_key=None, base_url="https://paper-api.alpaca.markets"):
        self.api_key = api_key or "MOCK_KEY"
        self.secret_key = secret_key or "MOCK_SECRET"
        self.base_url = base_url
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("TycoonBroker")

    def get_account_balance(self):
        """Mock balance retrieval."""
        return 12500.75 # Hardcoded for demo parity with burn-rate logs

    def place_order(self, symbol, qty, side="buy", type="market"):
        """Executes a trade and emits to the Alliance Event Bus."""
        self.logger.info(f"🏦 [BROKER] Executing {side.upper()} order: {qty} shares of {symbol}")
        
        # In a real impl, we'd use requests.post to Alpaca
        confirmation = {
            "order_id": f"ord_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "symbol": symbol,
            "qty": qty,
            "side": side,
            "status": "filled",
            "timestamp": datetime.now().isoformat()
        }
        
        # Emit to UnifiedEventBus (simulated via print for standalone script)
        print(f"✨ Trade Confirmation: {json.dumps(confirmation)}")
        return confirmation

if __name__ == "__main__":
    broker = TycoonBroker()
    if len(sys.argv) > 1:
        # e.g. python tycoon_broker_bridge.py VOO 1
        symbol = sys.argv[1]
        qty = int(sys.argv[2]) if len(sys.argv) > 2 else 1
        broker.place_order(symbol, qty)
    else:
        print(f"💰 Tycoon Broker Online. Current Balance: ${broker.get_account_balance()}")
