import asyncio
import websockets
import json
import sys

async def test_relay():
    uri = "ws://127.0.0.1:3001"
    print(f"📡 Testing Neural Relay at {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connection Established.")
            
            # Should receive initial handshake
            message = await websocket.recv()
            data = json.loads(message)
            print(f"📥 Received Handshake: {data}")
            
            if data.get("type") == "SYSTEM_STATUS":
                print("🏆 Relay status verified: ONLINE")
                sys.exit(0)
            else:
                print("⚠️ Unexpected response from relay.")
                sys.exit(1)
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(test_relay())
