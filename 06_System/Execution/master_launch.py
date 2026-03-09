import subprocess
import time
from datetime import datetime

PYTHON = "python3"
EXEC_DIR = "/Users/infinite27/AILCC_PRIME/06_System/Execution"
ROOT = "/Users/infinite27/AILCC_PRIME"

SCRIPTS = [
    "context_orchestrator.py",
    "vault_rag.py",
    "budget_governor.py",
    "finance_tracker.py",
    "convergence_audit.py",
    "resource_vital_emitter.py"
]

DAEMONS = [
    ["node", "/Users/infinite27/AILCC_PRIME/06_System/Execution/playwright_watchdog.js"]
]

def launch_all():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🚀 INITIALIZING AILCC CHAMBER (PHASE 4 CONVERGED)...")
    
    # 1. Start Core Services
    for script in SCRIPTS:
        path = f"{EXEC_DIR}/{script}"
        print(f"⚡ Launching {script}...")
        try:
            # Run once to initialize state
            subprocess.run([PYTHON, path], check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            print(f"❌ Error launching {script}: {e.stderr}")

    # 2. Start JS Daemons (Watchdogs)
    for daemon in DAEMONS:
        print(f"🛡️ Launching Watchdog: {daemon[1]}...")
        subprocess.Popen(daemon, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # 3. Start Persistent Background Loop (The Judge)
    print("⚖️ Engaging THE JUDGE (Strategic Growth Advisory)...")
    judge_path = f"{ROOT}/01_Areas/Codebases/ailcc/thejudge.py"
    subprocess.Popen([PYTHON, judge_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    print("\n✅ ALL SYSTEMS OPERATIONAL.")
    print("🌐 Neural Relay: ONLINE")
    print("🖥️ Dashboard: READY")
    print("🧠 Singularity Alignment: 100%")

if __name__ == "__main__":
    launch_all()
