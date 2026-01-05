# TASK-3B — Forge Monitor → Dashboard Wiring (Phase 2)

**Task ID:** TASK-3B  
**Created:** November 26, 2024  
**Executor:** CodexForge/Claude (in Codespace)  
**Coordinator:** ChatGPT/Comet  
**Reviewer:** infinitexzero-AI

---

## Summary (one line)

Wire the Forge Monitor backend to the Agent Alignment Dashboard UI so the dashboard shows live (mock) telemetry and agent health, and open a PR with the changes.

---

## Roles (color-coded)

🔵 **Executor** (CodexForge/Claude) — implement code changes, run tests, open PR  
🟣 **Coordinator** (Comet / ChatGPT) — verify PR, run validations, summarize results  
🟢 **Reviewer** (infinitexzero-AI) — review and approve/merge

---

## Branch / PR metadata

- **Branch:** `feature/forge-monitor-dashboard-integration`
- **PR title:** `feat(forge): Wire Forge Monitor backend to Dashboard (TASK-3B)`
- **PR base:** `automation-mode`
- **Labels:** `feature`, `dashboard`, `forge-monitor`
- **Reviewer:** `@infinitexzero-AI`

---

## What to implement (file-level)

### 1. API proxy routes (Next.js API) — `dashboard/pages/api/forge/*`

Create proxy endpoints that forward requests to forge-monitor:

- **GET** `/api/forge/health` → proxy to forge-monitor `/health`
- **GET** `/api/forge/agents/health` → proxy to `/api/agents/health`
- **GET** `/api/forge/agents/status` → proxy to `/api/agents/status`
- **GET** `/api/forge/pipeline/telemetry` → proxy to `/api/pipeline/telemetry`

**Implementation notes:**
- Use `http-proxy-middleware` or fetch-based proxy
- Handle errors gracefully (503 if forge-monitor unreachable)
- Pass through status codes
- Add CORS headers if needed

### 2. Frontend data hooks & components

**Create:**
- `dashboard/components/hooks/useForgeHealth.ts` - React hook for polling forge health

**Wire existing components:**
- `AgentGrid.tsx` → consume `/api/forge/agents/health`
- `PipelineView.tsx` → consume `/api/forge/pipeline/telemetry`
- `pages/index.tsx` → show top-level status, timestamp, heartbeat

**Hook specification (useForgeHealth.ts):**
```typescript
export function useForgeHealth(pollInterval = 5000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch /api/forge/health
    // Poll every pollInterval ms
    // Update state
  }, [pollInterval]);
  
  return { data, loading, error };
}
```

### 3. UI polish

**Status color mapping:**
- `ok` = green (bg-green-100, text-green-800)
- `warn` = amber (bg-amber-100, text-amber-800)
- `down` = red (bg-red-100, text-red-800)

**Add small status summary card:**
- System status badge
- Last heartbeat timestamp
- Agent count (active / total)
- Quick actions (refresh, settings)

### 4. Tests

**Create:**
- `tests/dashboard/hooks/useForgeHealth.test.ts`
  - Test polling behavior
  - Test error handling
  - Test loading states

- `tests/dashboard/api/proxy.test.ts`
  - Test proxy forwarding
  - Test error responses (forge-monitor down)
  - Use deterministic mock from HeartbeatSimulator

**Test requirements:**
- Use Jest + React Testing Library
- Mock fetch/axios calls
- Achieve >80% coverage on new code

### 5. Documentation

**Update:**
- `dashboard/STATUS.md` - Add proxy architecture section
- `forge-monitor/STATUS.md` - Mention dashboard integration

**Documentation should include:**
- How to start forge-monitor for dashboard development
- API endpoints and their purposes
- Troubleshooting proxy issues
- Environment variables (if any)

---

## Implementation steps

