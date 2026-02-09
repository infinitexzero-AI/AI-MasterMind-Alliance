# Grok Phase 3 Integration Pack

## Goal
Prepare Phase 3 for xAI Grok adapter wiring, tests, and integration guide.

## Tasks
1. Verify `automations/mode6/agents/grok-adapter.ts` uses `ConfigLoader`.
2. Add streaming support tests (mocked) for reasoning-heavy prompts.
3. Create `GROK_INTEGRATION_GUIDE.md` with endpoints, API keys, and examples.
4. Add basic rate-limit/retry policies to config defaults.
5. Add E2E smoke test in `tests/` to exercise dispatcher -> grok adapter chain.

## Quick Notes
- Model endpoint: `https://api.x.ai/v1/chat/completions`
- Default model: `grok-2` (configurable)
- Mock mode should be identical to Claude/OpenAI patterns
