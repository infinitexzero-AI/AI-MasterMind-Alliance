import json
import time
import os
import websockets
import asyncio
import sys
from datetime import datetime

# Ensure we can import from scripts dir
sys.path.append("/Users/infinite27/AILCC_PRIME/scripts")
from neural_relay_query import query_unified_memory

# Configuration
LOG_FILE = "/Users/infinite27/AILCC_PRIME/06_System/Logs/event_bus.jsonl"
RELAY_WS = "ws://localhost:3001"

async def watch_bus():
    print(f"🕵️ Swarm Relay Daemon v2.0 watching: {LOG_FILE}", flush=True)
    
    if not os.path.exists(LOG_FILE):
        open(LOG_FILE, 'a').close()

    while True:
        try:
            async with websockets.connect(RELAY_WS) as ws:
                print(f"🔗 Connected to Neural Relay: {RELAY_WS}", flush=True)
                
                with open(LOG_FILE, 'r') as f:
                    f.seek(0, os.SEEK_END)
                    
                    while True:
                        line = f.readline()
                        if not line:
                            await asyncio.sleep(0.5)
                            continue
                        
                        try:
                            event = json.loads(line)
                            print(f"📣 Relaying Event: {event.get('type')}", flush=True)
                            
                            # 1. Forward Original Event
                            await ws.send(json.dumps({
                                "type": "SWARM_EVENT",
                                "payload": event
                            }))

                            # 2. Trigger Pulse if Handoff
                            if event.get('type') in ['HANDOFF_INITIATED', 'HANDOFF_ACCEPTED']:
                                thread_id = event.get('thread_id', 'unknown')
                                print(f"🧠 Pulsing Memory for Thread: {thread_id}", flush=True)
                                
                                # Query Memory
                                context = query_unified_memory(event.get('message', 'General Task'))
                                
                                # Send Pulse
                                await ws.send(json.dumps({
                                    "type": "MEMORY_PULSE",
                                    "thread_id": thread_id,
                                    "payload": context
                                }))
                                print(f"✅ Pulse Sent for Thread: {thread_id}", flush=True)

                        except Exception as inner_e:
                            print(f"❌ Inner Parse Error: {inner_e}", flush=True)

        except Exception as outer_e:
            print(f"🔄 Connection Lost/Failed: {outer_e}. Retrying in 5s...", flush=True)
            await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(watch_bus())
    except KeyboardInterrupt:
        print("\nStopping Swarm Relay.")
