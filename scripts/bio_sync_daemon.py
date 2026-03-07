import json
import random
import time
from datetime import datetime

class BioSyncDaemon:
    def __init__(self):
        self.state_file = "/Users/infinite27/AILCC_PRIME/data/bio_pulse.json"
        
    def generate_mock_vitals(self):
        """Simulates ingestion from Apple Health/Whoop."""
        # Randomly choose an energy state for the demo
        states = ["PEAK", "FOCUS", "RECOVERY", "CRITICAL"]
        current_state = random.choice(states)
        
        vitals = {
            "timestamp": datetime.now().isoformat(),
            "hrv": random.randint(40, 110),
            "resting_hr": random.randint(55, 75),
            "sleep_score": random.randint(60, 95),
            "energy_state": current_state,
            "score_rationale": f"Simulated {current_state} state based on biometric drift."
        }
        
        return vitals

    def emit_pulse(self):
        vitals = self.generate_mock_vitals()
        with open(self.state_file, 'w') as f:
            json.dump(vitals, f, indent=2)
        print(f"💓 [BIO-SYNC] Pulse Emitted: {vitals['energy_state']} (HRV: {vitals['hrv']})")
        return vitals

if __name__ == "__main__":
    daemon = BioSyncDaemon()
    while True:
        daemon.emit_pulse()
        time.sleep(30) # Emit every 30s
