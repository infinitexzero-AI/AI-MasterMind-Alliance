# AI Copilot Instructions for AILCC Framework

## Project Context

The **AI Lifecycle Command Center (AILCC)** is a multi-agent orchestration framework coordinating task execution across SuperGrok (Grok), Claude, Perplexity Comet, and ChatGPT. It operates in 5 distinct **mode branches**, each with specific workflows and responsibilities.

**Key Philosophy**: AI agents transition from advisory (analysis) mode to execution mode through systematic training, automation frameworks, and platform integration.

## Critical Architecture Patterns

### 1. Branch Strategy (Not Monolithic)
The repository uses **mode-specific branches** as the primary organizational unit:

- **`main`**: Coordination docs, README, shared conventions (current state)
- **`automation-mode`**: Mode 5 full automation (CI/CD, workflow configs, browser automation)
- **`professional-mode`**: Career development, internship tracking
- **`student-mode`**: Academic projects, study systems
- **`life-mode`**: Personal productivity, crypto analysis
- **`self-actualized-mode`**: Meta-learning, skill optimization

**When implementing features**: Work on the **appropriate mode branch**, not main. Main contains only cross-cutting documentation and coordination protocols.

### 2. Cross-Agent Handoff Pattern

Multi-agent coordination uses a **structured delegation protocol** (see `docs/sops/multi-agent-sop.md`):

```
[SOURCE_AGENT] → [TARGET_AGENT] with:
- Full task context (avoid summarizing)
- Expected output format
- Error escalation route
```

**Agent routing by capability**:
- **SuperGrok**: Central orchestration, execution logic, complex coordination
- **Claude**: Analysis, code generation, detailed reasoning
- **Comet (Perplexity)**: Research verification, web browsing, fact-checking
- **ChatGPT**: GitHub integration, automated code commits

### 3. Mode Context Management

Each mode has distinct workflows and priorities. When working on mode-specific content:

1. Check the appropriate mode branch's resources
2. Follow mode-specific SOP routing (table in `multi-agent-sop.md`)
3. Document mode-specific configurations separately
4. Never mix concerns between modes in shared files

**Example**: Student-mode academic projects don't belong in automation-mode—use separate branch structures.

## Developer Workflows & Commands

### Git Workflow
```bash
# Switch to mode branch for feature work
git checkout automation-mode

# Create feature branch from mode branch
git checkout -b feat/new-automation

# Commit with clear scope
git commit -m "feat(automation): Add browser automation template"

# Push to feature branch, then PR to mode branch (not main)
git push origin feat/new-automation
```

### Documentation Standards
- Use `kebab-case` for filenames (`multi-agent-sop.md`, not `multiAgentSOP.md`)
- Organize by concern: `/docs/sops/`, `/prompts/{agent}/`, `/modes/{mode}/`
- Always include a "Last Updated" date and related file references
- Include **concrete examples** from the codebase, not abstract patterns

### Testing & Validation
- **Prompt testing**: Verify cross-agent handoff format with actual agent responses before committing
- **Workflow validation**: Test automation templates in target branch before merging
- **Mode isolation**: Ensure features in one mode don't affect others (branch-level separation)

## Integration Points & External Dependencies

### Platforms
- **Linear** (Task source of truth) — AI agents pull task definitions from here
- **GitHub** (Code + CI/CD) — Workflow triggers, branch protection, automated commits
- **Notion** (Documentation) — Team coordination and AI team status dashboard
- **Zapier/Make.com** (Cross-platform bridging) — Routes tasks between Linear → GitHub → Claude/Grok

### Key Secrets (Configure in GitHub Settings > Secrets)
```
GITHUB_TOKEN          # For automated commits/PRs
LINEAR_API_KEY        # Task management integration
NOTION_API_KEY        # Documentation sync
GOOGLE_CLOUD_CREDS    # GCP for deployed automations
```

### API Handoff Pattern
When integrating new external services:
1. Document the integration in relevant mode's README
2. Store credentials in GitHub Secrets (never hardcode)
3. Create a dedicated SOP file in `/docs/sops/` for integration steps
4. Include error handling for API rate limits and unavailability

## Project-Specific Conventions

### Naming Conventions
| Item | Convention | Example |
|------|-----------|---------|
| Prompt files | `{agent}-{purpose}.md` | `supergrok-training.md` |
| Config files | `{context}.json` | `mode5-config.json` |
| Scripts | `{action}-{target}.py` | `sync-linear-github.py` |
| Directories | `kebab-case` | `multi-agent-memory/` |

### Prompt Organization
Prompts are **agent-specific** (not generic). Structure:
```
prompts/
├── supergrok/          # SuperGrok-specific training
├── claude/             # Claude-specific workflows
├── comet/              # Comet research prompts
└── chatgpt/            # ChatGPT automation templates
```

Each agent's prompts should include:
- **Context**: Which mode/workflow this applies to
- **Instructions**: Specific capabilities being trained
- **Handoff template**: How to delegate to next agent
- **Examples**: Concrete scenarios from AILCC usage

### Error Handling Convention
Document escalation paths in SOPs:
- **Context overflow**: Split task, re-delegate with summarized context
- **Agent unavailable**: Route to backup per mode (table in `multi-agent-sop.md`)
- **API rate limits**: Queue task, notify via Comet mobile
- **Conflicting outputs**: Escalate to human decision point

## Key Files to Understand the Project

1. **`README.md`** — High-level mission, tech stack, branch strategy
2. **`docs/DIRECTORY_STRUCTURE.md`** — File organization and planned future structure
3. **`docs/sops/multi-agent-sop.md`** — Cross-agent handoff protocol & agent routing table
4. **`prompts/supergrok/README.md`** — SuperGrok orchestration principles

When implementing new features, **read these in order** to understand the "why" behind decisions.

## When to Ask Questions

Before implementing, clarify:
- **Which mode branch** should this feature target?
- **Which agent** should primarily handle this (SuperGrok for orchestration, Claude for coding, etc.)?
- **Is this a new integration point** or extension of existing cross-platform bridges?
- **Does this need an SOP** documenting the handoff protocol?

---

**Last Updated**: November 26, 2025  
**Framework**: AILCC v1  
**Related**: [Multi-Agent SOP](../docs/sops/multi-agent-sop.md), [Directory Structure](../docs/DIRECTORY_STRUCTURE.md)
