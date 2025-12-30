# 🧠 Valentine Decision Logic: Routing Protocol v1.0

This specification defines how **Valentine** (the System Strategist) classifies incoming requests and orchestrates the Alliance.

## 🎯 The 5 Task Categories

Tasks are classified into one of these buckets:

| Category | Agent | Keywords | Description |
| :--- | :--- | :--- | :--- |
| **CODE** | Antigravity | `fix, implement, refactor, debug, python, script` | Deep technical implementation and IDE actions. |
| **LOGIC** | Claude | `analyze, summary, plan, reconcile, drafting` | Complex reasoning, document synthesis, and brainstorming. |
| **WEB** | Comet | `scrape, search, find, extract, pulse, check` | Real-time data retrieval and web-based research. |
| **JUDGMENT** | Valentine | `approve, prioritize, route, decide, budget` | High-level system strategy and resource allocation. |
| **SYNC** | System | `backup, mirror, archive, setup` | Maintenance and background infrastructure tasks. |

## 🛤️ Routing Algorithm (Pseudocode)

```python
def route_task(payload):
    content = payload['content']['description'].lower()
    
    if "web" in content or "scrape" in content:
        return "comet"
    elif "code" in content or "script" in content or "implement" in content:
        return "antigravity"
    elif "analyze" in content or "summary" in content:
        return "claude"
    else:
        return "valentine" # Fallback to Strategist
```

## 🛠️ Implementation Strategy

1. **Monitor**: Watch `06_System/AILCC/handoffs/inbox/`.
2. **Classify**: Apply the Routing Algorithm.
3. **Dispatch**:
    - Move JSON to `06_System/AILCC/handoffs/active/`.
    - Update `status.json` with the new assignment.
    - (Optional) Trigger n8n webhook.
