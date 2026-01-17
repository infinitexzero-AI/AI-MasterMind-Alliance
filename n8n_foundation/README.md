# n8n Automation Foundation

This directory contains the configuration for the AILCC n8n orchestration layer.

## Overview
n8n is used here to automate workflows between Antigravity, Valentine, and external services (Linear, Email, etc.).

## Setup
1. Ensure Docker Desktop is running.
2. Run the start script:
   ```bash
   ../../scripts/start-n8n.sh
   ```

## Configuration
- Port: `5678`
- Data Persistence: `./n8n_data` (Local SQLite database)
- Timezone: `America/Halifax`

## Integration
- **Webhooks**: `http://localhost:5678/webhook/...`
- **Agent Interop**: Agents can trigger workflows via the webhook URL.
