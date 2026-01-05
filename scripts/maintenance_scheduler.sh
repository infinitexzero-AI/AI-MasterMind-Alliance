#!/bin/bash
# Step 16: Automated Maintenance Scheduler
# Performs nightly DB optimization and log rotation.

ROOT="/Users/infinite27/AILCC_PRIME"
SCRIPTS="$ROOT/scripts"
LOGS="$ROOT/06_System/Logs"

echo "[$(date)] ⚙️ Starting Scheduled Maintenance..."

# 1. Vacuum Database
echo "[$(date)] 🧹 Optimizing Knowledge Base..."
python3 "$SCRIPTS/vacuum_db.py"

# 2. Archive Old Logs
echo "[$(date)] 📂 Archiving Logs..."
ARCHIVE_DIR="$LOGS/archive/$(date +%Y-%m)"
mkdir -p "$ARCHIVE_DIR"

# Move logs older than 7 days to archive
find "$LOGS" -maxdepth 1 -name "*.log" -mtime +7 -exec mv {} "$ARCHIVE_DIR/" \;

# 3. Security Audit
echo "[$(date)] 🛡️ Running Security Audit..."
python3 "$SCRIPTS/security_audit.py" >> "$LOGS/maintenance.log" 2>&1

# 4. Integrity Check
echo "[$(date)] 🔐 Verifying System Integrity..."
python3 "$SCRIPTS/system_integrity_check.py" >> "$LOGS/maintenance.log" 2>&1

echo "[$(date)] ✅ Maintenance Complete."
