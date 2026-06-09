Phase 3: WebSocket Real-time + Agent Control Panel

Implemented:
- /api/forge/ws Next API route proxying Forge Monitor WS feed
- Frontend hook useForgeWS.ts for realtime telemetry
- AgentControlPanel component (pause/resume, send command)
- Integration tests for WS endpoint and hook
- Dashboard wired to show live telemetry + control panel
- Docs updated: dashboard/STATUS.md and forge-monitor/STATUS.md

Validation:
- Type-check: PASS
- Tests: PASS
- Lint: PASS (warnings only)

Please review UI behavior and merge into automation-mode.
