# User Abilities Guide: Running Your AI Mastermind

**Status**: Phase 2 Ready
**Architecture**: Dual-System (Antigravity + Comet)

## 1. How to Run Antigravity Abilities (Inner Loop)
*Location: VS Code Primary Sidebar / Terminal*

### A. The "Valentine Check" (System Health)
**Goal**: Verify CPU/Disk/RAM status.
**Action**:
1.  Open the **Antigravity** task window (where you talk to me).
2.  Type: `"Run /valentine-check workflow"`
3.  **OR** Run manually in terminal:
    ```bash
    python3 core/scripts/system_check.py
    ```
**Output**: A log entry in `logs/valentine.log` and a status report.

### B. The "Sprint" (New Project)
**Goal**: Scaffold a new Mode 1 academic project.
**Action**:
1.  Type: `"Run /sprint workflow for [Project Name]"`
2.  I will create the folder in `ailcc/modes/mode-1-student/` and set up the `TaskBoard` entry.

### C. The "Sync" (Task Ingestion)
**Goal**: Ingest tasks from Comet/Email.
**Action**:
1.  Type: `"Run /sync-tasks"`
2.  I will read `TaskBoard.csv` and summarize priorities.

---

## 2. How to Run Comet Abilities (Outer Loop)
*Location: Perplexity / Browser Sidebar*

**Prerequisite**: You must create the shortcuts using [COMET_SHORTCUTS_LIBRARY.md](file:///Users/infinite27/AILCC_PRIME/doc_archive/COMET_SHORTCUTS_LIBRARY.md).

### A. The "Overview" (Context Loading)
**Goal**: Get a quick summary of the system on any page.
**Action**: Type `/ailcc-overview`.

### B. The "Researcher" (Mode 1)
**Goal**: Turn a topic into a reading list.
**Action**: Type `/comet-research-mode1`, then paste your topic.
**Handoff**: Copy the result -> Paste into Antigravity or a Markdown file.

### C. The "Task Updater" (Mode 2)
**Goal**: Turn an email/Slack thread into a CSV task.
**Action**: Type `/comet-taskboard-update`.
**Handoff**: Copy the CSV block -> Append to `core/TaskBoard.csv` (or ask Antigravity to "add this to taskboard").

---

## 3. The "Success Equation" Routine
**Daily Driver Workflow**:

1.  **Morning**: Run `/comet-mode2-professional-brief` (Browser) to see what's up.
2.  **Work**: Use Antigravity for deep coding/writing.
3.  **Check-in**: Run `/valentine-check` (Terminal) to ensure stability.
4.  **End of Day**: Run `/comet-habit-tracker` (Browser) for wellness log.

---

## 🔗 Quick Links
- **Shortcuts Source**: [COMET_SHORTCUTS_LIBRARY.md](file:///Users/infinite27/AILCC_PRIME/doc_archive/COMET_SHORTCUTS_LIBRARY.md)
- **Wiring Spec**: [WIRING_SPEC.md](file:///Users/infinite27/AILCC_PRIME/doc_archive/WIRING_SPEC.md)
- **Manual**: [AGENT_MANUAL.md](file:///Users/infinite27/AILCC_PRIME/doc_archive/AGENT-MANUAL.ANTIGRAVITY.md)
