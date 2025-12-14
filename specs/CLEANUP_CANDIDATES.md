# Storage Cleanup Candidates Report

**Objective:** Reclaim space by removing installers, duplicates, and legacy dependencies.
**Estimated Reclaim:** ~600MB - 1GB+

---

## 🗑️ High-Confidence Deletions (Installers)

These files appear to be downloaded installers (DMGs) that are no longer needed if the apps are installed.

| File | Size | Path | Recommendation |
| :--- | :--- | :--- | :--- |
| `GoogleDrive.dmg` | **279 MB** | `.../Legacy_Imports/.../GoogleDrive.dmg` | **DELETE** |
| `Antigravity.dmg` | **190 MB** | `~/AILCC_PRIME/Claude Code/Antigravity.dmg` | **DELETE** |

## ⚠️ Potential Redundancies (Codebases)

You have multiple `node_modules` folders. `AILCC_PRIME/01_Areas/Codebases/ailcc` seems to be an older version of the Dashboard.

| Directory | Size | Notes | Recommendation |
| :--- | :--- | :--- | :--- |
| `01_Areas/.../ailcc` | **[CHECKING]** | Legacy Project? | **PRUNE node_modules** |
| `AI-MasterMind-Alliance` | **[CHECKING]** | Current Project | **KEEP** |

## 👯 Duplicate Files (Name Pattern Match)

Files found with " copy" or "(1)" in the name.

*(List populated after scan completion)*

---

## 🏁 Action Plan

1. **Safety Check:** Confirm you want to delete the DMGs.
2. **Legacy Purge:** Confirm if `01_Areas/Codebases/ailcc` is legacy and can have its `node_modules` deleted (`rm -rf .../node_modules`).
3. **Execute:** I will run the deletion commands upon your signal.
