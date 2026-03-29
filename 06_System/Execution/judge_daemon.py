# AILCC JUDGE DAEMON — Autonomous File Classification & PARA Routing
# Phase 16 Step 2 | Epoch 90+ | infinitexzero-AI/ailcc-framework
#
# Watches 07_Comet_Sync/ and auto-routes incoming files to proper PARA locations.
# Uses extension-based + content-based classification with full event bus integration.

import os
import sys
import time
import json
import shutil
import logging
import hashlib
from datetime import datetime
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from unified_event_bus import UnifiedEventBus

# ─── Configuration ────────────────────────────────────────────────────────────

BASE_PATH = "/Users/infinite27/AILCC_PRIME"
WATCH_DIR = os.path.join(BASE_PATH, "07_Comet_Sync")
LOG_PATH = os.path.join(BASE_PATH, "06_System/Logs/judge.log")
LEDGER_PATH = os.path.join(BASE_PATH, "06_System/State/judge_ledger.json")
POLL_INTERVAL = 5  # seconds

# PARA routing rules: extension → target directory
ROUTING_RULES = {
    # Code → Codebases
    ".py":   "01_Areas/Codebases",
    ".js":   "01_Areas/Codebases",
    ".ts":   "01_Areas/Codebases",
    ".tsx":  "01_Areas/Codebases",
    ".jsx":  "01_Areas/Codebases",
    ".sh":   "06_System/Scripts",
    
    # Documents → Resources
    ".md":   "02_Resources/Knowledge_Base",
    ".txt":  "02_Resources/Knowledge_Base",
    ".pdf":  "02_Resources/Reference",
    ".docx": "02_Resources/Academics",
    ".pptx": "02_Resources/Academics",
    
    # Data → System State
    ".json": "06_System/State",
    ".jsonl": "06_System/State",
    ".csv":  "02_Resources/Data",
    ".xml":  "02_Resources/Data",
    
    # Media → Assets
    ".png":  "02_Resources/Assets",
    ".jpg":  "02_Resources/Assets",
    ".jpeg": "02_Resources/Assets",
    ".mp3":  "02_Resources/Media",
    ".mp4":  "02_Resources/Media",
    ".wav":  "02_Resources/Media",
    
    # Archives → Archive
    ".zip":  "03_Archives/Exports",
    ".tar":  "03_Archives/Exports",
    ".gz":   "03_Archives/Exports",
}

# Content-based overrides (keyword → target)
CONTENT_OVERRIDES = {
    "DAO": "01_Areas/Codebases/ailcc/output/diplomacy",
    "PROPOSAL": "01_Areas/Codebases/ailcc/output/diplomacy",
    "YIELD": "01_Areas/Codebases/ailcc/output/yield",
    "DEFI": "01_Areas/Codebases/ailcc/output/yield",
    "THESIS": "02_Resources/Academics",
    "NEUROSCIENCE": "01_Areas/Neuroscience",
    "SENTINEL": "06_System/Logs",
}

# ─── Logger ───────────────────────────────────────────────────────────────────

os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [JUDGE] - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_PATH),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("JudgeDaemon")


