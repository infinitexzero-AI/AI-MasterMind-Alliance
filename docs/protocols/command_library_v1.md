# 📖 The Spell Book (Command Library) v1.1

The "Spell Book" maps live "Moves" (Workflows) in the AILCC Prime ecosystem to their triggers and targets.

## 🔮 Command Schema

| Field | Description |
| :--- | :--- |
| `name` | Human-readable name (e.g., "Grok strategy session"). |
| `trigger` | CLI or chat command trigger (e.g., `/grok`). |
| `target` | The active agent or system component executing the action. |
| `description` | The specific outcome of the command. |

## 🧪 Live Moves

| Name | Trigger | Target | Description |
| :--- | :--- | :--- | :--- |
| **Grok Session** | `/grok` | Grok (Strategy) | Initiates an interactive strategic session utilizing `scripts/grok_antigravity.py` with dynamic workspace and academic context. |
| **Vanguard Mesh** | `/mesh` | System (Mesh) | Queries status and manages the local Vanguard orchestrator daemons (`scripts/vanguard_bridge.py`). |
| **Dual-Channel Sync** | `/sync` | Git (Repo) | Checks sync status and executes dual-channel synchronization via `scripts/git_sync_agent.py`. |
| **Valentine Mobile** | `/valentine-mobile` | Grok (Mobile) | Interfaces with the iOS Valentine capture and Siri voice-status hook via `procedures/git_sync_voice.txt`. |

## 🛠️ Usage

Cast spells by running the target python/bash scripts directly, or calling them via the command center console.
