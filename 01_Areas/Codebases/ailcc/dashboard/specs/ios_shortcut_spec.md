# Nexus Voice Uplink - iOS Shortcut Spec

This shortcut enables voice control for the Agent System. It dictates your speech and sends it to the NEXUS API as a "Voice Task".

## Configuration

- **API Endpoint**: `http://YOUR_MAC_IP:3000/api/chat` (Or local network IP)
- **API Key**: `antigravity_dev_key`
- **Method**: `POST`

## Shortcut Workflow

1. **Dictate Text**
   - *Language*: English (US)
   - *Stop Listening*: On Short Pause

2. **Get Contents of URL**
   - *URL*: `http://YOUR_LOCAL_IP:3000/api/chat`
   - *Method*: POST
   - *Headers*:
     - `Content-Type`: `application/json`
     - `X-API-Key`: `antigravity_dev_key`
   - *Request Body (JSON)*:
     - `message`: (Select "Dictated Text" variable)
     - `role`: `user`
     - `source`: `voice`

3. **Show Notification**
   - *Title*: Nexus Uplink
   - *Body*: "Command Sent: [Dictated Text]"
   - *Play Sound*: Yes

## Installation

1. Open **Shortcuts App** on iPhone.
2. Tap `+` to create new.
3. Add "Dictate Text".
4. Add "Get Contents of URL" and configure as above.
5. Rename to **"Hey Nexus"** or **"Upload Command"**.
6. Add to Home Screen for quick access.
