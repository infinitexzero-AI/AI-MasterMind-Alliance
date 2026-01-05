---
description: Activate Scholar Mode (Study Environment)
---

# Scholar Mode Protocol

1. Set System Mode to Scholar

   ```bash
   python3 antigravity.py mode scholar
   ```

2. Scan for Course Data

   ```bash
   python3 antigravity.py scan
   ```

3. Launch Course Materials (Example: COMM 3611)

   // turbo

   ```bash
   # In a real scenario, this would open PDFs or search notes
   echo "Opening COMM 3611 Context..."
   cat modes/mode-1-student/current_courses.json
   ```

4. Notify Dashboard (via Webhook/API - Mock)

   ```bash
   # This would hit the Next.js API to update the UI
   echo "Scholar Mode Active. Dashboard updated."
   ```
