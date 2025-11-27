# Grok Integration Guide

**Status:** ✅ Phase 3 Complete - Real API wiring active

This guide covers the xAI Grok integration with Mode 6's multi-agent orchestration system.

## Quick Start

### 1. Get Your API Key

1. Visit [console.x.ai](https://console.x.ai) and sign up
2. Create a new API key in your account dashboard
3. Add to `.env`:
   ```bash
   XAI_API_KEY=xai-xxxxxxxxxxxx
   ```

### 2. Basic Usage

```typescript
import { GrokAdapter } from './automations/mode6';

const grokAdapter = new GrokAdapter();

const result = await grokAdapter.executeTask({
  taskId: 'reasoning-001',
  sourceMode: 'mode6',
  timestamp: new Date(),
  targetAgent: 'grok',
  taskData: 'Analyze this complex logic problem: ...',
  metadata: {
    description: 'Complex reasoning task',
    taskType: 'reasoning'
  }
});

console.log(result.output); // Grok's response
```

### 3. With Mode 6 Orchestrator

```typescript
import { Mode6Orchestrator } from './automations/mode6';

const orchestrator = new Mode6Orchestrator();

const result = await orchestrator.processTask({
  id: 'task-001',
  description: 'Reasoning-heavy analysis',
  taskType: 'reasoning'
});

// Dispatcher routes to Grok based on intent
// Result includes reasoning process and output
```

### 4. Mock Mode (No API Key)

If `XAI_API_KEY` is not set, Grok automatically operates in mock mode:

```bash
# Mock mode active
[Grok Adapter] XAI_API_KEY not set; adapter will operate in mock mode.

# Response:
{
  success: true,
  agentUsed: 'grok',
  output: '[Grok Mock Mode - reasoning] Reasoning completed for: ...'
}
```

## Configuration

### Environment Variables

```bash
# Required for real API
XAI_API_KEY=xai-xxxxxxxxxxxx

# Optional (defaults shown)
GROK_MODEL=grok-2
GROK_MAX_TOKENS=4000
GROK_TEMPERATURE=0.7
```

### Programmatic Config

```typescript
const customGrok = new GrokAdapter({
  apiKey: 'xai-custom-key',
  modelId: 'grok-2',
  maxTokens: 8000,
  enableReasoning: true
});
```

## Architecture

### Component Flow

```
Mode6Orchestrator
    ↓
IntentRouter (analyzes task)
    ↓
AgentDispatcher (selects Grok for reasoning/analysis)
    ↓
AdapterRegistry.getAdapter('grok')
    ↓
GrokAdapter
    ├─ Check XAI_API_KEY
    ├─ Format message with task context
    ├─ Call https://api.x.ai/v1/chat/completions
    └─ Return DispatchResult with output
```

### Request/Response Flow

**Request:**
```json
{
  "model": "grok-2",
  "messages": [
    {
      "role": "user",
      "content": "[Reasoning Task]\nAnalyze security vulnerabilities...\n\n{task_data}"
    }
  ],
  "max_tokens": 4000,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "id": "chatcmpl-...",
  "created": 1234567890,
  "model": "grok-2",
  "result": {
    "output": "Vulnerability analysis: ...",
    "reasoning_tokens": 1200,
    "completion_tokens": 800
  },
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 800,
    "reasoning_tokens": 1200
  }
}
```

## Error Handling

### 401 Unauthorized

**Cause:** Invalid or missing XAI_API_KEY

**Resolution:**
```bash
# Verify key is valid
export XAI_API_KEY=xai-your-key

# Or use mock mode for testing
unset XAI_API_KEY  # Falls back to mock
```

### 429 Rate Limited

**Cause:** Exceeded per-minute token limits

**Built-in Handling:**
- Error is caught and returned in DispatchResult
- Use secondary agents via dispatcher's fallback mechanism
- Retry with exponential backoff (implement in orchestrator if needed)

**Example:**
```typescript
const result = await dispatcher.dispatchToAgent(handoff);
if (!result.success && result.error?.includes('429')) {
  // Try secondary agent
  const fallback = await dispatcher.dispatchToSecondaryAgents(handoff);
}
```

### 500 Server Error

**Cause:** xAI service unavailable

**Built-in Handling:**
- Error message included in DispatchResult
- Dispatcher can route to backup agent
- Check [status.x.ai](https://status.x.ai) for incidents

## Monitoring

### Request Statistics

```typescript
const grok = new GrokAdapter();

// After executing tasks...
const stats = grok.getStats();

console.log(stats);
// Output:
// {
//   successfulRequests: 12,
//   failedRequests: 1,
//   totalTokensUsed: 28450,
//   model: 'grok-2',
//   reasoningEnabled: true,
//   isConfigured: true
// }
```

### Via Orchestrator

```typescript
const orchestrator = new Mode6Orchestrator();
const stats = orchestrator.getSystemStats();

console.log(stats.dispatcher);
// Includes Grok adapter stats via getAdapter('grok').getStats()
```

## Use Cases

### 1. Complex Problem Solving

```typescript
const result = await grokAdapter.executeTask({
  taskId: 'problem-001',
  taskData: 'Design distributed system for 1M concurrent users',
  metadata: {
    description: 'Architecture design',
    taskType: 'reasoning'
  }
});

// Grok provides multi-step reasoning breakdown
```

### 2. Code Review & Analysis

```typescript
const result = await grokAdapter.executeTask({
  taskId: 'review-001',
  taskData: `Review this code for security:\n${sourceCode}`,
  metadata: {
    description: 'Security review',
    taskType: 'code-review'
  }
});

// Grok analyzes for vulnerabilities, best practices
```

### 3. Multi-Step Planning

```typescript
const result = await grokAdapter.executeTask({
  taskId: 'plan-001',
  taskData: 'Create deployment plan for database migration',
  metadata: {
    description: 'Database migration plan',
    taskType: 'planning'
  }
});

// Grok outputs step-by-step plan with dependencies
```

### 4. Research & Analysis

```typescript
const result = await grokAdapter.executeTask({
  taskId: 'research-001',
  taskData: 'Compare TypeScript vs Rust for systems programming',
  metadata: {
    description: 'Language comparison',
    taskType: 'research'
  }
});

// Grok provides comprehensive comparison with reasoning
```

## API Reference

### GrokAdapter

#### Constructor

```typescript
new GrokAdapter(config?: GrokAdapterConfig)
```

**Config Options:**
- `apiKey?: string` - xAI API key (defaults to XAI_API_KEY env)
- `modelId?: string` - Model to use (default: 'grok-2')
- `maxTokens?: number` - Max response tokens (default: 4000)
- `enableReasoning?: boolean` - Enable reasoning mode (default: true)

#### Methods

##### executeTask

```typescript
async executeTask(handoff: HandoffContext): Promise<DispatchResult>
```

Executes a task via Grok API or mock mode.

**Parameters:**
- `handoff.taskId` - Unique task identifier
- `handoff.taskData` - Task input (string or object)
- `handoff.metadata.description` - Task description
- `handoff.metadata.taskType` - Type of task

**Returns:**
```typescript
{
  success: boolean;
  taskId: string;
  agentUsed: 'grok';
  output?: string;           // Grok's response
  error?: string;            // Error message if failed
  metadata?: {
    model: string;           // Model used
    tokens: number;          // Tokens used
    reasoningTokens: number; // Reasoning tokens
    duration: number;        // Execution time (ms)
    mode?: 'mock';           // Present if mock mode
  };
}
```

##### validateCapability

```typescript
async validateCapability(capability: string): Promise<boolean>
```

Checks if Grok supports a capability.

**Supported Capabilities:**
- `reasoning`
- `multi-step-planning`
- `code-review`
- `analysis`
- `research`

##### getStats

```typescript
getStats(): {
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  model: string;
  reasoningEnabled: boolean;
  isConfigured: boolean;
}
```

Returns adapter statistics and configuration status.

## Security Best Practices

1. **Never Commit API Keys**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Use Environment Variables**
   ```typescript
   // ✅ Good
   const apiKey = process.env.XAI_API_KEY;
   
   // ❌ Bad
   const apiKey = 'xai-xxxxx';
   ```

3. **Rotate Keys Regularly**
   - Change API keys quarterly
   - Immediately after suspected leak

4. **Monitor Usage**
   - Check xAI dashboard for unexpected usage
   - Set up billing alerts

5. **Rate Limiting**
   - Implement request queuing in production
   - Use circuit breaker pattern for reliability

## Troubleshooting

### "XAI_API_KEY not set; adapter will operate in mock mode"

This is informational, not an error. Grok is running in mock mode because no API key was provided.

**Resolution:**
- Set `XAI_API_KEY` in `.env` for real API calls
- Or continue testing with mock mode

### "Grok error: Invalid request"

Check request format:
- `taskId` must be present
- `taskData` should be string or serializable object
- `metadata.description` should be descriptive

### "Grok error: 429 Too Many Requests"

You've exceeded rate limits:
- Wait before retrying
- Implement backoff in production
- Check xAI dashboard for quota

### Tests Failing with "Cannot find module"

Ensure:
```bash
npm install
npm run type-check  # Should pass
```

## Migration from Phase 2

If upgrading from Phase 2 (mock-only):

1. **Get API Key**: [console.x.ai](https://console.x.ai)
2. **Add to .env**: `XAI_API_KEY=xai-...`
3. **Update import**:
   ```typescript
   // Old (if was separate mock)
   // import { GrokAdapterMock } from '...'
   
   // New (real API with mock fallback)
   import { GrokAdapter } from './automations/mode6';
   ```
4. **No code changes needed**: Adapter handles real/mock automatically

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

### Mock Mode Testing

```typescript
// Automatically uses mock mode if no XAI_API_KEY
const grok = new GrokAdapter(); // Mock mode active
const result = await grok.executeTask(handoff);
// Returns mock response without API call
```

### Integration Testing

```typescript
// Set real API key for integration tests
process.env.XAI_API_KEY = 'xai-...';

const grok = new GrokAdapter();
const result = await grok.executeTask({
  taskId: 'integration-test',
  taskData: 'Test message',
  metadata: { description: 'Integration test' }
});

expect(result.success).toBe(true);
expect(result.agentUsed).toBe('grok');
expect(result.output).toBeDefined();
```

## Production Deployment

1. **Set environment variable** via secrets management:
   ```bash
   # Docker
   docker run -e XAI_API_KEY=xai-... ...
   
   # GitHub Actions
   env:
     XAI_API_KEY: ${{ secrets.XAI_API_KEY }}
   
   # Kubernetes
   apiVersion: v1
   kind: Secret
   metadata:
     name: xai-keys
   data:
     XAI_API_KEY: <base64-encoded-key>
   ```

2. **Monitor performance**:
   ```typescript
   const stats = grokAdapter.getStats();
   metrics.gauge('grok_successful_requests', stats.successfulRequests);
   metrics.gauge('grok_failed_requests', stats.failedRequests);
   metrics.gauge('grok_tokens_used', stats.totalTokensUsed);
   ```

3. **Set up alerts** for:
   - Repeated 401 errors (invalid key)
   - High 429 rates (rate limiting)
   - Increased latency
   - Error rate > 5%

4. **Rate limit handling**:
   ```typescript
   // Implement in orchestrator
   async dispatchWithRetry(handoff, maxRetries = 3) {
     for (let attempt = 1; attempt <= maxRetries; attempt++) {
       try {
         return await this.dispatchToAgent(handoff);
       } catch (error) {
         if (error.status === 429 && attempt < maxRetries) {
           const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
           await sleep(delay);
         } else {
           throw error;
        }
       }
     }
   }
   ```

## Support & Resources

- **xAI Documentation**: https://docs.x.ai/
- **API Reference**: https://docs.x.ai/api/
- **Status Page**: https://status.x.ai
- **Pricing**: https://x.ai/pricing
- **Community**: https://discuss.x.ai

## Changelog

### Version 1.0.0 - Phase 3 Complete
- ✅ Real xAI API wiring complete
- ✅ Bearer token authentication
- ✅ Mock mode fallback
- ✅ Error handling with proper status codes
- ✅ Request statistics tracking
- ✅ Multi-step reasoning support
- ✅ Integrated with Mode 6 dispatcher
- ✅ ConfigLoader support for environment variables
- ✅ Comprehensive integration guide

### Previous Phases
- **Phase 2**: Mock-only adapter (deprecated)
- **Phase 1**: Initial scaffolding

