from transformers import pipeline
import sys
import json

# Task #6: Universal Intent Parser
# Uses a lightweight DistilBERT Zero-Shot classifier

CANDIDATE_LABELS = ["optimize vault", "purge logs", "dispatch agent", "status check", "unknown"]

def parse_intent(text):
    print(f"[Parser] Analyzing: '{text}'...")
    
    # Initialize Classifier (downloads on first run, cached thereafter)
    classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-1")
    
    result = classifier(text, CANDIDATE_LABELS)
    
    top_label = result['labels'][0]
    score = result['scores'][0]
    
    output = {
        "text": text,
        "intent": top_label,
        "confidence": round(score, 4),
        "entities": {} # Placeholder for NER
    }
    
    # Basic Extraction
    if "vault" in text:
        output["entities"]["target"] = "VAULT"
    
    print(json.dumps(output, indent=2))
    return output

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "Hey Valentine, clean up the vault please."
    parse_intent(query)
