#!/bin/bash
set -euo pipefail

echo "🚀 Initializing Comet-Antigravity Sync Infrastructure..."

# Set paths
SYNC_ROOT="$HOME/AILCC_PRIME/07_Comet_Sync"
MANIFEST_DIR="$SYNC_ROOT/manifests"
LOG_DIR="$SYNC_ROOT/logs"

# Create sync manifest
cat > "$MANIFEST_DIR/sync_manifest.json" << 'MANIFEST'
{
  "sync_version": "1.0.0",
  "last_sync": null,
  "sync_frequency": "hourly",
  "sources": {
    "comet": {
      "type": "browser_agent",
      "session_store": "~/.comet/sessions",
      "export_format": "json",
      "sync_enabled": true
    },
    "antigravity": {
      "type": "ide_agent",
      "workspace_db": "~/.antigravity/workspace.db",
      "export_format": "sqlite",
      "sync_enabled": true
    }
  },
  "targets": {
    "github": {
      "repo": "AILCC_PRIME",
      "branch": "main",
      "path": "07_Comet_Sync/data"
    },
    "local": {
      "path": "$HOME/AILCC_PRIME/07_Comet_Sync/unified_history"
    }
  },
  "conflict_resolution": {
    "strategy": "timestamp_merge",
    "manual_review_threshold": 5
  },
  "mas_protocol": {
    "enabled": true,
    "sync_with": ["n8n", "claude_desktop", "grok_api"],
    "broadcast_port": 8765
  }
}
MANIFEST

# Initialize log
echo "{\"initialized_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"status\": \"READY\"}" > "$LOG_DIR/sync_init.log"

# Set permissions
chmod +x "$SYNC_ROOT/scripts/"*.sh

echo "✅ Sync infrastructure initialized at $SYNC_ROOT"
echo "📁 Manifest: $MANIFEST_DIR/sync_manifest.json"
echo "📊 Logs: $LOG_DIR/"
