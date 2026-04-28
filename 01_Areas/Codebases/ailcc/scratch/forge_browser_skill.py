import asyncio
import os
import sys
import json

# Add project root to path
AILCC_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(AILCC_ROOT)

from core.neural_skill_forge import NeuralSkillForge

async def main():
    forge = NeuralSkillForge()
    
    objective = (
        "Implement a proactive browser orchestration layer that automatically opens relevant "
        "academic and task-specific websites (CRA, TurboTax, MTA Moodle at https://moodle.mta.ca/local/login/index.php, ResearchGate) "
        "based on the current active task matrix. The orchestration layer must first audit existing tabs, "
        "closing any that are redundant, non-functional (error pages), or irrelevant to the active task, "
        "before grouping the necessary pages into a single OneTab session or browser group."
    )
    
    print(f"Initiating Forge for objective: {objective}")
    
    async def stream_cb(payload: dict):
        if payload.get('type') == 'log':
            print(f"LOG: {payload.get('message')}")
        elif payload.get('type') == 'error':
            # Remove emojis from log messages too
            msg = payload.get('message', '').encode('ascii', 'ignore').decode('ascii')
            print(f"ERROR: {msg}")
        elif payload.get('type') == 'success':
            msg = payload.get('message', '').encode('ascii', 'ignore').decode('ascii')
            print(f"SUCCESS: {msg}")
        elif payload.get('type') == 'code':
            print("--- SYNTHESIZED CODE ---")
            print(payload.get('content', '')[:200] + "...")
            print("------------------------")

    result = await forge.iterate_and_forge(objective=objective, stream_cb=stream_cb)
    print(f"\nFinal Result: {json.dumps(result, indent=2)}")

if __name__ == "__main__":
    asyncio.run(main())
