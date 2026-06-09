# Inter-Agent Communication Protocol v1.1

**Effective Date:** December 29, 2025  
**Canonical Root:** /Users/infinite27/AILCC_PRIME

## Message Format

All agents must emit messages in this standardized format:

```json
{
  "message_id": "uuid-v4",
"from_agent": "source_agent_id",
"to_agent": "target_agent_id",
"timestamp": "2025-12-29T00:20:00Z",
"task_type": "single_agent|multi_agent",
"priority": "low|medium|high|critical",
"payload": {
"description": "Human-readable task description",
"file_paths": ["/Users/infinite27/AILCC_PRIME/path/to/file"],
"expected_output": "Description of what should be produced",
"dependencies": ["task_id_1", "task_id_2"]
},
"status": "pending|in_progress|completed|failed"
}

## Routing Rules (Valentine Decision Tree)

| Task Type | Target Agent | Reason |
| :--- | :--- | :--- |
| Code generation, schema design | Antigravity | Primary code architect |
| File read/write via MCP | Claude | Has filesystem access |
| Web research, scraping | Comet | Browser-based agent |
| Strategic planning, optimization | Grok | High-level reasoning |
| Academic research queries | Perplexity | Research specialist |
| General Q&A, brainstorming | ChatGPT | General-purpose |
| Summarization, synthesis | Gemini | Synthesis specialist |

## Fallback Logic

- If primary agent is offline, Valentine routes to next-best agent.
- If task requires MCP and Claude is offline, queue task in `web_tasks.json`.
- Critical tasks marked as "blocked" if no suitable agent available.

## Internal vs External Routing

1. **Internal Agents** (Antigravity, Claude, Valentine) communicate via `context/handoffs/`.
2. **External Agents** (Grok, Perplexity, ChatGPT, Gemini) receive prompts via their respective API/Interfaces, with results mirrored back to `AILCC_PRIME`.

## Compliance Requirements
- **State Persistence**: Agents MUST write session state to `knowledge.db` before termination.
- **Handoff Receipt**: Recipient agent must update `sync_state.json` within 30 seconds of file detection.
- **Error Propagation**: Failed tasks must bubble up to Valentine for re-routing or user escalation.
