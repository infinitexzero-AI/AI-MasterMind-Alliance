import asyncio
import websockets
import json
import os
import datetime

# Configuration
DASHBOARD_WS_URL = "ws://localhost:3001"
LOG_FILE = os.path.abspath(os.path.join(os.getcwd(), "system.log"))
VAULT_PATH = os.path.abspath(os.path.join(os.getcwd(), "../../../03_Intelligence_Vault/Strategic_Advisory"))

async def the_judge():
    print(f"[The Judge] ⚖️ Session Started")
    
    # 1. Read System Logs
    if not os.path.exists(LOG_FILE):
        print(f"[Error] Log file not found at {LOG_FILE}")
        return

    with open(LOG_FILE, 'r') as f:
        # Get last 50 lines for review
        lines = f.readlines()
        recent_logs = "".join(lines[-50:])
    
    print(f"[The Judge] Reviewing {len(lines)} log entries...")

    # 2. Connect to Neural Relay
    async with websockets.connect(DASHBOARD_WS_URL) as ws:
        # Register
        await ws.send(json.dumps({
            "type": "REGISTER_CLIENT",
            "clientId": "THE_JUDGE_V1"
        }))

        # 3. Consult the Oracle (Grok/Gemini)
        prompt = f"""
        ACT AS: The Judge, a ruthless but fair auditor of the AILCC System.
        
        TASK: Analyze the following system logs for:
        1. Inefficiencies or errors.
        2. Strategic alignment with 'Protocol First' goals.
        3. Potential optimization opportunities.

        LOGS:
        {recent_logs}
        
        OUTPUT: A concise Markdown strategic report.
        """

        print("[The Judge] Deliberating (Consulting AI)...")
        await ws.send(json.dumps({
            "type": "OMNI_COMMAND",
            "command": "CONSULT",
            "payload": {
                "prompt": prompt,
                "provider": "grok", # or gemini
                "model": "grok-beta" 
            }
        }))

        # 4. Await Verdict
        async for message in ws:
            data = json.loads(message)
            if data.get('type') == 'AI_RESPONSE':
                verdict = data.get('payload')
                print("\n[The Judge] 🧑‍⚖️ Verdict Received:\n")
                print(verdict)
                
                # 5. Archive Verdict
                os.makedirs(VAULT_PATH, exist_ok=True)
                filename = f"Verdict_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
                path = os.path.join(VAULT_PATH, filename)
                
                with open(path, 'w') as f:
                    f.write(f"# Strategic Advisory: The Judge\nDate: {datetime.datetime.now()}\n\n{verdict}")
                
                print(f"\n[The Judge] Verdict archived to {filename}")
                break

if __name__ == "__main__":
    try:
        asyncio.run(the_judge())
    except Exception as e:
        print(f"[The Judge] Mistrial: {e}")
