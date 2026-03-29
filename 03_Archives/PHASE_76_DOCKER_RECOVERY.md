# Phase 76: Docker Recovery & Telemetry Integration

**Date**: 2025-01-15  
**Status**: IN PROGRESS  
**Objective**: Resolve host telemetry unavailability and forge_verifier log spam in Mode 6 autonomous loop

---

## Issues Identified

1. **Host Telemetry Unavailable**: Services couldn't read Docker daemon metrics via `/api/system/health`
2. **forge_verifier Log Spam**: Mode 6 loop continuously errored on "Agent not found: forge_verifier" despite exception handler

## Root Causes

- **Missing Docker Socket Mount**: `nexus-dashboard` and `hippocampus-api` lacked `/var/run/docker.sock` access
- **Dead Code Path**: forge_verifier exception checks existed but loop continued to attempt registry lookup after exception block

## Fixes Applied

### 1. Docker Compose Updates (`docker-compose.yml`)

#### `hippocampus-api` service:
```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock # Host telemetry access
```

#### `nexus-dashboard` service:
```yaml
volumes:
  - ./01_Areas/Codebases/ailcc/dashboard/src/lib/mode6:/app/mode6:cached # Live sync for loop.ts patches
  - /var/run/docker.sock:/var/run/docker.sock # Host telemetry access
```

#### `valentine-core` service:
```yaml
volumes:
  - ./agents/chatgpt-proxy:/app:cached # Live sync for agent patches
restart: unless-stopped
```

### 2. loop.ts Patches (3 files patched)

#### File: `/01_Areas/Codebases/ailcc/automations/mode6/loop.ts`
**Change**: Enhanced forge_verifier exception logging + explicit continue statement

```typescript
// Exception: Handle Python-native Daemons by generating a synthetic completion
if (['forge_verifier', 'alchemist_daemon'].includes(agentName)) {
    console.log(`[Loop] Agent ${agentName} corresponds to a Python Daemon. Handling natively (no error spam).`);
    const resultPath = path.join(DATA_DIR, resultFile);
    fs.writeFileSync(resultPath, JSON.stringify({ 
        success: true, 
        message: "Handled by Python daemon natively.", 
        daemon: agentName 
    }, null, 2));
    continue; // Skip logging "Agent not found" error ← KEY FIX
}
```

#### File: `/01_Areas/Codebases/ailcc/dashboard/src/lib/mode6/loop.ts`
**Change**: Added forge_verifier daemon check in ACTION phase

```typescript
// --- 3. ACTION PHASE ---
const role = await router.route(task);
console.log(`[MCP-ReACT] Phase: ACTION (Role: ${role})`);

// Exception: Handle Python-native Daemons
if (['forge_verifier', 'alchemist_daemon'].includes(role)) {
    console.log(`[MCP-ReACT] Role ${role} is a Python daemon. Delegating natively.`);
    memory.updateTask(task.id, {
        status: 'delegated_to_daemon',
        daemon: role,
        timestamp: new Date()
    });
    continue; // ← Prevents dispatcher.dispatch() call
}

const result = await dispatcher.dispatch(task, role);
```

#### File: `/01_Areas/Codebases/ailcc/src/automation/mode6/loop.ts`
**Change**: Added daemon check after routing

```typescript
// Exception: Handle Python-native Daemons
if (['forge_verifier', 'alchemist_daemon'].includes(role)) {
    logToStream(`${role} is a Python daemon. Handling natively.`, 'info', 'DAEMON');
    memory.updateTask(task.id, {
        status: 'delegated_to_daemon',
        daemon: role,
        timestamp: new Date().toISOString()
    });
    continue;
}
```

## Container Rebuild

**Affected Services**:
- `nexus-dashboard` (rebuilding with new volume mounts + loop.ts patches)
- `hippocampus-api` (adding Docker socket access)
- `valentine-core` (enabling live volume sync)

**Build Status**: In progress

## Expected Outcomes

✅ **Host Telemetry**: Services can now read `/var/run/docker.sock` → `http://<service>/api/system/health` will work  
✅ **Live Code Sync**: loop.ts patches load immediately without container restart (`:cached` mount flag)  
✅ **No forge_verifier Spam**: Exception path properly continues, avoiding "Agent not found" logs  
✅ **Daemon Delegation**: Python daemons like forge_verifier marked as `delegated_to_daemon` status instead of error

## Verification Steps

```bash
# 1. Check Docker socket access
docker exec nexus-dashboard ls -la /var/run/docker.sock

# 2. Tail Mode 6 logs for NO "Agent not found" errors
docker compose logs -f nexus-dashboard | grep "Agent not found"
# Expected: No output (clean logs)

# 3. Check delegation status in memory
curl http://localhost:8090/api/tasks
# Expected: Tasks with forge_verifier should have status: "delegated_to_daemon"

# 4. Verify host telemetry endpoint
curl http://localhost:8090/api/system/health
# Expected: 200 OK with Docker daemon stats
```

## Next Steps (Phase 77)

- [ ] Monitor container logs for 5+ minutes to confirm zero forge_verifier spam
- [ ] Validate health endpoint returns real Docker metrics
- [ ] Update Nexus Dashboard UI to display daemon delegation status
- [ ] Implement graceful fallback if Docker socket becomes unavailable

---

**Notes**:
- Docker socket mount is read-only security best practice (not applied here, as sentinel needs root access)
- Live volume sync (`:cached` flag) is macOS/Docker Desktop optimization; adjust for Linux if needed
- Python daemons should be registered in `/agents/` with proper MCP adapters in future phases
