#!/usr/bin/env python3
"""
taguette_parser.py — Qualitative Research Parser (Scholar Module)
=================================================================
Monitors for Taguette exported files (CSV/SQLite) in Downloads, extracting
qualitative research tags, highlighted document quotes, and metadata.
Converts the flat tag structure into a semantic Knowledge Graph
(Nodes and Edges) deposited into the Hippocampus.

The resulting JSON is consumed by the Nexus `KnowledgeMap` UI for 3D routing.

Usage:
    python3 taguette_parser.py --watch ~/Downloads/
    python3 taguette_parser.py --parse ~/Downloads/tags_export.csv
    python3 taguette_parser.py --status
"""

import os
import csv
import json
import logging
import hashlib
import argparse
import time
import sqlite3
from pathlib import Path
from collections import defaultdict
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [TaguetteParser] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────
HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
KNOWLEDGE_MAP   = HIPPOCAMPUS_DIR / "knowledge_map"
SCHOLAR_NOTES   = HIPPOCAMPUS_DIR / "scholar_notes"
LEDGER_PATH     = KNOWLEDGE_MAP / "taguette_ledger.json"
WATCH_DIR       = Path.home() / "Downloads"
POLL_INTERVAL   = 30

def setup_dirs():
    os.makedirs(KNOWLEDGE_MAP, exist_ok=True)
    os.makedirs(SCHOLAR_NOTES, exist_ok=True)

setup_dirs()


