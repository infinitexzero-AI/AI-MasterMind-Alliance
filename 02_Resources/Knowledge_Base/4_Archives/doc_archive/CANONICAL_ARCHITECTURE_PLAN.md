# CANONICAL_ARCHITECTURE_PLAN.md

## Canonical Root
**The Canonical Working Root is:** `/Users/infinite27/AILCC_PRIME`

## Proposed Directory Layout
```
AILCC_PRIME/
├── ailcc/                   # The Framework (Modes)
│   ├── modes/
│   │   ├── mode-1-student/
│   │   ├── mode-2-professional/
│   │   └── ...
├── core/                    # Legacy Core (Valentine)
│   ├── SystemProfile.markdown
│   └── TaskBoard.csv
├── .agent/                  # Antigravity Config
│   ├── rules/
│   ├── workflows/
│   └── mcp_config.json
├── doc_archive/             # Documentation
└── logs/                    # System Logs
```

## Refactoring Notes
- The `core` directory currently mirrors the old `AI-Mastermind-Core/project-root`. 
- **Future Goal**: Move `TaskBoard.csv` and `SystemProfile.markdown` up to a `system-config` folder for better visibility, but for now we essentially map "Legacy Core" to `core/`.
