import sqlite3
import os
import requests
import json
from datetime import datetime

# Master Architecture Local Paths
DB_PATH = os.path.expanduser("~/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT/vault_vector_store.db")
OUTPUT_PATH = os.path.expanduser("~/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/public/data/flashcards.json")
OLLAMA_URL = "http://localhost:11434/api/generate"

def extract_vault_context():
    """Extracts organic lecture notes directly from the Zero-RAM SQLite memory vault."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        # Randomly select 2 thick semantic chunks to prevent overloading the local GPU
        cur.execute("SELECT content, doc_path FROM vectors WHERE length(content) > 300 ORDER BY RANDOM() LIMIT 2")
        rows = cur.fetchall()
        conn.close()
        return rows
    except Exception as e:
        print(f"❌ [Flashcard Forge] Local DB Error: {e}")
        return []

def generate_flashcards():
    print("🧠 [Flashcard Forge] Activating Midnight Anki Generation Sequence...")
    
    context_rows = extract_vault_context()
    if not context_rows:
        print("⚠️ [Flashcard Forge] SQLite Vault empty. Execute Phase 111 (vault_ingester_daemon.py) first.")
        return

    cards = []
    
    for content, doc_path in context_rows:
        filename = os.path.basename(doc_path)
        print(f"⛏️ Mining academic insights directly from: {filename}")
        
        # Enforce exact JSON schemas from the LLaMA3 API
        prompt = f"""
You are an elite Pre-Med and Ivy League university tutor.
Read the following university lecture notes excerpt and generate 3 highly difficult active-recall flashcards.
Focus on concepts, dates, biological pathways, and key definitions.
OUTPUT MUST BE EXACTLY A VALID JSON ARRAY with no markdown and no conversational text.
Format: [{{"q": "The question?", "a": "The precise answer"}}]

Lecture Excerpt:
{content[:2500]}
"""
        try:
            res = requests.post(OLLAMA_URL, json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False,
                "format": "json" # Enforce JSON edge-compute
            }, timeout=180) # 3-minute timeout to accommodate non-M3 MacBooks
            
            if res.status_code == 200:
                raw_json = res.json().get("response", "[]")
                batch = json.loads(raw_json)
                
                # Append telemetry to the card metadata
                for card in batch:
                    card['source_file'] = filename
                    card['course'] = 'HLTH1011' if 'HLTH' in filename else 'GENS2101' if 'GENS' in filename else 'General'
                    card['generated_at'] = datetime.utcnow().isoformat()
                    cards.append(card)
        except Exception as e:
            print(f"❌ [Flashcard Forge] Local Edge-Compute (Ollama) inference failed: {e}")
            
    if cards:
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        
        # Non-destructive merge with existing flashcard decks
        existing_deck = []
        if os.path.exists(OUTPUT_PATH):
            with open(OUTPUT_PATH, 'r') as f:
                try: 
                    existing_deck = json.load(f)
                except: 
                    pass
                
        existing_deck.extend(cards)
        
        # Serialize back to the Frontend UI folder
        with open(OUTPUT_PATH, 'w') as f:
            json.dump(existing_deck, f, indent=4)
            
        print(f"\n✅ Successfully forged {len(cards)} new edge-compute flashcards!")
        print(f"📝 Synchronized to: {OUTPUT_PATH}")
        print("🖥️ The Nexus Dashboard will now auto-render these in the Scholar Core.")

if __name__ == "__main__":
    generate_flashcards()
