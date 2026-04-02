import os
import sqlite3
import json
import requests
import datetime

OLLAMA_URL = "http://localhost:11434/api/generate"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

DB_PATH = os.path.join(BASE_DIR, "dashboard", "vault_vector_store.db")
CHRONICLE_DIR = os.path.join(BASE_DIR, "dashboard", "public", "chronicle")
FLASHCARD_DB = os.path.join(BASE_DIR, "dashboard", "public", "flashcards.json")

def initialize_chronicle():
    os.makedirs(CHRONICLE_DIR, exist_ok=True)

def gather_vanguard_telemetry():
    telemetry = {
        "voice_logs": [],
        "career_bounties": [],
        "academic_flashcards": 0
    }
    
    print("[Dispatcher] Establishing SQLite Vector Readout...")
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        # Pull latest 5 voice transcripts
        c.execute("SELECT timestamp, transcript, intent FROM voice_telemetry ORDER BY id DESC LIMIT 5")
        for row in c.fetchall():
            telemetry["voice_logs"].append(f"[{row[0]}] {row[1]} -> {row[2]}")
            
        # Pull latest 3 career bounties
        try:
            c.execute("SELECT status, company, role FROM career_tracker ORDER BY id DESC LIMIT 3")
            for row in c.fetchall():
                telemetry["career_bounties"].append(f"[{row[0]}] {row[2]} at {row[1]}")
        except sqlite3.OperationalError:
            # career_tracker table might be missing if DB drifted
            telemetry["career_bounties"].append("Career Ops: DB Engine Offline.")
            
        conn.close()
    except Exception as e:
        print(f"[ERROR] SQLite Extraction Failure: {e}")
        
    print("[Dispatcher] Parsing the Local Anki Flashcard Arrays...")
    try:
        if os.path.exists(FLASHCARD_DB):
            with open(FLASHCARD_DB, "r") as f:
                cards = json.load(f)
                telemetry["academic_flashcards"] = len(cards)
    except Exception as e:
        pass
        
    return telemetry

def forge_executive_summary(telemetry):
    print("[Dispatcher] Piping arrays into native TinyLlama Core...")
    now = datetime.datetime.now().strftime("%A, %B %d %Y - %H:%M")
    
    raw_telemetry_string = f"""
    VANGUARD STATE: {now}
    
    RECENT VOICE COMMANDS:
    {chr(10).join(telemetry['voice_logs']) if telemetry['voice_logs'] else "No recent commands."}
    
    LATEST CAREER BOUNTIES:
    {chr(10).join(telemetry['career_bounties']) if telemetry['career_bounties'] else "No recent job hunts."}
    
    ACADEMIC EXTRACTION:
    Total Active Recall Flashcards injected today: {telemetry['academic_flashcards']}
    """
    
    prompt = f"""
    You are Vanguard, the AI orchestrator for the Commander. 
    Review the following raw telemetry from the system logs and generate a concise 3-paragraph "Morning Executive Brief".
    
    Output purely the Markdown formatted response. Do not output anything like "Here is your summary:"
    Write in a highly professional, calculated, cyberbetic tone.
    
    Paragraph 1: Welcome the Commander and summarize the Voice Commands.
    Paragraph 2: Summarize the state of the Career Bounties.
    Paragraph 3: Note the Academic Flashcard progress and closing thoughts.
    
    RAW TELEMETRY:
    {raw_telemetry_string}
    """
    
    try:
        payload = {
            "model": "tinyllama", 
            "prompt": prompt, 
            "stream": False
        }
        res = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response_text = res.json().get('response', 'Engine Offline.').strip()
        
        # Strip LLM hallucination markers
        if response_text.startswith("```markdown"):
            response_text = response_text[11:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        return response_text.strip()
    except Exception as e:
        print(f"[ERROR] LLaMA inference crashed: {e}")
        return f"# Critical System Warning\n\nThe Local Inference Node failed to synthesize the daily logs. {e}"

def execute_morning_run():
    initialize_chronicle()
    telemetry = gather_vanguard_telemetry()
    summary = forge_executive_summary(telemetry)
    
    daily_file = os.path.join(CHRONICLE_DIR, "briefing_today.md")
    
    with open(daily_file, "w") as f:
        f.write("# 🌅 Morning Dispatch Override\n\n")
        f.write(summary)
        
    print(f"[Dispatcher] Structural Executive Summary actively written to: {daily_file}")
    print("[Dispatcher] Pipeline Secure.")

if __name__ == "__main__":
    print("=========================================================")
    print(" 🚀 VANGUARD DISPATCHER: DAILY SITUATION REPORT")
    print("=========================================================")
    execute_morning_run()
