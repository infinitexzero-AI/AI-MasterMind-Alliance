#!/bin/bash
# AILCC Mechanic: Kernel & Stability Monitor
# Scans for SIGTRAPs, Panics, and Resource Contentions

LOG_FILE="/Users/infinite27/AILCC_PRIME/06_System/Logs/mechanic_stability.log"
REPORT_FILE="/Users/infinite27/AILCC_PRIME/06_System/State/stability_report.json"

echo "--- Mechanic Stability Audit: $(date) ---" >> "$LOG_FILE"

# 1. Check for recent Crashes in DiagnosticReports
RECENT_CRASHES=$(find ~/Library/Logs/DiagnosticReports -mmin -60 -name "*.ips" | wc -l)
echo "Recent crashes (last 60m): $RECENT_CRASHES" >> "$LOG_FILE"

# 2. Check for SIGTRAP specifically
SIGTRAP_COUNT=$(grep -r "SIGTRAP" ~/Library/Logs/DiagnosticReports -mmin -1440 2>/dev/null | wc -l)
echo "SIGTRAP events (last 24h): $SIGTRAP_COUNT" >> "$LOG_FILE"

# 3. Resource Heavy Processes
TOP_CPU=$(ps -arcx -o %cpu,command | head -n 5)
echo "Top CPU Consumers:" >> "$LOG_FILE"
echo "$TOP_CPU" >> "$LOG_FILE"

# 4. Generate JSON Report for HUD
CAT="NOMINAL"
if [ "$RECENT_CRASHES" -gt 0 ]; then CAT="CRITICAL"; fi
if [ "$SIGTRAP_COUNT" -gt 5 ]; then CAT="WARNING"; fi

cat <<EOF > "$REPORT_FILE"
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "health_category": "$CAT",
  "recent_crashes": $RECENT_CRASHES,
  "sigtrap_events": $SIGTRAP_COUNT,
  "top_cpu": "$(echo "$TOP_CPU" | head -n 1 | awk '{print $1}')%",
  "uptime": "$(sysctl -n kern.boottime | awk -F'[ =,]' '{print $4}')"
}
EOF

echo "✅ Stability report generated at $REPORT_FILE" >> "$LOG_FILE"
