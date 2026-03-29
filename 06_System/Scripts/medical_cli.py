import os
import sys
import json
import asyncio
import logging
from pathlib import Path

# Fix relative imports
AILCC_PRIME_PATH = Path(__file__).resolve().parent.parent
if str(AILCC_PRIME_PATH) not in sys.path:
    sys.path.insert(0, str(AILCC_PRIME_PATH))

from automations.skills.casper_mmi_simulator import CasperSimulator
from automations.skills.mcat_anki_generator import McatAnkiGenerator

# Mute logging to stdout so we only print valid JSON back to Node
logging.getLogger().setLevel(logging.CRITICAL)

async def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        return

    cmd = sys.argv[1]
    
    try:
        if cmd == "casper_generate":
            sim = CasperSimulator()
            scen = await sim.generate_scenario()
            print(json.dumps(scen))
            
        elif cmd == "casper_grade":
            scen_text = sys.argv[2]
            user_resp = sys.argv[3]
            sim = CasperSimulator()
            grade = await sim.grade_response(scen_text, user_resp)
            print(json.dumps(grade))
            
        elif cmd == "mcat_anki":
            source_path = sys.argv[2]
            topic = sys.argv[3]
            gen = McatAnkiGenerator()
            # Pass a mock task ID
            res = await gen.execute_generation("dashboard_mcat", source_path, topic)
            print(json.dumps({"csv_path": res}))
        else:
            print(json.dumps({"error": "Unknown Command"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    asyncio.run(main())
