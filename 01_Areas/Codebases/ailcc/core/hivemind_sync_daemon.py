#!/usr/bin/env python3
"""
hivemind_sync_daemon.py — Vanguard Swarm Hivemind Replicator
=============================================================
Establishes an asynchronous Peer-to-Peer background loop.
Connects to registered external AILCC Mastermind nodes and syncs their 
`skill_vault` vectors to the local database, ensuring the entire Mesh 
maintains state parity regarding autonomously acquired capabilities.

Expected Configuration at `~/.ailcc/mesh_nodes.json`:
{
  "peers": [
    "http://192.168.1.100:8002",
    "http://10.0.0.5:8002"
  ]
}
"""

import os
import json
import time
import requests
import logging
import asyncio

logging.basicConfig(level=logging.INFO, format="%(asctime)s [HivemindSync] [%(levelname)s] %(message)s")
logger = logging.getLogger("Hivemind")

CONFIG_PATH = os.path.expanduser("~/.ailcc/mesh_nodes.json")

class HivemindSyncDaemon:
    def __init__(self):
        self.peers = self._load_config()
        self._init_chroma()
        
    def _init_chroma(self):
        try:
            import chromadb
            from chromadb.utils import embedding_functions
            self.client = chromadb.HttpClient(
                host=os.getenv("CHROMA_HOST", "localhost"), 
                port=int(os.getenv("CHROMA_PORT", 8001))
            )
            self.ef = embedding_functions.DefaultEmbeddingFunction()
            self.skill_vault = self.client.get_or_create_collection(
                name="skill_vault", 
                embedding_function=self.ef
            )
        except Exception as e:
            logger.error(f"ChromaDB connection failed: {e}")
            self.client = None

    def _load_config(self) -> list:
        if not os.path.exists(CONFIG_PATH):
            logger.warning(f"No Mesh configuration found at {CONFIG_PATH}. Creating empty template.")
            os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
            default_config = {"peers": []}
            with open(CONFIG_PATH, 'w') as f:
                json.dump(default_config, f, indent=2)
            return []
            
        try:
            with open(CONFIG_PATH, 'r') as f:
                return json.load(f).get("peers", [])
        except Exception as e:
            logger.error(f"Failed to load Mesh configuration: {e}")
            return []

    async def sync_with_mesh(self):
        """Iterates through known peers and downloads delta skills."""
        if not self.peers:
            logger.info("No remote peer nodes configured. Skipping sync.")
            return
            
        if not self.client:
            logger.warning("Local ChromaDB Offline. Cannot ingest synced skills.")
            return

        for peer_url in self.peers:
            logger.info(f"Initiating Neural Handshake with Peer Node: {peer_url}")
            try:
                # 1. Fetch skills from remote node
                response = requests.get(f"{peer_url.rstrip('/')}/mesh/sync", timeout=10)
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") != "success":
                    logger.error(f"Peer explicitly failed sync: {data.get('error')}")
                    continue
                    
                remote_skills = data.get("skills", [])
                logger.info(f"Peer {peer_url} supplied {len(remote_skills)} forged skills in ledger.")
                
                # 2. Ingest unfamiliar skills into local `skill_vault`
                new_injections = 0
                for skill in remote_skills:
                    s_id = skill.get("id")
                    s_code = skill.get("code")
                    s_lang = skill.get("language")
                    s_doc = skill.get("document")
                    
                    if not s_id or not s_code:
                        continue
                        
                    # Check if local vault already possesses this specific neural pathway
                    existing = self.skill_vault.get(ids=[s_id])
                    
                    if not existing['ids']:
                        logger.info(f"Injecting novel remote capability into local memory: {s_id}")
                        self.skill_vault.add(
                            documents=[s_doc],
                            metadatas=[{"code": s_code, "language": s_lang}],
                            ids=[s_id]
                        )
                        new_injections += 1
                        
                if new_injections > 0:
                    logger.info(f"Successfully synthesized {new_injections} newly propagated skills from {peer_url}.")
                else:
                    logger.info(f"Local AILCC Node is already synchronized with {peer_url}.")

            except requests.exceptions.RequestException as e:
                logger.error(f"Neural connection to Peer {peer_url} severed: {e}")
            except Exception as e:
                logger.error(f"Unexpected error during mesh sync with {peer_url}: {e}")

async def main():
    daemon = HivemindSyncDaemon()
    logger.info("AILCC Hivemind P2P Replicator Active.")
    
    while True:
        await daemon.sync_with_mesh()
        # Poll every 3 minutes
        await asyncio.sleep(180)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Hivemind Daemon shutting down.")
