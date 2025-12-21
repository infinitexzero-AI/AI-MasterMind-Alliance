import os
import json
from datetime import datetime

ROOT = "/Users/infinite27/AILCC_PRIME"
AUDIT_LOG = os.path.join(ROOT, "06_System/Logs/convergence_audit.log")

CORE_CHAMBERS = [
    "01_Areas", "02_Resources", "03_Archives", 
    "04_Intelligence_Vault", "05_Templates", "06_System"
]

PHASE_4_ARTIFACTS = {
    "scripts": [
        "06_System/Execution/context_orchestrator.py",
        "06_System/Execution/vault_rag.py",
        "06_System/Execution/budget_governor.py",
        "06_System/Execution/finance_tracker.py"
    ],
    "state": [
        "06_System/State/current_context.json",
        "06_System/State/vault_index.json",
        "06_System/State/budget_state.json",
        "06_System/State/finance_data.json"
    ]
}

def run_audit():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🌌 Initiating Task 125: Singularity Audit...")
    report = []
    success_count = 0
    total_checks = len(CORE_CHAMBERS) + len(PHASE_4_ARTIFACTS["scripts"]) + len(PHASE_4_ARTIFACTS["state"])

    # 1. Chamber Check
    for chamber in CORE_CHAMBERS:
        path = os.path.join(ROOT, chamber)
        if os.path.exists(path):
            report.append(f"✅ [VAULT] Chamber {chamber} is properly localized.")
            success_count += 1
        else:
            report.append(f"❌ [VAULT] Chamber {chamber} is MISSING.")

    # 2. Phase 4 Execution Check
    for script in PHASE_4_ARTIFACTS["scripts"]:
        path = os.path.join(ROOT, script)
        if os.path.exists(path):
            report.append(f"✅ [EXEC] {os.path.basename(script)} is operational.")
            success_count += 1
        else:
            report.append(f"❌ [EXEC] {os.path.basename(script)} is MISSING.")

    # 3. Phase 4 State Check
    for state in PHASE_4_ARTIFACTS["state"]:
        path = os.path.join(ROOT, state)
        if os.path.exists(path):
            report.append(f"✅ [STATE] {os.path.basename(state)} is synced.")
            success_count += 1
        else:
            report.append(f"❌ [STATE] {os.path.basename(state)} is MISSING.")

    progress = (success_count / total_checks) * 100
    
    with open(AUDIT_LOG, 'a') as f:
        f.write(f"\n--- AUDIT {datetime.now().isoformat()} ---\n")
        f.write("\n".join(report))
        f.write(f"\nFinal Convergence Score: {progress}%\n")

    print("\n".join(report))
    print(f"\n🌌 Final Convergence Score: {progress}%")
    
    if progress == 100:
        print("🚀 SINGULARITY ACHIEVED. PHASE 4 COMPLETE.")

if __name__ == "__main__":
    run_audit()
