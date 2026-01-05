---
description: Check the status of the AI Command Center systems
---

# System Status

1. Check Dashboard State

   ```bash
   cat dashboard_state.json
   ```

2. Check Dashboard Build Status

   ```bash
   cd 01_Areas/Codebases/ailcc/dashboard && npm run build
   ```

3. List Active Agents (Mock check)

   ```bash
   grep "status" dashboard_state.json
   ```
