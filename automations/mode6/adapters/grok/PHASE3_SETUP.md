/**
 * Grok Phase 3 Setup Instructions
 * 
 * This file outlines the scaffolding and next steps for real Grok integration.
 */

# Grok Phase 3 — Scaffolding Complete

## Current Status

- ✅ `automations/mode6/adapters/grok/` directory created
- ✅ `grok-adapter-scaffold.ts` — placeholder with mock mode
- ✅ ConfigLoader already supports XAI_API_KEY
- ✅ Adapter registry ready for GrokAdapter export

## Environment Variables (Add to .env)

```bash
XAI_API_KEY=xai-your-key-here
GROK_MODEL=grok-2              # default
GROK_MAX_TOKENS=4000           # default
GROK_TEMPERATURE=0.7           # default
```

## Next Steps (Phase 3 Implementation)

### 1. Wire Real xAI API

In `grok-adapter.ts` (rename from scaffold):

- Replace mock implementation with real HTTP call to `https://api.x.ai/v1/chat/completions`
- Add Bearer token auth: `Authorization: Bearer ${this.apiKey}`
- Request body:
  ```json
  {
    "model": "grok-2",
    "messages": [{"role": "user", "content": "..."}],
    "max_tokens": 4000,
    "temperature": 0.7
  }
  ```
- Response parsing: extract `choices[0].message.content`
- Error handling: retry on 429 (rate limit), normalize errors

### 2. Add Tests

In `tests/` directory:

- Mock HTTP responses for grok-adapter
- Test mock mode operation
- Test error scenarios (401, 429, 500)
- E2E smoke test: dispatcher → grok adapter → result

### 3. Create Integration Guide

`GROK_INTEGRATION_GUIDE.md`:

- Quick start (get API key from x.ai console)
- Architecture flow
- API endpoint details
- Error handling
- Monitoring
- Security best practices

### 4. Update Adapter Registry

In `automations/mode6/agents/adapter-registry.ts`:

```typescript
import { GrokAdapter } from './grok-adapter';

export class AdapterRegistry {
  private grokAdapter: GrokAdapter;

  constructor() {
    this.grokAdapter = new GrokAdapter();
  }

  getAdapter(agentType: 'grok'): GrokAdapter {
    return this.grokAdapter;
  }

  // etc.
}
```

### 5. Export from Mode6 Index

In `automations/mode6/index.ts`:

```typescript
export { GrokAdapter } from './agents/grok-adapter';
```

## Estimated Time

- API wiring: 15–20 minutes
- Tests: 20–30 minutes
- Integration guide: 15 minutes
- **Total: ~1 hour**

## Safety Notes

- Always use mock mode in CI unless XAI_API_KEY is explicitly set
- Rate limits: xAI enforces per-minute limits; use exponential backoff
- Costs: Monitor xAI dashboard for token usage and costs
- Test with mock mode first before running full CI with real API key