# ─── Parsing Engines ──────────────────────────────────────────────────────────
def parse_csv(filepath: Path) -> list[dict]:
    """Parse Taguette CSV export. Expects columns like: document, tag, text, notes."""
    records = []
    try:
        with open(filepath, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            headers = [h.lower().strip() for h in (reader.fieldnames or [])]
            for row in reader:
                norm_row = {k.lower().strip(): v.strip() for k, v in row.items() if k}
                # Fallback column names
                doc  = norm_row.get("document", norm_row.get("filename", "Unknown Doc"))
                tag  = norm_row.get("tag", norm_row.get("code", "Untagged"))
                txt  = norm_row.get("content", norm_row.get("text", norm_row.get("highlight", "")))
                if txt:
                    records.append({"document": doc, "tag": tag, "content": txt})
        return records
    except Exception as e:
        logger.error(f"CSV Parse error: {e}")
        return []

def parse_sqlite(filepath: Path) -> list[dict]:
    """Parse a Taguette raw SQLite DB if the user exports the project file directly."""
    records = []
    try:
        # Immutable read-only
        conn = sqlite3.connect(f"file:{filepath}?mode=ro&immutable=1", uri=True)
        # Attempt to query projects, documents, and tags
        query = """
            SELECT d.name AS document, t.path AS tag, h.snippet AS content
            FROM highlights h
            JOIN tags t ON h.tag_id = t.id
            JOIN documents d ON h.document_id = d.id
        """
        for r in conn.execute(query).fetchall():
            records.append({"document": r[0], "tag": r[1], "content": r[2]})
        conn.close()
    except Exception as e:
        logger.error(f"SQLite Parse error: {e}")
    return records


# ─── Knowledge Graph Builder ──────────────────────────────────────────────────
def build_knowledge_graph(records: list[dict], source_name: str) -> dict:
    """
    Convert a flat list of highlights into a D3-ready graph:
    Nodes: Documents, Tags
    Links: Document <-> Tag (weight = number of shared highlights)
    """
    nodes_dict = {}
    links_dict = defaultdict(lambda: {"source": "", "target": "", "weight": 0, "highlights": []})

    for r in records:
        doc = r["document"]
        tag = r["tag"]

        # Register nodes if they don't exist
        if doc not in nodes_dict:
            nodes_dict[doc] = {"id": doc, "group": "document", "name": doc, "val": 5}
        if tag not in nodes_dict:
            nodes_dict[tag] = {"id": tag, "group": "tag", "name": tag, "val": 3}

        # Increase tag node weight based on occurrences
        nodes_dict[tag]["val"] += 1

        # Link Document to Tag
        link_id = f"{doc}::{tag}"
        links_dict[link_id]["source"] = doc
        links_dict[link_id]["target"] = tag
        links_dict[link_id]["weight"] += 1
        links_dict[link_id]["highlights"].append(r["content"])

    graph = {
        "metadata": {
            "source": source_name,
            "parsed_at": datetime.now().isoformat(),
            "nodes_count": len(nodes_dict),
            "links_count": len(links_dict)
        },
        "nodes": list(nodes_dict.values()),
        "links": list(links_dict.values())
    }
    return graph


def generate_scholar_notes(records: list[dict], source_name: str):
    """
    Aggregate records by Tag, mapping them into MD files for Grok Synthesis.
    Meaning: Create one note per Tag containing all qualitative highlights.
    """
    tags_data = defaultdict(list)
    for r in records:
        tags_data[r["tag"]].append(r)

    count = 0
    for tag, items in tags_data.items():
        safe_tag = "".join(c if c.isalnum() or c in " -_" else "_" for c in tag)
        md_lines = [
            f"# 🏷️ Qualitative Research Tag: {tag}",
            f"**Source:** {source_name}",
            f"**Ingested:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            f"**Total References:** {len(items)}",
            "",
            "## 📝 Associated Highlights",
        ]
        # Group by document under the tag
        docs_data = defaultdict(list)
        for i in items:
            docs_data[i["document"]].append(i["content"])

        for doc, highlights in docs_data.items():
            md_lines.append(f"### 📄 Source: {doc}")
            for h in highlights:
                md_lines.append(f"> {h}")
            md_lines.append("")

        filepath = SCHOLAR_NOTES / f"taguette_{safe_tag}.md"
        filepath.write_text("\n".join(md_lines))
        count += 1
    
    logger.info(f"Generated {count} Scholar Markdown notes from `{source_name}` tags.")


# ─── Ledger & Processing ──────────────────────────────────────────────────────
def load_ledger() -> dict:
    if LEDGER_PATH.exists():
        try:
            return json.loads(LEDGER_PATH.read_text())
        except Exception:
            pass
    return {"processed_files": {}, "total_records": 0, "last_run": None}

def save_ledger(ledger: dict):
    ledger["last_run"] = datetime.now().isoformat()
    LEDGER_PATH.write_text(json.dumps(ledger, indent=2))


def process_file(filepath: Path) -> int:
    """Process a single Taguette file and export Knowledge Map JSON."""
    fname = filepath.name.lower()
    records = []

    if fname.endswith(".csv"):
        records = parse_csv(filepath)
    elif fname.endswith(".sqlite") or fname.endswith(".sqlite3"):
        records = parse_sqlite(filepath)
    else:
        return 0

    if not records:
        return 0

    # Build and deposit Knowledge Graph
    graph = build_knowledge_graph(records, filepath.name)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    out_json = KNOWLEDGE_MAP / f"taguette_graph_{timestamp}.json"
    out_json.write_text(json.dumps(graph, indent=2))
    
    # Generate unified markdown notes grouped by Tag
    generate_scholar_notes(records, filepath.name)

    logger.info(f"✅ Processed {filepath.name}: {len(records)} highlights mapped.")
    logger.info(f"   Deposited Knowledge Graph: {out_json.name}")
    
    # Update ledger
    ledger = load_ledger()
    fp_hash = hashlib.md5(filepath.read_bytes()).hexdigest()
    ledger["processed_files"][fp_hash] = {
        "filename": filepath.name,
        "records": len(records),
        "processed_at": datetime.now().isoformat()
    }
    ledger["total_records"] += len(records)
    save_ledger(ledger)

    return len(records)


def scan_dir(watch_dir: Path):
    ledger = load_ledger()
    files = list(watch_dir.glob("taguette*.csv")) + list(watch_dir.glob("tags*.csv")) + list(watch_dir.glob("*.sqlite3"))
    count = 0

    for f in files:
        fp_hash = hashlib.md5(f.read_bytes()).hexdigest()
        if fp_hash not in ledger["processed_files"]:
            logger.info(f"📄 Found new Taguette export: {f.name}")
            rec_count = process_file(f)
            if rec_count > 0: count += 1
    
    if count == 0:
        logger.info(f"✨ No new Taguette files found in {watch_dir}.")

def print_status():
    ledger = load_ledger()
    print(f"\\n📊 Taguette Parser Status")
    print(f"   Files processed : {len(ledger['processed_files'])}")
    print(f"   Total highlights: {ledger['total_records']}")
    print(f"   Graph JSON path : {KNOWLEDGE_MAP}")
    print(f"   Last run        : {ledger.get('last_run', 'Never')}\\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Taguette Parser Daemon — Scholar Module")
    parser.add_argument("--watch",  metavar="DIR",  help="Watch directory for Taguette exports")
    parser.add_argument("--parse",  metavar="FILE", help="Parse a single Taguette file")
    parser.add_argument("--status", action="store_true", help="Show daemon status")
    args = parser.parse_args()

    if args.status:
        print_status()
    elif args.parse:
        fp = Path(args.parse)
        if fp.exists():
            process_file(fp)
            print_status()
        else:
            print(f"❌ File not found: {fp}")
    elif args.watch:
        wd = Path(args.watch)
        logger.info(f"🚀 Taguette Parser watching: {wd}")
        while True:
            scan_dir(wd)
            time.sleep(POLL_INTERVAL)
    else:
        logger.info("🚀 Running single scan pass on ~/Downloads/")
        scan_dir(WATCH_DIR)
        print_status()
