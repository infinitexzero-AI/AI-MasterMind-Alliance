# TASK-3C — Forge Monitor Real-time WS + Agent Control Panel (Phase 3)

## Goal
Add WebSocket realtime telemetry and an Agent Control Panel to the Dashboard.
WS stream will be proxied from forge-monitor to dashboard (Next.js API route).
Add UI control to start/stop agent tasks, and a simple "send command" to CodexForge/agent bus (simulated).

## Success criteria
- WS endpoint available at /api/forge/ws that upgrades to ws
- Dashboard connects via useForgeWS hook and displays live updates
- AgentControlPanel allows "Pause/Resume" (UI-only) and "Send Command" (simulated)
- Unit & integration tests validating WS and hook
- PR created, tests & type-check pass

