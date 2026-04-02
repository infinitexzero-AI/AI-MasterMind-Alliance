import psutil
import time
import os
import signal

# Configuration
TARGET_PROCESS_NAMES = ["python3", "node", "chrome"]  # AI/System tasks
CPU_THRESHOLD = 5.0  # Keep under 5%
CHECK_INTERVAL = 3.0

def shadow_daemon():
    print(f"[Shadow] 🌑 Daemon Active (PID: {os.getpid()})")
    print(f"[Shadow] Monitoring for CPU spikes > {CPU_THRESHOLD}%...")
    
    while True:
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
                try:
                    # Filter for our target processes
                    if any(name in proc.info['name'] for name in TARGET_PROCESS_NAMES):
                        cpu_usage = proc.info['cpu_percent']
                        
                        if cpu_usage > CPU_THRESHOLD:
                            # Renice (De-prioritize)
                            os.setpriority(os.PRIO_PROCESS, proc.info['pid'], 19)
                            # print(f"[Shadow] Throttled {proc.info['name']} (PID: {proc.info['pid']}) - CPU: {cpu_usage}%")
                            
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass
                    
        except Exception as e:
            print(f"[Shadow] Error: {e}")
            
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    # Ensure we are nice ourselves
    os.setpriority(os.PRIO_PROCESS, os.getpid(), 19)
    shadow_daemon()