class JudgeDaemon:
    """
    The Judge: Autonomous file classification and PARA routing daemon.
    Monitors 07_Comet_Sync/ and routes files to their proper PARA locations.
    """

    def __init__(self):
        self.bus = UnifiedEventBus()
        self.ledger = self._load_ledger()
        self.processed_hashes = set(self.ledger.get("processed", []))
        os.makedirs(WATCH_DIR, exist_ok=True)
        logger.info("⚖️  Judge Daemon initialized. Watching: %s", WATCH_DIR)

    def _load_ledger(self):
        """Load the filing ledger (tracks what's been processed)."""
        if os.path.exists(LEDGER_PATH):
            with open(LEDGER_PATH, "r") as f:
                return json.load(f)
        return {"processed": [], "filings": [], "stats": {"total_filed": 0, "last_run": None}}

    def _save_ledger(self):
        """Persist the ledger to disk."""
        self.ledger["processed"] = list(self.processed_hashes)
        self.ledger["stats"]["last_run"] = datetime.now().isoformat()
        with open(LEDGER_PATH, "w") as f:
            json.dump(self.ledger, f, indent=2)

    def _file_hash(self, filepath):
        """Generate a hash for a file to track duplicates."""
        stat = os.stat(filepath)
        key = f"{filepath}:{stat.st_size}:{stat.st_mtime}"
        return hashlib.md5(key.encode()).hexdigest()

    def _classify(self, filepath):
        """
        Classify a file into a PARA target directory.
        Priority: Content overrides > Extension rules > Default
        """
        ext = Path(filepath).suffix.lower()
        filename = Path(filepath).name

        # 1. Content-based classification (for text files)
        if ext in (".md", ".txt", ".json", ".py"):
            try:
                with open(filepath, "r", errors="ignore") as f:
                    content = f.read(2048).upper()  # Read first 2KB
                for keyword, target in CONTENT_OVERRIDES.items():
                    if keyword in content:
                        return target, f"CONTENT_MATCH:{keyword}"
            except Exception:
                pass

        # 2. Extension-based classification
        if ext in ROUTING_RULES:
            return ROUTING_RULES[ext], f"EXT_MATCH:{ext}"

        # 3. Default: send to Archive
        return "03_Archives/Exports", "DEFAULT_ARCHIVE"

    def _route_file(self, filepath):
        """Route a single file to its PARA target."""
        file_hash = self._file_hash(filepath)
        if file_hash in self.processed_hashes:
            return None

        target_dir, reason = self._classify(filepath)
        target_path = os.path.join(BASE_PATH, target_dir)
        os.makedirs(target_path, exist_ok=True)

        filename = Path(filepath).name
        destination = os.path.join(target_path, filename)

        # Handle name collisions
        if os.path.exists(destination):
            stem = Path(filename).stem
            ext = Path(filename).suffix
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            destination = os.path.join(target_path, f"{stem}_{timestamp}{ext}")

        try:
            shutil.move(filepath, destination)
            self.processed_hashes.add(file_hash)

            filing = {
                "source": filepath,
                "destination": destination,
                "reason": reason,
                "timestamp": datetime.now().isoformat()
            }
            self.ledger["filings"].append(filing)
            self.ledger["stats"]["total_filed"] += 1

            logger.info("📂 Filed: %s → %s (%s)", filename, target_dir, reason)

            self.bus.emit(
                event_type="JUDGE_FILED",
                source="JudgeDaemon",
                message=f"Filed '{filename}' → {target_dir}",
                payload=filing,
                priority=4
            )
            return filing

        except Exception as e:
            logger.error("❌ Failed to route %s: %s", filepath, e)
            return None

    def scan(self):
        """Scan the watch directory for new files."""
        filings = []
        for root, dirs, files in os.walk(WATCH_DIR):
            # Skip hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            for filename in files:
                if filename.startswith('.'):
                    continue
                filepath = os.path.join(root, filename)
                result = self._route_file(filepath)
                if result:
                    filings.append(result)
        return filings

    def monitor(self):
        """Main loop: continuously watch and route."""
        logger.info("🚀 Judge Daemon Online — Monitoring %s", WATCH_DIR)
        self.bus.emit(
            event_type="JUDGE_ONLINE",
            source="JudgeDaemon",
            message="Judge Daemon started. Auto-filing active.",
            priority=3
        )

        try:
            while True:
                filings = self.scan()
                if filings:
                    logger.info("⚖️  Processed %d files this cycle.", len(filings))
                self._save_ledger()
                time.sleep(POLL_INTERVAL)
        except KeyboardInterrupt:
            logger.info("🛑 Judge Daemon shutting down.")
            self._save_ledger()


if __name__ == "__main__":
    daemon = JudgeDaemon()
    daemon.monitor()
