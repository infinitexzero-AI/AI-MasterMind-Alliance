# n8n ↔ Alliance API Integration Spec (v1.0)

**Goal:** Enable n8n workflows to create/update `AllianceArtifact` objects automatically via the PRIME API.

---

## 1. Workflows Overview

### A. Artifact Logger (Triggered by Webhook)

* **Trigger:** HTTP POST (Webhook) from Antigravity/Comet.
* **Action:** Validates JSON schema -> POSTs to PRIME API.
* **Use Case:** Agent completes a task -> logs it to the Dashboard instantly.

### B. GitHub Sync (Triggered by Commit)

* **Trigger:** GitHub Webhook (`push` to `main`).
* **Action:**
  1. Parse commit message (Regex: `Artifact ID: (.*)`).
  2. Check if Artifact exists in DB.
  3. PUT/PATCH update with new commit hash.
* **Use Case:** Updates "Code" artifacts to "Implemented" status automatically.

### C. System Event Stream (Storage Guardian)

* **Trigger:** `Storage Guardian` workflow (already built).
* **Enhancement:**
  * IF State changes (Green -> Yellow), POST to `/api/artifacts`.
  * Type: `LOG` | `SYSTEM_EVENT`.
* **Use Case:** Dashboard "Activity Feed" shows "Storage dropped to Yellow".

---

## 2. API Requirements (PRIME Backend)

The FastAPI backend must expose these endpoints for n8n:

| Method | Endpoint | Payload | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/artifacts` | `AllianceArtifact` JSON | Create new artifact |
| `PUT` | `/api/artifacts/{id}` | Partial JSON | Update existing artifact |
| `POST` | `/api/events` | `{ type, message, level }` | Log system event |

---

## 3. Security Model

Since n8n runs locally but communicates via localhost:

1. **API Key:** n8n sends `X-Alliance-Key` header.
2. **Validation:** PRIME API checks against env `ALLIANCE_API_KEY`.

---

## 4. Implementation Plan

1. **Antigravity:** Implement `/api/artifacts` POST/PUT in `main.py`.
2. **User:** Import `storage_guardian.json` into n8n.
3. **Antigravity:** Create `artifact_logger.json` for n8n.
