# AI Mastermind Alliance (AIMmA) - System Manifest v20.0

This document serves as the true north for the architecture, active ports, and core daemons of the fully autonomous AI Mastermind Alliance system as of Phase 20 (Recursive Evolution).

## 🌍 The Sovereign Ecosystem

### 🧠 The Core Intelligence (Nexus & Hub)
- **Valentine Core (chatgpt-proxy)**: The primary routing engine and task distributor. Supports GPT-4o, Claude 3, Grok 4.20 (Failover), and Gemini.
- **MastermindHub (Nexus Dashboard)**: The unified command interface displaying the UI, 3D Object Knowledge Graph, real-time Telemetry, and Tycoon financial status.
- **Relay.js (The Neural Uplink)**: Handles real-time Socket.io bi-directional messaging between the dashboard, daemons, and mobile devices.

### 📚 The Memory Layer (Hippocampus)
- **ChromaDB (Vector Store)**: Persistent mult-vector storage for long-term document recall and RAG.
- **Redis (State & Pub/Sub)**: Handles the `NEURAL_SYNAPSE` event streams, cross-agent coordination, and active dashboard state.
- **Intelligence Vault (`/AILCC_VAULT`)**: The cloud-synced text repository for all permanent Knowledge Items (KIs).

### 🤖 The Autonomous Daemons (Execute & Correct)
- **The Conductor (`the_conductor_daemon.py`)**: Schedules tasks based on physiological state (Whoop/Health data).
- **Wealth Executor (`wealth_executor.py`)**: Manages biometric-gated capital surplus deployments.
- **Bank CSV Parser & NSLSC Reconciliator**: Auto-ingests and balances academic debt vs personal burn-rates.
- **Autonomy Optimizer (Ω)**: Monitors confidence levels in the Synapse stream and proposes instructions / registry upgrades for failing agents.
- **Singularity Engine (`singularity_engine_daemon.py`)**: Continuously parses the Intelligence Vault to dream up and propose new development phases via the OmniTracker.
- **Sovereign Logic Bridge**: A secured sandbox environment allowing the system to auto-generate, execute, and verify its own Python scripts.

## 🔌 Port Map & Registry

| Service | Protocol | Port | Description |
|---|---|---|---|
| **Nexus Dashboard** | HTTP | `3000` | The user's visual control center (React/Next.js) |
| **Valentine Relay** | HTTP/WS | `3001` | Socket.io stream (`NEURAL_SYNAPSE`, health telemetry) |
| **Valentine Core** | HTTP | `8080` | AI routing brain (chatgpt-proxy) |
| **Redis Memory** | TCP | `6379` | High-speed cache and intent Pub/Sub |
| **ChromaDB** | HTTP | `8000` | Vector Database for RAG semantic search |
| **Graph Backend** | HTTP | `8000/system/graph` | Synthesis endpoint for 3D Knowledge Graph |
| **Playwright Comet** | HTTP | `3333` | Native headless browser bridge |
| **Zotero Integrator**| HTTP | `23119`| Local academic citation integration |

## 🛡️ Failsafes & Safe Mode

The system relies on a `Safe Mode` toggle to prevent recursive, unchecked modifications.
When safe mode is active, the Autonomy Optimizer (Ω) and Singularity Engine operate in **Read-Only (Proposal) Mode**. They will inject suggestions to the OmniTracker via `pending_approval` rather than autonomously rewriting source files or executing wealth distributions.

### To Launch in Safe Mode:
```bash
./launch_cortex.sh --safe
```

> **"Autonomy is not the absence of control, but the perfection of delegation."**
