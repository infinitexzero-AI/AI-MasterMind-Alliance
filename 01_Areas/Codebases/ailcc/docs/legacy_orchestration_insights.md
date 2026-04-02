# Legacy Agentic Orchestration Insights

> Consolidated from Archives/Staging Areas on 2025-12-10

## Source: Analysis Pending

> (Content will be appended here as relevant files are discovered and processed)

## 1. Comet Assist Manifest (Key Protocol Definitions)

> Source: 03_Archives/Staging_Areas/DEC_10th_REVISE/Nexus_HMI/COMET_ASSIST_MANIFEST.md

### Webhook Schema (Comet <-> Mode 6)

```typescript

interface CometWebhookPayload {
  event: 'task-pending' | 'task-complete' | 'task-failed' | 'escalation';
  taskId: string;
  sourceAgent: string;
  timestamp: string;
  metadata: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedCost?: number;
    tokensUsed?: number;
    executionTime: number;
  };
  payload: Record<string, any>;
}

interface CometResponse {
  decision: 'approve' | 'reject' | 'retry' | 'escalate';
  reasoning: string;
  nextAgent?: string;
}
```

### Event Routing

* **Approvals**: Go to Memory Store.
* **Retries**: Go back to Dispatcher.
* **Rejections**: Route to Secondary Agent.
* **Escalations**: Go to Human Review.

### Rate Limits (Safety Policy)

* **Claude**: 60 req/min, 5M tokens/day.
* **OpenAI**: 90 req/min, 3M tokens/day.
* **Grok**: 40 req/min, 2M tokens/day.
* **Comet**: 1000 req/min (research only).

## 2. AILCC Architecture Overview

> Source: 03_Archives/Staging_Areas/DEC_10th_REVISE/Nexus_HMI/ARCHITECTURE.md

**Core Modules:**

1. **Intent Router**: Classifies complexity, maps tasks.
2. **Agent Dispatcher**: Selects adapters, handles errors.
3. **Memory Manager**: Persists context, dependency graphs.
4. **ConfigLoader**: Single source of truth for keys/modes.
5. **Mode 6 Automation Loop**: Recursive agent planning.

## 3. Integration Guidelines (Summarized)

> Source: 03_Archives/Staging_Areas/DEC_10th_REVISE/Nexus_HMI/

### OpenAI Integration

* **Env Vars**: `OPENAI_API_KEY`, `OPENAI_MODEL` (default: gpt-4-turbo).
* **Mock Mode**: Activates if API key is unset.
* **Integration**: Auto-selected for 'code-generation', 'documentation', 'quick-tasks'.

### Task Orchestration Plan

* **Phases**: Ingest (Intent) -> Plan (Dispatcher) -> Execute (Memory) -> Finalize.
* **Automation**: Relies on CI jobs for smoke tests.

## 4. Strategic Alignment (External)

> Source: [Process Orchestration Strategy (Camunda 2025)](./research/camunda_machine_colleagues.md)

* **Concept**: "Agentic Process Orchestration" matches our "Mode 6" architecture.
* **Insight**: Orchestration is the "unifying layer" for Human + System + AI.
* **Directive**: Ensure our `Dashboard` acts as the deterministic anchor for probabilistic AI agents.
* **Application**: See [Applied Strategy for Antigravity](./strategy/process_orchestration_alignment.md).

