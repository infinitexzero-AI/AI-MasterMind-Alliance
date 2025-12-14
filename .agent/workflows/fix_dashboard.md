---
description: Attempt to recover the dashboard by cleaning cache and rebuilding
---

# Fix Dashboard

1. Clean Next.js Cache

   // turbo

   ```bash
   rm -rf 01_Areas/Codebases/ailcc/dashboard/.next
   ```

2. Reinstall Dependencies (Optional but good for recovery)

   ```bash
   cd 01_Areas/Codebases/ailcc/dashboard && npm install
   ```

3. Rebuild Dashboard

   // turbo

   ```bash
   cd 01_Areas/Codebases/ailcc/dashboard && npm run build
   ```
