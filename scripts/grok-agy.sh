#!/bin/bash
# ==============================================================================
# grok-agy - Antigravity Terminal Grok Agent Wrapper
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_SCRIPT="$SCRIPT_DIR/grok_antigravity.py"

# Activate virtual environment if it exists, otherwise fall back to system python
if [ -d "$SCRIPT_DIR/../.venv" ]; then
    source "$SCRIPT_DIR/../.venv/bin/activate"
fi

# Execute the bridge script and pass all command-line arguments directly
python3 "$BRIDGE_SCRIPT" "$@"
