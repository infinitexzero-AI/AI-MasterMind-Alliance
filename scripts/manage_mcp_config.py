import json
import os
import shutil
import sys
from pathlib import Path

# Configuration
CONFIG_PATH = Path.home() / "Library/Application Support/Claude/claude_desktop_config.json"
BACKUP_PATH = CONFIG_PATH.with_suffix(".json.bak")

PLAYWRIGHT_SERVER_CONFIG = {
    "command": "docker",
    "args": [
        "run",
        "-i",
        "--rm",
        "--init",
        "-e", "DOCKER_CONTAINER=true",
        "mcp/playwright"
    ]
}

def load_config():
    if not CONFIG_PATH.exists():
        print(f"Config file not found at: {CONFIG_PATH}")
        return None
    try:
        with open(CONFIG_PATH, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None

def save_config(config):
    try:
        with open(CONFIG_PATH, 'w') as f:
            json.dump(config, f, indent=2)
        print(f"Successfully saved updated config to: {CONFIG_PATH}")
    except Exception as e:
        print(f"Error saving config: {e}")

def backup_config():
    if CONFIG_PATH.exists():
        shutil.copy2(CONFIG_PATH, BACKUP_PATH)
        print(f"Backup created at: {BACKUP_PATH}")
    else:
        print("No existing config file to backup.")

def add_playwright_server(config, dry_run=False):
    if "mcpServers" not in config:
        config["mcpServers"] = {}
    
    # Check if exists
    if "Playwright" in config["mcpServers"]:
        print("Playwright server already exists in config.")
        existing = config["mcpServers"]["Playwright"]
        if existing == PLAYWRIGHT_SERVER_CONFIG:
            print("Configuration matches. No changes needed.")
            return False
        else:
            print("Existing configuration differs.")
            print(f"Current: {json.dumps(existing, indent=2)}")
            print(f"Proposed: {json.dumps(PLAYWRIGHT_SERVER_CONFIG, indent=2)}")
            # For now, we update it
    
    print("Adding/Updating Playwright Docker server config...")
    config["mcpServers"]["Playwright"] = PLAYWRIGHT_SERVER_CONFIG
    return True

def main():
    dry_run = "--dry-run" in sys.argv
    test_mode = "--test" in sys.argv
    
    if dry_run or test_mode:
        print("Running in DRY RUN mode. No changes will be written to disk.")

    config = load_config()
    if config is None:
        # Create default if not exists? For now, abort if not exists as per my discovery
        if test_mode: 
            config = {"mcpServers": {}} # Mock for test
        else:
            sys.exit(1)

    if not dry_run and not test_mode:
        backup_config()

    changed = add_playwright_server(config, dry_run=(dry_run or test_mode))
    
    if changed:
        if dry_run or test_mode:
             print("New Config state (Preview):")
             print(json.dumps(config, indent=2))
        else:
            save_config(config)
    else:
        print("No changes made.")

if __name__ == "__main__":
    main()
