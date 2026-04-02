import time
import os
import redis
import json
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

import sys
sys.path.append(os.path.expanduser('~/AILCC_PRIME/01_Areas/Codebases/ailcc'))
from core.memory.sqlite_vector_bridge import upsert_to_sqlite

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3" # Local edge compute to save cloud APIs
LOG_PATH = os.path.expanduser("~/AILCC_PRIME/05_Medical/Logs/Clinical_Logs.md")
REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")

r = redis.Redis(host=REDIS_HOST, port=6379, db=0)

SYSTEM_PROMPT = """
You are the Executive Medical Extracurricular (CanMEDS) Parser. 
I will provide you with unstructured markdown/text log entries detailing clinical and volunteer hours.
Sum the TOTAL hours for each of the 5 CanMEDS roles based on the entries.
Return strictly a raw JSON object with NO markdown formatting, NO backticks, and NO additional text.
Example format:
{
  "Professional": 20,
  "Communicator": 15,
  "Collaborator": 55,
  "Leader": 10,
  "Health Advocate": 30
}
Analyze the logs carefully and classify the time optimally.
"""

def parse_logs_with_edge_ai():
    if not os.path.exists(LOG_PATH):
        print(f"⚠️ [CanMEDS Parser] Log file not found at {LOG_PATH}")
        return

    with open(LOG_PATH, 'r', encoding='utf-8') as f:
        content = f.read().strip()

    if not content:
        print("ℹ️ [CanMEDS Parser] Log file is empty. Skipping inference.")
        return

    print("🧠 [CanMEDS Parser] File change detected. Engaging Local Ollama Inference...")
    
    payload = {
        "model": MODEL_NAME,
        "prompt": f"{SYSTEM_PROMPT}\n\nLOGS TO PARSE:\n{content}",
        "stream": False,
        "format": "json"
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        if response.status_code == 200:
            result = response.json().get('response', '{}').strip()
            
            # Sanitize any stray markdown backticks if LLaMA ignores system prompt
            if result.startswith('```'):
                result = '\n'.join(result.split('\n')[1:-1])
                
            parsed_json = json.loads(result)
            
            # Persist to Redis
            r.hset('ailcc:medical:state', 'canmeds_hours', json.dumps(parsed_json))
            print(f"✅ [CanMEDS Parser] Successfully updated Redis state: {parsed_json}")
            
            # Optional: Broadcast via PubSub to auto-refresh the UI
            r.publish('NEURAL_SYNAPSE', json.dumps({
                "intent": "MEDICAL_STATE_UPDATED",
                "timestamp": time.time()
            }))
            
            # Phase 109: Embed raw log content to Zero-RAM Vector DB for Semantic Search
            print("💾 [CanMEDS Parser] Embedding log text to SQLite Semantic Vector Store...")
            upsert_to_sqlite(content, doc_path="Clinical_Logs.md", chunk_index=0)
            
        else:
            print(f"❌ [CanMEDS Parser] Ollama Error: {response.text}")
            
    except Exception as e:
        print(f"❌ [CanMEDS Parser] Inference failure: {e}")

class LogHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path == LOG_PATH:
            parse_logs_with_edge_ai()

if __name__ == "__main__":
    print(f"🟢 [CanMEDS Parser] Booted in Edge-Compute Mode. Monitoring: {LOG_PATH}")
    
    # Initialize initial state on boot
    parse_logs_with_edge_ai()
    
    observer = Observer()
    # Watch the directory, not the exact file, to handle typical macOS atomic saves.
    target_dir = os.path.dirname(LOG_PATH)
    observer.schedule(LogHandler(), path=target_dir, recursive=False)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
