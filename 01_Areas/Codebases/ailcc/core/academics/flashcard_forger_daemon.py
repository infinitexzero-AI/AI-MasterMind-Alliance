import os
import json
import requests
import time
import shutil

OLLAMA_URL = "http://localhost:11434/api/generate"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# Internal Vault Paths
LIT_DIR = os.path.join(BASE_DIR, "hippocampus_storage", "literature")
FLASHCARD_DB = os.path.join(BASE_DIR, "dashboard", "public", "flashcards.json")

def initialize_db():
    if not os.path.exists(FLASHCARD_DB):
        with open(FLASHCARD_DB, "w") as f:
            json.dump([
                {"course": "GENS2101", "question": "What is the primary vector for NRM?", "answer": "Matrix alignment."},
                {"course": "HLTH1011", "question": "Define bio-informatic synthesis.", "answer": "The fusion of medical telemetry & computing."}
            ], f, indent=4)

def append_flashcards(new_cards):
    initialize_db()
    try:
        with open(FLASHCARD_DB, "r") as f:
            existing = json.load(f)
    except json.JSONDecodeError:
        existing = []
        
    existing.extend(new_cards)
    with open(FLASHCARD_DB, "w") as f:
        json.dump(existing, f, indent=4)

def generate_flashcards_from_text(course_code, text_chunk):
    print(f"[Anki Forger] Structuring Memory Matrices for {course_code} via LLaMA3...")
    prompt = f"""
    You are an automated Academic extraction Subagent tracking the commander's university workflow.
    Analyze the following true academic text for the course {course_code} and generate EXACTLY 2 active recall flashcards.
    
    You MUST output a valid JSON array containing exactly 2 objects.
    Example target output format:
    [
      {{"course": "{course_code}", "question": "What is the primary objective of modern non-invasive biometric telemetry?", "answer": "To reduce hospital transmission rates while establishing a continuous health monitoring vector."}},
      {{"course": "{course_code}", "question": "What does PPG stand for?", "answer": "Photoplethysmography."}}
    ]
    
    TEXT BLOCK:
    {text_chunk[:3000]}
    """
    try:
        payload = {
            "model": "tinyllama", 
            "prompt": prompt, 
            "stream": False
        }
        res = requests.post(OLLAMA_URL, json=payload, timeout=45)
        response_data = res.json()
        print(f"[Anki Forger] Raw API Payload Dictionary: {response_data}")
        raw_text = response_data.get('response', '').strip()
        
        # ----------------------------------------------------
        # NATIVE REGEX / TEXT PARSING FOR TINYLLAMA (BYPASS JSON)
        # ----------------------------------------------------
        cards = []
        import re
        # Try to find anything that looks like {"question": "...", "answer": "..."}
        # Even if it's malformed or split across multiple arrays
        matches = re.findall(r'"question":\s*"([^"]+)",?\s*"answer":\s*"([^"]+)"', raw_text)
        
        # If TinyLlama hallucinates keys or French, fallback to basic text splitting if Regex misses
        if not matches:
            lines = raw_text.split('\n')
            q, a = None, None
            for line in lines:
                if "question" in line.lower() and ":" in line:
                    q = line.split(":", 1)[1].strip().strip('",')
                elif "answer" in line.lower() and ":" in line:
                    a = line.split(":", 1)[1].strip().strip('",')
                    if q and a:
                        cards.append({"course": course_code, "question": q, "answer": a})
                        q, a = None, None
        else:
            for q, a in matches:
                cards.append({"course": course_code, "question": q, "answer": a})
                
        # If absolutely everything fails, synthesize a fallback
        if not cards:
            cards.append({
                "course": course_code, 
                "question": f"Synthesize {course_code} core concepts.", 
                "answer": "Engine offline. Manual review required."
            })
            
        print(f"[Anki Forger] Successfully stripped {len(cards)} variables from hallucinated text.")
        return cards
        
    except Exception as e:
        print(f"[Anki Forger] LLaMA3 Inference Crash: {e}")
        print(f"[Raw Output Dump]: {raw_json if 'raw_json' in locals() else 'None'}")
        return []

def scan_and_forge():
    print("[Anki Forger] Scanning internal literature directory for ripped Moodle Arrays...")
    os.makedirs(LIT_DIR, exist_ok=True)
    
    literature_files = [f for f in os.listdir(LIT_DIR) if f.endswith(".txt") or f.endswith(".md")]
    
    if not literature_files:
        print("[Anki Forger] No new literature located. Pipeline clear.")
        return
        
    for file in literature_files:
        print(f"[Anki Forger] Processing newly intercepted Module: {file}")
        filepath = os.path.join(LIT_DIR, file)
        
        # Course Code Inference Engine
        course_code = "GENS2101"
        if "hlth" in file.lower():
            course_code = "HLTH1011"
            
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            print(f"[Anki Forger] Loaded buffer size: {len(content)} bytes.")
            
        cards = generate_flashcards_from_text(course_code, content)
        if cards:
            append_flashcards(cards)
            print(f"[Anki Forger] Successfully injected {len(cards)} active recall vectors into the Dashboard ({course_code}).")
            
        # Architecture cleanup
        arch_dir = os.path.join(LIT_DIR, "archived")
        os.makedirs(arch_dir, exist_ok=True)
        shutil.move(filepath, os.path.join(arch_dir, file))

if __name__ == "__main__":
    print("=========================================================")
    print(" 🚀 VANGUARD SCHOLAR: DOMAIN KNOWLEDGE SYNTHESIS")
    print("=========================================================")
    scan_and_forge()
