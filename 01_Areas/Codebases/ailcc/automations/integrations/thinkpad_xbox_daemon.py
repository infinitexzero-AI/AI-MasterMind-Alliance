import subprocess
import asyncio
import os
import time
import requests
import threading
from flask import Flask, request, jsonify

app = Flask(__name__)

# Xbox Package IDs
XBOX_EDGE_AUMID = "Microsoft.MicrosoftEdge.Stable_8wekyb3d8bbwe!App"
LOFI_YOUTUBE_URL = "https://www.youtube.com/watch?v=jfKfPfyJRdk"
MAC_COMMAND_CENTER_IP = os.getenv("MAC_IP", "10.0.0.2") # Default Mac IP on home network
MAC_RELAY_URL = f"http://{MAC_COMMAND_CENTER_IP}:5005/api/system/telemetry"

@app.route('/xbox/dashboard', methods=['POST'])
def launch_xbox_dashboard():
    """ Zero-Cost Dashboard Terminal """
    data = request.json
    target_xbox_ip = data.get('target', '10.0.0.31')
    mac_dash_url = data.get('dashboard_url', f"http://{MAC_COMMAND_CENTER_IP}:3000/antigravity")
    
    print(f"\n[VANGUARD BRIDGE] Hijacking Xbox {target_xbox_ip} into Zero-Cost Dashboard Terminal...")
    try:
        subprocess.run(['xbox-app', 'launch', XBOX_EDGE_AUMID, '-a', target_xbox_ip], check=True)
        return jsonify({"success": True, "message": f"Xbox Kiosk Hijacked. Open {mac_dash_url} manually on Xbox for now."}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/xbox/scholar', methods=['POST'])
def trigger_scholar_mode():
    """ Scholar Mode Contextual Automation Enforcer """
    data = request.json
    target_xbox_ip = data.get('target', '10.0.0.31')
    
    print(f"\n[VANGUARD BRIDGE] Scholar Mode Triggered! Suspending Games on {target_xbox_ip}")
    try:
        subprocess.run(['xbox-app', 'launch', XBOX_EDGE_AUMID, '-a', target_xbox_ip], check=True)
        return jsonify({"success": True, "message": "Xbox forcefully suspended for Scholar Mode!"}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"success": False, "error": str(e)}), 500

def xbox_telemetry_loop(target_xbox_ip='10.0.0.31'):
    print(f"[VANGUARD TELEMETRY] Starting Xbox polling loop for {target_xbox_ip}...")
    while True:
        try:
            resp = requests.get(f"http://localhost:5557/device/{target_xbox_ip}/console_status", timeout=2)
            if resp.status_code == 200:
                status = resp.json()
                active_title = status.get('active_titles', [{}])[0].get('name', 'Idle')
                
                payload = {
                    "type": "XBOX_PRESENCE",
                    "data": {
                        "online": True if active_title != "Idle" else False,
                        "state": "RECOVERY_MODE_ACTIVE" if active_title != "Idle" else "DEEP_WORK",
                        "title": active_title
                    }
                }
                requests.post(MAC_RELAY_URL, json=payload, timeout=1)
                
        except Exception:
            pass # Silent fail if Xbox is offline or xbox-rest-server is down
            
        time.sleep(30) # Poll every 30 seconds

if __name__ == '__main__':
    print("=========================================================")
    print(" VANGUARD THINKPAD DAEMON: SMARTGLASS EDGE ALLIANCE ")
    print(" Waiting for MacOS AILCC triggers on Port 5000... ")
    print("=========================================================")
    
    # Start the telemetry loop thread
    t = threading.Thread(target=xbox_telemetry_loop, daemon=True)
    t.start()
    
    app.run(host='0.0.0.0', port=5000, debug=False)
