
import os
import sys
import json
import logging
import argparse
import datetime
import shutil
from pathlib import Path
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load env helper
def load_environment():
    env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
    load_dotenv(env_path)
    return os.getenv("GEMINI_API_KEY")

class BiopsychOrchestrator:
    def __init__(self):
        self.gemini_key = load_environment()
        self.base_path = Path(os.path.expanduser("~/LifeLibrary/Personal_Wing/health_fitness"))
        self.inbox_path = self.base_path / "_Inbox"
        self.archive_path = self.base_path / "archives"
        
        # Ensure dirs exist
        self.inbox_path.mkdir(parents=True, exist_ok=True)
        self.archive_path.mkdir(parents=True, exist_ok=True)

    def ingest_logs(self):
        """Step 1: Ingest JSON logs from Inbox."""
        logger.info(f"📥 [Biopsych] Scanning {self.inbox_path}...")
        files = list(self.inbox_path.glob("*.json"))
        
        if not files:
            logger.info("   No new logs found.")
            return []
            
        logs = []
        for file_path in files:
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    data['_source_file'] = str(file_path) # Track source
                    logs.append(data)
                logger.info(f"   Found log: {file_path.name}")
            except json.JSONDecodeError:
                logger.error(f"   ❌ Invalid JSON: {file_path.name}")
        
        return logs

    def perform_research(self, log: dict) -> dict:
        """Step 2: Simulate Perplexity Recon on symptoms."""
        symptoms = log.get('symptoms', [])
        research_data = {}
        
        if symptoms:
            logger.info(f"🔍 [Perplexity] Researching symptoms: {', '.join(symptoms)}")
            # Simulation
            research_data['insights'] = [
                f"Recent studies suggest hydration and magnesium for {symptoms[0]}.",
                "Check interactions with current nootropics stack."
            ]
        else:
            logger.info("   No acute symptoms to research.")
            
        return research_data

    def generate_protocol(self, log: dict, research: dict) -> dict:
        """Step 3: Generate Recovery Protocol via Gemini (acting as Claude)."""
        logger.info("🧠 [Claude] Analyzing biometrics and generating protocol...")
        
        metrics = log.get('metrics', {})
        subjective = log.get('subjective', {})
        
        # Construct the context for the AI
        context = f"""
        METRICS: Sleep {metrics.get('sleep_hours')}h, HRV {metrics.get('hrv')}, RHR {metrics.get('resting_hr')}
        SUBJECTIVE: Cognitive {subjective.get('cognitive_clarity')}/10, Fatigue {subjective.get('fatigue_level')}/10
        SYMPTOMS: {log.get('symptoms', [])}
        RESEARCH: {research.get('insights', [])}
        """

        if self.gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                prompt = f"""
                You are Dr. Valentine, a Biopsych Recovery Specialist.
                Analyze this daily log and generate an optimization protocol.
                
                DATA:
                {context}
                
                OUTPUT JSON ONLY:
                {{
                    "recovery_score": "0-100",
                    "analysis": "Brief analysis of state",
                    "protocol_am": "Morning routine adjustments",
                    "protocol_pm": "Evening routine adjustments",
                    "warning": "Any flags"
                }}
                """
                response = model.generate_content(prompt)
                clean_json = response.text.replace('```json', '').replace('```', '').strip()
                return json.loads(clean_json)
            except Exception as e:
                logger.error(f"Gemini generation failed: {e}")
        
        # Fallback Simulation
        score = 85 if metrics.get('hrv', 0) > 40 else 60
        return {
            "recovery_score": score,
            "analysis": "Stable baseline. HRV indicates good parasympathetic tone.",
            "protocol_am": "Focus block recommended. Caffeine cut-off 2pm.",
            "protocol_pm": "Magnesium glycinate recommended. Limit blue light.",
            "warning": "None"
        }

    def archive_log(self, log_data: dict):
        """Step 4: Move processed file to archive."""
        src = Path(log_data.get('_source_file'))
        if src.exists():
            dest = self.archive_path / src.name
            shutil.move(str(src), str(dest))
            logger.info(f"   🗄 Archived: {src.name} -> {dest}")

    def save_day_report(self, log: dict, protocol: dict):
        """Step 5: Save markdown report."""
        date_str = log.get('date', datetime.date.today().isoformat())
        filename = self.base_path / f"Recovery_Log_{date_str}.md"
        
        with open(filename, 'w') as f:
            f.write(f"# 🧬 Biopsych Recovery Log: {date_str}\n\n")
            f.write(f"**Recovery Score**: {protocol.get('recovery_score')}/100\n")
            f.write(f"**Analysis**: {protocol.get('analysis')}\n\n")
            f.write("## 📋 Optimization Protocol\n")
            f.write(f"- **Morning**: {protocol.get('protocol_am')}\n")
            f.write(f"- **Evening**: {protocol.get('protocol_pm')}\n\n")
            
            if log.get('symptoms'):
                f.write("## ⚠️ Symptom Watch\n")
                for s in log.get('symptoms'):
                    f.write(f"- {s}\n")
            
            if protocol.get('warning') != "None":
                 f.write(f"\n> [!WARNING]\n> {protocol.get('warning')}\n")

        logger.info(f"   📄 Generated Report: {filename}")

    def run(self):
        print("-" * 60)
        print("🧬 STARTING BIOPSYCH ORCHESTRATOR")
        print("-" * 60)
        
        logs = self.ingest_logs()
        for log in logs:
            # Recon
            research = self.perform_research(log)
            
            # Plan
            protocol = self.generate_protocol(log, research)
            
            # Execute
            self.save_day_report(log, protocol)
            self.archive_log(log)
            
        print("-" * 60)
        print("✅ BIOPSYCH CYCLE COMPLETE")
        print("-" * 60)

if __name__ == "__main__":
    orchestrator = BiopsychOrchestrator()
    orchestrator.run()
