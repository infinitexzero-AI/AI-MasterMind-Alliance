# 📖 The Spell Book (Command Library) v1.0

The "Spell Book" stores recurring, high-impact commands designed for an intuitive environment based on your usage patterns.

## 🔮 Command Schema

| Field | Description |
| :--- | :--- |
| `name` | Human-readable name (e.g., "Full System Sync"). |
| `trigger` | CLI or Webhook alias. |
| `target` | The agent or system component executing the spell. |
| `spell_string` | The actual executable code/command. |

## 🧪 Initial Spells

| Name | Trigger | Target | Effect |
| :--- | :--- | :--- | :--- |
| **Pulsar Sync** | `spell_sync` | Antigravity | Syncs all local markdown state to knowledge.db. |
| **Evidence Scan** | `spell_scan` | Comet | Initiates MTA email search parameters. |
| **Judge Audit** | `spell_audit` | Grok | Streams the last 100 log lines for strategic review. |
| **Nexus Reboot** | `spell_reboot` | System | Restarts the Orchestrator and core services. |

## 🛠️ Usage

Spells can be cast via:
1. `scripts/cast_spell.py <spell_name>`
2. Nexus Dashboard "Spell Book" widget.
