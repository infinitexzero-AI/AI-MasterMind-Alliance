# Project Start Gate (Storage Health)

Before scaffolding a new project, installing large dependencies, or cloning a repo > 100MB:

1. Run:
`~/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/protocol_inspector.py --action check_health`

2. If exit code is `2` (RED):
   - **Do not proceed.**
   - Present snapshot and suggest offload plan.

3. If exit code is `0` or `1`:
   - Proceed normally.
