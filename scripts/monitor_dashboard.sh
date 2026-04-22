#!/bin/bash
# Continuous Monitoring Script for AILCC Dashboard and System Health
# Monitors dashboard status, API endpoints, and system health
# Logs issues and sends alerts when problems are detected

set -euo pipefail

LOG_DIR="/Volumes/XDriveBeta/AILCC_PRIME/06_System/Logs"
MONITOR_LOG="$LOG_DIR/dashboard_monitor.log"
DASHBOARD_URL="http://localhost:3007"
API_BASE="$DASHBOARD_URL/api"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Function to log with timestamp
log_message() {
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1" | tee -a "$MONITOR_LOG"
}

# Function to check if dashboard is running
check_dashboard() {
    if curl -s -o /dev/null -w "%{http_code}" "$DASHBOARD_URL" | grep -q "200\|301\|302"; then
        return 0
    else
        return 1
    fi
}

# Function to check API endpoint
check_api_endpoint() {
    local endpoint=$1
    local url="$API_BASE/$endpoint"
    
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -1)
    
    if [ "$http_code" = "200" ]; then
        return 0
    else
        log_message "⚠️  API endpoint /$endpoint returned HTTP $http_code"
        return 1
    fi
}

# Function to check system health
check_system_health() {
    # Check memory
    free_ram=$(vm_stat | awk '/Pages free/ {print $3}' | sed 's/\.//')
    free_mb=$((free_ram * 4096 / 1024 / 1024))
    
    if [ "$free_mb" -lt 100 ]; then
        log_message "🚨 CRITICAL: Free RAM is ${free_mb}MB (< 100MB)"
        return 1
    elif [ "$free_mb" -lt 200 ]; then
        log_message "⚠️  WARNING: Free RAM is ${free_mb}MB (< 200MB)"
    fi
    
    # Check SSD usage
    ssd_percent=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$ssd_percent" -gt 85 ]; then
        log_message "🚨 CRITICAL: SSD usage is ${ssd_percent}% (> 85%)"
        return 1
    elif [ "$ssd_percent" -gt 75 ]; then
        log_message "⚠️  WARNING: SSD usage is ${ssd_percent}% (> 75%)"
    fi
    
    return 0
}

# Function to check automation health
check_automation() {
    local issues=0
    
    # Check if orchestrator logs are being updated
    if [ -f "$LOG_DIR/memory_orchestrator.log" ]; then
        last_run=$(stat -f "%Sm" -t "%s" "$LOG_DIR/memory_orchestrator.log")
        now=$(date +%s)
        age=$((now - last_run))
        
        # Should run every 30 minutes (1800 seconds)
        if [ "$age" -gt 2700 ]; then  # 45 minutes tolerance
            log_message "⚠️  Memory orchestrator hasn't run in $((age / 60)) minutes"
            issues=$((issues + 1))
        fi
    fi
    
    return $issues
}

# Main monitoring loop
log_message "🚀 Starting AILCC Dashboard Monitor"

# Check dashboard
if check_dashboard; then
    log_message "✅ Dashboard is running at $DASHBOARD_URL"
else
    log_message "🚨 Dashboard is NOT running at $DASHBOARD_URL"
    log_message "💡 Start with: cd /Volumes/XDriveBeta/AILCC_PRIME/nexus-dashboard && npm run dev"
    exit 1
fi

# Check API endpoints
log_message "🔍 Checking API endpoints..."
api_status=0

if check_api_endpoint "storage/tiers"; then
    log_message "✅ /api/storage/tiers is healthy"
else
    api_status=1
fi

if check_api_endpoint "system/health"; then
    log_message "✅ /api/system/health is healthy"
else
    api_status=1
fi

if check_api_endpoint "storage/activity"; then
    log_message "✅ /api/storage/activity is healthy"
else
    api_status=1
fi

# Check system health
log_message "🏥 Checking system health..."
if check_system_health; then
    log_message "✅ System health is good"
fi

# Check automation
log_message "⚙️  Checking automation status..."
if check_automation; then
    log_message "✅ Automation is running normally"
fi

# PROACTIVE UPGRADES (OpenClaw Engagement)
if [[ $(bc <<< "$free_mb > 300") -eq 1 ]]; then
    log_message "🚀 System Health OPTIMAL. Dispatching OpenClaw Upgrade Engine for autonomous refinements."
    bash /Volumes/XDriveBeta/AILCC_PRIME/scripts/openclaw_upgrade_engine.sh &
else
    log_message "ℹ️  System resources constrained (${free_mb}MB). Skipping proactive upgrades."
fi

# Summary
log_message "📊 Monitor check complete"
if [ $api_status -eq 0 ]; then
    log_message "✅ All systems operational"
    exit 0
else
    log_message "⚠️  Some issues detected - check logs above"
    exit 1
fi
