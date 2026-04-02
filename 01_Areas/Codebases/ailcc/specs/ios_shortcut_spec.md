# iOS Shortcut Spec (Antigravity Bridge)

This shortcut allows you to send tasks from your iPhone directly to your Antigravity dashboard securely.

## Shortcut Setup

1.  **Create New Shortcut** named "Send to Antigravity".
1.  **Open Shortcuts App** on iPhone.
2.  **Create New Shortcut**.
3.  **Add Action**: "Dictate Text" (optional) or "Ask for Input".
4.  **Add Action**: "Get Contents of URL".
5.  **Method**: POST.
6.  **URL**: `https://<YOUR_NGROK_URL>/api/tasks/create`.
7.  **Headers**:
    *   `Content-Type`: `application/json`
    *   `X-API-Key`: `<YOUR_API_KEY>`
8.  **Request Body**: JSON.
    *   `title`: (Provided Input)
    *   `priority`: "medium" (or ask user)
    *   `source`: "iphone"
    *   `targetAgent`: "OmniRouter"

## Validation

1.  Make sure your iPhone and Mac are on the same WiFi network.
2.  Run the shortcut.
3.  Check the Dashboard "Command Console" to see the task appear.

## Usage Ideas

*   **"Agent Brain Dump":** Dictate text via Siri, pass it as the `context` variable.
*   **Action Button:** Map this shortcut to your iPhone 15/16 Action Button.
*   **Focus Mode Trigger:** Run this shortcut automatically when entering "Work" focus to log a session start.
