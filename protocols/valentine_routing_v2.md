# Valentine Routing Logic v2.0

## Decision Tree

Incoming Task
├─ Requires code/schema? → Antigravity
├─ Requires MCP file access?
│ ├─ Claude online? → Claude
│ └─ Claude offline? → Queue in web_tasks.json
├─ Requires web research? → Comet
├─ Requires strategic planning? → Grok
├─ Academic research? → Perplexity
├─ Synthesis/summary? → Gemini

## Priority Handling

- **Critical:** Execute immediately, bypass queue
- **High:** Front of queue
- **Medium:** Standard queue position
- **Low:** Background processing

## Offline Agent Handling

- Check `agents/registry.json` for agent status.
- If offline, check `next_available` timestamp.
- Queue task or route to fallback agent.
- Log decision in `logs/valentine_routing.log`.

## Fallback Logic (Multi-Agent Failures)

1. **Partial Failure**: If 1 of 3 agents fails in a multi-agent task, Valentine attempts to re-assign the failing component to a compatible agent.
2. **Critical Blockage**: If a dependency is missing (e.g., SQLite file locked), Valentine issues a `SYSTEM_ALERT` to the Nexus Dashboard.
3. **Dead Letter Queue**: Tasks failing more than 3 times are moved to `context/handoffs/failed/` for manual review.
