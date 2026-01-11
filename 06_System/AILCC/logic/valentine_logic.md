# 🧠 Valentine Decision Logic: Routing Protocol v1.0

This specification defines how **Valentine** (the System Strategist) classifies incoming requests and orchestrates the Alliance.

## 🎯 The 5 Task Categories

Tasks are classified into one of these buckets:

| Category | Agent | Keywords | Description |
| :--- | :--- | :--- | :--- |
| **CODE** | Antigravity | `fix, implement, refactor, debug, python, script` | Deep technical implementation and IDE actions. |
| **LOGIC** | Claude | `analyze, summary, plan, reconcile, drafting` | Complex reasoning, document synthesis, and text-based drafting. |
| **MULTIMODAL** | Gemini | `pdf, image, ocr, extract, multimodal, analyze docs` | PDF analysis, visual processing, and documentation extraction. |
| **WEB** | Comet | `scrape, search, find, extract, pulse, check` | Real-time data retrieval and web-based research. |
| **JUDGMENT** | Valentine | `approve, prioritize, route, decide, budget` | High-level system strategy and resource allocation. |
| **SYNC** | System | `backup, mirror, archive, setup` | Maintenance and background infrastructure tasks. |

## 🕹️ Multi-Agent Delegation Flow (The "Handshake")

When a task requires high-level coordination, the following sequence applies:

1. **Strategist (Valentine)**: Initiates the need (e.g., "We need to appeal this grade").
2. **Orchestrator (Antigravity)**: Receives the intent and delegates:
   - To **Claude** for the core narrative and reasoning.
   - To **Gemini** if PDFs or evidence documentation are required.
3. **Execution**: The agent generates the draft and identifies optimal attachments.

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
