import os
import json
import socket
import datetime

def check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def diagnose():
    root = "/Users/infinite27/AILCC_PRIME"
    report = {
        "timestamp": datetime.datetime.now().isoformat(),
        "checks": []
    }

    # 1. File Readiness
    required_files = [
        "01_Areas/Codebases/ailcc/dashboard/server/relay.js",
        "01_Areas/Codebases/ailcc/ailcc-launch.sh",
        "06_System/State/dashboard_state.json",
        "01_Areas/Codebases/ailcc/core/spellbook.json"
    ]
    for f in required_files:
        abs_f = os.path.join(root, f)
        exists = os.path.exists(abs_f)
        report["checks"].append({
            "component": f"File: {f}",
            "status": "PASS" if exists else "FAIL",
            "message": "Found" if exists else f"Missing at {abs_f}"
        })

    # 2. Port Check
    ports = {"Dashboard (Nexus)": 3000, "Relay (Neural Uplink)": 3001}
    for name, port in ports.items():
        active = check_port(port)
        report["checks"].append({
            "component": f"Port: {port} ({name})",
            "status": "PASS" if active else "WARN",
            "message": "Service Listening" if active else "Service Offline"
        })

    # 3. State Integrity
    state_file = os.path.join(root, "06_System/State/dashboard_state.json")
    if os.path.exists(state_file):
        try:
            with open(state_file, 'r') as f:
                data = json.load(f)
                report["checks"].append({
                    "component": "State Persistence",
                    "status": "PASS",
                    "message": "Valid JSON"
                })
        except Exception as e:
            report["checks"].append({
                "component": "State Persistence",
                "status": "FAIL",
                "message": str(e)
            })

    output_path = os.path.join(root, "01_Areas/Codebases/ailcc/diagnostic_report.json")
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"✅ Diagnostic Complete. Report saved to {output_path}")
    for check in report["checks"]:
        print(f"[{check['status']}] {check['component']}: {check['message']}")

if __name__ == "__main__":
    diagnose()
