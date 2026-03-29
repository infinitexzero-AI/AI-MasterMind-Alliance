#!/bin/bash
export AILCC_ROOT="/Users/infinite27/AILCC_PRIME"

# Header
printf "\n\033[1;36m========================================\033[0m\n"
printf "\033[1;36m   🚀  AILCC SYSTEM LAUNCHER v2.0  🚀   \033[0m\n"
printf "\033[1;36m========================================\033[0m\n\n"

# 1. Lock Check to prevent "fork bomb" scenarios
LOCK_FILE="/tmp/ailcc_launch.lock"
if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE")
    if ps -p $PID > /dev/null; then
        echo "⚠️ AILCC System Launcher is already running (PID: $PID). Exiting."
        exit 1
    fi
fi
echo $$ > "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

# 2. Log Rotation
LOG_FILE="$AILCC_ROOT/06_System/Logs/system_heartbeat.log"
if [ -f "$LOG_FILE" ]; then
    cat "$LOG_FILE" >> "$AILCC_ROOT/06_System/Logs/system_heartbeat.old.log"
fi
echo "--- NEW SESSION $(date) ---" > "$LOG_FILE"

# 3. Sync Intelligence & Aggregate Logs
printf "🧠 Syncing Intelligence Vault...\n"
python3 "$AILCC_ROOT/scripts/sync_memory_pulse.py"
printf "📊 Aggregating System Logs...\n"
python3 "$AILCC_ROOT/scripts/log_aggregator.py"

# 4. Execute Orchestrator
printf "⚡ Executing Python Orchestrator...\n"
python3 "$AILCC_ROOT/06_System/Execution/ailcc_orchestrator.py"

# 5. Finished
printf "\n\033[1;32m✅ Launch Sequence Initiated.\033[0m\n"
printf "📡 Logs: $LOG_FILE\n\n"
