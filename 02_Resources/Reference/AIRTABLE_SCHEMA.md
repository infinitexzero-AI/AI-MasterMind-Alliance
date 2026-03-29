# AI Mastermind Alliance (AIMmA) - Logic Layer Schema

This document defines the schema for the "Brain" of the operation, ensuring Antigravity (VS Code/Gemini) and the External Managers (Airtable/n8n) speak the same language.

## 1. Airtable Base Schema

### Table: **Missions**

*High-level strategic arcs. Mirrors the "Phases" in your `NEXT_100_STEPS.md`.*

| Field Name | Type | Description |
| :--- | :--- | :--- |
| **Mission Name** | Single Line Text | e.g., "Phase 4: Scholar Convergence" |
| **Status** | Single Select | `Planning`, `Active`, `Blocked`, `Completed` |
| **Owner** | User/Collaborator | The human or primary lead. |
| **Goal** | Long Text | Summary of the objective. |
| **Progress** | Percent | Estimated completion. |
| **Linked Tasks** | Link to Record | Links to `Tasks` table. |

### Table: **Tasks**

*Atomic units of work. Mirrors `task.md` or granular items in your roadmap.*

| Field Name | Type | Description |
| :--- | :--- | :--- |
| **Task Name** | Single Line Text | e.g., "Refine Dashboard CSS" |
| **Agent** | Single Select | `Comet` (Browser), `Antigravity` (Code), `Grok` (Research), `Claude` (Docs) |
| **Status** | Single Select | `Backlog`, `Ready for Agent`, `In Progress`, `Review`, `Done` |
| **Priority** | Single Select | `🔥 Urgent`, `High`, `Normal`, `Low` |
| **Mission** | Link to Record | Links to `Missions` table. |
| **Payload/Context** | Long Text | Specific instructions or file paths for the agent. |
| **Artifact URL** | URL | Link to a PR, Google Doc, or file path. |

---

## 2. n8n Agent Router Logic

**Use Case**: When a task is moved to `Ready for Agent` in Airtable, n8n detects it and routes it to the correct AI system.

### Trigger

*   **Polling/Webhook**: Watch `Tasks` table for records where `Status` changes to `Ready for Agent`.

### Switch (Router)

Based on `Agent` field:

1. **Case: `Antigravity`**
   * **Action**: Send Webhook to local Listener (if active) OR create a `TODO.md` entry in the repo via GitHub API.
   * **Payload**: `{"task": "Name", "context": "Payload"}`.

2. **Case: `Comet`**
   * **Action**: Send email/notification to user with "Comet Prompt".
   * **Payload**: `Please execute this in Browser: [Context]`.

3. **Case: `Other` (Grok/Claude)**
   * **Action**: Log to specific research queue or document.

---

## 3. Deployment Steps

1.  Create the Airtable Base using the schema above.
2.  Set up n8n with an **Airtable Trigger**.
3.  Test the loop: Create a task "Test Antigravity Ping", set to `Ready for Agent`, and verify n8n catches it.
