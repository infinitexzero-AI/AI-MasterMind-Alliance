#!/usr/bin/env python3
"""
zotero_http_client.py — Antigravity ↔ Zotero App Bridge
=========================================================
Uses Zotero's built-in local HTTP server (port 23119) to programmatically
control the Zotero desktop app and the Zotero Connector browser extension
(Chrome, Comet, Firefox) without needing direct SQLite access.

This is the PREFERRED integration method — it works while the app is running,
doesn't lock the DB, and supports real-time item addition.

Zotero Connector Local API:
  http://localhost:23119/connector/   → browser extension endpoint
  http://localhost:23119/zotero/      → app control endpoint

Usage:
    from automations.integrations.zotero_http_client import ZoteroHTTPClient
    client = ZoteroHTTPClient()
    client.ping()            # check if Zotero app is running
    client.get_library()     # get all items
    client.save_url(url)     # save a URL (same as clicking Connector)
    client.run_and_ingest()  # full pipeline: fetch new → Hippocampus deposit
"""

import os
import json
import logging
import requests
import subprocess
import time
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

ZOTERO_PORT    = 23119
ZOTERO_BASE    = f"http://localhost:{ZOTERO_PORT}"
CONNECTOR_BASE = f"{ZOTERO_BASE}/connector"
ZOTERO_APP     = "/Applications/Zotero.app"

HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
SCHOLAR_NOTES   = HIPPOCAMPUS_DIR / "scholar_notes"


