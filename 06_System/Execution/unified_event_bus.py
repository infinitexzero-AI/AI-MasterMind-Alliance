import os
import json
import logging
from datetime import datetime
from linear_issue_creator import create_linear_issue

# Path Configuration
BASE_PATH = "/Users/infinite27/AILCC_PRIME"
VALENTINE_INBOX = os.path.join(BASE_PATH, "06_System/AILCC/handoffs/inbox")
LOG_PATH = os.path.join(BASE_PATH, "06_System/Logs/event_bus.log")
JSON_LOG_PATH = os.path.join(BASE_PATH, "06_System/Logs/event_bus.jsonl")

# Logging
os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', filename=LOG_PATH)

class UnifiedEventBus:
    """The central nervous system for AIMmA cross-platform interoperability."""
    
    @staticmethod
    def emit(event_type, source, message, payload=None, priority=3, platforms=["NEXUS", "LINEAR", "VALENTINE", "COMET"], thread_id=None):
        """
        Emits an event across multiple platforms.
        platforms: List of ['NEXUS', 'LINEAR', 'VALENTINE', 'COMET']
        """
        logging.info(f"✨ Event Emitted: [{event_type}] from {source} - {message} (Thread: {thread_id})")
        
        # Log to JSONL for Dashboard Relay
        event_entry = {
            "type": event_type,
            "source": source,
            "message": message,
            "payload": payload,
            "thread_id": thread_id,
            "timestamp": datetime.now().isoformat()
        }
        with open(JSON_LOG_PATH, "a") as f:
            f.write(json.dumps(event_entry) + "\n")
        
        # 1. NEXUS (WebSockets / Dashboard)
        if "NEXUS" in platforms:
            # Broadcast hook for NeuralRelay
            pass
        
        # 2. LINEAR (Task Management)
        if "LINEAR" in platforms and priority <= 2: 
            create_linear_issue(
                title=f"[{source}] {message}",
                description=f"Automated event from AIMmA.\nEvent Type: {event_type}\nPayload: {json.dumps(payload, indent=2)}",
                priority=priority
            )
            
        # 3. VALENTINE (Mobile/UI Notification)
        if "VALENTINE" in platforms:
            handoff = {
                "id": f"evt_{int(datetime.now().timestamp())}",
                "recipient": "valentine",
                "sender": source,
                "type": "event_notification",
                "content": {
                    "title": event_type,
                    "description": message,
                    "payload": payload
                },
                "metadata": {
                    "timestamp": datetime.now().isoformat(),
                    "priority": priority
                }
            }
            os.makedirs(VALENTINE_INBOX, exist_ok=True)
            with open(os.path.join(VALENTINE_INBOX, f"{handoff['id']}.json"), 'w') as f:
                json.dump(handoff, f, indent=2)
            logging.info(f"📱 Valentine notification staged: {handoff['id']}")

        # 4. COMET (Research Scout)
        if "COMET" in platforms and event_type == "ACADEMIC_INGESTION":
            import subprocess
            comet_script = os.path.join(BASE_PATH, "06_System/Execution/comet_scout.py")
            if os.path.exists(comet_script):
                topic = payload.get("course", "general_mission") if payload else "general_mission"
                subprocess.Popen(["python3", comet_script, topic])
                logging.info(f"🌠 Comet Scout launched for topic: {topic}")

if __name__ == "__main__":
    UnifiedEventBus.emit(
        event_type="SYSTEM_READY",
        source="Antigravity",
        message="Mode 7: Emergent Scholar Protocol is fully online.",
        priority=2
    )
