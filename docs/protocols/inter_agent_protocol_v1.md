# 📟 Inter-Agent Communication Protocol (IACP) v1.1

This document defines the standardized JSON schema for communication between agents (**Antigravity**, **Claude**, **Valentine**, **Comet**) within the AILCC framework.

## 📡 Canonical Workspace

- **Root**: `/Users/infinite27/AILCC_PRIME`
- **Handoffs**: `/Users/infinite27/AILCC_PRIME/context/handoffs/`
- **Protocols**: `/Users/infinite27/AILCC_PRIME/protocols/`
- **Scripts**: `/Users/infinite27/AILCC_PRIME/scripts/`
- **DB**: `/Users/infinite27/Antigravity/knowledge.db`

## 📩 Message Structure (v1.1)

All agent-to-agent communication via the filesystem must follow this format:

```json
{
  "message_id": "uuid-v4",
  "timestamp": "ISO-8601",
  "sender": "antigravity | claude | valentine | comet",
  "recipient": "antigravity | claude | valentine | comet | all",
  "type": "TASK_REQUEST | TASK_COMPLETE | TASK_FAILED | STATUS_UPDATE | HANDOFF",
  "content": {
    "task_id": "mission-slug-001",
    "description": "High-level summary of the work",
    "data_payload": {},
    "requirements": [],
    "priority": 1
  },
  "context": {
    "manifest_ref": "MASTER_PROJECT_MANIFEST.md",
    "db_sync": true
  },
  "metadata": {
    "version": "1.1",
    "agent_environment": "IDE | Desktop | Browser"
  }
}
```

## 🛤️ Task Lifecycle States

| State | Description |
| :--- | :--- |
| **PENDING** | Task created but not yet claimed by an agent. |
| **CLAIMED** | Agent has started work on the task. |
| **ACTIVE** | Work is currently in progress. |
| **BLOCKED** | Agent requires user input or another task to complete. |
| **COMPLETED** | Task finished and verified. |
| **FAILED** | Task stopped due to error; requires remediation. |

## 📂 Coordination Lanes

1. **Inbox**: `context/handoffs/inbox/` (New requests)
2. **Active**: `context/handoffs/active/` (Currently processing)
3. **Archive**: `context/handoffs/archive/` (Finished history)

## 🤖 Roles: Comet

Comet emits high-level tasks, not low-level commands.

- **Output Format**: JSON entries in `web_tasks.json` (See `comet_orchestration_spec.md`).
- **Access**: Comet never assumes direct file access; it proposes operations for Claude/Antigravity/n8n.

## 🗄️ Knowledge Base Sync

Agents should update `~/Antigravity/knowledge.db` after completing significant actions to ensure all agents share the same "Global Memory."
