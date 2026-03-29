import json
import os
from datetime import datetime

REGISTRY_PATH = "/Users/infinite27/AILCC_PRIME/tasks/consolidated_task_registry.json"

DOMAINS = [
    ("TECH", "DEVELOPMENT", "Architect"),
    ("TECH", "SYSTEM", "Nomad"),
    ("TECH", "SECURITY", "Mechanic"),
    ("TECH", "INTEGRATION", "Comet"),
    ("TECH", "LLM_OPS", "Scribe"),
    ("LIFE", "STRATEGY", "Judge"),
    ("LIFE", "OPERATIONS", "Antigravity")
]

VERBS = ["Implement", "Deploy", "Architect", "Refactor", "Optimize", "Audit", "Encrypt", "Synchronize", "Construct", "Patch", "Overhaul", "Synthesize", "Forge", "Calibrate"]
TARGETS = [
    "Glassmorphism React Components", "Framer Motion layout transitions", "WebSocket heartbeat payloads",
    "Redis Pub/Sub orchestration keys", "Local LLM failover routing", "Biometric TouchID intercepts",
    "Xbox presence telemetry pipelines", "Grok API translation proxies", "OneDrive Vault polling daemons",
    "Zero-knowledge encryption layers", "Automated Yield farming scrapes", "iOS Shortcut voice integrations",
    "Mastermind UI Task Matrices", "Playwright DOM parsing scripts", "Docker container auto-healing loops"
]
OUTCOMES = [
    "for zero-latency frontend rendering.", "to secure the AILCC Prime Vault.", "ensuring 99.9% Swarm uptime.",
    "for cross-device synchronization.", "to eliminate manual Bash triggers.", "for total network sovereignty.",
    "to hyper-saturate the OmniTracker.", "for deeper AI context retention.", "to optimize token limits.",
    "to aestheticize the Nexus Dashboard."
]

def generate_century_matrix():
    tasks = []
    task_id_counter = 100
    
    for i in range(100):
        track, category, assignee = DOMAINS[i % len(DOMAINS)]
        verb = VERBS[(i * 3) % len(VERBS)]
        target = TARGETS[(i * 7) % len(TARGETS)]
        outcome = OUTCOMES[(i * 11) % len(OUTCOMES)]
        
        directive = f"{verb} {target}"
        
        priority = "CRITICAL" if i % 10 == 0 else ("HIGH" if i % 3 == 0 else "MEDIUM")
        
        task = {
            "id": f"C-{task_id_counter + i}",
            "source": "SYSTEM",
            "assignedTo": assignee.upper(),
            "priority": priority,
            "category": category,
            "track": track,
            "directive": directive,
            "narrative": f"{assignee.upper()} is executing overarching Century Matrix Protocol: {directive}",
            "why": f"This action structurally fortifies the Mastermind {category} foundation {outcome}",
            "status": "QUEUED",
            "successCriteria": ["Inject module smoothly", "Verify log output telemetry"],
            "telemetry": {
                "progress": 0,
                "lastEvent": "Awaiting scheduling queue"
            }
        }
        tasks.append(task)
        
    return tasks

def main():
    if not os.path.exists(REGISTRY_PATH):
        print(f"Error: Registry not found at {REGISTRY_PATH}")
        return
        
    with open(REGISTRY_PATH, 'r') as f:
        data = json.load(f)
        
    # Purge any previously generated malformed Century tasks (C-100 through C-199)
    cleaned_registry = [t for t in data.get("registry", []) if not t.get("id", "").startswith("C-1")]
    
    century_matrix = generate_century_matrix()
    cleaned_registry.extend(century_matrix)
    
    data["registry"] = cleaned_registry
    data["total_tasks"] = len(cleaned_registry)
    data["last_updated"] = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    
    with open(REGISTRY_PATH, 'w') as f:
        json.dump(data, f, indent=4)
        
    print(f"Successfully purged malformed data and injected {len(century_matrix)} perfectly structured Century Matrix tasks into the OmniTracker.")
    print(f"Total tasks now tracking: {data['total_tasks']}")

if __name__ == "__main__":
    main()
