# Protocol: Conflict Resolution (v1.0)

**Effective Date:** December 29, 2025
**Scope:** `knowledge.db`, `web_tasks.json`, `sync_state.json`

## 🏁 Overview

In a multi-agent environment, race conditions can occur when two or more agents attempt to update the same record or file simultaneously. This protocol establishes the ground rules for resolution.

## ⚖️ Core Strategies

### 1. Last Write Wins (LWW) - Default

The agent with the most recent `updated_at` (SQLite) or `last_updated` (JSON) timestamp takes precedence.

- **Used for:** Task status updates, registry changes.

### 2. Array Merging (Additive)

If the modification is to an array (e.g., `dependencies`, `capabilities`, `tags`), the sync engine will merge the arrays and remove duplicates.

- **Used for:** Task dependencies, agent capabilities.

### 3. Manual Intervention Required

If a conflict occurs in a "Critical" task and the timestamps are within 1 second of each other, the sync engine will:

1. Mark the record as `CONFLICTED`.
2. Issue a `SYSTEM_ALERT` to the Nexus Dashboard.
3. Move the local JSON state to a `.conflict` backup file.

## 🛠️ Implementation Logic

```python
def resolve_conflicts(local_task, remote_task):
    if local_task['updated_at'] > remote_task['updated_at']:
        return "LOCAL_WINS"
    elif local_task['updated_at'] < remote_task['updated_at']:
        return "REMOTE_WINS"
    else:
        return "HANDOFF_TO_VALENTINE"
```

## 🛡️ Rules for Agents

- **Sync Before Writing:** Always perform a `sync_knowledge_db.py --pull` before modifying local files.
- **Atomic Commits:** When updating SQLite, use transactions to prevent partial writes.
- **Timestamp Integrity:** Never hardcode timestamps; always use `datetime.utcnow()` equivalent.
