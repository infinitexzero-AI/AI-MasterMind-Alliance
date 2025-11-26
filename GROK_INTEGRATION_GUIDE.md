# Grok Integration Guide

## Overview
This guide documents how to integrate xAI Grok into the AILCC Mode 6 framework.

## Endpoint
- `https://api.x.ai/v1/chat/completions`

## Recommended Config
- Default model: `grok-2`
- Timeout: 60s
- Retries: 2 (exponential backoff)

## Auth
- `Authorization: Bearer XAI_API_KEY`

## Best Practices
- Use mock mode in CI and developer flows when `XAI_API_KEY` is not configured.
- Keep streaming disabled initially; add streaming support after basic E2E smoke tests.

## Example Request (JSON)
```json
{
  "model": "grok-2",
  "messages": [{"role": "user", "content": "Summarize the repo architecture."}],
  "max_tokens": 1024
}
```

## Error handling
- Normalize errors to a common adapter Error type
- Handle 429 with retry and jitter

## Testing
- Add unit tests mocking HTTP responses
- Add a smoke test in `tests/` that runs dispatcher -> grok adapter in mock mode

## Monitoring
- Add metrics for requests, latency, error rate, and token usage