class ZoteroHTTPClient:
    """
    Antigravity bridge to the Zotero desktop app and browser Connector.
    Allows the Vanguard Swarm to save, retrieve, and ingest research
    without any manual steps.
    """

    def __init__(self, api_key: Optional[str] = None, library_id: Optional[str] = None):
        self.api_key    = api_key or os.getenv("ZOTERO_API_KEY")
        self.library_id = library_id or os.getenv("ZOTERO_LIBRARY_ID")
        self.session    = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "User-Agent"  : "AI-Mastermind-Alliance/4.0"
        })

    # ─── App Control ──────────────────────────────────────────────────────────

    def ping(self) -> bool:
        """Check if the Zotero app is running and responsive."""
        try:
            r = self.session.get(f"{CONNECTOR_BASE}/ping", timeout=2)
            if r.status_code == 200:
                logger.info("✅ Zotero app is RUNNING and responsive")
                return True
        except requests.exceptions.ConnectionError:
            pass
        logger.warning("⚠️  Zotero app is NOT running on port 23119")
        return False

    def launch_zotero(self) -> bool:
        """Launch the Zotero desktop app if it's not already running."""
        if self.ping():
            logger.info("Zotero already running — skipping launch")
            return True
        logger.info("🚀 Launching Zotero app...")
        subprocess.Popen(["open", ZOTERO_APP])
        # Wait for Zotero to initialize (up to 10s)
        for _ in range(10):
            time.sleep(1)
            if self.ping():
                logger.info("✅ Zotero launched successfully")
                return True
        logger.error("❌ Zotero failed to start within 10 seconds")
        return False

    def get_status(self) -> dict:
        """Get Zotero app status and connector info."""
        try:
            r = self.session.get(f"{CONNECTOR_BASE}/ping", timeout=3)
            return {"running": r.status_code == 200, "response": r.text}
        except Exception as e:
            return {"running": False, "error": str(e)}

    # ─── Save Items ───────────────────────────────────────────────────────────

    def save_url(self, url: str, tags: list[str] = None) -> dict:
        """
        Save a URL to Zotero — same as clicking the Connector extension.
        Works for: arXiv, PubMed, Google Scholar, journal articles, web pages.
        """
        if not self.ping():
            if not self.launch_zotero():
                return {"success": False, "error": "Zotero not running"}

        payload = {
            "url"    : url,
            "title"  : "",
            "tags"   : tags or ["vanguard-swarm", "auto-ingested"],
            "cookie" : ""
        }
        try:
            r = self.session.post(f"{CONNECTOR_BASE}/saveSnapshot", json=payload, timeout=10)
            logger.info(f"📥 Saving URL to Zotero: {url}")
            return {"success": True, "status": r.status_code, "url": url}
        except Exception as e:
            logger.error(f"Save URL failed: {e}")
            return {"success": False, "error": str(e)}

    def save_item_via_identifier(self, identifier: str) -> dict:
        """
        Save an item using DOI, ISBN, PMID, or arXiv ID.
        Example: save_item_via_identifier('10.1038/s41586-021-03819-2')
        Example: save_item_via_identifier('arxiv:2301.07041')
        """
        if not self.ping():
            if not self.launch_zotero():
                return {"success": False, "error": "Zotero not running"}
        try:
            r = self.session.post(
                f"{ZOTERO_BASE}/zotero/search",
                json={"identifier": identifier},
                timeout=10
            )
            return {"success": r.status_code < 400, "status": r.status_code, "id": identifier}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # ─── Library Access ───────────────────────────────────────────────────────

    def get_library_via_cloud_api(self) -> list[dict]:
        """
        Fetch Zotero library via the cloud API (requires API key from zotero.org/settings/keys).
        More reliable than SQLite for getting full metadata.
        """
        if not self.api_key or not self.library_id:
            logger.warning("ZOTERO_API_KEY or ZOTERO_LIBRARY_ID not set → use SQLite fallback")
            return []
        try:
            r = self.session.get(
                f"https://api.zotero.org/users/{self.library_id}/items/top",
                headers={"Zotero-API-Key": self.api_key},
                params={"limit": 100, "format": "json"},
                timeout=10
            )
            if r.status_code == 200:
                items = r.json()
                logger.info(f"📚 Retrieved {len(items)} items from Zotero Cloud API")
                return items
            logger.warning(f"Zotero API returned {r.status_code}")
            return []
        except Exception as e:
            logger.error(f"Cloud API error: {e}")
            return []

    # ─── Connector Browser Status ─────────────────────────────────────────────

    def get_connector_status(self) -> dict:
        """
        Check if the Zotero Connector is active in the browser.
        Returns info visible to Chrome/Comet extension.
        """
        try:
            r = self.session.get(f"{CONNECTOR_BASE}/ping", timeout=2)
            return {
                "active"  : r.status_code == 200,
                "browser" : "Chrome/Comet",
                "endpoint": CONNECTOR_BASE,
                "message" : "Connector is live — any browser with the Zotero extension can save items"
            }
        except:
            return {"active": False, "message": "Connector not reachable — is Zotero open?"}

    # ─── Full Pipeline ────────────────────────────────────────────────────────

    def run_and_ingest(self, trigger_synthesis: bool = True) -> str:
        """
        Full Vanguard Swarm pipeline:
        1. Ensure Zotero is running
        2. Trigger the SQLite watcher for new items
        3. Optionally run Grok 4.20 synthesis on new Scholar Notes

        Returns a summary string for the Data Center.
        """
        logger.info("🔄 Starting full Zotero → Hippocampus pipeline...")

        # Step 1: Ensure Zotero is live
        running = self.ping()
        if not running:
            running = self.launch_zotero()
            if not running:
                return "❌ Zotero could not be started. Please open it manually."

        # Step 2: Extract items natively and bridge to Zotero Watcher deposit layer
        import sys
        sys.path.insert(0, str(Path(__file__).parent.parent.parent))
        from automations.integrations.zotero_watcher import run_ingestion, load_ledger

        logger.info("Extracting native Zotero item array via Cloud REST...")
        extracted_items = self.get_library_via_cloud_api()

        run_ingestion(items=extracted_items, once=True, classification='LOCAL_ONLY')
        ledger = load_ledger()

        # Step 3: Optional Grok 4.20 synthesis on new notes
        if trigger_synthesis:
            notes_dir = SCHOLAR_NOTES
            if notes_dir.exists():
                new_notes = list(notes_dir.glob("*.md"))
                if new_notes:
                    try:
                        from core.grok_router import GrokRouter
                        router   = GrokRouter()
                        latest   = sorted(new_notes, key=lambda f: f.stat().st_mtime, reverse=True)[0]
                        content  = latest.read_text()
                        summary  = router.dispatch(
                            f"Synthesize key insights from this Scholar Note using Ollama (Gemma 3:4b) for the Mastermind OS: {content[:3000]}",
                            system_prompt="You are Grok, Lead Architect of the Vanguard Swarm. Extract actionable insights locally."
                        )
                        logger.info("🧠 Grok synthesis complete")
                    except Exception as e:
                        logger.warning(f"Synthesis skipped: {e}")

        return (
            f"✅ Pipeline complete | "
            f"Items in Hippocampus: {ledger['total_notes']} | "
            f"Last run: {ledger.get('last_run', 'N/A')}"
        )


# ─── CLI ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Zotero HTTP Client — Vanguard Swarm Bridge")
    parser.add_argument("--ping",    action="store_true", help="Check if Zotero is running")
    parser.add_argument("--launch",  action="store_true", help="Launch Zotero app")
    parser.add_argument("--status",  action="store_true", help="Get connector + app status")
    parser.add_argument("--save",    metavar="URL",       help="Save a URL to Zotero")
    parser.add_argument("--doi",     metavar="DOI",       help="Save item by DOI/ISBN/arXiv ID")
    parser.add_argument("--ingest",  action="store_true", help="Run full pipeline")
    args = parser.parse_args()

    client = ZoteroHTTPClient()

    if args.ping:
        client.ping()
    elif args.launch:
        client.launch_zotero()
    elif args.status:
        print(json.dumps(client.get_connector_status(), indent=2))
    elif args.save:
        print(json.dumps(client.save_url(args.save), indent=2))
    elif args.doi:
        print(json.dumps(client.save_item_via_identifier(args.doi), indent=2))
    elif args.ingest:
        result = client.run_and_ingest()
        print(result)
    else:
        print("Zotero HTTP Client ready.")
        print("Run with --ping, --launch, --save <url>, --doi <id>, or --ingest")
        print(json.dumps(client.get_status(), indent=2))
