import os
import sqlite3
import time
import requests

# SQLite & Local LLaMA3 Resolvers
DB_PATH = os.path.join(os.path.dirname(__file__), "vault_vector_store.db")
OLLAMA_URL = "http://localhost:11434/api/generate"

def ensure_table():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS voice_telemetry (
        id TEXT PRIMARY KEY,
        transcript TEXT,
        status TEXT DEFAULT 'PENDING',
        intent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()

def parse_pending_transcripts():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Pull arrays where the Apple device posted it, but AI hasn't processed it
    c.execute("SELECT id, transcript FROM voice_telemetry WHERE status = 'PENDING'")
    rows = c.fetchall()

    if rows:
        print(f"[VOICE PARSER] Detected {len(rows)} new iOS telemetry packets in buffer.")

    for row in rows:
        voice_id, transcript = row
        print(f"[VOICE PARSER] Routing Transcript '{voice_id}' to localized LLaMA3. Body: \"{transcript}\"")
        
        prompt = f"""
        Commander infinitexzero-AI dictated this raw voice transcript: "{transcript}"
        Determine the exact operational intent of this command.
        Respond with ONLY ONE of the following exact string tags in brackets:
        [LOG] - If the Commander is just dictating a thought, idea, or memory to save.
        [TASK] - If the Commander is assigning a new task or bounty to be done.
        [AGENT_TRIGGER] - If the Commander is explicitly telling an AI agent to perform an execution immediately.
        
        Do not output conversational text. Output the literal tag.
        """
        
        try:
            payload = {"model": "llama3.2", "prompt": prompt, "stream": False}
            res = requests.post(OLLAMA_URL, json=payload, timeout=20)
            
            if res.status_code == 200:
                intent_raw = res.json().get('response', '[LOG]').strip()
                
                # Rigid Fallback Sanitization
                final_intent = "[LOG]"
                for tag in ["[LOG]", "[TASK]", "[AGENT_TRIGGER]"]:
                    if tag in intent_raw:
                        final_intent = tag
                        break
                
                # Execute semantic state update on Edge SQLite
                c.execute("UPDATE voice_telemetry SET status = 'PARSED', intent = ? WHERE id = ?", (final_intent, voice_id))
                conn.commit()
                print(f"[VOICE PARSER] Synthesized successfully. Logic Intent locked as: {final_intent}")
                
                # Dynamic Git Injection Handoff
                if final_intent == "[AGENT_TRIGGER]" and any(k in transcript.lower() for k in ["commit", "push", "save", "sync"]):
                    print("[VOICE PARSER] ⚠️ Git Subagent Operation Detected! Dispatching Payload.")
                    import subprocess
                    script_path = os.path.join(os.path.dirname(__file__), "..", "agents", "git_operative.py")
                    # Spawn in the background unconditionally
                    subprocess.Popen(["python3", script_path])
            else:
                print(f"[VOICE PARSER] Fatal Ollama Crash - Engine returned {res.status_code}")
                # Back-off logic
                
        except Exception as e:
            print(f"[VOICE PARSER] Connection to offline Engine sever. Details: {e}")
            c.execute("UPDATE voice_telemetry SET status = 'ERROR' WHERE id = ?", (voice_id,))
            conn.commit()

    conn.close()

if __name__ == "__main__":
    ensure_table()
    print("[AILCC VOICE NEXUS] Sub-routine active. Aggressively guarding the root SQLite table for inbound iOS payload injections.")
    
    # Daemon loop for pseudo-websockets architecture
    while True:
        parse_pending_transcripts()
        time.sleep(3) # Polling exactly every 3000ms ensures an immediate physical perception when tapping Apple Watch.
