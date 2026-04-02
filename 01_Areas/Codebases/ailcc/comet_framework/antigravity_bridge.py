import asyncio
import websockets
import json
import argparse
import sys
import datetime

# Configuration
RELAY_URL = "ws://localhost:3001"
AGENT_ID = "Gemini_Antigravity"

async def broadcast_message(message_type, payload):
    """Sends a single message to the relay server and closes connection."""
    uri = RELAY_URL
    try:
        async with websockets.connect(uri) as websocket:
            
            # Construct standard AILCC payload
            full_payload = {
                "type": message_type,
                "timestamp": datetime.datetime.now().isoformat(),
                "sender": AGENT_ID,
                "payload": payload
            }
            
            await websocket.send(json.dumps(full_payload))
            print(f"✅ Sent {message_type}: {payload}")
            
    except ConnectionRefusedError:
        print(f"❌ Connection failed. Is the Relay Server running at {RELAY_URL}?")
    except Exception as e:
        print(f"❌ Error: {e}")

async def listen_loop():
    """Listens for messages from the relay server indefinitely."""
    uri = RELAY_URL
    print(f"📡 {AGENT_ID} Listening on {RELAY_URL}...")
    try:
        async with websockets.connect(uri) as websocket:
            # Announce presence
            await websocket.send(json.dumps({
                "type": "AGENT_CONNECT",
                "sender": AGENT_ID,
                "payload": {"status": "ONLINE"}
            }))
            
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                
                # Filter out own messages
                if data.get("sender") == AGENT_ID:
                    continue
                    
                display_incoming(data)
                
    except ConnectionRefusedError:
        print(f"❌ Connection failed. Relay server offline?")
    except Exception as e:
        print(f"❌ Error: {e}")

def display_incoming(data):
    """Pretty prints incoming JSON data."""
    msg_type = data.get("type", "UNKNOWN")
    sender = data.get("sender", "Unknown")
    payload = data.get("payload", {})
    
    print(f"\n📨 [{sender}] -> [{msg_type}]")
    print(json.dumps(payload, indent=2))
    print("-" * 40)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Antigravity Bridge to AILCC Relay")
    parser.add_argument("--broadcast", help="Send a generic text broadcast", type=str)
    parser.add_argument("--send-file", help="Send a JSON payload from a file", type=str)
    parser.add_argument("--git-commit", help="Trigger a git commit with message", type=str)
    parser.add_argument("--register-agent", help="Register a new agent (Format: Name,Role)", type=str)
    parser.add_argument("--task", help="Send a natural language task to the Intent Router", type=str)
    parser.add_argument("--ping", action="store_true", help="Send a heartbeat ping")
    parser.add_argument("--listen", action="store_true", help="Start listening mode")
    
    args = parser.parse_args()

    if args.broadcast:
        asyncio.run(broadcast_message("AGENT_BROADCAST", {"message": args.broadcast}))
    elif args.send_file:
        try:
            with open(args.send_file, 'r') as f:
                payload = json.load(f)
            asyncio.run(broadcast_message("MISSION_DISPATCH", payload))
        except Exception as e:
            print(f"❌ Failed to read/send file: {e}")
    elif args.git_commit:
        payload = {"action": "commit", "message": args.git_commit}
        asyncio.run(broadcast_message("GIT_OPERATION", payload))
    elif args.register_agent:
        name, role = args.register_agent.split(',')
        payload = {
            "name": name.strip(), 
            "role": role.strip(), 
            "capabilities": ["Remote"], 
            "status": "ONLINE"
        }
        asyncio.run(broadcast_message("REGISTER_AGENT", payload))
    elif args.task:
        payload = {"prompt": args.task}
        asyncio.run(broadcast_message("PROCESS_TASK", payload))
    elif args.ping:
        asyncio.run(broadcast_message("ANTIGRAVITY_HEARTBEAT", {"status": "ONLINE", "mode": "EXECUTION"}))
    elif args.listen:
        try:
            asyncio.run(listen_loop())
        except KeyboardInterrupt:
            print("\n🛑 Bridge stopped.")
    else:
        parser.print_help()
