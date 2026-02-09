import json
import os
import sys
from pathlib import Path

# Config paths
CLAUDE_CONFIG_PATH = Path.home() / "Library/Application Support/Claude/claude_desktop_config.json"
OUTPUT_CONFIG_PATH = Path("superassistant_config.json")

def load_claude_config():
    if not CLAUDE_CONFIG_PATH.exists():
        print(f"Error: Claude config not found at {CLAUDE_CONFIG_PATH}")
        sys.exit(1)
    
    try:
        with open(CLAUDE_CONFIG_PATH, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error decoding Claude config: {e}")
        sys.exit(1)

def generate_superassistant_config(claude_config):
    # The schema for mcp-superassistant-proxy is compatible with the mcpServers block
    # We essentially need to extract that block.
    
    if "mcpServers" not in claude_config:
        print("Warning: No 'mcpServers' found in Claude config.")
        return {"mcpServers": {}}

    # We can perform any necessary transformations here if the schemas diverge.
    # For now, we assume direct compatibility for the server definitions.
    super_config = {
        "mcpServers": claude_config["mcpServers"]
    }
    
    return super_config

def main():
    print(f"Reading Claude config from: {CLAUDE_CONFIG_PATH}")
    claude_config = load_claude_config()
    
    super_config = generate_superassistant_config(claude_config)
    
    try:
        with open(OUTPUT_CONFIG_PATH, 'w') as f:
            json.dump(super_config, f, indent=2)
        print(f"Successfully generated Superassistant config at: {OUTPUT_CONFIG_PATH.absolute()}")
        
        # summary of servers added
        servers = list(super_config["mcpServers"].keys())
        print(f"Bridged Servers: {', '.join(servers)}")
        
    except Exception as e:
        print(f"Error writing output config: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
