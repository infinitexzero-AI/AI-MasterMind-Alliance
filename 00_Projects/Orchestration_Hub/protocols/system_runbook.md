# Antigravity Storage Runbook (v1.2)

Quick-reference guide for managing Alliance storage health under Protocol v1.2.

**Protocol Location:** `~/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/storage_protocol.json`

---

## 🔴 Scenario 1: "I'm in RED State" (<10% Free or <15GB)

**Action:** Immediate Offload Required.

### Steps

1.  **Analyze**:

    ```bash
    cd ~/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols
    ./protocol_inspector.py --action snapshot
    ```

2.  **Identify Candidates**:
    - Look for `large_static` folders in `~/Projects` or `~/Desktop`.
    - Common culprits: `media_raw/`, `old_browser_profiles/`, `vm_images/`, large `.zip` archives.

3.  **Execute Offload**:

    ```bash
    mv ~/Projects/SomeOldProject /Volumes/LaCie/ARCHIVE/PROJECTS_2025/
    ```

    OR for large media:

    ```bash
    mv ~/Desktop/media_raw /Volumes/LaCie/ARCHIVE/MEDIA/
    ```

4. **Verify Recovery**:

    ```bash
    ./protocol_inspector.py --action check_health
    ```

    Should now return exit 0 (GREEN) or 1 (YELLOW)

5. **Update Audit (optional)**:

    ```bash
    ./protocol_inspector.py --action update_audit --agent "manual_offload"
    ```

---

## 🟢 Scenario 2: "I Want to Start a New Project"

**Action:** Check Storage Gate First.

### Scenario 2 Steps

1. **Gate Check**:

    ```bash
    cd ~/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols
    ./protocol_inspector.py --action check_health
    echo $? # Check exit code
    ```

2. **Interpret Result**:
    - **Exit 0 (GREEN)**: Safe. Proceed with `npx create-next-app`, `git clone`, etc.
    - **Exit 1 (YELLOW)**: Proceed with caution. Plan cleanup within 24–48h.
    - **Exit 2 (RED)**: **STOP**. Go to Scenario 1 first.

3. **If GREEN/YELLOW, proceed normally**:

    ```bash
    cd ~/AILCC_PRIME
    npx create-next-app my-new-project
    ```

---

## 🧹 Scenario 3: "Scheduled / Routine Cleanup"

**Action:** Prune Rebuildables from Archive.

### Scenario 3 Steps

1. **Launch Antigravity Workflow**:
    - Open Antigravity.
    - Run workflow: **"Run System Cleanup"** (two-phase).

2. **Phase 1 – Analysis**:
    - Workflow runs `snapshot`.
    - Review status and candidate list.

3. **Phase 2 – Execution (requires approval)**:
    - If safe (GREEN/YELLOW) or you approve override:
      - Workflow runs `system_cleanup.sh`.
      - Deletes `node_modules`, `.venv`, `.cache`, `logs` from `ARCHIVED_LOCAL` (>7 days).
    - Audit log is auto-updated.

4. **Verify**:

    ```bash
    ./protocol_inspector.py --action snapshot
    ```

**Manual Alternative (if not using Antigravity):**

```bash
cd ~/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols
./system_cleanup.sh
./protocol_inspector.py --action update_audit --agent "manual_cleanup"
```

---

## 📱 Scenario 4: "Valentine Signal Failure / Mobile Glitch"

**Action**: Resolve "Failed to send request" or "Request canceled" errors on Grok Mobile/iOS.

### Steps

1. **Local App Fix**:
    - Force-quit the app (Swipe up).
    - Clear app cache/storage if possible.
    - Verify app permissions (Network, Bluetooth/Local Discovery).

2. **Network Reset**:
    - Toggle WiFi off and back on.
    - Switch to LTE/5G briefly to force re-handshake.
    - Re-toggle WiFi and wait for "Handshake Packet" sync.

3. **Software Audit**:
    - Check for Grok/xAI app updates in the App Store.
    - Ensure iOS System is up-to-date.

4. **Relay Verification**:
    - Check Neural Relay status on Dashboard (`http://localhost:3000`).
    - Verify Port 3001 is listening: `lsof -i :3001`.
    - Retry the query/command in the app.

---

## 🤖 Automation Notes

- **n8n Storage Guardian**: Runs every 6 hours. Sends alerts on YELLOW/RED and creates Linear issue if RED.
- **Antigravity Workspace Rules**:
- `storage_safety.md`: Enforces read-only/forbidden zones.
- `project_start_gate.md`: Blocks new projects if RED.
- **Protocol Inspector**: Central tool for health checks, pattern matching, and audit logging.

---

## 🛠️ Troubleshooting

### "Inspector says RED but I just freed space"

- Disk usage can lag on macOS due to caching or Spotlight indexing.
- Wait 1–2 minutes, then re-run `check_health`.

### "Antigravity workflow stuck or won't execute Phase 2"

- Manually check health:

    ```bash
    ./protocol_inspector.py --action check_health
    ```

- If exit code is `2` (RED) and you want to override:
    - Type "Override RED – execute cleanup anyway" in Antigravity chat.
    - Or run `system_cleanup.sh` manually.

### "n8n Guardian didn't alert on RED"

- Check n8n execution logs for SSH/command failures.
- Verify cron schedule is active.
- Test manually:

    ```bash
    ./protocol_inspector.py --action check_health
    ./protocol_inspector.py --action snapshot
    ```

### "I accidentally deleted something critical"

- **Critical files** (journals, TEK_data, Alliance_configs) should have cloud backups per protocol.
- Check:
- iCloud: `~/Library/Mobile Documents/`
- Google Drive: Web interface or local sync folder.
- GitHub: For any `.git` repos.

### "LaCie not mounted – can't offload"

- Reconnect LaCie drive and verify mount:

    ```bash
    ls /Volumes/LaCie
    ```

- If not mounted, check Disk Utility or reconnect USB.

---

## 📋 Quick Command Reference

| Task | Command |
| :--- | :--- |
| Check health | `./protocol_inspector.py --action check_health` |
| View snapshot | `./protocol_inspector.py --action snapshot` |
| Get class patterns | `./protocol_inspector.py --action get_patterns --class-name rebuildable` |
| Run cleanup | `./system_cleanup.sh` |
| Update audit log | `./protocol_inspector.py --action update_audit --agent <name>` |
| Check disk usage | `df -h /` |

---

## 🔗 Related Documents

- **Protocol Spec**: `storage_protocol.json` (v1.2)
- **Inspector Code**: `protocol_inspector.py`
- **Cleanup Script**: `system_cleanup.sh`
- **Antigravity Workflows**: `.agent/workflows/run_cleanup.md`
- **Workspace Rules**: `.agent_rules/storage_safety.md`, `project_start_gate.md`

---

**Last Updated:** 2025-12-13
**Protocol Version:** v1.2.0
