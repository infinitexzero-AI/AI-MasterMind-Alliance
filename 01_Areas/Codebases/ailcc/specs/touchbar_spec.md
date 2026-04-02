# MacBook Touch Bar Spec (BetterTouchTool)

## Overview

We will use BetterTouchTool (BTT) to add a "Smart Button" to the MacBook Touch Bar. This button will trigger a `curl` request to the local NEXUS API to create a high-priority task.

## Configuration Steps

1.  **Open BetterTouchTool** and create a new Touch Bar trigger.
2.  **Trigger Type:** "Touch Bar Button".
3.  **Add a New Trigger** (Click `+`).
4.  **Select Trigger:** "Touch Bar Button".

### Button 1: "Spawn Research Agent"

* **Icon:** 🔍 (or custom microscope icon)
* **Label:** Research
* **Color:** `#0EA5E9` (Neon Blue)

    *   **Name:** `invoke_nexus` (or "NEXUS")
    *   **Icon:** (Optional) Choose a futuristic/AI icon.
    *   **Action:** "Execute Terminal Command (Async, not blocking)".

## Command Configuration


### Option A:4.  **Create Helper Script**:
    Create `scripts/touchbar_trigger.sh` for easy testing.

    ```bash
    #!/bin/bash
    # Usage: ./touchbar_trigger.sh "Task Title" [Priority] [Agent]
    ```

### Option B: Raw API Call (Direct)

```bash
curl -X POST "http://localhost:3000/api/tasks/create" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: antigravity_dev_key" \
  -d '{
    "title": "Quick Task from TouchBar",
    "context": "Triggered via BTT",
    "priority": "high",
    "targetAgent": "OmniRouter",
    "source": "touchbar"
  }'
```

## Verification
1. Tap the button on the Touch Bar.
2. Check the Dashboard "Command Console" to see the new task appear immediately.
