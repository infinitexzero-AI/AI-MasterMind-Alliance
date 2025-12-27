# MCP Connectivity Guide: AI Mastermind Alliance (AIMmA)

This guide documents the Model Context Protocol (MCP) infrastructure that powers the AIMmA system, enabling seamless interaction between AI agents and local/remote resources.

## 🚀 Active MCP Servers

The following MCP servers are currently configured and verified:

| Server | Role | Status | Path/Command |
| :--- | :--- | :--- | :--- |
| **GitKraken (Git)** | Local git operations & status | ✅ Active | `server-git` (via npx) |
| **Linear** | Task & issue tracking | ✅ Active | `server-linear` (via npx) |
| **CloudRun** | GCP deployment & management | ⚠️ Pending Test | `server-cloudrun` |
| **Filesystem** | Local file access for agents | ✅ Active | `server-filesystem` |

## 🛠️ Configuration Details (Claude Desktop)

Configuration is located at `~/Library/Application Support/Claude/claude_desktop_config.json`.

### Environment Variables

- `LINEAR_API_KEY`: Required for Linear integration.
- `AILCC_ROOT`: `/Users/infinite27/AILCC_PRIME` (Primary context).

### Allowed Paths (Filesystem)

- `/Users/infinite27/AILCC_PRIME`
- `/Users/infinite27/ailcc-framework`

## 🧠 Agent Interaction Model

The Alliance uses a "Neural Connectivity Mesh" where different agents play specialized roles:

1. **Claude (The Architect)**: Uses MCP for local filesystem management, Git operations, and task tracking (Linear).
2. **Comet (The Scout)**: Uses the browser and potentially WebSockets to relay information to the **NEXUS Dashboard**.
3. **Gemini (The Craftsman)**: Primary implementation agent, utilizing Antigravity's built-in MCP bridge.
4. **Grok (The Judge)**: Strategic reasoning, monitoring logs via the shared filesystem.

## 📡 Neural Relay

The system uses a WebSocket relay server (`relay.js`) on port **3001** to bridge real-time agent signals to the **NEXUS Dashboard** (port 3000).

## 🆘 Troubleshooting

- **Server Not Responding**: Restart the Claude Desktop app or the corresponding Node.js process.
- **Permission Denied**: Ensure the path is included in the `filesystem` server configuration.
- **API Errors**: Verify API keys in `claude_desktop_config.json`.

---
**Last Updated**: 2025-12-27
**Status**: Mode 5 (Automated Abundance)
