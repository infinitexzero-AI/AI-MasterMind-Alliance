# Claude API Integration Guide

**Status**: Ready for Implementation  
**Created**: November 26, 2025  
**Purpose**: Wire Anthropic Claude API into Mode 6 Agent Dispatcher

---

## 🎯 Quick Start

### 1. Get Your API Key

1. Visit [Anthropic Console](https://console.anthropic.com/account/keys)
2. Create or copy your API key
3. Keep it safe — never commit to git

### 2. Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Claude API key
export ANTHROPIC_API_KEY=[YOUR_ANTHROPIC_KEY_GOES_HERE]
```

### 3. Verify Configuration

```bash
# Check if Claude adapter is configured
npm run type-check

# Test the adapter is working
node -e "
  const { configLoader } = require('./automations/mode6');
  configLoader.logStatus();
"
```

---

## 🔧 Architecture

### Configuration Flow

```
Environment Variables (.env)
         ↓
ConfigLoader (config/env.ts)
         ↓
ClaudeAdapter Constructor
         ↓
Real API Mode or Mock Mode
```

### When API Key is Present

✅ `ANTHROPIC_API_KEY` set → **Real API Mode**

- Calls actual Anthropic API endpoint
- Returns real model responses
- Uses token counting from API

### When API Key is Missing

⚠️ `ANTHROPIC_API_KEY` empty → **Mock Mode**

- Simulates Claude responses
- Perfect for testing without API costs
- Logs `[Claude Mock Mode]` prefix

---

## 📚 Configuration Files

### `.env.example`

Template for environment variables. Copy to `.env` and fill in your keys.

```bash
ANTHROPIC_API_KEY=sk-ant-v0-...  # Anthropic Claude
OPENAI_API_KEY=sk-...             # OpenAI GPT (optional)
XAI_API_KEY=...                    # xAI Grok (optional)
```

### `automations/mode6/config/env.ts`

Central configuration loader that:

- Reads from `.env` and process.env
- Validates API key availability
- Provides mock mode fallback
- Exports singleton `configLoader` instance

```typescript
import { configLoader } from './automations/mode6/config/env';

// Check if agents are available
const claudeAvailable = !configLoader.isAgentMocked('anthropic');
const agents = configLoader.getAvailableAgents(); // ['anthropic', 'openai', 'grok']

// Log status (safe — doesn't expose keys)
configLoader.logStatus();
```

### `automations/mode6/agents/claude-adapter.ts`

ClaudeAdapter now:

- Imports `configLoader` from `config/env`
- Uses config values in constructor
- Provides real API integration
- Falls back to mock mode if key missing

---

## 🚀 Usage Examples

### Basic Task Execution

```typescript
import { ClaudeAdapter, configLoader } from './automations/mode6';

// Initialize adapter (uses env config)
const adapter = new ClaudeAdapter();

// Check configuration status
configLoader.logStatus();
// Output: ✅ Anthropic Claude: Ready (if key set)
//         ⚠️  Anthropic Claude: MOCK MODE (if key missing)

// Execute a task
const result = await adapter.executeTask({
  taskId: 'task-001',
  format: '[MODE6] → [CLAUDE]',
  context: {
    fullTaskDescription: 'Generate TypeScript code for a REST API',
    subtasks: ['Define types', 'Implement routes', 'Add middleware'],
    relatedContext: {},
    linearTicket: 'LINEAR-123'
  },
  expectedOutput: { format: 'structured-result', includeMetadata: true },
  escalationRoute: 'supergrok → human-review',
  timestamp: new Date().toISOString()
});

console.log(result);
// Output (Real Mode):
// {
//   success: true,
//   taskId: 'task-001',
//   agentUsed: 'claude',
//   output: '...(actual Claude response)...',
//   metadata: {
//     model: 'claude-3-5-sonnet-20241022',
//     inputTokens: 124,
//     outputTokens: 456,
//     duration: 2340
//   }
// }

// Output (Mock Mode):
// {
//   success: true,
//   taskId: 'task-001',
//   agentUsed: 'claude',
//   output: '[Claude Mock Mode] Processed task: ...',
//   metadata: { mode: 'mock', reason: 'ANTHROPIC_API_KEY not configured' }
// }
```

### Via Mode6Orchestrator

```typescript
import { Mode6Orchestrator, configLoader } from './automations/mode6';

const orchestrator = new Mode6Orchestrator();

// Log all agent statuses before processing
configLoader.logStatus();

// Process a task (auto-routes to Claude if appropriate)
const result = await orchestrator.processTask({
  id: 'task-002',
  description: 'Analyze API performance bottlenecks',
  subtasks: ['Profile endpoints', 'Identify slow queries', 'Suggest optimizations'],
  priority: 'high',
  mode: 'automation',
  createdAt: new Date().toISOString()
});

console.log('Task result:', result);
```

### Stream Mode (Real-time Responses)

```typescript
const adapter = new ClaudeAdapter();

// Stream response in chunks
await adapter.streamTask(handoff, (chunk) => {
  process.stdout.write(chunk); // Print as it arrives
});
```

---

## 🧪 Testing

### Test With Real API

```bash
# Set your API key first
export ANTHROPIC_API_KEY=sk-ant-v0-...

# Run tests (will call real API)
npm test -- tests/adapters/claude-adapter.real.test.ts
```

### Test With Mock Mode

```bash
# Unset API key (optional, tests check for mock mode)
unset ANTHROPIC_API_KEY

# Run tests (will use mock responses)
npm test -- tests/adapters/claude-adapter.mock.test.ts
```

### Manual Testing

```typescript
// test-claude-adapter.ts
import { ClaudeAdapter, configLoader } from './automations/mode6';

async function testClaude() {
  const adapter = new ClaudeAdapter();
  
  console.log('Configuration status:');
  configLoader.logStatus();
  
  console.log('\nTesting adapter...');
  const result = await adapter.executeTask({
    taskId: 'test-001',
    format: '[TESTER] → [CLAUDE]',
    context: {
      fullTaskDescription: 'Write hello world in TypeScript',
      subtasks: [],
      relatedContext: {}
    },
    expectedOutput: { format: 'structured-result', includeMetadata: true },
    escalationRoute: 'human-review',
    timestamp: new Date().toISOString()
  });
  
  console.log('\nResult:');
  console.log(JSON.stringify(result, null, 2));
}

testClaude().catch(console.error);
```

Run with:

```bash
npx ts-node test-claude-adapter.ts
```

---

## 🔐 Security Best Practices

### ✅ DO

- ✅ Store `ANTHROPIC_API_KEY` in `.env` (ignored by git)
- ✅ Use environment variables for secrets
- ✅ Log configuration status (safe — no keys exposed)
- ✅ Rotate keys regularly
- ✅ Use GitHub Secrets for CI/CD

### ❌ DON'T

- ❌ Commit API keys to git
- ❌ Log full API responses with sensitive data
- ❌ Hardcode keys in source code
- ❌ Share keys in chat/emails
- ❌ Use same key across multiple environments

---

## 🐛 Troubleshooting

### API Key Not Recognized

```bash
# Verify key is set
echo $ANTHROPIC_API_KEY

# Should output: sk-ant-v0-...
# If empty, run: export ANTHROPIC_API_KEY=your-key
```

### 401 Unauthorized Error

```
Claude API error (401): Invalid API key
```

**Solution**:

1. Check key is copied correctly
2. Visit [Anthropic Console](https://console.anthropic.com/account/keys)
3. Verify key is active (not revoked)
4. Update `.env` with new key

### 429 Rate Limit Error

```
Claude API error (429): Rate limit exceeded
```

**Solution**:

- Wait a few minutes before retrying
- Use mock mode for testing
- Implement exponential backoff in production

### Mock Mode When Key Should Be Set

```
[Claude Adapter] ANTHROPIC_API_KEY not set; adapter will operate in mock mode.
```

**Solution**:

```bash
# Verify .env file exists
ls -la .env

# Check key is actually set
grep ANTHROPIC_API_KEY .env

# Reload environment
source .env

# Verify
echo $ANTHROPIC_API_KEY
```

---

## 📊 Monitoring

### Check Adapter Statistics

```typescript
const adapter = new ClaudeAdapter();

// Get stats after some requests
const stats = adapter.getStats();
console.log(stats);
// Output: {
//   successfulRequests: 5,
//   failedRequests: 0,
//   totalTokensUsed: 12345,
//   averageResponseTime: 2150,
//   model: 'claude-3-5-sonnet-20241022',
//   isConfigured: true
// }
```

### Monitor All Agents

```typescript
import { configLoader } from './automations/mode6';

configLoader.logStatus();
// Output:
// [Config] Agent Configuration Status:
//   • Anthropic Claude: ✅ Ready
//   • OpenAI GPT: ⚠️  MOCK MODE
//   • xAI Grok: ⚠️  MOCK MODE
```

---

## 🔄 Next Steps

1. ✅ Set `ANTHROPIC_API_KEY` in `.env`
2. ✅ Run `npm run type-check` to verify compilation
3. ✅ Test with manual script above
4. ✅ Wire OpenAI and Grok adapters (same pattern)
5. ✅ Add to CI/CD pipeline via GitHub Secrets
6. ✅ Deploy to production

---

## 📚 Related Documentation

- [Anthropic API Docs](https://docs.anthropic.com/)
- `automations/mode6/config/env.ts` - Configuration loader
- `automations/mode6/agents/claude-adapter.ts` - Claude adapter implementation
- `.env.example` - Environment template
- `automations/mode6/README.md` - Mode 6 architecture

---

**Questions?** Check the logs or review the adapter source code for inline documentation.
