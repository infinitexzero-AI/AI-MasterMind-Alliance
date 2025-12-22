# 🤖 OUTLOOK EXTRACTION PROMPTS (OPERATIONAL)

These prompts are to be executed by Antigravity using the Comet Browser Pipeline.

### **[EXECUTION_01] Initial Data Extraction**
Extract and catalog all Mount Allison University administrative correspondence.
- **Target**: `japalkricard@mta.ca`
- **Output**: JSON Structure with sender, date, subject, body_summary, attachments[].

### **[EXECUTION_02] Document Attachment Processing**
Process all attachments from academic administrative emails.
- **Target**: `FALL2025COE.pdf`, `Winter2025COE.pdf`, Probation Letters.
- **Steps**: OCR extraction, key data identification (amounts, deadlines).

### **[EXECUTION_03] Timeline Intelligence**
Create comprehensive timeline of all academic administrative events and deadlines.
- **Format**: `academic_timeline.json`.

---
*Reference: Handover dated 2025-12-22.*
