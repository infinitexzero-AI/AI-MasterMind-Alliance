# Agent Handoff Protocol (v1.0)

**Purpose:** Standardize how AI agents (Comet, Antigravity, Claude, n8n) pass tasks and artifacts to each other within the Alliance.

---

## 1. The Core Concept: "Artifact-Driven Handoff"

Agents do not "chat" directly. They communicate by producing **Artifacts** and registering them in the **Central Log**.

* **Comet** plans -> produces `PlanArtifact`.
* **Antigravity** executes -> produces `CodeArtifact` or `ActionArtifact`.
* **n8n** monitors -> produces `AlertArtifact`.

## 2. The Universal Schema

Every handoff object must adhere to this JSON structure:

```json
{
  "schema_version": "1.0",
  "handoff_id": "uuid",
  "source_agent": "Comet",
  "target_agent": "Antigravity",
  "priority": "HIGH",
  "context": {
    "project": "PRIME",
    "task_id": "TASK-123"
  },
  "payload": {
    "instruction": "Execute the attached verification plan.",
    "resources": [
      "/path/to/plan.md",
      "/path/to/code.py"
    ]
  },
  "definition_of_done": "Exit code 0 from verification script."
}
```

## 3. The "Inbox" Architecture

Since agents run in different environments, we use a file-based layout monitored by the Dashboard API.

### Directory Structure

```text
~/AILCC_PRIME/AI-MasterMind-Alliance/
├── data/
│   ├── communication/
│   │   ├── inbox_antigravity/  <-- Antigravity watches this
│   │   ├── inbox_comet/        <-- Comet context provider watches this
│   │   └── inbox_human/        <-- Notifies User
│   └── artifact_log.jsonl      <-- Central History
```

## 4. Operational Workflows

### Scenario A: Comet plans, Antigravity executes

1. **Comet** generates a plan.
2. **Comet** saves plan to `.../plans/feat_xyz.md`.
3. **Comet** creates a JSON handoff file in `data/communication/inbox_antigravity/task_[uuid].json`.
4. **Dashboard API** (or Antigravity's startup script) detects new file.
5. **Antigravity** reads JSON, executes task, and moves JSON to `processed/`.

### Scenario B: Storage Red Alert (n8n to Human)

1. **n8n** detects Red State.
2. **n8n** POSTs to `http://localhost:8000/api/workflow/alert`.
3. **Dashboard API** creates `alert_[uuid].json` in `inbox_human` AND triggers system notification.

## 5. Implementation Steps

1. **Create Directories:** Ensure `data/communication/inbox_*` structure exists.
2. **Update API:** Add polling/POST endpoints for Handoffs.
3. **Agent Context:** Update `MASTER_DELEGATION_BRIEF.md` to instruct agents to look in their inbox.
