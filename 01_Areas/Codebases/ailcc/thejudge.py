import sys
import time
import os
import json
from datetime import datetime

VAULT_PATH = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault"
VERDICT_PATH = "/Users/infinite27/AILCC_PRIME/06_System/State/judge_verdict.json"

class ProgressBar:
    def __init__(self, total, prefix='Progress'):
        self.total = total
        self.prefix = prefix
        self.current = 0
        
    def update(self, current):
        self.current = current
        percent = 100 * (self.current / float(self.total))
        bar = '█' * int(percent / 2) + '-' * (50 - int(percent / 2))
        sys.stdout.write(f'\r{self.prefix}: |{bar}| {percent:.1f}%')
        sys.stdout.flush()
        
    def finish(self):
        self.update(self.total)
        sys.stdout.write('\n')

import subprocess

def check_system_health():
    # Check disk space on workspace drive
    res = subprocess.run(["df", "-h", "/Users/infinite27/AILCC_PRIME/"], capture_output=True, text=True)
    if "94%" in res.stdout or "90%" in res.stdout:
        print("⚠️  CRITICAL: High disk usage detected. Issuing Optimization Verdict.")
        subprocess.run(["python3", "/Users/infinite27/AILCC_PRIME/06_System/Execution/system_optimizer.py"])
        return True
    return False

from autonomy_engine import AutonomyEngine
from persistence_manager import PersistenceManager

def analyze_research():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] ⚖️  The Judge scanning vault...")
    
    health_action = check_system_health()
    engine = AutonomyEngine()
    
    files = [f for f in os.listdir(VAULT_PATH) if f.startswith("research_")]
    if not files:
        # even without research, allow for system refinement
        if health_action:
             print("Autonomous health action taken.")
        return "No recent research found. Passive monitoring active."
    
    # Get latest file
    latest_file = max(files, key=lambda f: os.path.getmtime(os.path.join(VAULT_PATH, f)))
    with open(os.path.join(VAULT_PATH, latest_file), 'r') as f:
        data = json.load(f)
    
    topic = data.get('topic', 'unknown')
    
    # Autonomous Role Selection
    role = engine.select_role(f"Refine research on {topic}")
    engine.execute_role(role)

    verdict = {
        "timestamp": datetime.now().isoformat(),
        "topic": topic,
        "summary": f"Research on [{topic}] detected. Strategic value: HIGH.",
        "analysis": f"The scout (Comet) successfully retrieved vectors regarding {topic}. We have engaged {role}.",
        "directives": [
            f"1. Consolidate results for {topic}",
            f"2. Role active: {role}",
            "3. Optimize local cache"
        ],
        "autonomy_meta": {
            "level": engine.autonomy_level,
            "role_selected": role
        }
    }
    
    with open(VERDICT_PATH, 'w') as f:
        json.dump(verdict, f, indent=2)
    
    # Persist the refinement
    PersistenceManager.save_state("last_judgment", verdict)
    
    return f"Verdict generated for {topic} using {role}."

import asyncio
import websockets
import json

class TheJudge:
    def __init__(self):
        self.engine = AutonomyEngine()
        self.verdict_path = VERDICT_PATH
        self.ws_url = "ws://localhost:3001"

    async def heartbeat(self, ws):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] 💓 Heartbeat active (Valentine)")
        missed_heartbeats = 0
        while True:
            try:
                payload = {
                    "type": "HEARTBEAT",
                    "source": "valentine",
                    "status": "online",
                    "timestamp": datetime.now().isoformat()
                }
                await ws.send(json.dumps(payload))
                
                # Wait for acknowledgment or timeout (simulating heartbeat response check)
                # If the relay server sends a response, we'd listen for it here.
                # For now, we assume failure if the send fails or we implement a pong check.
                
                await asyncio.sleep(300)
                missed_heartbeats = 0 # Success resets the counter
            except Exception as e:
                missed_heartbeats += 1
                print(f"Heartbeat Warning [{missed_heartbeats}/2]: {e}")
                if missed_heartbeats >= 2:
                    print("⚠️  CRITICAL: Multiple heartbeats missed. System auto-reboot initiated.")
                    # Reboot logic: restart the script
                    os.execv(sys.executable, ['python3'] + sys.argv)
                await asyncio.sleep(10)

    async def run(self):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ⚖️  The Judge connecting to Neural Uplink...")
        async with websockets.connect(self.ws_url) as ws:
            # Start heartbeat in background
            asyncio.create_task(self.heartbeat(ws))
            
            # Initial judgment
            analyze_research()
            
            # Keep connection alive
            while True:
                await asyncio.sleep(1)

if __name__ == "__main__":
    progress = ProgressBar(100, 'Judge Analysis')
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🔍 Initiating Strategic Judgment...")

    for i in range(0, 101, 20):
        progress.update(i)
        time.sleep(0.1)
        
    progress.finish()
    
    judge = TheJudge()
    try:
        asyncio.run(judge.run())
    except KeyboardInterrupt:
        print("\n⚖️ Judgment Halted.")
