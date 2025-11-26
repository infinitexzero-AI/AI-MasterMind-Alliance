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
}
```

## Integrates With:
- Dispatcher
- Memory Manager
- Mode 6 Automation Loop
