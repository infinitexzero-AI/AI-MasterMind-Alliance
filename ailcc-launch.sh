#!/bin/bash
export AILCC_ROOT="/Users/infinite27/AILCC_PRIME"

# Header
printf "\n\033[1;36m========================================\033[0m\n"
printf "\033[1;36m   🚀  AILCC SYSTEM LAUNCHER v2.0  🚀   \033[0m\n"
printf "\033[1;36m========================================\033[0m\n\n"

# 1. Log Rotation
LOG_FILE="$AILCC_ROOT/06_System/Logs/system_heartbeat.log"
if [ -f "$LOG_FILE" ]; then
    cat "$LOG_FILE" >> "$AILCC_ROOT/06_System/Logs/system_heartbeat.old.log"
fi
echo "--- NEW SESSION $(date) ---" > "$LOG_FILE"

# 2. Sync Intelligence & Aggregate Logs
printf "🧠 Syncing Intelligence Vault...\n"
python3 "$AILCC_ROOT/scripts/sync_memory_pulse.py"
printf "📊 Aggregating System Logs...\n"
python3 "$AILCC_ROOT/scripts/log_aggregator.py"

# 3. Execute Orchestrator
printf "⚡ Executing Python Orchestrator...\n"
python3 "$AILCC_ROOT/06_System/Execution/ailcc_orchestrator.py"

# 3. Stream Logs
printf "\n\033[1;32m✅ Launch Sequence Initiated.\033[0m\n"
printf "📡 Streaming System Heartbeat (Ctrl+C to stop viewing logs, System will continue)...\n\n"
tail -f "$LOG_FILE"
