# Comet Assist Manifest

**Version:** 1.0.0  
**Date:** November 27, 2025  
**Status:** Production Ready for Integration

---

## 1. Comet Identity & Role Definition

### Agent Name

**Comet Assist** — Multi-agent supervisor and research coordinator

### Primary Functions

- Real-time web research and fact verification
- Cross-agent message routing and escalation
- Consensus building for multi-agent disagreements
- Integration with Perplexity Spaces for knowledge synthesis
- Rate-limit and cost monitoring for all agents

### Capabilities

- Web browsing and fact-checking
- Summarization and synthesis
- Task verification and QA
- Multi-model reasoning aggregation
- Incident escalation

---

## 2. API Schema (Comet ↔ Mode 6)

### Webhook Events

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
  retryConfig?: {
    maxRetries: number;
    backoffMs: number;
  };
}
```

### REST Endpoints

| Endpoint | Method | Purpose | Rate Limit |
| ---------- | -------- | --------- | ----------- |
| `/api/comet/verify` | POST | Verify agent output | 1000/min |
| `/api/comet/research` | POST | Perform web research | 500/min |
| `/api/comet/synthesize` | POST | Synthesize multi-agent results | 500/min |
| `/api/comet/escalate` | POST | Escalate decision to human | 100/min |
| `/api/comet/costs` | GET | Query cost tracking | Unlimited |

### Request Example

```json
{
  "taskId": "task-abc123",
  "action": "verify",
  "agentOutput": {
    "agent": "claude",
    "output": "...",
    "confidence": 0.95
  },
  "verificationCriteria": {
    "factAccuracy": true,
    "codeReview": false,
    "securityCheck": true
  }
}
```

### Response Example

```json
{
  "decision": "approve",
  "reasoning": "Output verified against 5 authoritative sources",
  "confidence": 0.98,
  "nextAgent": null,
  "costEstimate": 0.0045
}
```

---

## 3. Event Routing System

### Event Flow

```text
[Mode 6 Dispatcher]
    ↓
[Task Completion]
    ↓
[Webhook to Comet]
    ↓
[Comet Verification]
    ↓ (Decision)
    ├─→ [Approve] → Memory Store
    ├─→ [Retry] → Dispatcher (new attempt)
    ├─→ [Reject] → Secondary Agent
    └─→ [Escalate] → Human Review Queue
```

### Event Types

| Event | Trigger | Handler | Output |
| ------- | --------- | --------- | -------- |
| `task-pending` | Dispatch begins | Comet logs start time | Cost pre-calculation |
| `task-complete` | Agent finishes | Comet verifies output | Approval/retry decision |
| `task-failed` | Agent error | Comet analyzes error | Escalation or retry |
| `escalation` | Manual trigger | Comet routes to human | Ticket creation |

### Retry Configuration

```typescript
const defaultRetryPolicy = {
  maxRetries: 3,
  backoffMs: [1000, 2000, 4000],  // exponential
  retriableErrors: ['429', '503', 'timeout'],
  nonRetriableErrors: ['401', '403', '404']
};
```

---

## 4. Role Definitions

### Comet Assist (Supervisor)

**Responsibilities:**

- Monitor all agent executions
- Verify output quality and accuracy
- Route tasks to secondary agents if needed
- Track costs and rate limits
- Escalate critical issues

**Permissions:**

- Read-only access to all agent outputs
- Can trigger task reruns
- Can escalate to human review
- Cannot modify task parameters

**Rate Limits:**

- 10,000 verification checks/day
- 1,000 web searches/day
- 500 escalations/day

### Claude (Primary Code/Analysis Agent)

**Responsibilities:**

- Code generation and review
- Complex analysis and reasoning
- Documentation generation
- Security audits

**Handoff to Comet:** When output confidence < 0.85 or high-risk category

### OpenAI (Quick Tasks Agent)

**Responsibilities:**

- Fast task execution
- Token-efficient operations
- Summarization
- API documentation

**Handoff to Comet:** On error or ambiguous output

### Grok (Reasoning Agent)

**Responsibilities:**

- Multi-step logical reasoning
- Complex planning
- Experimental approaches
- Cross-domain analysis

**Handoff to Comet:** For verification of novel approaches

---

## 5. Rate-Limit Safety Policy

### Per-Agent Limits

| Agent | Requests/min | Tokens/day | Concurrency |
| ------- | ------------- | ----------- | ------------ |
| Claude | 60 | 5M | 10 |
| OpenAI | 90 | 3M | 15 |
| Grok | 40 | 2M | 5 |
| Comet | 1000 | N/A (research only) | 50 |

### Cost Tracking

```typescript
interface CostTracker {
  daily: {
    claude: number;
    openai: number;
    grok: number;
    total: number;
  };
  monthly: Record<string, number>;
  thresholds: {
    warningAt: number;     // $50/day
    alertAt: number;       // $100/day
    cutoffAt: number;      // $200/day (stop accepting new tasks)
  };
}
```

### Enforcement

```typescript
// Comet checks before each dispatch
if (costTracker.daily.total >= costTracker.thresholds.alertAt) {
  // Route to cheaper agent or queue for review
  return escalate({
    reason: 'cost-threshold',
    currentCost: costTracker.daily.total,
    recommendation: 'defer-low-priority-tasks'
  });
}
```

---

## 6. Error Handling & Recovery

### Error Classification

| Category | Examples | Action |
| ---------- | ---------- | -------- |
| Retryable | 429, 503, timeout | Exponential backoff |
| Transient | 500, 502 | Retry with jitter |
| Auth | 401, 403 | Escalate to human |
| Not Found | 404 | Route to secondary agent |
| Client | 400, 422 | Reject and log |

### Recovery Flow

```text
[Agent Error]
    ↓
