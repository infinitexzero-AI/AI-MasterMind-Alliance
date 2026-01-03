import asyncio
import websockets
import json
import logging
import os
import psutil
from datetime import datetime

# Path Discovery
ROOT = "/Users/infinite27/AILCC_PRIME"
STATE_DIR = f"{ROOT}/06_System/State"
LOG_DIR = f"{ROOT}/06_System/Logs"

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(f"{LOG_DIR}/system_relay.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("NeuralRelay")

CLIENTS = set()

async def get_system_telemetry():
    """Gathers real-time hardware telemetry."""
    return {
        "cpu": psutil.cpu_percent(),
        "memory": psutil.virtual_memory().percent,
        "network": 99, # Placeholder for net IO
        "status": "OPTIMAL"
    }

async def get_agent_roster():
    """Reads agent status from registry/state."""
    registry_path = f"{STATE_DIR}/agent_registry.json" # Fallback if DB not used
    # For now, simulate from what we know is running
    return [
        {"name": "Antigravity", "role": "System Bridge", "status": "ACTIVE", "currentTask": "Orchestrating Relay"},
        {"name": "Valentine", "role": "Arbiter", "status": "IDLE"},
        {"name": "Comet", "role": "Web Daemon", "status": "BUSY"}
    ]

async def broadcast_telemetry():
    """Broadcasts system state to all connected clients every 2 seconds."""
    while True:
        if CLIENTS:
            try:
                telemetry = await get_system_telemetry()
                roster = await get_agent_roster()
                
                payload = {
                    "type": "HEARTBEAT",
                    "payload": telemetry,
                    "timestamp": datetime.now().isoformat()
                }
                
                roster_payload = {
                    "type": "AGENT_ROSTER",
                    "payload": roster,
                    "timestamp": datetime.now().isoformat()
                }
                
                # Convert to string once
                msg_tel = json.dumps(payload)
                msg_ros = json.dumps(roster_payload)
                
                # Broadcast
                await asyncio.gather(*[client.send(msg_tel) for client in CLIENTS])
                await asyncio.gather(*[client.send(msg_ros) for client in CLIENTS])
                
            except Exception as e:
                logger.error(f"Broadcast Error: {e}")
        
        await asyncio.sleep(2)

async def handler(websocket):
    CLIENTS.add(websocket)
    logger.info(f"🔗 Client Connected: {websocket.remote_address}")
    
    try:
        # Send Initial Handshake
        await websocket.send(json.dumps({
            "type": "SYSTEM_STATUS", 
            "payload": { "status": "ONLINE", "module": "RELAY_NODE_01", "version": "2.0.0" }
        }))
        
        async for message in websocket:
            try:
                data = json.loads(message)
                logger.info(f"📨 Received: {data}")
                
                # Route intents
                if data.get("type") == "PROCESS_TASK":
                    response = {
                        "type": "TASK_UPDATE",
                        "sender": "ANTIGRAVITY",
                        "payload": { "message": f"Processing Intent: {data['payload'].get('prompt')}" },
                        "timestamp": datetime.now().isoformat()
                    }
                    await websocket.send(json.dumps(response))
            except json.JSONDecodeError:
                logger.warning("Received non-JSON message")

    except websockets.exceptions.ConnectionClosed:
        logger.info("❌ Client Disconnected")
    finally:
        CLIENTS.remove(websocket)

async def main():
    logger.info("🚀 Starting Neural Relay v2.0 on 0.0.0.0:3001")
    
    # Start the broadcast loop
    asyncio.create_task(broadcast_telemetry())
    
    async with websockets.serve(handler, "0.0.0.0", 3001):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down Neural Relay")
