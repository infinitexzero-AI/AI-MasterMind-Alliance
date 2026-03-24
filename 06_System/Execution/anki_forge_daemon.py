import os
import time
import json
import requests
from pathlib import Path
from datetime import datetime

VAULT_PATH = Path("/Users/infinite27/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT")
INTELLIGENCE_VAULT = VAULT_PATH / "04_Intelligence_Vault"
ANKI_VAULT = VAULT_PATH / "05_Anki_Decks"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = os.environ.get("AILCC_LOCAL_SLM", "llama3")

def generate_anki_csv(markdown_text):
    prompt = f"""
    You are an expert academic Anki flashcard creator.
    Extract the 5 to 10 most critical clinical/philosophical concepts from the following intelligence report and format them STRICTLY as a CSV with two columns: Question and Answer.
    Do NOT output any conversational text, introductory sentences, or markdown formatting outside of the raw CSV strings. Do not include column headers. Just raw "Question","Answer" lines.
    
    Report context:
    {markdown_text[:4500]}
    """
    
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.2
        }
    }
    
    try:
        resp = requests.post(OLLAMA_URL, json=payload, timeout=80.0) # LLama3 can take ~30-60s locally on MacBook
        if resp.status_code == 200:
            return resp.json().get("response", "").strip()
        else:
            print(f"⚠️ Ollama API Error: {resp.status_code}. Is {MODEL_NAME} installed?")
            return None
    except requests.exceptions.Timeout:
        print(f"❌ Ollama Local Inference Timeout while forging Anki cards.")
        return None
    except Exception as e:
        print(f"❌ Ollama Connection Error: {e}")
        return None

def process_vault():
    if not INTELLIGENCE_VAULT.exists():
        return
        
    ANKI_VAULT.mkdir(parents=True, exist_ok=True)
    
    # Track processed files globally to avoid duplicate generation loops
    processed_log = ANKI_VAULT / ".processed_log.json"
    processed = []
    if processed_log.exists():
        with open(processed_log, 'r') as f:
            try:
                processed = json.load(f)
            except:
                pass
                
    # Recursively scan for new intelligence drops from the Swarm
    for root, dirs, files in os.walk(INTELLIGENCE_VAULT):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                if file_path in processed:
                    continue
                    
                print(f"🎓 [Anki Forge] Synthesizing flashcards for: {file}...")
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    csv_data = generate_anki_csv(content)
                    
                    if csv_data and len(csv_data) > 20: # Ensure valid CSV matrix
                        deck_name = file.replace('.md', '.csv')
                        output_path = ANKI_VAULT / deck_name
                        with open(output_path, 'w', encoding='utf-8') as f:
                            f.write(csv_data)
                            
                        print(f"✅ Anki Deck Forged: {output_path.name}")
                        processed.append(file_path)
                        
                        # Save state robustly
                        with open(processed_log, 'w') as f:
                            json.dump(processed, f)
                            
                except Exception as e:
                    print(f"❌ Failed to forge {file}: {e}")

if __name__ == "__main__":
    print("🛠️ ANKI FORGE DAEMON: Monitoring Intelligence Vault to synthesize raw output...")
    while True:
        process_vault()
        time.sleep(45)
