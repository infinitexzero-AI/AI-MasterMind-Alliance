import requests
import time
import os
import json
import threading
from services.blackboard_service import blackboard_service

class HealthMonitorService:
    def __init__(self):
        self.services = {
            "nexus-dashboard": "http://nexus-dashboard:3000/api/health",
            "valentine-core": "http://valentine-core:5001/health",
            "chroma": "http://chroma:8000/api/v1/heartbeat"
        }
        self.check_interval = 30 # seconds
        self.stop_event = threading.Event()
        self.thread = None

    def start(self):
        if self.thread is None:
            self.thread = threading.Thread(target=self._run_monitor, daemon=True)
            self.thread.start()

    def stop(self):
        self.stop_event.set()

    def _run_monitor(self):
        print("🛡️ Self-Healing Sentinel Monitor Started.")
        while not self.stop_event.is_set():
            for name, url in self.services.items():
                try:
                    response = requests.get(url, timeout=5)
                    status = "healthy" if response.status_code == 200 else "degraded"
                    
                    if status == "degraded":
                        self._trigger_healing(name, f"Status code: {response.status_code}")
                    else:
                        print(f"💚 Global Heartbeat: {name} is {status}")
                except Exception as e:
                    self._trigger_healing(name, str(e))
                
            time.sleep(self.check_interval)

    def _trigger_healing(self, service_name, reason):
        print(f"⚠️ Service Failure Detected: {service_name} | Reason: {reason}")
        blackboard_service.broadcast(
            channel="infrastructure",
            message={
                "event": "healing_required",
                "service": service_name,
                "reason": reason,
                "action_suggested": "restart_or_reconnect"
            },
            sender="sentinel_monitor"
        )

# Singleton instance
health_monitor = HealthMonitorService()
