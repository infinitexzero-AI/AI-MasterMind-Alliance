#!/bin/bash

# AILCC War Room Ignite — Strategic Suite
# ⚔️ War Room | 🗺️ Mapping | 🔬 Observability

echo "🛡️ Igniting AILCC War Room Strategic Suite..."

# 1. Open Strategic Views in Chrome
open -a "Google Chrome" "http://localhost:3000/war-room"
open -a "Google Chrome" "http://localhost:3000/mapping"
open -a "Google Chrome" "http://localhost:3000/observability"

# 2. Perception Alignment for Swarm
echo "📡 Synchronizing View Context with Neural Relay..."
curl -X POST http://localhost:5005/api/antigravity/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "SYNC_WAR_ROOM", "payload": {"status": "ACTIVE", "monitors": 3}}'

echo "✅ War Room Suite Online."
