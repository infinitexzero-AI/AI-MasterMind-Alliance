#!/bin/bash

# Configuration
ROOT_DIR="/Users/infinite27/AILCC_PRIME"
STATUS_FILE="$ROOT_DIR/status.json"
CHECK_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "[*] Starting Alliance Health Check..."

# 1. Directory Integrity
DIRS=("agents" "spellbooks" "protocols" "scripts" "logs" "tasks")
STATUS_DIRS="ok"
for dir in "${DIRS[@]}"; do
    if [ ! -d "$ROOT_DIR/$dir" ]; then
        echo " [!] Missing directory: $dir"
        STATUS_DIRS="degraded"
    fi
done

# 2. JSON Validation
STATUS_JSON="ok"
JSON_FILES=("agents/registry.json" "spellbooks/master_commands.json" "tasks/100_task_master_plan.json")
for file in "${JSON_FILES[@]}"; do
    if ! jq . "$ROOT_DIR/$file" > /dev/null 2>&1; then
        echo " [!] Invalid JSON: $file"
        STATUS_JSON="error"
    fi
done

# 3. Agent Pulse (Static check for now)
STATUS_AGENTS="active"

# 4. Storage Pressure
AVAILABLE_GB=$(df -g / | awk 'NR==2 {print $4}')
STORAGE_STATUS="ok"
if [ "$AVAILABLE_GB" -lt 2 ]; then
    STORAGE_STATUS="critical"
fi

# Write to status.json
cat <<EOF > "$STATUS_FILE"
{
  "last_check": "$CHECK_TIME",
  "system_integrity": "$STATUS_DIRS",
  "config_integrity": "$STATUS_JSON",
  "agent_service": "$STATUS_AGENTS",
  "storage_status": "$STORAGE_STATUS",
  "available_gb": $AVAILABLE_GB
}
EOF

echo "[!] Health Check Complete. Status written to status.json"
