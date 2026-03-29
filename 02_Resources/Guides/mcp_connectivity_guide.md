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

## 📡 Browser Assistant Integration (SSE Proxy)

The Gemini browser assistant requires a Server-Sent Events (SSE) bridge to communicate with local MCP servers.

| Component | Endpoint | Port | Status |
| :--- | :--- | :--- | :--- |
| **MCP Proxy** | `http://localhost:3006/sse` | 3006 | ✅ Active |

### Proxy Commands
Integrated via `mcp_proxy.sh` using localized binaries to bypass registry errors:
- **Linear**: `mcp-remote https://mcp.linear.app/sse`
- **GitHub**: `server-github` (local cache)
- **Git**: `gk mcp` (GitKraken)
- **CloudRun**: `cloud-run-mcp`

## 🧠 Neural Relay
The system uses a WebSocket relay server (`relay.js`) on port **3001** for inter-agent signaling.

## 🆘 Troubleshooting
- **SSE Error**: Ensure the proxy is running (`lsof -i :3006`).
- **Missing Tools**: Check `config.json` absolute paths.
- **Disconnected**: Refresh the "MCP SuperAssistant" panel in Gemini.

---
**Last Updated**: 2025-12-27
**Status**: Mode 5 (Automated Abundance) - MCP Bridge Fully Restored
