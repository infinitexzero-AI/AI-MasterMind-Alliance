# 📔 Playbook: Boot Stability v1 (The 2026 Optimization)

**Version**: 1.0  
**Status**: ACTIVE & VERIFIED  
**Arbiter**: Antigravity  
**Goal**: Resolve boot-time race conditions, silence defunct agent log spam, and stabilize MCP proxy connectivity for the AILCC system.

---

## 🛑 1. The Problems (Instability Sources)

### A. Chrome Launch Race Condition

- **Symptom**: Google Chrome (Incognito) would crash with `EXC_BREAKPOINT (SIGTRAP)` shortly after system boot.
- **Cause**: `launch_protocol.sh` used a fixed 12-second delay before firing Chrome. During system boot, the Next.js dashboard frequently took longer to initialize, causing Chrome to hit an unresponsive `http://localhost:3000` while the system was already under high resource load (WindowServer watchdog contention).

### B. Defunct LaunchAgent Log Spam

- **Symptom**: `watcher.error.log` in `~/Desktop/ai-command-handoff/` was growing rapidly, reaching megabytes of repetitive error messages.
- **Cause**: The `com.valentine.watcher` LaunchAgent was configured to run a missing `watcher.py` script. macOS `launchd` was attempting to restart the failing process every 10 seconds.

### C. Unreliable MCP Proxy (Port 3006)

- **Symptom**: User encountered "stream errors" when agents attempted to communicate via the MCP bridge.
- **Cause**: The `mcp-superassistant-proxy` either failed to start silently or the SSE (Server-Sent Events) connection timed out before the bridge was fully established.

---

## 🛠️ 2. The Patches (Solutions)

### [A] Robust Port Readiness Logic

Updated `launch_protocol.sh` to transition from "Blind Waiting" to "Intelligent Polling."

- **Implementation**: Added a `wait_for_port()` bash function.
- **Mechanism**: The script now polls `lsof -i :3000` for up to 60 seconds with 2-second intervals.
- **Result**: Chrome only launches when the port is confirmed active.
- **Safety Flags**: Added `--disable-gpu` and `--no-first-run` to minimize initial process footprint.

### [B] LaunchAgent Decommissioning

- **Action**: Unloaded the agent using `launchctl bootout`.
- **Permanent Fix**: Renamed the configuration file in `~/Library/LaunchAgents/` to `com.valentine.watcher.plist.disabled` to prevent any future auto-load.

### [C] Proxy Self-Verification

- **Implementation**: Modified `mcp_proxy.sh` to capture the PID of the launched proxy.
- **Logic**: Script now sleeps for 3 seconds post-launch and verifies `ps -p $PID` before reporting success in `mcp_proxy.log`.

---

## ✅ 3. Verification Protocol

1. **Dashboard Readiness**: Verify `launch_protocol.sh` output shows `✅ Dashboard detected.` before `open -a`.
2. **Log Heartbeat**: Confirm `watcher.error.log` has zero growth over a 60-second observation window.
3. **SSE Bridge Integrity**: Check `mcp_proxy.log` for the `✅ MCP Proxy is running on port 3006.` status message.
4. **Process Monitoring**: Use `pgrep -f mcp-superassistant-proxy` and `lsof -i :3006` to ensure the bridge is listening to requests.

---

## 🚀 4. Reuse Patterns for Future Development

> [!TIP]
> **Port Polling > Fixed Sleeps**: Always use a readiness loop for services that rely on other ports (e.g., Next.js, API servers).
>
> **Boot Latency Window**: Expect macOS system services (WindowServer) to be volatile for the first 60 seconds of uptime. Delay UI launches accordingly.
>
> **Agent Transparency**: Every background proxy script should have a self-check block that logs its own health status to a persistent log file.

---

### 🛡️ System Integrity Note

"System integrity is the bedrock of autonomous execution. The Alliance is now stable." — Antigravity