```bash
# Step 1: Create feature branch
git checkout -b feature/forge-monitor-dashboard-integration

# Step 2: Implement API proxy routes
# Create dashboard/pages/api/forge/health.ts
# Create dashboard/pages/api/forge/agents/health.ts
# Create dashboard/pages/api/forge/agents/status.ts
# Create dashboard/pages/api/forge/pipeline/telemetry.ts

# Step 3: Implement hooks and UI updates
# Create dashboard/components/hooks/useForgeHealth.ts
# Update dashboard/components/AgentGrid.tsx
# Update dashboard/components/PipelineView.tsx
# Update dashboard/pages/index.tsx

# Step 4: Add tests
# Create tests/dashboard/hooks/useForgeHealth.test.ts
# Create tests/dashboard/api/proxy.test.ts

# Step 5: Update documentation
# Update dashboard/STATUS.md
# Update forge-monitor/STATUS.md

# Step 6: Quality checks
npm run -s type-check
npm test
npm run -s lint

# Step 7: Commit and push
git add .
git commit -m "feat(forge): Wire Forge Monitor backend to dashboard UI (TASK-3B)"
git push --set-upstream origin feature/forge-monitor-dashboard-integration

# Step 8: Create PR
gh pr create \
  --title "feat(forge): Wire Forge Monitor backend to Dashboard (TASK-3B)" \
  --body-file ./comms/chatgpt-to-codexforge/TASK-3B-prbody.md \
  --base automation-mode \
  --head feature/forge-monitor-dashboard-integration \
  --label feature,dashboard,forge-monitor \
  --reviewer infinitexzero-AI
```

---

## Success criteria

- ✅ API proxy returns identical JSON to forge-monitor
- ✅ Dashboard health UI updates via polling
- ✅ All tests pass (Jest)
- ✅ TypeScript passes (no errors)
- ✅ Lint passes (warnings allowed)
- ✅ PR opens successfully with proper metadata
- ✅ Documentation updated

---

## Expected outputs

**Code files:**
- `dashboard/pages/api/forge/health.ts`
- `dashboard/pages/api/forge/agents/health.ts`
- `dashboard/pages/api/forge/agents/status.ts`
- `dashboard/pages/api/forge/pipeline/telemetry.ts`
- `dashboard/components/hooks/useForgeHealth.ts`
- Updated: `dashboard/components/AgentGrid.tsx`
- Updated: `dashboard/components/PipelineView.tsx`
- Updated: `dashboard/pages/index.tsx`

**Test files:**
- `tests/dashboard/hooks/useForgeHealth.test.ts`
- `tests/dashboard/api/proxy.test.ts`

**Documentation:**
- Updated: `dashboard/STATUS.md`
- Updated: `forge-monitor/STATUS.md`

**Git artifacts:**
- Branch: `feature/forge-monitor-dashboard-integration`
- Commit with all changes
- PR to `automation-mode`

**Response document:**
- `comms/codexforge-responses/RESPONSE-3B.md`

---

## PR Body Template

**File:** `comms/chatgpt-to-codexforge/TASK-3B-prbody.md`

