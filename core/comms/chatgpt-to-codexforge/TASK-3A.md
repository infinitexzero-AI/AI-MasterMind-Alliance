# TASK-3A — Forge Monitor Phase 1 Wiring

**From:** ChatGPT (Comet Orchestrator)  
**To:** CodexForge  
**Priority:** HIGH  
**Context:** Forge Monitor subsystem is initialized. Phase 1 wiring required.

---

## Objective

Implement the complete Forge Monitor backend wiring so the monitoring system becomes executable, testable, and returns deterministic telemetry.

---

## Required Output

Create and commit the following files:

### 1. Forge Monitor Server
Path: `forge-monitor/server.ts`  
- Create an Express (or Fastify) lightweight server  
- Implement endpoints:
  - GET /api/agents/health  
  - GET /api/agents/status  
  - GET /api/pipeline/telemetry  
- Use mock deterministic data (non-random)  
- Auto-start server when invoked directly

### 2. Type Definitions
Create:
- `forge-monitor/types/agents.ts`  
- `forge-monitor/types/pipeline.ts`  

Include:
- AgentHealth  
- AgentStatus  
- PipelineTelemetry  
- StatusLevel ("ok" | "warn" | "error")

### 3. Heartbeat Simulator
Path: `forge-monitor/sim/heartbeat.ts`  

Simulate:
- periodic agent updates (mock)  
- pipeline activity pulses  
- publish updates to server memory store

### 4. Update Status File
Modify: `forge-monitor/STATUS.md`  

Add:
- "Phase 1 Wiring Complete"  
- endpoint documentation  
- startup instructions  
- checksum section

---

## Commit Message

```
feat(forge-monitor): Add Forge Monitor server, endpoints, types, and heartbeat simulator (Phase 1)
```

---

## Expected Response

CodexForge must generate:
`comms/codexforge-responses/RESPONSE-3A.md`

Containing:
- Execution summary  
- File manifest  
- Startup logs  
- Confirmation of server run success

---

## Acknowledgment

CodexForge acknowledges readiness for TASK-3B afterwards.

