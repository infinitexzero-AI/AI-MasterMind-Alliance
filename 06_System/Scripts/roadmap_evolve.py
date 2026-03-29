#!/usr/bin/env python3
import requests
import os
import sys

VALENTINE_URL = "http://localhost:5001/execute"
TASK_FILE = "/Users/infinite27/.gemini/antigravity/brain/542d6997-c7f5-4473-a5ab-29dba653bafb/task.md"
WALKTHROUGH_FILE = "/Users/infinite27/.gemini/antigravity/brain/542d6997-c7f5-4473-a5ab-29dba653bafb/walkthrough.md"

def evolve_roadmap():
    print("🚀 Initializing Autonomous Roadmap Evolution...")
    
    if not os.path.exists(TASK_FILE) or not os.path.exists(WALKTHROUGH_FILE):
        print("❌ Error: Task or Walkthrough files not found.")
        return

    with open(TASK_FILE, 'r') as f:
        task_content = f.read()
    
    with open(WALKTHROUGH_FILE, 'r') as f:
        walkthrough_content = f.read()

    prompt = f"""
    You are the Master Strategist of the AI Mastermind Alliance. 
    Review the current TASK LIST and WALKTHROUGH of what has been achieved.
    
    CURRENT TASKS:
    {task_content}
    
    ACHIEVEMENTS:
    {walkthrough_content}
    
    Your goal is to propose 'Phase 10: Recursive Self-Optimization' for the roadmap.
    Identify gaps in service orchestration, data intelligence, or agentic sovereignty.
    
    Format the output as a Markdown list of 5-7 actionable technical tasks ready for task.md.
    Example:
    - [ ] Step 1: Optimize Neural Cache
    - [ ] Step 2: Implement Cross-Workspace Logic Bridges
    """

    print("🧠 Querying Valentine Core for strategic synthesis...")
    try:
        response = requests.post(VALENTINE_URL, json={
            "prompt": prompt,
            "context": "Autonomous Roadmap Synthesis Operation"
        }, timeout=60)
        
        if response.ok:
            data = response.json()
            proposal = data.get('response', '')
            print("\n✨ Strategic Proposal for Phase 10:")
            print(proposal)
            
            # Append to task.md
            with open(TASK_FILE, 'a') as f:
                f.write(f"\n- [ ] Phase 10: Recursive Self-Optimization (Proposed by Hive Mind)\n")
                f.write(proposal)
                f.write("\n")
            
            print(f"\n✅ Roadmap successfully evolved in {TASK_FILE}")
        else:
            print(f"❌ Error: Valentine Core returned {response.status_code}")
    except Exception as e:
        print(f"❌ Error during request: {e}")

if __name__ == "__main__":
    evolve_roadmap()
