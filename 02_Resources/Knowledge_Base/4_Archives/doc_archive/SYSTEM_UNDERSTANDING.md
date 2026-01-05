# SYSTEM_UNDERSTANDING.md

## Current Architecture Summary
The system has just been consolidated into **`~/AILCC_PRIME`**.
- **Root**: `~/AILCC_PRIME`
- **Framework**: `~/AILCC_PRIME/ailcc` (Contains the Mode 1-5 structure)
- **Core Agents**: `~/AILCC_PRIME/core` (Legacy Valentine & Scripts)
- **Documentation**: `~/AILCC_PRIME/doc_archive` (White Paper, Manuals)

This "Prime" workspace resolves the previous "directory sprawl" identified in the critique.

## Key Agent Ecosystem
1.  **Antigravity (Me)**: The "Inner Loop" architect. Managing `AILCC_PRIME`.
2.  **Comet Assistant**: The "Outer Loop" browser agent.
3.  **Valentine**: The orchestration script (`core/scripts/system_check.py`).

## Opportunities for Antigravity Integration
- **Workflow Enforcement**: We can now place `.agent/workflows` directly in `AILCC_PRIME` to govern the whole system.
- **Cleanup**: The `core` folder is still a bit of a "dump" of the old structure. We should eventually map `core/TaskBoard.csv` to a more central location or keep it as the definitive source.
