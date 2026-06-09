# Comet Orchestration Spec – AILCC Orchestration & Evidence

## 📋 1. Context & Role

Comet serves as the **Planning & Intelligence Layer** of the AI Mastermind Alliance. While **Claude** and **Antigravity** handle direct execution via the filesystem and MCP, Comet scouts the web, synthesizes high-level strategy, and proposes actionable tasks.

- **Comet**: Proposes and Plans.
- **Claude + Antigravity**: Execute and Coordinate.
- **Valentine**: Routes and Arbitrates.

## 📁 2. Supported Projects
- **AILCC Orchestration & Evidence** (Primary)
- **INDG-MiKmaq-Fisheries-2024**
- **Crypto Scalp**

## 📄 3. Task Representation (`web_tasks.json`)

All tasks proposed by Comet must be written to `/Users/infinite27/AILCC_PRIME/web_tasks.json` using the following schema:

| Field | Type | Description |
| :--- | :--- | :--- |
| `task_id` | String | Unique slug for the task. |
| `project_id` | String | e.g., "AILCC-Orchestration-Evidence". |
| `task_type` | Enum | `single_agent`, `multi_agent`, `iphone_only`, `automated`, `sync`. |
| `source_agent` | String | Always "comet". |
| `target_agent` | String \| Array | Intended executor(s). |
| `description` | String | High-level summary of the work. |
| `priority` | Enum | `low`, `medium`, `high`, `critical`. |
| `status` | Enum | `pending`, `assigned`, `in_progress`, `completed`, `failed`, `cancelled`. |
| `created_at` | Timestamp | ISO8601 format. |
| `context_ref` | Array | Optional. File paths under `AILCC_PRIME`. |
| `notes` | String | Optional. Additional details. |

## 🚀 4. Example: Comet → Valentine (Multi-Agent)

```json
{
  "task_id": "evidence-extraction-001",
  "project_id": "AILCC-Orchestration-Evidence",
  "task_type": "multi_agent",
  "source_agent": "comet",
  "target_agent": ["claude", "antigravity"],
  "description": "Extract academic appeal evidence from MTA email archives and sync to knowledge.db.",
  "priority": "high",
  "status": "pending",
  "created_at": "2025-12-29T00:10:00Z",
  "context_ref": ["MASTER_PROJECT_MANIFEST.md"],
  "notes": "Comet will handle the search parameters; Claude to analyze; Antigravity to commit to SQL."
}
```
