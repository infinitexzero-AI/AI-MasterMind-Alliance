# Life OS Integration: Gemini & Comet Sync

## Goal Description
Integrate `Antigravity` (Gemini) into the AI Mastermind Alliance "Life OS" by establishing a bidirectional sync with the `Comet` agent and the `Dashboard`. This enables Antigravity to receive tasks planed by Comet and push status updates to the System HUD.

## User Review Required
*   **Bridge Script:** A new Python script `antigravity_bridge.py` will be created to act as the interface for me (Antigravity) to talk to the Relay Server.
*   **Port 3001:** Confirmation that the Relay Server is running on port 3001 (standard per previous docs).

## Proposed Changes

### 1. New Bridge Component
#### [NEW] [antigravity_bridge.py](file:///Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/comet_framework/antigravity_bridge.py)
*   **Purpose:** Connect to `ws://localhost:3001` as a client.
*   **Functionality:**
    *   `send_message(type, payload)`: Utility to broadcast messages.
    *   `listen()`: Optional loop to print incoming tasks (for me to read via `command_status`).
    *   **CLI Mode:** Allow one-off execution: `python3 antigravity_bridge.py --broadcast "Plan Update"`

### 2. Comet Enhancements
#### [MODIFY] [orchestration_engine.py](file:///Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/comet_framework/orchestration_engine.py)
*   Add handler for `ANTIGRAVITY_UPDATE` messages.
*   Log interactions with Gemini/Antigravity.

### 3. Dashboard Updates
#### [MODIFY] [dashboard/src/components/SystemHUD.tsx](file:///Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/src/components/SystemHUD.tsx)
*   Add "Gemini" indicator to the status array (alongside Comet, Relay, etc.).
*   Listen for `ANTIGRAVITY_HEARTBEAT`.

## Verification Plan

### Automated Verification
*   **Bridge Test:** Run `python3 comet_framework/antigravity_bridge.py --ping`.
    *   *Expectation:* Relay logs connection; Dashboard HUD shows "Gemini Online".
*   **Comet Sync:** Send a task from Comet `orchestration_engine.py` (simulated) and verify `antigravity_bridge.py` receives it.

### Manual Verification
*   **Dashboard Check:** User verifies "Gemini" appears in the System HUD.
*   **Visual Confirmation:** "Life OS" mode active (if UI toggle exists).
