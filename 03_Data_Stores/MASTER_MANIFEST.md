# AILCC Master Document Manifest (2026)

This manifest maps all gathered documents from across the ThinkPad (Desktop, Downloads, External Hubs) to the centralized `03_Data_Stores` repository.

## 🏦 Finance Hub

`Path: C:\Users\infin\AILCC_PRIME\03_Data_Stores\Finance_Hub`

### CRA & Tax Documents

- **NOA CRA 2023.pdf**: Centralized in `Finance_Hub/CRA_Tax_Docs`.
- **NOA 2024.pdf**: Centralized in `Finance_Hub/CRA_Tax_Docs`.
- **TurboTax_2024_Filed_Return.pdf**: Centralized in `Finance_Hub/CRA_Tax_Docs`.
- **2026-04-14_TAX_CRA_GST_HST_2024_Confirmation.pdf**: Centralized in `Finance_Hub/CRA_Tax_Docs`.

### Business Performance (P&L)

- `Bank_Statements/`
  - `Raw_Statements/`
    - `RBC_Transactions_2025_RAW.csv`: Recovered forensic audit trail (90k in / 100k out).
  - `Coinbase/`
    - `Coinbase_Transactions_2025_12.pdf`: 33-page forensic report of all crypto activity.
- `Business_P_and_L/`
  - **CompanyOverview.pdf**: Centralized in `Finance_Hub/Business_P_and_L`.
- **Profit and Loss by Customer2023.pdf**: Centralized in `Finance_Hub/CRA_Tax_Docs`.
- **Profit and Loss by Customer2024.pdf**: Centralized in `Finance_Hub/CRA_Tax_Docs`.

### Academic Funding (SFS/OSAP)

- **2026-04-16_LOAN_NB_SFS_RequestLetter.pdf**: Centralized in `Finance_Hub/Academic_Funding`.

---

## 🎓 Academic Hub

`Path: C:\Users\infin\AILCC_PRIME\03_Data_Stores\Academic_Hub`

### Syllabi & Course Materials

- **HLTH 1011 Syllabus - Winter 2026.pdf**: Gathered from Desktop.
- **HLTH_1011_Lecture_Notes (1-7)**: Centralized in `Academic_Hub/Course_Materials`.

### Certificates

- **Joel_Palk-Ricard_0260004_tcps2_core_certificate.pdf**: Gathered from Desktop.

---

## 🗺️ System Maps

`Path: C:\Users\infin\AILCC_PRIME\03_Data_Stores`

- **Mastermind_Alliance_Map.md**: Gathered from Downloads.
- **Mastermind_Alliance_Map_1.md**: Gathered from Downloads.

---

## 🔄 Sync Status

- **ThinkPad (Vanguard)**: Local source of truth.
- **MacBook (Antigravity)**: Aligned via `powershell .\scripts\vanguard_sync.ps1`.
- **Hub**: central-git-repository.