```markdown
## TASK-3B: Forge Monitor → Dashboard Integration (Phase 2)

### Summary
Wires the Forge Monitor backend API to the Agent Alignment Dashboard UI, enabling real-time telemetry display and agent health monitoring.

### Changes
- ✅ Created API proxy routes (`/api/forge/*`)
- ✅ Implemented `useForgeHealth` React hook
- ✅ Wired `AgentGrid` and `PipelineView` components
- ✅ Added status summary card to dashboard home
- ✅ Implemented comprehensive tests
- ✅ Updated documentation

### API Endpoints Added
- `GET /api/forge/health` - System health check
- `GET /api/forge/agents/health` - Individual agent health
- `GET /api/forge/agents/status` - Agent operational status
- `GET /api/forge/pipeline/telemetry` - Pipeline metrics

### Testing
```bash
npm test                # All tests passing
npm run type-check      # TypeScript clean
npm run lint            # Linting passed
```

### Screenshots
[TODO: Add screenshot of dashboard with live telemetry]

### Reviewers
@infinitexzero-AI - Please review the proxy architecture and UI integration

### Related
- Depends on: forge-monitor service running
- Part of: Agent Alignment Dashboard implementation
- Closes: #[issue-number-if-applicable]
```

---

## Response Document Template

**File:** `comms/codexforge-responses/RESPONSE-3B.md`

```markdown
# RESPONSE-3B: Forge Monitor Dashboard Integration Complete

**Task:** TASK-3B  
**Executor:** CodexForge/Claude  
**Completed:** [timestamp]  
**Status:** ✅ SUCCESS

## Execution Summary

### Commits Created
- `feat(forge): Wire Forge Monitor backend to dashboard UI (TASK-3B)`
- SHA: [commit-hash]

### Files Changed
**Created (9 files):**
- dashboard/pages/api/forge/health.ts
- dashboard/pages/api/forge/agents/health.ts
- dashboard/pages/api/forge/agents/status.ts
- dashboard/pages/api/forge/pipeline/telemetry.ts
- dashboard/components/hooks/useForgeHealth.ts
- tests/dashboard/hooks/useForgeHealth.test.ts
- tests/dashboard/api/proxy.test.ts
- comms/chatgpt-to-codexforge/TASK-3B-prbody.md
- comms/codexforge-responses/RESPONSE-3B.md

**Modified (4 files):**
- dashboard/components/AgentGrid.tsx
- dashboard/components/PipelineView.tsx
- dashboard/pages/index.tsx
- dashboard/STATUS.md
- forge-monitor/STATUS.md

### Test Results
```
PASS tests/dashboard/hooks/useForgeHealth.test.ts
PASS tests/dashboard/api/proxy.test.ts

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
Coverage:    87.4% (above threshold)
```

### Quality Checks
```
✅ TypeScript: No errors
✅ Tests: All passing (12/12)
✅ Lint: Passed (2 warnings - acceptable)
✅ Build: Success
```

### Pull Request
- **PR #:** [number]
- **URL:** [github-pr-url]
- **Status:** Open, awaiting review
- **Reviewer:** @infinitexzero-AI
- **Labels:** feature, dashboard, forge-monitor

## Technical Details

### API Proxy Architecture
Implemented Next.js API routes that proxy requests to forge-monitor service:
- Handles CORS and error states
- Graceful degradation if forge-monitor unavailable
- Pass-through authentication (future-ready)

### Frontend Integration
- React hook provides automatic polling (5s interval)
- Components update reactively via state
- Loading and error states handled gracefully

### Test Coverage
- Unit tests for hooks (polling, error handling)
- API proxy tests (forwarding, error cases)
- Deterministic mocks for CI stability

## Next Steps

### Immediate
1. Review PR and merge to `automation-mode`
2. Deploy to staging for integration testing
3. Test with live forge-monitor service

### Follow-up Tasks
- **TASK-3C:** Add WebSocket support for real-time updates
- **TASK-3D:** Implement agent control panel (start/stop/restart)
- **TASK-3E:** Add alerting and notification system

## Issues Encountered
None - implementation completed smoothly.

## Blockers
None currently.

---

**Coordinator Note:** Ready for human review and merge.
```

---

## Execution Checklist for Claude

When executing this task, follow this checklist:

- [ ] Read complete TASK-3B specification
- [ ] Create feature branch
- [ ] Scaffold directory structure
- [ ] Implement all API proxy routes (4 files)
- [ ] Implement useForgeHealth hook
- [ ] Update AgentGrid component
- [ ] Update PipelineView component
- [ ] Update index.tsx dashboard home
- [ ] Create hook tests
- [ ] Create API proxy tests
- [ ] Update dashboard/STATUS.md
- [ ] Update forge-monitor/STATUS.md
- [ ] Create PR body file
- [ ] Run type-check (must pass)
- [ ] Run tests (must pass)
- [ ] Run lint (warnings OK)
- [ ] Commit changes
- [ ] Push branch
- [ ] Create PR
- [ ] Create RESPONSE-3B.md
- [ ] Report completion

---

**END OF TASK-3B SPECIFICATION**
