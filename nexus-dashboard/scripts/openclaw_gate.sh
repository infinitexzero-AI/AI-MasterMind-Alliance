#!/bin/bash
# OpenClaw Gateway - Nexus Bridge
# Listens for system events and dispatches OpenClaw audits.

echo "🚀 OpenClaw Gateway ACTIVE"
echo "Root: $AILCC_ROOT"

# Ensure log directory exists
mkdir -p "$AILCC_ROOT/06_System/Logs"
LOG_FILE="$AILCC_ROOT/06_System/Logs/openclaw_gateway.log"

tail -f /dev/null # Keep process alive for PM2
