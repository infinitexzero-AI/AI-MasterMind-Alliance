import os
import json
import re
from pathlib import Path

CONFIG_PATH = "/Users/infinite27/AILCC_PRIME/06_System/State/digital_twin_config.json"

def load_config():
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)

def extract_high_signal_text():
    config = load_config()
    vault_path = config['vault_path']
    exclusions = config['exclusions']
    min_words = config['min_word_count']
    output_path = config['output_file']
    
    dataset = []
    print(f"🧬 Harvesting digital DNA from {vault_path}...")

    for root, dirs, files in os.walk(vault_path):
        # Apply exclusions
        if any(ex in root for ex in exclusions):
            continue
            
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Heuristic: Find specific headers or large blocks of original thought
                    # For now, let's just take the whole file if it's substantial
                    word_count = len(content.split())
                    if word_count >= min_words:
                        # Clean markdown formatting slightly for training fidelity
                        clean_content = re.sub(r'#+\s', '', content)
                        
                        # Format as an instruction-output pair (Simplified for LoRA)
                        # Instruction focuses on the topic of the file
                        topic = file.replace('.md', '').replace('_', ' ')
                        
                        dataset.append({
                            "instruction": f"Explain the philosophy or technical details of {topic}.",
                            "input": "",
                            "output": clean_content.strip()
                        })
                except Exception as e:
                    print(f"⚠️ Error reading {file}: {e}")

    # Write to JSONL
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        for entry in dataset:
            f.write(json.dumps(entry) + '\n')
            
    print(f"✅ Extraction complete. {len(dataset)} high-signal pairs forged into {output_path}")

if __name__ == "__main__":
    extract_high_signal_text()
