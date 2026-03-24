import os
import json
import time
from pathlib import Path
from datetime import datetime

VAULT_PATH = Path("/Users/infinite27/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT")
INTELLIGENCE_VAULT = VAULT_PATH / "04_Intelligence_Vault"
MODE6_DATA_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/automations/mode6/data")

def harvest_results():
    if not MODE6_DATA_DIR.exists():
        return
        
    for result_file in MODE6_DATA_DIR.glob("result-research-*.json"):
        try:
            with open(result_file, 'r') as f:
                result_data = json.load(f)
            
            if not result_data.get("success"):
                print(f"❌ Swarm Task Failed: {result_file.name}")
                continue
                
            report_text = result_data.get("data", {}).get("text", "")
            if not report_text:
                report_text = str(result_data.get("data", "No text payload extracted."))
            
            # Fallback topic
            topic = f"Autonomous_Research_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Read decision file metadata if it exists to categorize cleanly
            decision_file = MODE6_DATA_DIR / result_file.name.replace("result-", "decision-")
            if decision_file.exists():
                with open(decision_file, 'r') as df:
                    decision_data = json.load(df)
                    topic = decision_data.get("metadata", {}).get("topic", topic).replace(" ", "_")
            
            # Create subfolder in vault
            output_folder = INTELLIGENCE_VAULT / topic
            output_folder.mkdir(parents=True, exist_ok=True)
            
            output_file = output_folder / f"intelligence_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            with open(output_file, 'w') as f:
                # Top header for context
                f.write(f"# Sovereign Intelligence Report: {topic.replace('_', ' ')}\n")
                f.write(f"**Synthesized by Swarm Mode 6** | Timestamp: {datetime.now().isoformat()}\n\n")
                f.write(report_text)
                
            print(f"✅ Harvested Intelligence to: {output_file}")
            
            # Cleanup payload shards
            result_file.unlink()
            if decision_file.exists():
                decision_file.unlink()
                
        except Exception as e:
            print(f"Harvest Failure on {result_file.name}: {e}")

if __name__ == "__main__":
    print("🌾 RESULT HARVESTER: Monitoring Mode 6 data layer...")
    while True:
        harvest_results()
        time.sleep(10)
