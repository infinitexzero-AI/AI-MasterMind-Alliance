import os
import json
from datetime import datetime

# AILCC Cycle 1: System Parity Check
# Verifies presence of critical files across local and virtual hubs.

CRITICAL_PATHS = [
    "/Users/infinite27/AILCC_PRIME/antigravity_config.json",
    "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/registries/agents_registry.json",
    "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/registries/CREDIT_MAP.json",
    "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault/VAULT_INDEX.json",
    "/Users/infinite27/AILCC_PRIME/06_System/Execution/mcp_proxy.sh",
    "/Users/infinite27/AILCC_PRIME/06_System/Execution/autonomy_engine.py",
    "/Users/infinite27/Library/Application Support/Valentine/watcher.py"
]

def run_check():
    print(f"🕵️ System Parity Check: {datetime.now().isoformat()}")
    missing = []
    for path in CRITICAL_PATHS:
        if os.path.exists(path):
            print(f"✅ FOUND: {os.path.basename(path)}")
        else:
            print(f"❌ MISSING: {path}")
            missing.append(path)
            
    if not missing:
        print("\n✨ Total Parity Achieved. Cycle 1 Foundation is SOLID.")
        return True
    else:
        print(f"\n⚠️ Parity Gap Detected! {len(missing)} items missing.")
        return False

if __name__ == "__main__":
    run_check()
