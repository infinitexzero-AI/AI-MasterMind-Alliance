import os
import subprocess
import requests

# LLaMA3 Autonomous Inference Resolution
OLLAMA_URL = "http://localhost:11434/api/generate"
# Ascend out of `core/agents/` to the physical Vault root (`AILCC_PRIME/01_Areas/Codebases/ailcc`)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def execute_autonomous_push():
    """
    Reads the physical Git Delta, forces LLaMA3 to mathematically generate the logic summary, 
    and directly pushes the changes to the origin pipeline.
    """
    try:
        # 1. Extract the Raw Payload Matrix
        # Stage everything first so `git diff --cached` can read the untracked files too
        subprocess.check_call(["git", "add", "."], cwd=BASE_DIR)
        diff_output = subprocess.check_output(["git", "diff", "--cached"], cwd=BASE_DIR, stderr=subprocess.STDOUT).decode('utf-8')
        
        if not diff_output.strip():
            return "No changes detected in the Vanguard matrix. System architecture is perfectly synced."
            
        print("[Git Operative] Extracting code delta. Bridging to local LLaMA3...")
        
        # 2. Forge the Conventional Message
        prompt = f"""
        You are a Vanguard Software Architect performing an absolute code execution. 
        Generate a perfect 1-line Conventional Commit message based on these verified Git changes.
        Do NOT output any introductory or conversational text. DO NOT EXPLAIN YOURSELF.
        ONLY output the raw commit message (e.g. 'feat(nexus): inject voice telemetry endpoint' or 'refactor(core): sync routing arrays').
        
        Git Delta:
        {diff_output[:3000]}
        """
        
        try:
            payload = {"model": "llama3.2", "prompt": prompt, "stream": False}
            res = requests.post(OLLAMA_URL, json=payload, timeout=30)
            
            if res.status_code == 200:
                commit_msg = res.json().get('response', '').strip()
                # Strip artifacts LLaMA might inject
                commit_msg = commit_msg.strip('"').strip("'")
            else:
                commit_msg = "chore(system): autonomous vanguard array sync"
        except Exception:
            commit_msg = "chore(system): autonomous vanguard array sync (offline)"
            
        print(f"[Git Operative] Synthesized Message -> '{commit_msg}'")
        
        # 3. Execute Vanguard Push
        subprocess.check_call(["git", "commit", "-m", commit_msg], cwd=BASE_DIR)
        
        branch = subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=BASE_DIR).decode('utf-8').strip()
        print(f"[Git Operative] Establishing secure uplink to branch: {branch}...")
        
        try:
            subprocess.check_call(["git", "push", "origin", branch], cwd=BASE_DIR)
            push_status = "Cloud Deployment Secured"
        except subprocess.CalledProcessError:
            # Most likely origin doesn't exist, just leaving it committed locally
            push_status = "Local Commit Passed (Origin push failed - check git remote)"
        
        return f"SUCCESS: {push_status}. Logic locked as: '{commit_msg}'"
        
    except Exception as e:
        return f"FATAL GIT ERROR: {str(e)}"

if __name__ == "__main__":
    print("=========================================================")
    print(" 🚀 VANGUARD GIT OPERATIVE: TACTICAL EXECUTION INITIATED")
    print("=========================================================")
    result = execute_autonomous_push()
    print(f"\n[Terminus] {result}")
