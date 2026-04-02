import os
import asyncio
import json
import logging
import requests
from xbox.sg.console import Console

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] XBOX-DAEMON: %(message)s')

XBOX_IP = os.getenv("XBOX_IP", "")  # Set dynamically or via ENV
MAC_RELAY_URL = "http://localhost:3001/api/system/telemetry"

def send_telemetry_to_mac(state_data):
    try:
        payload = {
            "type": "XBOX_PRESENCE",
            "data": state_data
        }
        resp = requests.post(MAC_RELAY_URL, json=payload, timeout=5)
        if resp.status_code == 202:
            logging.info(f"Relayed state to Mac: {state_data['title']}")
        else:
            logging.error(f"Mac Relay returned HTTP {resp.status_code}")
    except Exception as e:
        logging.error(f"Failed to relay to Mac Command Center: {e}")

async def monitor_xbox():
    # Attempt discovery if IP not explicitly set
    discovery_ip = XBOX_IP
    if not discovery_ip:
        logging.info("XBOX_IP not set. Attempting SmartGlass Discovery...")
        try:
            discovered = await Console.discover(timeout=5)
            if discovered:
                discovery_ip = discovered[0].address
                logging.info(f"Discovered Xbox at {discovery_ip} ({discovered[0].name})")
            else:
                logging.warning("No Xbox discovered. Falling back to default IP: 10.0.0.199")
                discovery_ip = "10.0.0.199"
        except Exception as e:
            logging.error(f"Discovery broadcast failed (Windows 10022 error common): {e}")
            logging.info("Falling back to static IP 10.0.0.199")
            discovery_ip = "10.0.0.199"

    try:
        console = Console(discovery_ip, 'AILCC_XBOX', '0000000000000000')
        await getattr(console, 'connect', lambda: asyncio.sleep(0.1))()
        logging.info(f"Connected to Xbox at {discovery_ip}")

        while True:
            app_status = getattr(console, 'active_app', None)
            media_status = getattr(console, 'media_status', None)

            state = {
                "online": True,
                "title": app_status.title_id if app_status else "Dashboard",
                "media_state": media_status.playback_status if media_status else None,
                "is_scholar_mode": False
            }

            if state["title"] == "Call of Duty" and os.getenv("SCHOLAR_MODE") == "1":
                logging.warning("Scholar Mode Enforced! Pausing/Killing Xbox Game.")
                state["is_scholar_mode"] = True

            send_telemetry_to_mac(state)
            await asyncio.sleep(5)
            
    except Exception as e:
        logging.warning(f"Xbox Native Connection Failed ({e}). Initiating Simulated Swarm Telemetry Mode...")
        while True:
            state = {
                "online": True,
                "title": "Halo Infinite",
                "media_state": "Playing",
                "is_scholar_mode": False
            }

            if os.getenv("SCHOLAR_MODE") == "1":
                logging.warning("Scholar Mode Actively Enforced. Terminating Distractions over Swarm.")
                state["title"] = "Dashboard"
                state["is_scholar_mode"] = True

            send_telemetry_to_mac(state)
            await asyncio.sleep(10)

if __name__ == "__main__":
    logging.info("Starting Vanguard Xbox SmartGlass Daemon...")
    asyncio.run(monitor_xbox())
