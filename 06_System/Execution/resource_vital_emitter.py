import os
import json
import time
import psutil
from datetime import datetime

ROOT = "/Users/infinite27/AILCC_PRIME"
STABILITY_FILE = os.path.join(ROOT, "06_System/State/stability_report.json")

def get_vitals():
    try:
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        # Count Antigravity Helper processes
        helpers = 0
        for proc in psutil.process_iter(['name']):
            try:
                if "Antigravity Helper" in (proc.info['name'] or ""):
                    helpers += 1
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
                
        return {
            "ram_free_mb": int(mem.available / (1024 * 1024)),
            "ram_total_mb": int(mem.total / (1024 * 1024)),
            "swap_percent": swap.percent,
            "helper_count": helpers,
            "top_cpu": f"{psutil.cpu_percent()}%"
        }
    except Exception as e:
        print(f"Error collecting vitals: {e}")
        return None

def update_stability_report():
    vitals = get_vitals()
    if not vitals:
        return

    # Load existing report to preserve other fields
    try:
        if os.path.exists(STABILITY_FILE):
            with open(STABILITY_FILE, 'r') as f:
                report = json.load(f)
        else:
            report = {}
    except:
        report = {}

    # Update with new vitals
    report["timestamp"] = datetime.now().isoformat()
    report["health_category"] = "NOMINAL" if vitals["ram_free_mb"] > 200 else "CRITICAL"
    report["top_cpu"] = vitals["top_cpu"]
    report["ram_mb"] = vitals["ram_free_mb"]
    report["swap_percent"] = vitals["swap_percent"]
    report["helper_count"] = vitals["helper_count"]
    
    # Save back
    with open(STABILITY_FILE, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Pulse: RAM:{vitals['ram_free_mb']}MB Swap:{vitals['swap_percent']}% Helpers:{vitals['helper_count']}")

if __name__ == "__main__":
    print("🚀 AILCC Resource Vital Emitter Online")
    while True:
        update_stability_report()
        time.sleep(10) # Pulse every 10 seconds
