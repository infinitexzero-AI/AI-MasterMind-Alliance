import asyncio
import websockets
import json
import logging
from datetime import datetime

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("/Users/infinite27/AILCC_PRIME/06_System/Logs/system_relay.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("NeuralRelay")

CLIENTS = set()

async def handler(websocket, path):
    CLIENTS.add(websocket)
    logger.info(f"🔗 Client Connected: {websocket.remote_address}")
    
    try:
        # Send Initial Status
        await websocket.send(json.dumps({
            "type": "SYSTEM_STATUS", 
            "payload": { "status": "ONLINE", "module": "RELAY_NODE_01" }
        }))
        
        async for message in websocket:
            data = json.loads(message)
            logger.info(f"📨 Received: {data}")
            
            # Echo back for now (or route to Agents later)
            if data.get("type") == "PROCESS_TASK":
                response = {
                    "type": "INTENT_ROUTER",
                    "status": "CLASSIFIED",
                    "payload": f"ROUTING_TO_CORE: {data['payload'].get('prompt', 'Unknown')}",
                    "timestamp": datetime.now().isoformat()
                }
                await websocket.send(json.dumps(response))
                
                # Simulate Terminal Log
                await websocket.send(json.dumps({
                    "type": "TERMINAL_SIGNAL",
                    "payload": { "message": f"Executing: {data['payload'].get('prompt')}", "type": "CMD" }
                }))

    except websockets.exceptions.ConnectionClosed:
        logger.info("❌ Client Disconnected")
    finally:
        CLIENTS.remove(websocket)

async def main():
    logger.info("🚀 Starting Neural Relay on 0.0.0.0:3001")
    async with websockets.serve(handler, "0.0.0.0", 3001):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down Neural Relay")
