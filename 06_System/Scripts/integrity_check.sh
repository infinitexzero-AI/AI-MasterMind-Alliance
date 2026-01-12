#!/bin/bash
echo "🔍 AILCC System Integrity Check"
echo "================================"

# 1. Latency Check
echo -n "Sync Latency: "
if [ -f ~/AILCC_PRIME/06_System/State/latency_report.json ]; then
    grep "total_sync_latency_ms" ~/AILCC_PRIME/06_System/State/latency_report.json | awk -F': ' '{print $2}' | sed 's/,//' | xargs echo -n && echo "ms"
else
    echo "UNKNOWN (File missing)"
fi

# 2. Migration Status
echo -n "XDriveAlpha Migration: "
if [ -f ~/AILCC_PRIME/06_System/Logs/migration_complete.json ]; then
    echo "✅ COMPLETE"
else
    # Check if rsync is running
    if ps aux | grep -v grep | grep rsync > /dev/null; then
        echo "⏳ IN PROGRESS (Rsync Active)"
    else
        echo "❓ NOT RUNNING (Check Logs)"
    fi
fi

# 3. Academic Documents
echo -n "Academic Appeal Doc: "
if [ -f ~/AILCC_PRIME/04_Intelligence_Vault/FINAL_Academic_Appeal_Document.md ]; then
    echo "✅ PRESENT"
else
    echo "❌ MISSING"
fi

# 4. Sync Infrastructure
echo -n "Comet-Antigravity Sync: "
if [ -f ~/AILCC_PRIME/07_Comet_Sync/manifests/sync_manifest.json ]; then
    echo "✅ INITIALIZED"
else
    echo "❌ NOT INITIALIZED"
fi

# 5. Git Status
echo -n "Git Repository Status: "
cd ~/AILCC_PRIME && git status --short | wc -l | xargs echo -n && echo " pending changes"
