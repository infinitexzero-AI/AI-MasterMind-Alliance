# SOP: External Agent Delegation (Mode 5)

**Version:** 1.0  
**Effective Date:** 2025-12-15  
**Owner:** Antigravity (Orchestrator)

## 1. Objective
To automate the offloading of tasks (research, analysis, creative generation) to specialized external agents (Claude, ChatGPT, Gemini) via the AILCC Orchestration Engine, ensuring seamless synchronization of outputs.

## 2. Scope
Applies to all Mode 5 (Automation) activities and ad-hoc requests from Mode 1 (Student) and Mode 4 (Self-Actualized).

## 3. Protocol

### 3.1. Initiation
- **Voice/Chat Command**: User issues intent (e.g., "Research X").
- **Uplink Format**:
  ```json
  {
    "action": "SPIN_UP_AGENT",
    "parameters": {
      "agent": "claude|gemini|chatgpt",
      "task": "Description...",
      "sync_back": "true"
    }
  }
  ```

### 3.2. Execution (Antigravity Bridge)
1.  **Route**: Orchestrator interprets `SPIN_UP_AGENT`.
2.  **Dispatch**: Logic Gateway calls external API (OpenAI/Anthropic/Google).
3.  **Monitor**: System tracks task status (PENDING -> IN_PROGRESS).

### 3.3. Synchronization (Memory Stream)
- **Log**: All inputs/outputs mapped to `shared_memory_stream.jsonl`.
- **Artifact**: Structured MD files created for complex outputs research.
- **Notification**: User notified only if "Human Flag" is raised or task completes.

### 3.4. Recurring Automation
- Use `SET_RECURRING_DELEGATION` for periodic tasks.
- **Input**: Task name, frequency, target agent.
- **Output**: Auto-scheduled events in the daily logic loop.

## 4. Guardrails
- **Budget**: Daily API cost limits enforced by `OrchestrationEngine`.
- **Privacy**: PII redaction (simulated) before external dispatch.
- **Verification**: Human review required for high-impact artifacts.
