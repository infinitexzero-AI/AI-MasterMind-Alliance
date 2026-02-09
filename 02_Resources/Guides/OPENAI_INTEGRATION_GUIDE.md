# OpenAI GPT Integration Guide

**Status**: Ready for Implementation  
**Created**: November 26, 2025  
**Purpose**: Wire OpenAI GPT API into Mode 6 Agent Dispatcher

---

## 🎯 Quick Start

### 1. Get Your API Key

1. Visit [OpenAI API Platform](https://platform.openai.com/account/api-keys)
2. Create or copy your API key
3. Keep it safe — never commit to git

### 2. Configure Environment

```bash
# Edit .env and add your OpenAI API key
export OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Verify Configuration

```bash
# Check if OpenAI adapter is configured
npm run type-check

# Test the adapter is working
node -e "
  const { OpenAIAdapter } = require('./automations/mode6');
  const adapter = new OpenAIAdapter();
  console.log(adapter.getStats());
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
OpenAIAdapter Constructor
         ↓
Real API Mode or Mock Mode
```

### When API Key is Present

✅ `OPENAI_API_KEY` set → **Real API Mode**
- Calls actual OpenAI API endpoint
- Returns real GPT responses
- Uses token counting from API

### When API Key is Missing

⚠️ `OPENAI_API_KEY` empty → **Mock Mode**
- Simulates GPT responses
- Perfect for testing without API costs
- Logs `[OpenAI Mock Mode]` prefix

---

## 📚 Configuration

### Environment Variables

```bash
# Required for real API mode
OPENAI_API_KEY=sk-...

# Optional: Override defaults
OPENAI_MODEL=gpt-4-turbo
OPENAI_MAX_TOKENS=2048
OPENAI_TEMPERATURE=0.7
```

### Default Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Model | gpt-4-turbo | GPT model to use |
| Max Tokens | 2048 | Maximum response length |
| Temperature | 0.7 | Creativity level (0-1) |

---

## 🔌 Integration Points

### With Intent Router

OpenAI is automatically selected for tasks matching these capabilities:

```typescript
[
  'code-generation',
  'documentation',
  'quick-tasks',
  'code-review',
  'summarization',
]
```

### With Agent Dispatcher

```typescript
import { OpenAIAdapter } from './automations/mode6';

const adapter = new OpenAIAdapter();
const result = await adapter.executeTask(handoff);
```

### With Memory Manager

Execution results are automatically stored:

```typescript
await memory.storeExecutionResult(result);
```

---

## 🧪 Testing

### Test Without API Key (Mock Mode)

```bash
# Unset API key
unset OPENAI_API_KEY

# Run tests - will use mock mode
npm test
```

### Test With API Key (Real Mode)

```bash
# Set API key
export OPENAI_API_KEY=sk-your-key-here

# Run tests - will call real API
npm test
```

---

## 🚨 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid API key | Key is wrong or expired | Check API key in OpenAI dashboard |
| Rate limit exceeded | Too many requests | Implement exponential backoff retry |
| Model not found | Wrong model name | Use correct model: gpt-4-turbo |
| Context too long | Prompt exceeds max tokens | Split into smaller tasks |

---

## 📊 Monitoring

### Check Adapter Stats

```typescript
const stats = adapter.getStats();
console.log(`
  Successful Requests: ${stats.successfulRequests}
  Failed Requests: ${stats.failedRequests}
  Total Tokens Used: ${stats.totalTokensUsed}
  Model: ${stats.model}
  Configured: ${stats.isConfigured}
`);
```

---

## 🔒 Security Best Practices

1. **Never commit API keys** - Use environment variables only
2. **Rotate keys regularly** - Delete old keys from OpenAI dashboard
3. **Use specific keys** - Create separate keys for dev/prod
4. **Monitor usage** - Check OpenAI dashboard for unusual activity
5. **Set limits** - Configure spending limits in OpenAI account

---

## 🔄 API Endpoint Details

### Completions Endpoint

**URL**: `https://api.openai.com/v1/completions`

**Method**: POST

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer sk-..."
}
```

**Request Body**:
```json
{
  "model": "gpt-4-turbo",
  "prompt": "Your task description here",
  "max_tokens": 2048,
  "temperature": 0.7
}
```

**Response**:
```json
{
  "id": "cmpl-xxx",
  "object": "text_completion",
  "created": 1234567890,
  "model": "gpt-4-turbo",
  "choices": [{
    "text": "Generated response here",
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  }
}
```

---

## 🚀 Next Steps

1. Set `OPENAI_API_KEY` environment variable
2. Run `npm test` to verify integration
3. Monitor token usage on OpenAI dashboard
4. Proceed with Grok integration (Phase 3)

---

## 📖 Related Documentation

- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [Claude Integration Guide](./CLAUDE_INTEGRATION_GUIDE.md)
- [Mode 6 README](./README_MODE6.md)

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: November 26, 2025
