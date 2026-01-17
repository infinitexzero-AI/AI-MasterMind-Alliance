import asyncio
import json
import logging
import aiohttp
import websockets
from datetime import datetime

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] SLM-MIDDLEWARE: %(message)s'
)
logger = logging.getLogger("SLMMiddleware")

# Configuration
RELAY_URL = "ws://127.0.0.1:3001"
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
DEFAULT_MODEL = "tinyllama"

async def call_ollama(prompt, model=DEFAULT_MODEL):
    """Calls local Ollama instance for SLM processing."""
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(OLLAMA_URL, json=payload) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    return result.get("response", "No response from SLM.")
                else:
                    return f"Error: Ollama returned {resp.status}"
    except Exception as e:
        logger.error(f"Ollama Connection Error: {e}")
        return f"SLM Unavailable: {e}"

async def run_middleware():
    """Main loop connecting Relay to SLM."""
    while True:
        try:
            logger.info(f"Connecting to Neural Relay at {RELAY_URL}...")
            async with websockets.connect(RELAY_URL) as ws:
                logger.info("Connected to Neural Relay.")
                
                # Register as SLM Router
                await ws.send(json.dumps({
                    "type": "AGENT_HEARTBEAT",
                    "payload": { "name": "SLM_ROUTER", "status": "ACTIVE", "role": "Classification" }
                }))

                async for message in ws:
                    data = json.loads(message)
                    
                    # Watch for classification tasks
                    if data.get("type") == "PROCESS_TASK" and data.get("payload", {}).get("tier") == "SLM":
                        prompt = data["payload"].get("prompt")
                        logger.info(f"Processing SLM Task: {prompt}")
                        
                        response_text = await call_ollama(prompt)
                        
                        # Send result back
                        update = {
                            "type": "TASK_UPDATE",
                            "sender": "SLM_ROUTER",
                            "payload": { 
                                "message": "SLM Classification Complete",
                                "result": response_text,
                                "traceId": data.get("traceId")
                            },
                            "timestamp": datetime.now().isoformat()
                        }
                        await ws.send(json.dumps(update))
                        
        except Exception as e:
            logger.error(f"Middleware Loop Error: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(run_middleware())
    except KeyboardInterrupt:
        logger.info("Shutting down SLM Middleware")
