#!/bin/bash
# Sovereign OS Launch Check & Connectivity Audit
# Verifies all core services and external drive accessibility.

echo "=== SOVEREIGN OS LAUNCH CHECK ==="
echo "Timestamp: $(date)"
echo ""

# 1. VOLUME CHECK
echo "💾 Checking Volumes..."
if [ -d "/Volumes/XDriveBeta" ]; then
    echo "✅ XDriveBeta: CONNECTED"
else
    echo "❌ XDriveBeta: DISCONNECTED"
fi

if [ -d "/Volumes/XDriveAlpha" ]; then
    echo "✅ XDriveAlpha (LaCie): CONNECTED"
else
    echo "❌ XDriveAlpha: DISCONNECTED"
fi

# 2. PM2 STATUS
echo ""
echo "🔄 Checking PM2 Services..."
pm2 jlist | jq -r '.[] | "[\(.name)] \(.pm2_env.status)"' || echo "❌ PM2 not available or no processes."

# 3. PORT CHECK
echo ""
echo "🌐 Checking Network Ports..."
for port in 3001 3007 5005; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo "✅ Port $port: ACTIVE"
    else
        echo "❌ Port $port: INACTIVE"
    fi
done

# 4. DASHBOARD CONNECTIVITY
echo ""
echo "📡 Testing Neural Relay API..."
if curl -s http://localhost:3001/api/system/health | grep -q "ONLINE"; then
    echo "✅ Neural Relay: RESPONDING"
else
    echo "❌ Neural Relay: NO RESPONSE"
fi

echo ""
echo "=== AUDIT COMPLETE ==="
