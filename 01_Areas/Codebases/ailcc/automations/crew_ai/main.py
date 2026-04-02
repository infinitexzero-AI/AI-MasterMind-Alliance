import websocket
import json
import time
import threading
import os
from crewai import Crew
from agents import get_agents
from tasks import create_tasks

# Configuration
WS_URL = "ws://localhost:3001"
AGENTS = get_agents()

def on_message(ws, message):
    try:
        data = json.loads(message)
        print(f"[Python] Received: {data}")
        
        if data.get('type') == 'CREW_START':
            payload = data.get('payload', {})
            query = payload.get('task', 'Default Task')
            
            # Run Crew in a separate thread so we don't block WS heartbeats
            threading.Thread(target=run_crew, args=(query, ws)).start()
            
    except Exception as e:
        print(f"[Python] Error parsing message: {e}")

def run_crew(query, ws):
    print(f"[Python] Starting Crew for: {query}")
    
    # Notify UI: Starting
    send_status(ws, "STARTING", f"Initializing crew for: {query}")
    
    tasks = create_tasks(query, AGENTS)
    crew = Crew(
        agents=[AGENTS['orchestrator'], AGENTS['researcher'], AGENTS['coder']],
        tasks=tasks,
        verbose=2
    )
    
    # Notify UI: Thinking (Mocking intermediate steps for now as CrewAI callback integration is deeper)
    # Real implementation would hook into CrewAI callbacks
    time.sleep(1) 
    send_status(ws, "WORKING", "Orchestrator analyzing request...")
    
    try:
        result = crew.kickoff()
        
        # Notify UI: Complete
        send_status(ws, "COMPLETED", f"Result: {result}")
        print(f"[Python] Crew finished: {result}")
        
    except Exception as e:
        send_status(ws, "ERROR", str(e))
        print(f"[Python] Crew failed: {e}")

def send_status(ws, status, message):
    ws.send(json.dumps({
        "type": "CREW_STATUS",
        "payload": {
            "status": status,
            "message": message,
            "timestamp": time.time() * 1000
        }
    }))

def on_error(ws, error):
    print(f"[Python] Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("[Python] Closed")

def on_open(ws):
    print("[Python] Connected to Neural Relay")
    # Identify self
    ws.send(json.dumps({
        "type": "IDENTIFY",
        "payload": { "client": "CREW_AI_BACKEND" }
    }))

if __name__ == "__main__":
    # Keep trying to connect
    while True:
        try:
            ws = websocket.WebSocketApp(WS_URL,
                                      on_open=on_open,
                                      on_message=on_message,
                                      on_error=on_error,
                                      on_close=on_close)
            ws.run_forever()
        except Exception as e:
            print(f"Connection failed: {e}, retrying in 5s...")
        time.sleep(5)
