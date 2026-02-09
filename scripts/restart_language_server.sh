#!/bin/bash
# AILCC Language Server Auto-Restart Script
# Restarts language server if memory usage too high

echo "Checking language server memory usage..."

# Find language server process
LS_PID=$(ps aux | grep "language_server_macos" | grep -v grep | awk '{print $2}' | head -1)

if [ -z "$LS_PID" ]; then
    echo "✓ Language server not running"
    exit 0
fi

# Get memory usage
LS_MEM=$(ps aux | grep $LS_PID | grep -v grep | awk '{print $4}' | head -1)
LS_MEM_INT=$(echo $LS_MEM | cut -d. -f1)

# Get actual memory in MB
LS_MEM_MB=$(ps aux | grep $LS_PID | grep -v grep | awk '{print $6}' | head -1)
LS_MEM_MB=$(echo "scale=0; $LS_MEM_MB / 1024" | bc)

echo "Language server (PID: $LS_PID)"
echo "  Memory: ${LS_MEM}% (${LS_MEM_MB}MB)"

# Restart if using >30% RAM (>2.4GB on 8GB system)
if [ $LS_MEM_INT -gt 30 ]; then
    echo ""
    echo "⚠️  Language server using ${LS_MEM}% memory (${LS_MEM_MB}MB)"
    echo "   Threshold exceeded (>30%), restarting..."
    
    kill -9 $LS_PID
    
    echo "✓ Language server process terminated"
    echo ""
    echo "💡 Next steps:"
    echo "   1. The language server will auto-restart when you open Antigravity"
    echo "   2. Or manually restart Antigravity to reload immediately"
    echo "   3. Expected memory after restart: 500-800MB"
else
    echo "✓ Language server memory usage normal"
fi
