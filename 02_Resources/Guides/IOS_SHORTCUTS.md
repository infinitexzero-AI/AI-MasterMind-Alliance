# iOS Clipboard Sync via Apple Shortcuts

To enable clipboard persistence on your iPhone or iPad, follow these steps to create two Apple Shortcuts.

## Prerequisite: AILCC API URL

Your AILCC Dashboard must be accessible from your local network.
Assuming your Macbook's local IP is `192.168.1.X`, your API endpoint will be:
`http://192.168.1.X:3000/api/clipboard/history`

---

## 1. Shortcut: "Sync to AILCC"

This shortcut sends your current iPhone clipboard to the Macbook.

### Sync Steps

1. Open the **Shortcuts** app and create a new shortcut.
2. Add the action: **Get Clipboard**.
3. Add the action: **Get Dictionary from Input** (optional, but helps structure the JSON).
   - Key: `content`, Value: `Clipboard`
   - Key: `source`, Value: `iphone` (or `ipad`)
4. Add the action: **Get Contents of URL**.
   - URL: `http://[YOUR_IP]:3000/api/clipboard/history`
   - Method: **POST**
   - Headers: `Content-Type: application/json`
   - Request Body: **JSON**
     - Dictionary: (The dict created in step 3)
5. **Tip**: Add this to your home screen or as a "Back Tap" gesture for instant syncing.

---

## 2. Shortcut: "Fetch from AILCC"

This shortcut retrieves the last items from your Macbook and lets you choose one to copy.

### Fetch Steps

1. Open the **Shortcuts** app and create a new shortcut.
2. Add the action: **Get Contents of URL**.
   - URL: `http://[YOUR_IP]:3000/api/clipboard/history`
   - Method: **GET**
3. Add the action: **Get Dictionary from Input**.
4. Add the action: **Get Value for `data` in Dictionary**.
5. Add the action: **Repeat with Each** (to iterate through the history items).
   - Inside: **Get Value for `content` in Repeat Item**.
6. Add the action: **Choose from List** (using the repeats as input).
7. Add the action: **Copy to Clipboard** (with the chosen choice).
8. Add the action: **Show Notification** (e.g., "Copied to iPhone clipboard").

---

## 3. Advanced Automation (Optional)

You can set an automation in the Shortcuts app to run "Sync to AILCC" every time you close a specific app, or at certain times of the day, although iOS restricts fully silent background clipboard access for security reasons. Manual triggers or "Back Tap" are recommended.
