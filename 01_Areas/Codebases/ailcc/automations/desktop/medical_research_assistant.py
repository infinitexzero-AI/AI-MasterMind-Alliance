
import os
import sys
import json
import logging
import argparse
import datetime
from typing import Dict, Any
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load env
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(env_path)

# Paths
REGISTRY_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'registries', 'medical_case_history.json')

class MedicalResearchAssistant:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        if not self.gemini_key:
            logger.warning("GEMINI_API_KEY not found. Analysis will be limited/mocked.")
            
    def load_registry(self) -> Dict[str, Any]:
        if not os.path.exists(REGISTRY_PATH):
            logger.error(f"Registry not found at {REGISTRY_PATH}")
            return {}
        with open(REGISTRY_PATH, 'r') as f:
            return json.load(f)

    def save_registry(self, data: Dict[str, Any]):
        with open(REGISTRY_PATH, 'w') as f:
            json.dump(data, f, indent=2)
        logger.info(f"Registry saved to {REGISTRY_PATH}")

    def analyze_note(self, note: str, current_history: Dict[str, Any]) -> Dict[str, Any]:
        """Use Gemini to analyze the note against the history."""
        
        if not self.gemini_key:
            # Mock behavior
            return {
                "summary": "Mock analysis: Note noted.",
                "timeline_event": {
                    "date": datetime.date.today().isoformat(),
                    "event": "User Note",
                    "details": note
                },
                "new_symptoms": [],
                "suggested_actions": []
            }
            
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            You are a Medical Research Assistant for a user recovering from Encephalitis.
            Analyze the following new note/input in the context of their case history.
            
            CASE CONTEXT:
            Condition: {current_history.get('profile', {}).get('condition')}
            Current Symptoms: {current_history.get('symptoms', {}).get('current')}
            
            NEW INPUT:
            "{note}"
            
            OUTPUT JSON ONLY:
            {{
                "summary": "Brief clinical summary of the input",
                "timeline_event": {{
                    "date": "YYYY-MM-DD",
                    "event": "Short Title (e.g., Symptom Flare, New Protocol)",
                    "details": "One sentence description"
                }},
                "new_symptoms": ["list", "of", "newly", "identified", "symptoms"],
                "suggested_actions": ["Action 1", "Action 2"]
            }}
            """
            
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
            
        except Exception as e:
            logger.error(f"AI Analysis Failed: {e}")
            return {}

    def ingest(self, note: str):
        logger.info(f"PROCESSING INPUT: {note[:50]}...")
        
        history = self.load_registry()
        if not history:
            return

        analysis = self.analyze_note(note, history)
        
        if not analysis:
            logger.error("Analysis failed. No updates made.")
            return

        logger.info(f"   🧠 Analysis: {analysis.get('summary')}")
        
        # Update Timeline
        if analysis.get('timeline_event'):
            history.setdefault('timeline', []).append(analysis['timeline_event'])
            logger.info(f"   📅 Added Timeline Event: {analysis['timeline_event']['event']}")
            
        # Update Symptoms
        new_sym = analysis.get('new_symptoms', [])
        if new_sym:
            current_syms = set(history.get('symptoms', {}).get('current', []))
            for s in new_sym:
                if s not in current_syms:
                    history['symptoms']['current'].append(s)
                    logger.info(f"   ⚠️ Tracked New Symptom: {s}")
        
        # Save
        history['last_updated'] = datetime.date.today().isoformat()
        self.save_registry(history)
        
        # Output Report
        print("-" * 50)
        print("MEDICAL ASSISTANT REPORT")
        print("-" * 50)
        print(f"Summary: {analysis.get('summary')}")
        if analysis.get('suggested_actions'):
             print("Suggestions:")
             for action in analysis['suggested_actions']:
                 print(f"- {action}")
        print("-" * 50)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Medical Research Assistant")
    parser.add_argument("--note", type=str, help="Symptom note or research summary", required=True)
    args = parser.parse_args()
    
    assistant = MedicalResearchAssistant()
    assistant.ingest(args.note)
