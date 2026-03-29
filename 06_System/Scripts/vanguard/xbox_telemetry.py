import sys
import os
import time
import requests
import asyncio
import httpx
from xbox.webapi.api.client import XboxLiveClient
from xbox.webapi.authentication.manager import AuthenticationManager
from xbox.webapi.authentication.models import OAuth2TokenResponse

TOKEN_DIR = os.path.expanduser("~/Library/Application Support/xbox")
TOKEN_FILE = os.path.join(TOKEN_DIR, "tokens.json")
RELAY_URL = "http://127.0.0.1:5005/api/system/telemetry"

CLIENT_ID = "5e5ead27-ed60-482d-b3fc-702b28a97404"

async def async_main():
    if not os.path.exists(TOKEN_FILE):
        print(f"ERROR: Token file not found at {TOKEN_FILE}")
        print("Commander, please run the following command in your terminal to authenticate:")
        print("  /Library/Frameworks/Python.framework/Versions/3.13/bin/xbox-authenticate")
        sys.exit(1)

    async with httpx.AsyncClient() as session:
        auth_mgr = AuthenticationManager(
            session,
            CLIENT_ID,
            "",
            "http://localhost:8080/auth/callback"
        )

        with open(TOKEN_FILE, 'r') as f:
            auth_mgr.oauth = OAuth2TokenResponse.parse_raw(f.read())
            
        try:
            await auth_mgr.refresh_tokens()
        except Exception as e:
            print(f"Failed to refresh tokens: {e}. Please run xbox-authenticate again.")
            sys.exit(1)

        with open(TOKEN_FILE, 'w') as f:
            f.write(auth_mgr.oauth.json())

        xbl_client = XboxLiveClient(auth_mgr)
        print("AILCC Xbox Telemetry Daemon Authenticated.")
        print("Monitoring Xbox Live Telemetry for Commander")
        print(f"Pushing to -> {RELAY_URL}")

        while True:
            try:
                # Get user's own presence
                presence = await xbl_client.presence.get_presence_own()
                
                is_online = presence.state == "Online"
                current_title = "Dashboard"
                device_type = "Xbox"
                
                if is_online and presence.devices:
                    device = presence.devices[0]
                    device_type = device.type
                    if device.titles:
                        # Usually the first title in the array is the active app/game
                        current_title = device.titles[0].name

                payload = {
                    "source": "Xbox_Vanguard",
                    "type": "XBOX_PRESENCE",
                    "data": {
                        "online": is_online,
                        "title": current_title,
                        "device": device_type,
                        "xuid": "Commander"
                    }
                }

                try:
                    requests.post(RELAY_URL, json=payload, timeout=2)
                    print(f"[{time.strftime('%H:%M:%S')}] Pushed Xbox State: {'ONLINE' if is_online else 'OFFLINE'} | {current_title} on {device_type}")
                except requests.exceptions.RequestException:
                    print(f"[{time.strftime('%H:%M:%S')}] RELAY OFFLINE: Retrying in 30s")

            except Exception as e:
                print(f"Error querying presence: {e}")

            await asyncio.sleep(30)

def main():
    asyncio.run(async_main())

if __name__ == '__main__':
    main()
