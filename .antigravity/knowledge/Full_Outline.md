# AI Mastermind Alliance: System Capabilities & Agent Roster

## 1. Agent Roster & Capabilities

### 🧠 Antigravity (The Architect)
*   **Role:** Primary autonomous pair-programmer and task executor.
*   **Core Abilities:**
    *   Complex coding & refactoring.
    *   System command execution (terminal).
    *   File system manipulation.
    *   Browser automation (via sub-agent).
    *   Tool use (MCP servers: GitKraken, CloudRun, Linear).
*   **Specialization:** Deep workspace integration, "hands-on" development.

### ☄️ Comet Assist (The Supervisor)
*   **Role:** Multi-agent supervisor, research coordinator, and quality assurance.
*   **Core Abilities:**
    *   **Verification:** Validates output from other agents (accuracy, safety, completeness).
    *   **Research:** Real-time web research & fact-checking.
    *   **Routing:** Dispatches tasks to appropriate agents (Claude vs. OpenAI vs. Grok).
    *   **Cost/Rate Monitoring:** Tracks token usage and API costs; prevents overruns.
    *   **Escalation:** Triggers human review for critical failures or high-risk decisions.
*   **Key Workflows:** `web_research`, `incident_escalation`, `task_verification`.

### 🧠 Claude (The Analyst)
*   **Role:** Deep analysis, code generation, and security auditing.
*   **Core Abilities:**
    *   **Architecture Review:** Analyzes code structure, design patterns, and scalability.
    *   **Code Generation:** Produces production-ready TypeScript/Python modules.
    *   **Security Auditing:** Checks for OWASP vulnerabilities and data protection issues.
    *   **Documentation:** Generates comprehensive API docs and guides.
*   **Prompts:** `C1_Code_Architecture_Review`, `C3_Security_Audit`, `C2_Generate_TS_Module`.

### ⚡ OpenAI / ChatGPT (The Accelerator)
*   **Role:** Rapid task execution, summarization, and integration.
*   **Core Abilities:**
    *   **Quick Tasks:** Fast code snippets and general Q&A.
    *   **Summarization:** Condensing long contexts or logs.
    *   **Integration:** Generating commit messages, changelogs, and syncing with tools like Linear.
*   **Prompts:** `T1_Git_Commit_Gen`, `T2_Linear_Issue_Sync`.

### 🧠 Grok (The Reasoner)
*   **Role:** Multi-step logical reasoning and experimental problem solving.
*   **Core Abilities:**
    *   **Complex Reasoning:** Breaking down multi-faceted problems into logical steps.
    *   **Experimental Design:** Proposing novel/unconventional solutions.
    *   **Adversarial Analysis:** "Red teaming" systems to find weaknesses.
*   **Prompts:** `G1_Complex_Problem_Solving`, `G3_Adversarial_Analysis`.

### 🔍 Perplexity (The Researcher)
*   **Role:** Deep dive information gathering and landscape analysis.
*   **Core Abilities:**
    *   **Fact Verification:** Cross-referencing claims with authoritative sources.
    *   **Market/Tech Research:** Analyzing trends, competitors, and regulatory requirements.
*   **Prompts:** `P1_Fact_Verification`, `P2_Tech_Landscape`.

---

## 2. Full Software & App Stack

### Frontend (Dashboard & Interfaces)
*   **Framework:** React (TypeScript) / Next.js.
*   **Components:**
    *   **System HUD:** Real-time system status monitoring.
    *   **Live Agent Feed:** Visual log of agent activities and inter-agent communication.
    *   **Physics Canvas:** Interactive visual elements (gravity system).
    *   **Antigravity Panel:** Direct interface for controlling the primary agent.
*   **Styling:** Tailwind CSS (implied), Physics-based animations.

### Backend (Orchestration & Logic)
*   **Runtime:** Node.js (Primary), Python (Scripting/Bridge).
*   **Key Services:**
    *   **Relay Server:** WebSocket server for real-time frontend-backend communication (Port 3001).
    *   **Orchestration Engine:** Python scripts (`antigravity.py`, `antigravity_ollama_bridge.py`) for managing local LLMs and agent logic.
    *   **Middleware:** Express.js (implied for API endpoints).

### Infrastructure & Integration
*   **Tooling Protocol:** MCP (Model Context Protocol) connecting:
    *   **GitKraken:** Git operations (commit, log, blame, PRs).
    *   **CloudRun:** Google Cloud deployment.
    *   **Linear:** Project management (Issue tracking).
*   **Automation:** `n8n` for workflow automation (webhooks, data piping).
*   **CI/CD:** GitHub Actions (Self-hosted runner capability).
*   **Local AI:** Ollama (for running local models).

---

## 3. Orchestration & Workflows

### Mode 6: The "Brain" Loop
A structured automation loop that:
1.  **Classifies Intent:** Determines what the user wants (Code vs. Research vs. Debug).
2.  **Dispatches Agents:** Routes the task to the best-suited agent (e.g., Grok for logic, Claude for coding).
3.  **Executes:** Agents perform the work (Real API calls or Mock mode).
4.  **Verifies (Comet):** Comet Assist checks the output against quality criteria.
5.  **Stores/Responds:** Saves result to memory and presents to user.

### Event Routing System
*   **Events:** `task-pending`, `task-complete`, `task-failed`, `escalation`.
*   **Flow:**
    *   Task Complete -> **Comet Verification**
    *   (Approve) -> Memory Store
    *   (Reject) -> Retry/Secondary Agent
    *   (Critical Fail) -> **Human Escalation**

### Prompt Library Integration
*   A standardized library (`MULTI_AGENT_PROMPT_LIBRARY.md`) ensures all agents use optimized, production-tested prompts for consistency.
*   **Categories:** Research, Code Analysis, Orchestration, Reasoning, Integration, QA.

---

## 4. Current Operational Status
*   **Active Features:** WebSocket Relay, Dashboard Visualization, MCP Tooling.
*   **In Progress:** "Scholar Mode" wiring, "Motor Cortex" (n8n hooks), Full "Life OS" integration.
*   **Maintenance:** Diagnostic tools (`ailcc-diagnostic.html`) available for health checks.
