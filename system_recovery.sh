#!/bin/bash
# AILCC UNIFIED SYSTEM RECOVERY v1.0
# Designed for hardware-limited environments (damaged keys)
# Reclaims RAM, clears caches, and restarts all alliance services

BASE_DIR="/Users/infinite27/AILCC_PRIME"
LOG_FILE="$BASE_DIR/logs/system_recovery.log"

echo "🔱 AILCC SYSTEM RECOVERY INITIATED: $(date)" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

# 1. RAM Purge
echo "🧠 [1/4] Purging System RAM..." | tee -a "$LOG_FILE"
sudo purge 2>/dev/null && echo "   ✓ RAM purged" | tee -a "$LOG_FILE" || echo "   ⚠ sudo purge failed (requires manual entry if sudo not cached)" | tee -a "$LOG_FILE"

# 2. Disk Cleanup
echo "🧹 [2/4] Running Safe Cleanup..." | tee -a "$LOG_FILE"
bash "$BASE_DIR/scripts/safe_cleanup.sh" >> "$LOG_FILE" 2>&1
echo "   ✓ Caches cleared" | tee -a "$LOG_FILE"

# 3. Memory Optimization
echo "🧠 [3/4] Optimizing Memory..." | tee -a "$LOG_FILE"
bash "$BASE_DIR/scripts/memory_orchestrator.sh" >> "$LOG_FILE" 2>&1
echo "   ✓ Orchestrator run complete" | tee -a "$LOG_FILE"

# 4. Service Restart
echo "🚀 [4/4] Restarting Alliance Services..." | tee -a "$LOG_FILE"
bash "$BASE_DIR/ailcc-launch.sh" >> "$LOG_FILE" 2>&1
echo "   ✓ Launch sequence triggered" | tee -a "$LOG_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
echo "✅ RECOVERY COMPLETE. SERVICES REBOOTING." | tee -a "$LOG_FILE"
exit 0
