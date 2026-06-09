---
description: Enforce Antigravity Storage Protocol v1.2 Safety Rules
globs: "**/*"
---
# Antigravity Storage Policy

This workspace acts under the **Antigravity Storage Protocol v1.2**.
**Source of Truth:** `~/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/storage_protocol.json`

## Agent Restrictions
The following rules must be strictly observed by Antigravity agents:

1.  **Read-Only Paths:** You may NOT modify, delete, or move files in the following locations directly. You must use approved migration scripts or ask for user confirmation.
    - `/Volumes/LaCie` (Use `archive_to_lacie` intent)
    - `~/Projects/ARCHIVED_LOCAL` (Use `cool_to_archive` intent)

2.  **Forbidden Patterns:** You may NOT read or modify files matching these patterns under any circumstances unless explicitly directed by the user for a specific file.
    - `*/TEK_data/raw/*`
    - `*/journals/private/*`

3.  **Cleanup:**
    - DO NOT run manual `rm -rf` commands on `node_modules` or caches in bulk.
    - ALWAYS use the approved automation script:
      `~/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/system_cleanup.sh`

4.  **Health Checks:**
    - Before starting large file operations (creating new projects, downloading datasets), verify storage health:
      `~/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/protocol_inspector.py --action check_health`
    - If status is `RED` (<10% free), STOP and request user intervention.

5.  **Project Creation Gate:**
    - Before creating a new project, scaffolding a repo, or installing heavy dependencies, YOU MUST run:
      `~/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/protocol_inspector.py --action check_health`
    - **Exit Code 0 (Green):** Proceed.
    - **Exit Code 1 (Yellow):** Proceed with a warning to the user.
    - **Exit Code 2 (Red):** **ABORT.** Do not create files. Propose an offload plan instead.

## Protocol Interpretation
- **Tiers:** Respect `ssd_hot` (Active), `ssd_cool` (Archive Ready), and `lacie_archive` (Cold).
- **Classes:** Treat `critical` files (journals, configs) as effectively immutable without explicit user overrides.
