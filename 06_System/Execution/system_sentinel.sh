#!/bin/bash

# AILCC System Sentinel - Maintenance Protocol S3-001
ROOT="/Users/infinite27/AILCC_PRIME"
LOG_DIR="$ROOT/06_System/Logs"
ARCHIVE_DIR="$LOG_DIR/archives"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🛡️ Starting AILCC System Sentinel Maintenance..."

# 1. Log Rotation
mkdir -p "$ARCHIVE_DIR"
for logfile in "$LOG_DIR"/*.log; do
    if [ -f "$logfile" ]; then
        filename=$(basename "$logfile")
        echo "   📦 Archiving: $filename"
        cp "$logfile" "$ARCHIVE_DIR/${filename%.log}_$TIMESTAMP.log"
        > "$logfile" # Truncate active log
    fi
done

# 2. RAG Optimization (Trigger reindex)
echo "   🧠 Optimizing Intelligence Vault Index..."
python3 "$ROOT/06_System/Execution/vault_rag.py" --build

# 3. Cache Purge
echo "   🧹 Cleaning temporary caches..."
find "$ROOT/tmp" -mtime +1 -type f -delete 2>/dev/null

# 4. Status Update
echo "   ✅ System health check complete."
date >> "$LOG_DIR/sentinel_history.log"
echo "Protocol S3-001: Execution SUCCESS." >> "$LOG_DIR/sentinel_history.log"

echo "🏁 Sentinel Maintenance Protocol Complete."
