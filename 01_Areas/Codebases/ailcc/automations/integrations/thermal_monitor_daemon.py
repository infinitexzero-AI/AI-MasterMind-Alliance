#!/usr/bin/env python3
"""
thermal_monitor_daemon.py — Hardware Telemetry Interceptor
=============================================================================
Polls macOS system metrics (CPU load, memory). Note that true thermals on M-series
Macs often require root `powermetrics`, but we will approximate / use standard 
`psutil` metrics for now to pipe hardware strain onto the Vanguard UI.
"""

import os
import json
import time
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [Thermals] %(message)s")
logger = logging.getLogger(__name__)

try:
    import psutil
except ImportError:
    logger.error("psutil not installed. Run `pip install psutil`.")
    psutil = None

import redis
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

class ThermalMonitor:
    def __init__(self):
        self.channel = "neural_synapse"

    def get_hardware_telemetry(self):
        if not psutil: return None

        # Standard load and memory
        cpu_percent = psutil.cpu_percent(interval=1)
        ram = psutil.virtual_memory()
        
        # Thermals (if supported by psutil on this platform/run mode)
        temp_c = None
        try:
            if hasattr(psutil, "sensors_temperatures"):
                temps = psutil.sensors_temperatures()
                if temps:
                    # Generic average of available sensors
                    sensors = list(temps.values())[0] if temps else []
                    if sensors:
                        temp_c = sum(s.current for s in sensors) / len(sensors)
        except Exception:
            pass
            
        return {
            "cpu_percent": cpu_percent,
            "ram_percent": ram.percent,
            "temperature_c": temp_c, # May be None on macOS without root
            "status": "NORMAL" if cpu_percent < 80 else "STRESSED"
        }

    def run(self):
        logger.info("Hardware Ambient Monitoring Active.")
        
        while True:
            try:
                metrics = self.get_hardware_telemetry()
                if metrics:
                    payload = {
                        "signal_id": f"hw_telemetry_{int(time.time())}",
                        "source": "THERMAL_MONITOR",
                        "type": "HARDWARE_TELEMETRY",
                        "timestamp": datetime.now().isoformat(),
                        "payload": metrics
                    }
                    redis_client.publish(self.channel, json.dumps(payload))
            except Exception as e:
                logger.error(f"Error reading hardware metrics: {e}")
            
            # Broadcast telemetry every 10 seconds 
            time.sleep(10)

if __name__ == "__main__":
    monitor = ThermalMonitor()
    monitor.run()