[Comet Error Handler]
    ├─ [Retryable?] → Yes → [Retry with Backoff]
    ├─ [Secondary Agent Available?] → Yes → [Route]
    └─ [Escalate to Human]
```

---

## 7. Health Checks

### Comet Self-Diagnostics

Run every 5 minutes:

```typescript
async function healthCheck() {
  return {
    status: 'healthy' | 'degraded' | 'unhealthy',
    checks: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      agentConnectivity: await checkAllAgents(),
      webResearchLatency: await testPerplexityAPI(),
      costTrackerSync: await verifyCostDB(),
      webhookQueue: queueLength(),
    },
    alerts: [],
    lastCheck: new Date().toISOString(),
  };
}
```

### Alert Conditions

| Condition | Severity | Action |
| ----------- | ---------- | -------- |
| Agent unreachable for 5 min | 🔴 Critical | Page on-call |
| Cost spike > 2x baseline | 🟡 High | Alert + pause low-priority tasks |
| Webhook queue > 1000 | 🟡 High | Scale webhook consumers |
| Error rate > 10% | 🟡 High | Investigate and report |

---

## 8. Integration with Mode 6

### Initialization

```typescript
// In Mode6Orchestrator constructor
import { CometAssist } from './comet-assist';

export class Mode6Orchestrator {
  private comet: CometAssist;
  
  constructor() {
    this.comet = new CometAssist({
      webhookUrl: process.env.COMET_WEBHOOK_URL,
      apiKey: process.env.COMET_API_KEY,
      costThresholds: {
        warning: 50,
        alert: 100,
        cutoff: 200,
      }
    });
    
    // Register webhook handlers
    this.comet.on('verification-complete', (result) => {
      this.handleVerificationResult(result);
    });
  }
  
  async processTask(intent: TaskIntent) {
    const result = await this.dispatcher.dispatchToAgent(handoff);
    
    // Always route through Comet verification
    const verified = await this.comet.verify(result);
    
    if (!verified.approved) {
      // Re-route or escalate
      return await this.handleVerificationFailure(verified);
    }
    
    // Store verified result
    await this.memory.storeExecutionResult(result);
    return result;
  }
}
```

---

## 9. Configuration (Environment Variables)

```bash
# Comet API
COMET_API_KEY=comet-api-key-here
COMET_WEBHOOK_URL=https://comet.local/webhooks/mode6
COMET_TIMEOUT_MS=30000

# Cost Thresholds
COMET_COST_WARNING_USD=50
COMET_COST_ALERT_USD=100
COMET_COST_CUTOFF_USD=200

# Retry Policy
COMET_MAX_RETRIES=3
COMET_RETRY_BACKOFF_MS=1000

# Health Check
COMET_HEALTH_CHECK_INTERVAL_MS=300000
```

---

## 10. Monitoring & Observability

### Metrics

```typescript
interface CometMetrics {
  verifications: {
    total: number;
    approved: number;
    rejected: number;
    escalated: number;
  };
  costs: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  errors: {
    retryableCount: number;
    nonRetryableCount: number;
    escalationCount: number;
  };
}
```

### Dashboard Integration

```json
{
  "widgets": [
    {
      "name": "Comet Status",
      "type": "gauge",
      "metric": "comet.health_status"
    },
    {
      "name": "Verification Rate",
      "type": "timeseries",
      "metric": "comet.verifications_per_minute"
    },
    {
      "name": "Cost Tracking",
      "type": "counter",
      "metric": "comet.daily_cost_usd"
    },
    {
      "name": "Error Rate",
      "type": "gauge",
      "metric": "comet.error_rate_percent"
    }
  ]
}
```

---

## 11. Security Considerations

### API Key Management

- Store `COMET_API_KEY` in GitHub Secrets (never in .env)
- Rotate keys quarterly
- Use separate keys for dev/staging/prod

### Data Privacy

- No PII logged by default
- Sanitize user inputs before sending to Comet
- GDPR/CCPA compliant logging

### Rate Limiting

- Enforce token bucket algorithm per agent
- Implement circuit breaker for failing agents
- Alert on suspicious activity (cost spikes, error surges)

---

## 12. Deployment Checklist

- [ ] Create Comet service instance (if self-hosted)
- [ ] Configure `COMET_WEBHOOK_URL` endpoint
- [ ] Set `COMET_API_KEY` in GitHub Secrets
- [ ] Deploy Mode 6 with CometAssist integration
- [ ] Run health check: `npm run comet:health`
- [ ] Monitor first 1 hour of production traffic
- [ ] Set up alerts in monitoring system

---

## 13. Future Extensions

- **Streaming verification:** Real-time output verification as agents respond
- **Custom verification rules:** User-defined quality criteria
- **Multi-modal verification:** Combine web search, code analysis, peer review
- **Automated cost optimization:** Route tasks to cheaper agents when possible
- **Machine learning:** Learn from verification history to improve routing
