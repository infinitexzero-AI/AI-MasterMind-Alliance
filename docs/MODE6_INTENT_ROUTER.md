# Mode 6 — Intent Router Specification

## Purpose

The Intent Router identifies:

- User intention
- Required agents
- Task complexity
- Task categories (dev, research, orchestration, automation, etc.)

## Workflow

1. Normalize input
2. Apply classification heuristics
3. Detect keywords, verbs, and intents
4. Map to agent roles
5. Return structured `IntentResult`

## Output Structure

```ts
interface IntentResult {
  type: IntentType;
  complexity: "low" | "medium" | "high";
  requestedAgents: AgentType[];
  requiresChaining: boolean;
  routingHeuristic?: "Grok-First" | "Claude-First" | "Gemini-First";
}
```

## Routing Heuristics (xAI Optimization)

- **Grok-First**: Triggered for "Forecasting", "Real-time news", "Viral trends", and "High-velocity drafts".
- **Claude-First**: Triggered for "Architecture", "Validation", and "Academic Logic".
- **Gemini-First**: Triggered for "Code Implementation" and "Local Filesystem ops".

## Integrates With

- Dispatcher
- Memory Manager
- Mode 6 Automation Loop
