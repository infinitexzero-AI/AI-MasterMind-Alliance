# TASK-3B: Forge Monitor Integration & Dashboard Wiring

**Created:** 2025-11-27T04:40:00Z
**Phase:** Phase 2 - Integration & Testing
**Prerequisite:** TASK-3A ✅ Complete

## Overview

Phase 2 focuses on connecting the Forge Monitor backend to the dashboard frontend, enabling real-time telemetry visualization and agent status monitoring.

## Objectives

### 1. Dashboard Components Integration
- [ ] Wire `dashboard/components/AgentGrid.tsx` to `/api/agents/health` endpoint
- [ ] Wire `dashboard/components/StatusCard.tsx` to `/api/agents/status` endpoint
- [ ] Wire `dashboard/components/PipelineView.tsx` to `/api/pipeline/telemetry` endpoint
- [ ] Implement polling mechanism (5-second refresh interval)

### 2. API Route Enhancement
- [ ] Update `dashboard/pages/api/monitor/health.ts` to proxy Forge Monitor endpoints
- [ ] Add error handling and fallback responses
- [ ] Implement request deduplication (avoid duplicate calls within 5 seconds)

### 3. Real-Time Visualization
- [ ] Add color-coded status indicators (green=ok, yellow=warn, red=error)
- [ ] Display agent uptime, error counts, success counts
- [ ] Show task queue depth and pipeline latency
- [ ] Implement streaming updates via hooks

### 4. Testing & Validation
- [ ] Write Jest tests for AgentGrid component
- [ ] Write Jest tests for PipelineView component
- [ ] Verify endpoint responses match type definitions
- [ ] Load test: 10 concurrent API calls

## Deliverables

### Required Files

1. **dashboard/components/AgentGrid.tsx** (Enhanced)
   - Fetch from `/api/agents/health`
   - Display agent list with status badges
   - Show uptime and error metrics
   - Refresh every 5 seconds

2. **dashboard/components/PipelineView.tsx** (New)
   - Fetch from `/api/pipeline/telemetry`
   - Display task metrics (in-flight, completed, failed)
   - Show pipeline status and average latency
   - Visual task flow graph (optional)

3. **dashboard/pages/api/monitor/health.ts** (Enhanced)
   - Proxy to Forge Monitor `/api/agents/health`
   - Add caching (5-second TTL)
   - Error handling with fallback mock data

4. **dashboard/pages/api/monitor/telemetry.ts** (New)
   - Proxy to Forge Monitor `/api/pipeline/telemetry`
   - Add caching (5-second TTL)
   - Error handling with fallback mock data

5. **tests/dashboard-components.test.ts** (New)
   - Component render tests
   - API integration tests
   - Mock endpoint responses

### Updated Files

- `dashboard/STATUS.md` — Add integration progress, endpoint docs
- `dashboard/package.json` — Add any required dependencies

## Acceptance Criteria

- [x] All new components compile without TypeScript errors
- [x] API routes proxy Forge Monitor endpoints successfully
- [x] Dashboard displays live agent health and pipeline telemetry
- [x] Refresh mechanism polls endpoints every 5 seconds
- [x] All component tests passing (100% pass rate)
- [x] Type safety: strict mode compliance
- [x] Error handling: graceful degradation on endpoint failure

## Execution Notes

- **Forge Monitor Endpoint:** `http://localhost:3001` (development)
- **Dashboard API Route:** `http://localhost:3000/api/monitor/*` (development)
- **Refresh Interval:** 5 seconds (matches HeartbeatSimulator cadence)
- **Fallback Mode:** If Forge Monitor unavailable, use deterministic mock data
- **Dashboard Development:** Run `npm run dashboard:dev` in `/dashboard` directory

## Success Validation

```bash
# Terminal 1: Start Forge Monitor
cd /workspaces/ailcc-framework
npx ts-node forge-monitor/server.ts

# Terminal 2: Start Dashboard
cd /workspaces/ailcc-framework/dashboard
npm run dev

# Terminal 3: Verify endpoints
curl http://localhost:3001/api/agents/health
curl http://localhost:3000/api/monitor/health
```

Expected: Both endpoints return valid agent telemetry JSON with 3 agents (claude, openai, grok).

## Next Phase (TASK-3C)

- Extended monitoring: Historical data retention, aggregation
- Advanced visualization: Time-series graphs, heatmaps
- Production hardening: Database integration, persistence layer

---

*Part of CodexForge Protocol TASK-3 Series*
*AILCC Framework Automation*
