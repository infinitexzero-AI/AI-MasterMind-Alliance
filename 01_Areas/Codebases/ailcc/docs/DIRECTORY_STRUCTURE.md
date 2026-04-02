# AILCC Framework Directory Structure

## Overview
This document outlines the recommended directory hierarchy for the AI Lifecycle Command Center framework.

## Root Structure

```
ailcc-framework/
├── README.md                    # Main documentation
├── .gitignore
├── docs/                        # Documentation
│   ├── DIRECTORY_STRUCTURE.md   # This file
│   ├── architecture/            # System architecture docs
│   ├── sops/                    # Standard Operating Procedures
│   │   ├── multi-agent-sop.md
│   │   └── integration-handoff.md
│   └── guides/                  # User guides
│       ├── quick-start.md
│       └── faq.md
│
├── prompts/                     # AI Training Prompts
│   ├── supergrok/               # SuperGrok specific
│   ├── claude/                  # Claude specific
│   ├── chatgpt/                 # ChatGPT specific
│   └── comet/                   # Perplexity Comet specific
│
├── modes/                       # Mode-specific resources
│   ├── mode-1-student/
│   ├── mode-2-professional/
│   ├── mode-3-life/
│   ├── mode-4-self-actualized/
│   └── mode-5-automation/
│
├── automations/                 # Automation workflows
│   ├── mode5/                   # Mode 5 automations
│   ├── mode6/                   # Mode 6 intent routing
│   │   ├── intent-router.py
│   │   └── pipelines/
│   └── workflows/               # CI/CD workflows
│
├── dashboard/                   # Dashboard UI (Next.js)
│   ├── app/
│   ├── components/
│   └── api/
│
├── memory/                      # Multi-Agent Memory System
│   ├── core/
│   ├── policies/
│   └── scripts/
│
├── config/                      # Configuration templates
│   ├── templates/
│   └── schemas/
│
├── scripts/                     # Utility scripts
│   ├── setup/
│   └── maintenance/
│
└── .github/                     # GitHub-specific
    └── workflows/               # GitHub Actions
```

## Branch Strategy

| Branch | Purpose |
|--------|--------|
| `main` | Stable documentation & coordination |
| `automation-mode` | Mode 5 automations, CI/CD |
| `professional-mode` | Career development |
| `student-mode` | Academic projects |
| `life-mode` | Personal productivity |
| `self-actualized-mode` | Meta-learning |

## File Naming Conventions

- Use `kebab-case` for filenames
- Use `.md` for documentation
- Use `.py` for Python scripts
- Use `.json` for configuration
- Use `.tsx` for React components

---
*Last Updated: November 26, 2025*
