import os
import sys
import time
import json
import psutil
from datetime import datetime

# THE JUDGE v2.0: SYSTEM ENTROPY MONITOR
# Tracks system health, memory leaks, and vault integrity.

LOG_FILE = "/Users/infinite27/AILCC_PRIME/06_System/Logs/the_judge_verdict.jsonl"
VAULT_PATH = "/Users/infinite27/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT"
THRESHOLD_CPU = 90.0
THRESHOLD_MEM = 85.0

def audit_process_entropy():
    verdicts = []
    # 1. High CPU Usage Detection
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
        try:
            cpu = proc.info.get('cpu_percent')
            if cpu is not None and cpu > THRESHOLD_CPU:
                verdicts.append({
                    "type": "entropy_warning",
                    "id": f"cpu-{proc.info['pid']}",
                    "msg": f"High CPU Entropy: {proc.info['name']} (PID: {proc.info['pid']}) @ {cpu}%",
                    "severity": "HIGH"
                })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return verdicts

def audit_vault_integrity():
    # Basic check for empty files or suspected corruption
    verdicts = []
    try:
        if not os.path.exists(VAULT_PATH):
            return [{"type": "system_error", "msg": "Vault disconnected", "severity": "CRITICAL"}]
        
        files = os.listdir(VAULT_PATH)
        if len(files) == 0:
            verdicts.append({"type": "warning", "msg": "Vault appears empty. Potential sync failure.", "severity": "MEDIUM"})
    except Exception as e:
        verdicts.append({"type": "error", "msg": f"Vault Audit Error: {str(e)}", "severity": "HIGH"})
    return verdicts

def audit_redis_health():
    verdicts = []
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, socket_timeout=2)
        start = time.time()
        r.ping()
        latency = (time.time() - start) * 1000
        if latency > 10:
            verdicts.append({
                "type": "performance_warning",
                "msg": f"Slow Redis Response: {latency:.2f}ms",
                "severity": "MEDIUM"
            })
    except Exception as e:
        verdicts.append({
            "type": "critical_error",
            "msg": f"Redis Persistent Core Offline: {str(e)}",
            "severity": "CRITICAL"
        })
    return verdicts

def main():
    print("⚖️ THE JUDGE v2.0: Monitoring System Entropy...")
    while True:
        verdicts = []
        verdicts.extend(audit_process_entropy())
        verdicts.extend(audit_vault_integrity())
        verdicts.extend(audit_redis_health())
        
        if verdicts:
            with open(LOG_FILE, "a") as f:
                for v in verdicts:
                    entry = {
                        "timestamp": datetime.now().isoformat(),
                        "agent": "THE_JUDGE",
                        **v
                    }
                    f.write(json.dumps(entry) + "\n")
                    print(f"📡 Verdict: {v['msg']}")
        
        time.sleep(30) # Audit cycle: 30 seconds

if __name__ == "__main__":
    main()
