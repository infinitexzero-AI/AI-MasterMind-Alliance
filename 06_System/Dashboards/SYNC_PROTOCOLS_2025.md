# 🔄 CROSS-PLATFORM SYNC PROTOCOLS 2025

This document defines the technical handshake for real-time synchronization across the AILCC ecosystem.

---

## 🔗 1. NOTION ↔ ANTIGRAVITY (CNS)
- **Primary Hub**: Notion `COMET Orchestration` page.
- **Sync Trigger**: n8n Webhook on page update or local `git push`.
- **Logic**:
    - Local Markdown files in `AILCC_PRIME` are pushed to a private GitHub repo.
    - GitHub Actions trigger n8n.
    - n8n updates the corresponding Notion blocks.

## 📱 2. IPHONE (GROK) ↔ MACBOOK (TERMINAL)
- **Primary Hub**: iCloud Shared Folder `/Antigravity/logs/`.
- **Sync Logic**:
    - Voice/Text prompts on iPhone are saved to a dedicated Apple Note.
    - Shortcuts app exports the note as `.md` to iCloud.
    - `sync_daemon.py` on MacBook monitors the folder and ingests new prompts into `web_tasks.json`.

## 🤖 3. VALENTINE ROUTING (AGENT HANDOVER)
- **Protocol**: `OMNI-CLASSIFY-v2`
- **Logic**:
    - Input arrives at `web_tasks.json`.
    - Valentine (running via background script or browser agent) classifies mission priority.
    - If `PRIORITY_CRITICAL`, it bypasses the queue and triggers a macOS notification.

---
> [!TIP]
> Use the `creek bone alley slim` sync code to verify connection status on the Nexus Dashboard.
