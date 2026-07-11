#!/usr/bin/env python3
import json
import os
import subprocess
import sys
from datetime import datetime

# Expand home paths for cross-platform portability
REPO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VAULT_DIR = os.path.expanduser("~/Obsidian_Academic_Vault")
STATE_FILE = os.path.join(VAULT_DIR, "procedures", "git_sync_state.json")

def run_cmd(args, cwd=REPO_DIR):
    """Runs a shell command and returns stdout and return code."""
    result = subprocess.run(args, capture_output=True, text=True, cwd=cwd)
    return result.stdout.strip(), result.returncode

def get_git_status():
    """Returns whether the git workspace is dirty and current HEAD commit."""
    status_out, _ = run_cmd(["git", "status", "--porcelain"])
    head_hash, _ = run_cmd(["git", "rev-parse", "HEAD"])
    branch, _ = run_cmd(["git", "branch", "--show-current"])
    
    # Check if we are ahead/behind tracking branch
    status_full, _ = run_cmd(["git", "status"])
    is_ahead = "ahead of" in status_full
    is_behind = "behind" in status_full
    
    return {
        "dirty": len(status_out) > 0,
        "head": head_hash,
        "branch": branch,
        "is_ahead": is_ahead,
        "is_behind": is_behind
    }

def read_vault_state():
    """Reads the signaling file from the OneDrive Obsidian vault."""
    if not os.path.exists(STATE_FILE):
        return None
    try:
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return None

def write_vault_state(commit_hash):
    """Writes the new pushed commit hash to the vault signaling file."""
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    state = {
        "last_pushed_commit": commit_hash,
        "pushed_by_device": os.uname().nodename if hasattr(os, "uname") else os.environ.get("COMPUTERNAME", "unknown"),
        "timestamp": datetime.now().isoformat()
    }
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)
    print(f"📡 [SIGNAL] Synced new commit hash to Vault: {commit_hash[:8]}")

def sync():
    print(f"🔄 Checking AILCC_PRIME Sync Status...")
    print(f"   Repository: {REPO_DIR}")
    print(f"   Vault Signalling Path: {STATE_FILE}\n")
    
    if not os.path.exists(VAULT_DIR):
        print(f"❌ Error: Vault directory not found at {VAULT_DIR}.")
        print("   Ensure OneDrive is running and mounted.")
        sys.exit(1)

    # Fetch remote status
    print("📡 Fetching latest from origin...")
    run_cmd(["git", "fetch", "origin"])
    
    local = get_git_status()
    vault = read_vault_state()

    print(f"   Local Branch: {local['branch']}")
    print(f"   Local HEAD:   {local['head'][:8]}")
    
    if vault:
        print(f"   Vault Signal: {vault['last_pushed_commit'][:8]} (Pushed by {vault['pushed_by_device']})")
    else:
        print("   Vault Signal: No active signal found. Initializing...")
        write_vault_state(local["head"])
        vault = read_vault_state()

    # Determine Sync Actions
    if local["is_ahead"]:
        print("\n🚀 Local branch is ahead of origin. Pushing updates...")
        push_out, code = run_cmd(["git", "push", "origin", local["branch"]])
        if code == 0:
            new_head, _ = run_cmd(["git", "rev-parse", "HEAD"])
            write_vault_state(new_head)
            print("✅ Push and vault signaling complete.")
        else:
            print(f"❌ Push failed:\n{push_out}")
            
    elif local["is_behind"] or local["head"] != vault["last_pushed_commit"]:
        # We need to pull the remote commits
        print("\n⚠️ Sync Drift Detected. Vault signals a different commit or local is behind remote.")
        
        # Stash local dirty changes if any
        stashed = False
        if local["dirty"]:
            print("📦 Stashing local uncommitted changes...")
            run_cmd(["git", "stash"])
            stashed = True
            
        print("📥 Pulling latest commits from branch...")
        pull_out, code = run_cmd(["git", "pull", "origin", local["branch"]])
        
        if code == 0:
            new_local = get_git_status()
            print(f"✅ Pull complete. Local HEAD is now at {new_local['head'][:8]}")
            
            # Pop stash if we did it
            if stashed:
                print("📦 Re-applying local uncommitted changes...")
                run_cmd(["git", "stash", "pop"])
        else:
            print(f"❌ Pull failed:\n{pull_out}")
            if stashed:
                print("📦 Re-applying local uncommitted changes from stash...")
                run_cmd(["git", "stash", "pop"])
    else:
        print("\n🟢 System is fully synchronized. No actions needed.")

if __name__ == "__main__":
    sync()
