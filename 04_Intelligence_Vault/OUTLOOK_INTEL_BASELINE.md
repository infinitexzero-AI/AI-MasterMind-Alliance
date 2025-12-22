# 📧 OUTLOOK INTELLIGENCE BASELINE (DEC 2025)

**Account**: `japalkricard@mta.ca`
**Status**: Configured | **Context**: Academic Admin & Financial Aid

---

## 🏛️ Folder Architecture
The following structure has been verified and will be used for targeted scans:
- **MTA Academic Admin**: Key for registrar correspondence (e.g., Academic Probation 2023).
- **Meighen Center**: Accommodations and accessibility records.
- **MTA Financial Services**: Tuition, fees, and payment history.
- **Gov. Of Canada**: Federal student loan (NSLSC) communications.
- **Student_Loans_Federal / NB**: (Pending/Target folders for new rules).

## 🔍 Initial Intel Discovery (Search Results)
- **Certificates of Enrollment (COE)**: `FALL2025COE.pdf`, `Winter2025COE.pdf` identified.
- **Academic Status**: Notice from Registrar regarding Academic Probation (2023-05-18).
- **Financial Aid**: Emails from NSLSC and NB Student Aid (PETL) found in search history.

## 🤖 Pipeline Strategy
We will execute the following Prompts (as defined in `INTEGRATION_PROMPTS.md`):
1. **Initial Data Extraction**: Extract and catalog all MTA/GNB/GC correspondence.
2. **Document Intelligence**: OCR and metadata extraction from COEs and probation letters.
3. **Timeline Intelligence**: Generate `academic_timeline.json`.
4. **Network Graph**: Map institutional authority and document flow.

---
*Derived from User-Verified Outlook Configuration dated Dec 22, 2025.*
