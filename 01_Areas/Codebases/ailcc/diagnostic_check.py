import os
import sys
from pathlib import Path

def run_diagnostic():
    print("=== AILCC GLOBAL PATH DIAGNOSTIC (WINDOWS VANGUARD) ===")
    
    current_file = Path(__file__).resolve()
    codebase_root = current_file.parent
    project_root = codebase_root.parents[3] 
    
    # DISCOVERED Windows Structure
    required_paths = {
        "Codebase Root": codebase_root,
        "Project Root": project_root,
        "Whitepaper": codebase_root / "whitepaper.md",
        "Vault": project_root / "AILCC_VAULT",
        "Hippocampus": codebase_root / "hippocampus_storage",
        "Registries": codebase_root / "registries" / "task_state.json"
    }
    
    for name, p in required_paths.items():
        status = "[OK]" if p.exists() else "[MISSING]"
        print(f"{status} {name}: {p}")
        
    # VENV Verification
    venv_dir = project_root / ".venv"
    python_bin = venv_dir / "Scripts" / "python.exe" if os.name == 'nt' else venv_dir / "bin" / "python"
    venv_status = "[OK]" if python_bin.exists() else "[MISSING]"
    print(f"{venv_status} VENV: {python_bin}")

    print("======================================================")

if __name__ == "__main__":
    run_diagnostic()
