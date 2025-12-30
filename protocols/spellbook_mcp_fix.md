# 🧙‍♂️ SPELL: The "Silver Bullet" Bridge Repair

**Use Case:** Claude Desktop (or any MCP app) fails to connect to local tools because it can't find `npx` (silent failure), and you are out of messages to debug it.
**Why it works:** It bypasses the system's "path" confusion and forces the app to look exactly where NVM hides the Node executable.

## Step 1: Locate the Hidden Path
Run this in Terminal to find where your current Node version is actually hiding.
\`\`\`bash
which npx
\`\`\`
*(Copy the output path. Example: `/Users/infinite27/.nvm/versions/node/v24.11.1/bin/npx`)*

## Step 2: Cast the Hardlink (Overwrite Config)
Paste this block into Terminal. **IMPORTANT: Replace `YOUR_PATH_FROM_STEP_1`** with the path you copied above.

\`\`\`bash
cat <<INNER_EOF > ~/Library/Application\ Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "AILCC_PRIME_Filesystem": {
      "command": "YOUR_PATH_FROM_STEP_1",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/infinite27/AILCC_PRIME"
      ]
    }
  }
}
INNER_EOF
\`\`\`

## Step 3: The Hard Reset
1. **Quit App:** `CMD + Q` (Red X is not enough; fully quit from menu bar).
2. **Relaunch.**
3. **Verify:** Look for the **Plug Icon (🔌)** near the input bar.
