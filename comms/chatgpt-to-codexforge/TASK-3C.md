# TASK-3C — Forge Monitor Real-Time Telemetry (Phase 3)

## Objective
Add WebSocket-based live telemetry streaming to Forge Monitor + Dashboard.

## Requirements:

### 1. WebSocket server
File: forge-monitor/server.ts
- Add ws endpoint at /ws/telemetry
- Broadcast updates every 5 seconds
- Send initial snapshot on connection

### 2. Dashboard WebSocket hook
File: dashboard/components/hooks/useForgeStream.ts
- Connect to ws://localhost:4000/ws/telemetry
- Reconnect logic with exponential backoff
- Provide {data, connected, error}

### 3. UI updates
- AgentGrid: WS status indicator (green/yellow/red)
- PipelineView: live animated updates
- index.tsx: top-right LIVE indicator

### 4. Tests
- Add WebSocket mock tests in tests/dashboard/ws/

### 5. Docs
- Update forge-monitor/STATUS.md
- Update dashboard/STATUS.md

## Branch
feature/forge-monitor-live-telemetry

## PR Title
feat(forge): Add real-time telemetry (WebSockets) (TASK-3C)

CodexForge: Execute when ready.
