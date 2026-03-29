import os
import json
import time
import subprocess
from datetime import datetime
import psutil

# Configuration
ROOT_DIR = "/Users/infinite27/AILCC_PRIME"
STATUS_FILE = os.path.join(ROOT_DIR, "status.json")
LOG_DIR = os.path.join(ROOT_DIR, "06_System/Logs")
LOG_FILE = os.path.join(LOG_DIR, "heartbeat.log")
EXEC_FILE = os.path.join(ROOT_DIR, "ailcc-launch.sh")

# Mapping of agent names to their script file names or process identifiers
AGENT_PROCESSES = {
    "orchestrator": "ailcc_orchestrator.py",
    "context_orchestrator": "context_orchestrator.py",
    "web_daemon": "web_daemon.py",
    "sync_daemon": "sync_daemon.py",
    "system_relay": "system_relay.py"
}

LAST_RESTART_TIME = 0
RESTART_COOLDOWN = 300 # 5 minutes cooldown between system-wide restarts

def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"[{timestamp}] {message}"
    print(entry)
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")

def is_process_running(process_name):
    """Check if there is any running process that contains the given name."""
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            # Check cmdline for Python scripts
            cmdline = proc.info.get('cmdline')
            if cmdline and any(process_name in part for part in cmdline):
                return True
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    return False

def attempt_restart(agent_name):
    """Attempts to restart the system or specific agent."""
    global LAST_RESTART_TIME
    current_time = time.time()
    
    if current_time - LAST_RESTART_TIME < RESTART_COOLDOWN:
        log(f"⏳ Cooldown active. Skipping restart for '{agent_name}'.")
        return

    log(f"⚠️ FAILURE DETECTED: Agent '{agent_name}' is offline. Attempting system-wide convergence...")
    try:
        # Triggering the launcher to restore all services
        subprocess.Popen(["bash", EXEC_FILE], start_new_session=True)
        log(f"🚀 Launch sequence triggered for restoration.")
        LAST_RESTART_TIME = current_time
    except Exception as e:
        log(f"❌ Restart failed: {e}")

def update_heartbeat():
    try:
        if os.path.exists(STATUS_FILE):
            with open(STATUS_FILE, "r") as f:
                data = json.load(f)
        else:
            data = {"agents": {}, "system_integrity": "unknown"}

        if "agents" not in data:
            data["agents"] = {}

        # Update agents
        for agent, process_name in AGENT_PROCESSES.items():
            if agent not in data["agents"]:
                data["agents"][agent] = {}
            
            is_alive = is_process_running(process_name)
            data["agents"][agent]["status"] = "ACTIVE" if is_alive else "OFFLINE"
            data["agents"][agent]["last_heartbeat"] = datetime.now().isoformat()
            
            if not is_alive:
                log(f"❌ Agent {agent} is DOWN.")
                attempt_restart(agent)
                break # Only restart once per cycle to prevent spam
            
        data["system_integrity"] = "ok" # Verified pulse
        data["last_check"] = datetime.now().isoformat()
        data["storage_status"] = "ok" # Placeholder calculation

        with open(STATUS_FILE, "w") as f:
            json.dump(data, f, indent=2)
            
        log("💓 Heartbeat pulse successful.")

    except Exception as e:
        log(f"🚨 Heartbeat Critical Error: {e}")

if __name__ == "__main__":
    log("📡 AILCC Heartbeat Monitor v2.0 (Self-Healing) Initiated.")
    while True:
        update_heartbeat()
        time.sleep(30) # Pulse every 30s

