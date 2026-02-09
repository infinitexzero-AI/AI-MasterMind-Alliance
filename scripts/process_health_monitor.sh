#!/bin/bash
# Process Health Monitor
# Tracks and manages unhealthy processes

echo "🔍 Process Health Monitor - $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get total RAM for percentage calculations
TOTAL_RAM_MB=8192  # 8GB system

# 1. Monitor Language Server
echo "[1/4] Language Server Health:"
LS_PID=$(ps aux | grep language_server_macos | grep -v grep | awk '{print $2}' | head -1)

if [ -n "$LS_PID" ]; then
    LS_MEM_PERCENT=$(ps aux | grep language_server_macos | grep -v grep | awk '{print $4}' | head -1)
    LS_MEM_MB=$(echo "scale=0; ($LS_MEM_PERCENT * $TOTAL_RAM_MB) / 100" | bc)
    
    echo "  PID: $LS_PID"
    echo "  Memory: ${LS_MEM_MB}MB (${LS_MEM_PERCENT}%)"
    
    LS_MEM_INT=$(echo $LS_MEM_PERCENT | cut -d. -f1)
    if [ $LS_MEM_INT -gt 30 ]; then
        echo "  ⚠️  Memory usage high - restarting..."
        bash ~/AILCC_PRIME/scripts/restart_language_server.sh
        echo "  ✓ Restart initiated"
        
        # Log restart
        mkdir -p ~/AILCC_PRIME/logs
        echo "$(date +%Y-%m-%d\ %H:%M:%S),language_server,${LS_MEM_PERCENT}%,restarted" >> ~/AILCC_PRIME/logs/process_health.log
    else
        echo "  ✅ Healthy"
    fi
else
    echo "  ⚠️  Not running"
fi

echo ""

# 2. Monitor Docker
echo "[2/4] Docker Health:"
DOCKER_RUNNING=$(ps aux | grep -i docker | grep -v grep | wc -l | tr -d ' ')

if [ $DOCKER_RUNNING -gt 0 ]; then
    # Check Docker.raw size
    if [ -f ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw ]; then
        DOCKER_RAW_GB=$(du -sk ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw 2>/dev/null | awk '{print int($1/1024/1024)}')
        
        if [ -n "$DOCKER_RAW_GB" ]; then
            echo "  Docker.raw: ${DOCKER_RAW_GB}GB"
            
            if [ $DOCKER_RAW_GB -gt 50 ]; then
                echo "  🚨 CRITICAL - Reset Docker VM recommended"
                osascript -e 'display notification "Docker.raw is '"${DOCKER_RAW_GB}"'GB - reset VM" with title "🚨 AILCC Docker Critical"' 2>/dev/null
                echo "$(date +%Y-%m-%d\ %H:%M:%S),docker,${DOCKER_RAW_GB}GB,critical" >> ~/AILCC_PRIME/logs/process_health.log
            elif [ $DOCKER_RAW_GB -gt 20 ]; then
                echo "  ⚠️  Large - cleanup recommended"
                osascript -e 'display notification "Docker.raw is '"${DOCKER_RAW_GB}"'GB - run cleanup" with title "⚠️ AILCC Docker Warning"' 2>/dev/null
                echo "$(date +%Y-%m-%d\ %H:%M:%S),docker,${DOCKER_RAW_GB}GB,warning" >> ~/AILCC_PRIME/logs/process_health.log
            else
                echo "  ✅ Healthy"
            fi
        fi
    fi
    
    # Check Docker VM memory
    DOCKER_VM_MEM=$(ps aux | grep "com.apple.Virtualization.VirtualMachine" | grep -v grep | awk '{print $4}' | head -1)
    if [ -n "$DOCKER_VM_MEM" ]; then
        DOCKER_VM_MB=$(echo "scale=0; ($DOCKER_VM_MEM * $TOTAL_RAM_MB) / 100" | bc)
        echo "  VM Memory: ${DOCKER_VM_MB}MB (${DOCKER_VM_MEM}%)"
    fi
else
    echo "  ⚠️  Not running"
fi

echo ""

# 3. Monitor Chrome
echo "[3/4] Chrome Health:"
CHROME_COUNT=$(ps aux | grep -i chrome | grep -v grep | wc -l | tr -d ' ')

if [ $CHROME_COUNT -gt 0 ]; then
    CHROME_TOTAL_MEM=$(ps aux | grep -i chrome | grep -v grep | awk '{sum+=$4} END {print sum}')
    CHROME_TOTAL_MB=$(echo "scale=0; ($CHROME_TOTAL_MEM * $TOTAL_RAM_MB) / 100" | bc)
    
    echo "  Processes: $CHROME_COUNT"
    echo "  Total Memory: ${CHROME_TOTAL_MB}MB (${CHROME_TOTAL_MEM}%)"
    
    if [ $CHROME_COUNT -gt 30 ]; then
        echo "  ⚠️  High process count - close unused tabs"
        osascript -e 'display notification "Chrome has '"${CHROME_COUNT}"' processes - close tabs" with title "⚠️ AILCC Chrome Warning"' 2>/dev/null
        echo "$(date +%Y-%m-%d\ %H:%M:%S),chrome,${CHROME_COUNT} processes,warning" >> ~/AILCC_PRIME/logs/process_health.log
    else
        echo "  ✅ Healthy"
    fi
else
    echo "  ⚠️  Not running"
fi

echo ""

# 4. Monitor Antigravity Helpers
echo "[4/4] Antigravity Health:"
ANTIGRAVITY_COUNT=$(ps aux | grep "Antigravity Helper" | grep -v grep | wc -l | tr -d ' ')

if [ $ANTIGRAVITY_COUNT -gt 0 ]; then
    ANTIGRAVITY_TOTAL_MEM=$(ps aux | grep "Antigravity Helper" | grep -v grep | awk '{sum+=$4} END {print sum}')
    ANTIGRAVITY_TOTAL_MB=$(echo "scale=0; ($ANTIGRAVITY_TOTAL_MEM * $TOTAL_RAM_MB) / 100" | bc)
    
    echo "  Helper Processes: $ANTIGRAVITY_COUNT"
    echo "  Total Memory: ${ANTIGRAVITY_TOTAL_MB}MB (${ANTIGRAVITY_TOTAL_MEM}%)"
    
    if [ $ANTIGRAVITY_COUNT -gt 10 ]; then
        echo "  ⚠️  High helper count - may indicate memory leak"
        osascript -e 'display notification "'"${ANTIGRAVITY_COUNT}"' Antigravity Helpers running" with title "⚠️ AILCC Antigravity Warning"' 2>/dev/null
    else
        echo "  ✅ Healthy"
    fi
else
    echo "  ⚠️  Not running"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Process Health Monitor complete - $(date)"
echo ""
