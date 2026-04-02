#!/usr/bin/env python3
"""
mesh_discovery.py — Sovereign Mesh Discovery Node
=============================================================================
A lightweight UDP broadcast daemon. It continuously pings its own active IP 
address across the local network subnet (e.g., 192.168.x.255) to allow 
Raspberry Pis, iPads, and Vanguard nodes to automatically resolve the Mastermind 
host without static DNS configuration.
"""

import socket
import time
import logging
from threading import Thread

logging.basicConfig(level=logging.INFO, format="%(asctime)s [Mesh Node] %(message)s")
logger = logging.getLogger(__name__)

MESH_PORT = 5055

def get_local_ip():
    try:
        # Connect to a dummy external address to force resolving the primary NIC IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def udp_broadcaster(ip_address):
    """Broadcasts presence globally across the subset on UDP 5055."""
    broadcaster = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    broadcaster.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    
    payload = f"AILCC_MASTER_NODE_ACTIVE:{ip_address}:8000:3000:5005".encode('utf-8')
    
    logger.info(f"Broadcasting Mesh Signature on 255.255.255.255:{MESH_PORT}")
    while True:
        try:
            broadcaster.sendto(payload, ('<broadcast>', MESH_PORT))
            time.sleep(5)
        except Exception as e:
            logger.error(f"Broadcast error: {e}")
            time.sleep(10)

def udp_listener():
    """Listens for handshake ping from external nodes requesting sync."""
    listener = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    # Bind to all interfaces to listen
    try:
        listener.bind(('', MESH_PORT))
        logger.info(f"Listening for Vanguard fleet pings on UDP {MESH_PORT}...")
    except Exception as e:
        logger.error(f"Listener bind failed. Port {MESH_PORT} may be in use: {e}")
        return

    while True:
        try:
            data, addr = listener.recvfrom(1024)
            msg = data.decode('utf-8')
            if "AILCC_VANGUARD_PING" in msg:
                logger.info(f"Acknowledged Vanguard Ping from {addr[0]}.")
        except Exception as e:
            time.sleep(2)

def main():
    logger.info("Initializing The Distributed Mesh (Phase 50) Discovery Module...")
    master_ip = get_local_ip()
    logger.info(f"Primary Vector Resolved: {master_ip}")
    
    # Run the broadcaster and listener concurrently
    Thread(target=udp_broadcaster, args=(master_ip,), daemon=True).start()
    Thread(target=udp_listener, daemon=True).start()
    
    # Keep main thread alive
    while True:
        time.sleep(3600)

if __name__ == "__main__":
    main()
