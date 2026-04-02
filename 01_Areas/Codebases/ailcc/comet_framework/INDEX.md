# Comet + Antigravity Framework: Master Index

> **Status**: Production Ready
> **Version**: 1.0.0

## 📂 System Manifest

### 1. Documentation
*   **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**: ⚡ **Start Here**. 15-minute deployment guide.
*   **[comet_instructions.md](./comet_instructions.md)**: Defines the "Language" your agents speak.
*   **[GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)**: Security and API key configuration.

### 2. Core Engine
*   **[orchestration_engine.py](./orchestration_engine.py)**: The Python brain. Handles:
    *   `TEK_RESEARCH_001` (Research Synthesis)
    *   `CRYPTO_DASHBOARD_001` (Market Monitoring)
    *   `ADMIN_APPEAL_001` (Document Generation)
*   **[comet-orchestration.yml](./comet-orchestration.yml)**: The heartbeat. Runs the engine every 5 minutes via GitHub Actions.

### 3. Interface
*   **[dashboard.html](./dashboard.html)**: Real-time visualization of agent states.

---

## 🚦 Workflows

| Workflow | Trigger | Agent | Output |
| :--- | :--- | :--- | :--- |
| **TEK Research** | Manual/Schedule | Claude + Perplexity | 3x Poster Layouts (PDF/MD) |
| **Crypto Monitor** | Every 5 min | Grok (Analysis) | Trade Signals / Alerts |
| **Loan Appeal** | On Demand | Standard Logic | Formatted Appeal PDF |

---

## 🛠 Quick Actions

1.  **Configure**: Set up `.env` using `.env.example`.
2.  **Install**: `pip install -r requirements.txt`.
3.  **Run**: `python orchestration_engine.py`.
