#!/usr/bin/env python3
"""
Vanguard Swarm: Xbox Edge Browser Launcher
Requires: pip install xbox-smartglass-core

This module allows the Mac motor cortex to remotely trigger the Microsoft Edge
app on the Xbox console across the local network (10.0.0.31).
"""

import sys
import asyncio
from xbox.sg.console import Console
from xbox.sg.enum import ConnectionState

# The hardcoded Edge Package ID for Xbox OS
XBOX_EDGE_AUMID = "Microsoft.MicrosoftEdge_8wekyb3d8bbwe!MicrosoftEdge"

async def launch_edge(ip_address="10.0.0.31"):
    print(f"[VANGUARD] Attempting SmartGlass connection to Xbox at {ip_address}")
    try:
        console = Console(ip_address)
        
        # Connect to the console
        connection_state = await console.connect(user_hash="", xsts_token="")
        
        if connection_state != ConnectionState.Connected:
            print("[VANGUARD ERROR] Console refused SmartGlass connection. Ensure Xbox settings allow anonymous remote connections.")
            return

        print("[VANGUARD] Xbox Authenticated. Injecting Edge Browser payload...")
        
        # Launch Microsoft Edge
        await console.launch_title(XBOX_EDGE_AUMID)
        print("[VANGUARD SUCCESS] Microsoft Edge launched on Xbox monitor.")
        
    except Exception as e:
        print(f"[VANGUARD PANIC] Failed to bind to Xbox OS: {str(e)}")
        print("Run `xbox-authenticate` in your terminal to cache authentication tokens first.")

if __name__ == "__main__":
    ip = sys.argv[1] if len(sys.argv) > 1 else "10.0.0.31"
    asyncio.run(launch_edge(ip))
