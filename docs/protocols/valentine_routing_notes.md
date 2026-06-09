# Valentine Routing Notes

## 🤖 1. Multi-Agent Task Routing

Comet is authorized to propose tasks with `task_type: "multi_agent"` when the objective requires coordination across the alliance.

- These tasks are written into `web_tasks.json` under `/Users/infinite27/AILCC_PRIME`.
- **Valentine's Role**:
  - Read new entries in `web_tasks.json`.
  - Confirm or refine the `task_type`.
  - Assign a **primary_agent** (lead) and **secondary_agents** (support).
  - Update `sync_state.json` to reflect the current routing status of these multi-agent workflows.

## 🔄 2. Sync & State Management

Valentine ensures that all agents are notified of status changes by updating the shared `knowledge.db` and the legacy `sync_state.json` file.
