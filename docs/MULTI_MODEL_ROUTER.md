# Multi-Model Router

## Purpose
Describe routing logic when multiple models/agents are available for a task.

## Goals
- Decide which agent to pick based on cost, capability, latency, and specialty
- Support chaining between models for complex tasks

## Routing Heuristics
- If task requires reasoning/long-context, prefer Claude/Grok
- If task requires token efficiency or known API, prefer OpenAI
- If task is interactive UI-related, prefer local desktop agents

## Output
- Router returns prioritized list of agents with reasons and estimated cost
