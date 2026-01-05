# Alliance Master Delegation Brief (v1.0)

**To:** Comet, Valentine, Supergork, ChatGPT, Gemini, Ollama, Gork (iOS)
**From:** Antigravity (Infrastructure Architect)
**Subject:** Handoff of Storage v1.2 & Build Instructions
**Date:** 2025-12-13

---

## 🛑 CRITICAL OPERATIONAL CONSTRAINT
**Current System Status:** 🔴 **STORAGE RED** (<10% Free)
**Action:** `Code Life` offload is currently running.
**Rule:** **DO NOT** initiate large package installations (`npm install`), Docker builds, or Model downloads until the system returns to **GREEN/YELLOW**.
**Check Command:** `./00_Projects/Orchestration_Hub/protocols/protocol_inspector.py --action check_health`

---

## 🏗️ Mission: Continue Building AILCC

The Storage Layer is now "Alliance-Grade" (Policy-Driven). Your mandate is to build the application and intelligence layers on top of this foundation.

### 1. 🌌 Comet & Valentine (Orchestration & Dashboard)
**Role:** Interface & System State
**Tasks:**
*   **Storage Widget:** Connect the Dashboard to the new `storage_protocol.json`.
    *   *Source:* `dashboard/pages/api/system/storage.ts`
    *   *Display:* Real-time "Health Traffic Light" (Green/Yellow/Red).
*   **Visual Alert:** If Status = RED, the Dashboard should flash/lock new project creation UI.

### 2. 🧠 Supergork & Gork (iOS) (Research & Context)
**Role:** Knowledge Retrieval & "Scholar Mode"
**Tasks:**
*   **Mobile Interface:** Use "Valentine" on iOS to query system status.
    *   *Prompt:* "Valentine, check Antigravity Storage Health." -> Returns Snapshot.
*   **Scholar Mode:** Ensure `scholar_mode` workflow respects the new `read_only_paths` in `storage_safety.md`. Do not write research logs to the root directory; use `~/02_Resources/Knowledge_Bank`.

### 3. 🤖 Gemini & ChatGPT (Coding & Implementation)
**Role:** Heavy Lifting & Refactoring
**Tasks:**
*   **Refactor Logs:** Update existing Python/Node scripts to write logs to `~/AILCC_PRIME/03_Archives/LOGS` instead of local folders.
*   **Project Scaffolding:** Update `create_project` scripts to check `project_start_gate.md` before execution.
*   **Cleanup Integration:** When finishing a coding task, propose running `system_cleanup.sh` if temporary files were created.

### 4. 🦙 Ollama (Local Inference)
**Role:** AI Compute
**Tasks:**
*   **Model Path:** Verify `OLLAMA_MODELS` environment variable points to `/Volumes/LaCie/AI_MODELS` (External) to save SSD space.
*   **Config:** Do not pull new weights (e.g., Llama 3) until Storage Health is GREEN.

---

## 📜 Protocol Reference (For All Agents)

All agents must ingest and adhere to these documents:

1.  **Contract:** `~/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/storage_protocol.json`
2.  **Safety Rules:** `~/AILCC_PRIME/.agent_rules/storage_safety.md`
3.  **Runbook:** `~/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/system_runbook.md`

**Antigravity Status:** *Standing by for Infrastructure Maintenance.*
