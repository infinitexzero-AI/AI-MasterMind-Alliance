# Alliance Synchronization Protocol (v1.0)

This protocol defines how external Intelligence Platforms (ChatGPT, Claude, Grok, etc.) are utilized to monitor, audit, and improve the AI Mastermind Alliance.

## 1. System Context Injection

When interacting with external agents, always provide the `current_system_packet.json` or its markdown summary. This ensures the external agent has full visibility into the PRIME framework, active roles, and current task state.

## 2. Orchestration Roles

- **Claude (Analysis)**: Primary for code architecture review and deep forensic auditing.
- **ChatGPT (Operational)**: Best for generating task breakdowns and implementation sub-plans.
- **Grok (Real-time)**: Utilized for monitoring external market/academic trends that influence system goals.
- **Perplexity (Research)**: Deep sourcing and verification of academic materials for the Scholar Protocol.
- **Gemini (Coding/UI)**: Specialized in frontend evolution and TypeScript/Next.js refinements.

## 3. The "Downlaod & Sync" Loop

1. **Emit** system state to external platform.
2. **Consult** the platform for "Immediate System Improvements."
3. **Capture** response as a `synapse_<source>_<timestamp>.md` file in `/06_System/Synapses`.
4. **Integrate** the directives into the `task.md` or `implementation_plan.md`.

## 4. Master Sync Prompt Template
>
> "You are acting as a High-Council member of the AI Mastermind Alliance. I am supplying the current system state (PRIME Framework). Please review the dashboard observability metrics, active tasks, and agent roles. Identify three high-leverage improvements to the dashboard monitoring UI or the inter-agent orchestration protocol. Format your response with 'DIRECTIVE: `action`' blocks."
