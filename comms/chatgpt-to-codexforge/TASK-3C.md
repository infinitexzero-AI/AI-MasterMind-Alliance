# TASK-3C — Forge Monitor: WebSocket Control Panel + Live Telemetry

## Goal
Add a real-time WebSocket pipeline so the dashboard receives:
- agent health updates
- pipeline status changes
- heartbeat signals
- manual control actions

## Components to Implement
### forge-monitor/ws/server.js
- WebSocket server (ws library)
- Broadcast every 2s: simulated heartbeat + agent states
- Handle control commands:
  - RESTART_AGENT
  - PAUSE_PIPELINE
  - RESUME_PIPELINE

### Next.js API → WS upgrade
dashboard/pages/api/forge/ws/index.ts
- Accept WebSocket upgrade
- Proxy to forge-monitor ws

### React Hook
dashboard/components/hooks/useForgeStream.ts
- Connect to ws://localhost:3001
- Provide:
  - data
  - connected
  - lastPing
  - sendCommand()

### Control Panel UI
dashboard/components/ControlPanel.tsx
- Buttons: Restart, Pause, Resume
- Live connection indicator

## Tests
- ws server simulation
- hook reconnection logic
- control command send

