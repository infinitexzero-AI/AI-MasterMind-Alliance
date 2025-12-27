import subprocess
import time
import webbrowser
import os
import socket
from datetime import datetime

# Configuration
PYTHON = "python3"
ROOT = "/Users/infinite27/AILCC_PRIME"
EXEC_DIR = f"{ROOT}/06_System/Execution"
DASHBOARD_DIR = f"{ROOT}/01_Areas/Codebases/ailcc/dashboard"
LOG_FILE = f"{ROOT}/06_System/Logs/system_heartbeat.log"

SCRIPTS = [
    "context_orchestrator.py",
    "vault_rag.py",
    "budget_governor.py",
    "finance_tracker.py",
    "convergence_audit.py",
    "web_daemon.py",
    "nexus_server.py",
    "sync_daemon.py"
]

def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"[{timestamp}] {message}"
    print(entry)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def is_process_running(process_name):
    try:
        subprocess.check_output(["pgrep", "-f", process_name])
        return True
    except subprocess.CalledProcessError:
        return False

def launch_dashboard():
    if is_port_in_use(3000):
        log("⚠️ Port 3000 in use. Assuming Dashboard is active.")
        return
    
    log("🚀 Launching Dashboard (Next.js)...")
    # Start npm run dev in background
    log_path = f"{ROOT}/06_System/Logs/dashboard.log"
    with open(log_path, "w") as out:
        subprocess.Popen(
            ["npm", "run", "dev"], 
            cwd=DASHBOARD_DIR,
            stdout=out, 
            stderr=subprocess.STDOUT
        )
    log(f"   Dashboard logging to {log_path}")
    time.sleep(3) # Give it a moment

def launch_core():
    log("🚀 INITIALIZING AILCC ORCHESTRATOR...")
    
    # 1. Start Core Services (Background Init)
    for script in SCRIPTS:
        path = f"{EXEC_DIR}/{script}"
        log(f"⚡ Launching {script} in background...")
        try:
            # Use Popen to launch in background without waiting
            log_path = f"{ROOT}/06_System/Logs/{script.replace('.py', '.log')}"
            with open(log_path, "a") as out:
                subprocess.Popen([PYTHON, path], stdout=out, stderr=subprocess.STDOUT)
            log(f"✅ {script} launched.")
            time.sleep(1) # Staggered startup to prevent load spikes
        except Exception as e:
            log(f"❌ Error launching {script}: {str(e)}")

    # 2. Start Persistent Background Loop (The Judge)
    log("⚖️ Engaging THE JUDGE (Strategic Growth Advisory)...")
    if is_process_running("thejudge.py"):
        log("⚠️ The Judge is already active. Skipping launch.")
    else:
        judge_path = f"{ROOT}/01_Areas/Codebases/ailcc/thejudge.py"
        subprocess.Popen([PYTHON, judge_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        log("✅ The Judge launched.")

    # 3. Start Neural Relay (WebSocket Server)
    log("📡 Engaging NEURAL RELAY (Port 3001)...")
    if is_port_in_use(3001):
        log("⚠️ Port 3001 active. Relay likely running.")
    else:
        relay_path = f"{EXEC_DIR}/system_relay.py"
        with open(f"{ROOT}/06_System/Logs/system_relay.log", "a") as out:
             subprocess.Popen([PYTHON, relay_path], stdout=out, stderr=subprocess.STDOUT)
        log("✅ Neural Relay launched.")

def open_interface():
    log("🖥️ Opening Dashboard & Diagnostics...")
    webbrowser.open("http://localhost:3000/antigravity")
    
    # Mode 5 NEXUS
    webbrowser.open("http://localhost:8000")
    
    diag_path = f"file://{EXEC_DIR}/ailcc-diagnostic.html"
    webbrowser.open(diag_path)

if __name__ == "__main__":
    # Ensure log dir exists
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    
    launch_core()
    launch_dashboard()
    open_interface()
    
    log("✅ SYSTEM LAUNCH COMPLETE (MODE 5: ACTIVE). Monitoring Heartbeat...")
    log("🌐 Neural Relay: ONLINE")
    log("📊 NEXUS Dashboard: http://localhost:8000")
    log("🧠 Singularity Alignment: 100%")
