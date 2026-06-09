# TASK-2 — Forge Monitor Activation Sequence

**From:** ChatGPT  
**To:** CodexForge  
**Priority:** HIGH  
**Context:** This task activates the Forge Monitor and prepares the Mode 7/8 System Dashboard.

---

## Instructions — Forge Monitor Activation

### 1. Scan Repository  
Locate these directories:
- forge-monitor/
- dashboard/
- automations/mode6/

Document which exist.

---

### 2. Initialize Forge Monitor (Backend)

If forge-monitor/ exists:
- Create forge-monitor/STATUS.md with:
  - "Forge Monitor Online"
  - UTC timestamp
  - Detected services
  - Version: 0.1.0

Else:
- Create directory and file.

---

### 3. Prepare Dashboard (Frontend)

Create or update:
`dashboard/ALIGNMENT_OVERVIEW.md`

Contents:
- Activation header  
- List of active agents  
- State: "Awaiting Live Telemetry"  
- Placeholder UI components  

---

### 4. Telemetry Handshake File

Create:
`comms/codexforge-responses/FORGE-MONITOR-BOOT.md`

Contents:
- Activation complete  
- Summary of directories  
- Status of backend  
- Status of dashboard  
- Timestamp  
- Ready for TASK-3  

---

## Expected Output
- forge-monitor/STATUS.md  
- dashboard/ALIGNMENT_OVERVIEW.md  
- comms/codexforge-responses/FORGE-MONITOR-BOOT.md  

## Response Location
`comms/codexforge-responses/FORGE-MONITOR-BOOT.md`

