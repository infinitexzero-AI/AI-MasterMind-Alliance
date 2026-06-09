# 🗃️ Agent Registry Protocol v1.0

This protocol defines the source of truth for all active AI entities within the **AI Mastermind Alliance**.

## 📍 Registry Location

- **Database**: `~/Antigravity/knowledge.db` (Table: `agent_registry`)
- **Metadata Cache**: `/Users/infinite27/AILCC_PRIME/context/agent_roster.json`

## 📊 Registry Schema

| Field | Description |
| :--- | :--- |
| `agent_id` | Unique slug (e.g., `comet_01`). |
| `capabilities`| List of what the agent can actually DO. |
| `platform` | Where the agent lives (MCP, Browser, Cloud). |
| `status` | `ACTIVE`, `READY`, `IDLE`, `SYNCING`. |
| `observability` | Boolean. If true, agent logs are streamed to Nexus. |

## 🔄 Interoperability Rules

1. **Context Sharing**: Any agent proposing a task must include the `context_ref` to relevant AILCC_PRIME files.
2. **State Persistence**: Before an agent switches tasks, it MUST write its current logic state to the `tasks` table in `knowledge.db`.
3. **Delegation**: Multi-agent tasks must specify a `lead_agent` for coordination.
