#!/usr/bin/env python3
"""
AILCC Email Intelligence Engine
Monitors multiple accounts, identifies Areas of Interest (AOIs), 
and integrates with PRIME storage and proactive task management.
"""

import sqlite3
import os
import json
import re
import requests
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict

# Setup logging
LOG_DIR = Path("/Users/infinite27/ailcc-framework/ailcc-framework/logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / 'email_intelligence.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("EmailIntelligence")

@dataclass
class IntelligentEmail:
    id: str
    account_id: str
    subject: str
    sender: str
    received_date: str
    aois: List[str]
    priority: str  # CRITICAL, HIGH, MEDIUM, LOW
    snippet: str
    full_path: Optional[str] = None
    
    def to_dict(self):
        return asdict(self)

class IntelligenceEngine:
    def __init__(self, config_path: str = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/config/email_account_registry.json"):
        self.config_path = Path(config_path)
        self.config = self._load_config()
        self.processed_file = Path.home() / ".ailcc_processed_emails_v2.json"
        self.processed_ids = self._load_processed_ids()
        
    def _load_config(self) -> Dict:
        if not self.config_path.exists():
            logger.error(f"Config not found at {self.config_path}")
            return {"accounts": [], "global_aois": []}
        with open(self.config_path, 'r') as f:
            return json.load(f)

    def _load_processed_ids(self) -> set:
        if self.processed_file.exists():
            try:
                with open(self.processed_file, 'r') as f:
                    return set(json.load(f))
            except:
                return set()
        return set()

    def _save_processed_id(self, email_id: str):
        self.processed_ids.add(email_id)
        with open(self.processed_file, 'w') as f:
            json.dump(list(self.processed_ids), f)

    def classify_email(self, subject: str, body: str, account_aois: List[str]) -> Tuple[List[str], str]:
        """Classify email into AOIs and determine priority"""
        text = (subject + " " + body).lower()
        found_aois = []
        priority = "LOW"
        
        # Check Account-Specific AOIs
        for aoi in account_aois:
            if aoi.lower() in text:
                found_aois.append(aoi)
                priority = "MEDIUM"

        # Check Global AOIs and override priority
        for g_aoi in self.config.get("global_aois", []):
            if any(kw.lower() in text for kw in g_aoi["keywords"]):
                found_aois.append(g_aoi["name"])
                # Escalate priority
                p_map = {"CRITICAL": 3, "HIGH": 2, "MEDIUM": 1, "LOW": 0}
                new_p = g_aoi["auto_priority"]
                if p_map.get(new_p, 0) > p_map.get(priority, 0):
                    priority = new_p
                    
        return list(set(found_aois)), priority

    def process_edison_local(self, account: Dict):
        """Monitor local Edison Mail database"""
        base_path = Path.home() / "Library/Containers/com.edisonmail.edisonmail/Data/Library/Application Support/EdisonMail"
        db_path = base_path / "edisonmail.db"
        
        if not db_path.exists():
            logger.warning(f"Edison DB not found for account {account['id']}")
            return

        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Simple lookback: 2 hours
            since = int((datetime.now() - timedelta(hours=2)).timestamp())
            
            query = "SELECT pid, subject, fromEmail, date, snippet FROM Message WHERE date > ? ORDER BY date DESC"
            cursor.execute(query, (since,))
            
            for row in cursor.fetchall():
                email_id = f"{account['id']}_{row[0]}"
                if email_id in self.processed_ids:
                    continue
                
                subject, sender, date_ts, snippet = row[1], row[2], row[3], row[4]
                aois, priority = self.classify_email(subject or "", snippet or "", account["monitored_aois"])
                
                email = IntelligentEmail(
                    id=email_id,
                    account_id=account["id"],
                    subject=subject or "No Subject",
                    sender=sender or "Unknown",
                    received_date=datetime.fromtimestamp(date_ts/1000 if date_ts > 1e11 else date_ts).isoformat(),
                    aois=aois,
                    priority=priority,
                    snippet=snippet or ""
                )
                
                self.dispatch_email_signal(email)
                self._save_processed_id(email_id)
                
            conn.close()
        except Exception as e:
            logger.error(f"Error processing Edison {account['id']}: {e}")

    def dispatch_email_signal(self, email: IntelligentEmail):
        """Send intelligence signal to AILCC API and logs"""
        logger.info(f"🚀 SIGNAL: [{email.priority}] Email from {email.sender} | AOIs: {email.aois}")
        
        # Log to activity stream for dashboard
        activity_log = {
            "timestamp": datetime.now().isoformat(),
            "agent": "EmailIntelligence",
            "type": "INTELLIGENCE_SIGNAL",
            "status": "info" if email.priority != "CRITICAL" else "error",
            "content": f"Account: {email.account_id} | Subject: {email.subject} | Priority: {email.priority} | AOIs: {', '.join(email.aois)}",
            "payload": email.to_dict()
        }
        
        # In a real run, this would POST to http://localhost:5001/api/v1/logs
        # For now, we simulate by writing to a shared signal file
        signal_file = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/logs/intelligence_signals.jsonl")
        signal_file.parent.mkdir(parents=True, exist_ok=True)
        with open(signal_file, 'a') as f:
            f.write(json.dumps(activity_log) + "\n")

    def run(self):
        logger.info("Email Intelligence Engine starting run...")
        for account in self.config.get("accounts", []):
            if account["provider"] == "edison_local":
                self.process_edison_local(account)
            # Future: add IMAP/Gmail API support here
        logger.info("Run complete.")

if __name__ == "__main__":
    engine = IntelligenceEngine()
    engine.run()
