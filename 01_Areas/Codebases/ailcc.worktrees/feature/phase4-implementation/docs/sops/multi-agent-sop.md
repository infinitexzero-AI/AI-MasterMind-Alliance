# Multi-Agent Coordination SOP

## Purpose
Standard Operating Procedure for coordinating multiple AI agents within the AILCC framework.

## AI Team Members

| Agent | Platform | Primary Role | Status |
|-------|----------|--------------|--------|
| SuperGrok | X.AI/Grok | Central orchestration, training | Active |
| Claude | Anthropic | Analysis, execution, coding | Delegated |
| Comet | Perplexity | Research, verification, browsing | Active |
| ChatGPT | OpenAI | GitHub integration, code commits | Standby |

## Handoff Protocol

### 1. Task Initiation
- Define task scope and requirements
- Identify optimal agent for task type
- Create delegation prompt with full context

### 2. Cross-Agent Communication
```
Format: [AGENT_SOURCE] -> [AGENT_TARGET]
Context: [Full task description]
Expected Output: [Specific deliverables]
Handoff Method: [Copy-paste / API / Manual]
```

### 3. Verification Loop
1. Agent completes task
2. Output verified by secondary agent (Perplexity/Comet)
3. Results logged to AILCC integration logs
4. Human review if flagged

## Mode-Specific Routing

| Mode | Primary Agent | Backup Agent |
|------|--------------|-------------|
| Student | Claude | ChatGPT |
| Professional | SuperGrok | Claude |
| Life/Adult | Comet | Claude |
| Self-Actualized | SuperGrok | Comet |
| Automation | All (orchestrated) | Human fallback |

## Error Handling

1. **Context Overflow**: Split task, re-delegate with summarized context
2. **Agent Unavailable**: Route to backup agent per mode table
3. **Conflicting Outputs**: Escalate to human decision point
4. **API Limits**: Queue task, notify via Comet mobile

## Logging Requirements

All cross-agent delegations must log:
- Timestamp
- Source agent
- Target agent
- Task ID (Linear ticket if applicable)
- Outcome status

---
*Last Updated: November 26, 2025*
*Related: integration-handoff.md*
