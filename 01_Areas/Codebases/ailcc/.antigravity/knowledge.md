# AILCC Framework Knowledge Base

## Project Context
- **Purpose:** AI Lifecycle Command Center - Multi-agent orchestration platform
- **Started:** ~September 2025 (3 months ago)
- **Current Phase:** Phase 4 (Forge Runtime & Supervisor)
- **Deployment:** Production on Vercel (89 deployments)

## Architecture Patterns
- **Intent-based routing:** Tasks classified by IntentRouter before dispatch
- **Agent adapters:** Unified interface (sendMessage, supportsIntent, error normalization)
- **Memory with dependencies:** TTL-based retention, task graph introspection
- **Real/Mock modes:** ConfigLoader-driven behavior switching

## Agent Hierarchy
1. **Comet Assist** (Supervisor) - Verifies all outputs, escalates issues
2. **Claude** - Complex code/analysis, security audits
3. **OpenAI** - Fast tasks, token-efficient ops
4. **Grok** - Multi-step reasoning, experimental approaches

## Critical Files
- `forge-monitor/runtime` - Execution environment
- `forge-monitor/supervisor` - Event bus orchestration
- `dashboard/` - Next.js visualization (port 3000)
- `src/` - Core modules (Intent Router, Dispatcher, Memory Manager)

## Conventions
- TypeScript strict mode (no `any`)
- Jest tests required for new code
- ESLint compliance mandatory
- Follow existing adapter patterns

## Cost Monitoring
- Daily thresholds: $50 warning / $100 alert / $200 cutoff
- Claude: 60 req/min, 5M tokens/day
- OpenAI: 90 req/min, 3M tokens/day  
- Grok: 40 req/min, 2M tokens/day
