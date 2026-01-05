# WIRING_SPEC.md: Antigravity ↔ Comet Architecture

## Overview
This document defines how the "Inner Loop" (Antigravity/Local) communicates with the "Outer Loop" (Comet/Browser).

## 1. The Data Bridge: `TaskBoard.csv`
- **Role**: The Single Source of Truth for tasks.
- **Flow**:
    - **Comet** reads web data -> Generates CSV snippet -> User Pastes to Antigravity.
    - **Antigravity** reads `TaskBoard.csv` -> Executes Code -> Updates Status.

## 2. Integration Points

### A. Research Hand-off (Mode 1)
1. **Comet**: Runs `/comet-research-mode1`. Generates reading list markdown.
2. **User**: Copies markdown.
3. **Antigravity**: Pastes into `ailcc/modes/mode-1-student/research/`. Creates project folder via `/sprint`.

### B. Health Monitoring (Mode 2)
1. **Antigravity**: Runs `system_check.py` -> Writes `logs/valentine.log`.
2. **Comet**: (Future) Reads log via local server or user paste -> Runs `/comet-system-health`.

### C. Task Sync (Mode 5)
1. **Comet**: Runs `/comet-taskboard-update` based on email/Slack. Generates CSV rows.
2. **Antigravity**: Runs `/sync-tasks` to ingest and sort new rows.

## 3. Future Automation (n8n / Webhooks)
*Planned Phase 3*
- **Comet** trigger -> n8n Webhook -> Antigravity Agent (via MCP or Folder Watcher).
- **Goal**: Remove the copy-paste step.

## 4. Current Architecture Diagram
```ascii
[BROWSER LAYER]                 [LOCAL LAYER]
+------------------+            +---------------------+
| Comet Assistant  |            | Antigravity Agent   |
| (Research, Web)  |            | (Code, Filesystem)  |
+--------+---------+            +----------+----------+
         |                                 |
         | (Copy/Paste Bridge)             |
         v                                 v
+-----------------------------------------------------+
|                  TaskBoard.csv                      |
|           (The Shared State Interface)              |
+-----------------------------------------------------+
```
