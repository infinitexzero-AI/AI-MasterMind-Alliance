# ANTIGRAVITY_WORKFLOWS_SPEC.md

## 1. /sprint (Mode 1 Academic)
- **Description**: Scaffold a Mode 1 academic project.
- **Trigger**: `/sprint`
- **Steps**:
    1. Create project folder in `ailcc/modes/mode-1-student/{assignment_name}`.
    2. Create `project_overview.md`.
    3. Add entry to `TaskBoard.csv`.

## 2. /valentine-check (Mode 2 System)
- **Description**: System health check.
- **Trigger**: `/valentine-check`
- **Steps**:
    1. Run `python3 core/scripts/system_check.py`.
    2. Check `logs/valentine.log`.
    3. Summarize status.

## 3. /habit-intel (Mode 3 Life)
- **Description**: Analyze habit logs.
- **Trigger**: `/habit-intel`
- **Steps**:
    1. Read Mode 3 Logs.
    2. Analyze trends (Sleep, Focus, etc.).

## 4. /automation-spec (Mode 5 Wiring)
- **Description**: Draft wiring specs for integrations.
- **Trigger**: `/automation-spec`
- **Steps**:
    1. Scan `mode-5-automation`.
    2. Draft `WIRING_SPEC.md` for new integrations.

## 5. /sync-tasks (TaskBoard)
- **Description**: Sync and summarize TaskBoard.
- **Trigger**: `/sync-tasks`
- **Steps**:
    1. Read `core/TaskBoard.csv`.
    2. Generate summary of high-priority items.
