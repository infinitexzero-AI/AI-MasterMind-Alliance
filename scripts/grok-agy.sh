#!/bin/bash
# ==============================================================================
# grok-agy - Antigravity Terminal Grok Agent Wrapper
# ==============================================================================

set -e

# Resolve symlinks robustly to find the true script directory
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
SCRIPT_DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
BRIDGE_SCRIPT="$SCRIPT_DIR/grok_antigravity.py"

# Activate virtual environment if it exists, otherwise fall back to system python
if [ -d "$SCRIPT_DIR/../.venv" ]; then
    source "$SCRIPT_DIR/../.venv/bin/activate"
fi

# Execute the bridge script and pass all command-line arguments directly
python3 "$BRIDGE_SCRIPT" "$@"
