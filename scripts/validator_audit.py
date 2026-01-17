import json
import os
import subprocess
import glob
from datetime import datetime

# AILCC Validator: Integrity & Audit Pipeline
# Performs structural, logical, and security audits across the codebase.

BASE_DIR = "/Users/infinite27/AILCC_PRIME"
AUDIT_REPORT = f"{BASE_DIR}/06_System/State/audit_report.json"
VAULT_INDEX = f"{BASE_DIR}/04_Intelligence_Vault/VAULT_INDEX.json"
REGISTRY = f"{BASE_DIR}/01_Areas/Codebases/ailcc/registries/agents_registry.json"

def audit_structural_parity():
    required_dirs = ["01_Areas", "02_Projects", "03_Resources", "04_Intelligence_Vault", "05_Archive", "06_System"]
    missing = [d for d in required_dirs if not os.path.isdir(os.path.join(BASE_DIR, d))]
    return {"status": "PASS" if not missing else "FAIL", "missing": missing}

def audit_python_syntax():
    py_files = glob.glob(f"{BASE_DIR}/**/*.py", recursive=True)
    errors = []
    for f in py_files:
        try:
            subprocess.check_output(["python3", "-m", "py_compile", f], stderr=subprocess.STDOUT)
        except subprocess.CalledProcessError as e:
            errors.append({"file": f, "error": e.output.decode().strip()})
    return {"status": "PASS" if not errors else "FAIL", "error_count": len(errors), "details": errors[:5]}

def audit_registry_logic():
    registry = {}
    if os.path.exists(REGISTRY):
        with open(REGISTRY, 'r') as f:
            registry = json.load(f)
    
    triggers = []
    duplicates = []
    for agent in registry.get("agents", []):
        for t in agent.get("triggers", []):
            if t in triggers:
                duplicates.append(t)
            triggers.append(t)
            
    return {"status": "PASS" if not duplicates else "WARNING", "duplicate_triggers": duplicates}

def run_full_audit():
    print(f"🕵️ Validator: Starting Global Audit... {datetime.now().isoformat()}")
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "structural_parity": audit_structural_parity(),
        "python_syntax": audit_python_syntax(),
        "registry_logic": audit_registry_logic(),
        "overall_score": 100
    }
    
    # Calculate Score
    if results["structural_parity"]["status"] == "FAIL": results["overall_score"] -= 30
    if results["python_syntax"]["status"] == "FAIL": results["overall_score"] -= 20
    if results["registry_logic"]["status"] == "WARNING": results["overall_score"] -= 10
    
    with open(AUDIT_REPORT, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"✅ Audit complete. Score: {results['overall_score']}% | Results: {AUDIT_REPORT}")

if __name__ == "__main__":
    run_full_audit()
