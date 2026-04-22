text
# AI Mastermind Team

> Cross-platform AI collaboration system enabling multiple AI agents to coordinate complex tasks across Google Workspace, Microsoft 365, and Apple iCloud.

## 🚀 Quick Start

cat TaskBoard.csv # View current tasks
cat RolesAndProtocols.md # Review agent roles
ls -la # Check project structure

text

## 👥 Team Members

- **SuperGrok** (xAI): Task execution, automation, system operations, logging
- **Perplexity Comet**: Web research, real-time data retrieval, fact-checking
- **Claude Desktop**: Documentation, analysis, problem-solving, Mac integration
- **Valentine**: Task orchestration, coordination, status updates, hand-offs
- **Human**: Oversight, final approvals, sensitive operations, escalations

## 📋 Current Status

- ✅ **T001**: Setup Core Infrastructure - COMPLETED (2025-10-24)
- 🔄 **T004**: Generate Documentation (Claude) - IN PROGRESS
- 📌 **T002**: Configure Google Drive API (SuperGrok) - PENDING
- 📌 **T003**: Research AI Best Practices (Perplexity) - PENDING
- 📌 **T005-T008**: See TaskBoard.csv for details

## 📚 Documentation

- [RolesAndProtocols.md](RolesAndProtocols.md) - Agent roles and API integrations
- [TaskBoard.csv](TaskBoard.csv) - Live task tracking
- [workflows_guide.md](docs/workflows_guide.md) - Collaboration patterns

## 🔧 Technical Setup

**Prerequisites:** macOS/Linux/Windows, Python 3.8+, Git, API credentials

**Installation:**
cd ~/AI-Mastermind-Core
pip install -r requirements.txt
python automations.py

text

## Agent Collaboration Workflows

### Core Workflow Principles

1. **TaskBoard-Driven Coordination**
   - All agents check `TaskBoard.csv` for assignments
   - Status updates: Not Started → In Progress → Completed
   - Dependencies tracked to prevent blocking

2. **Transparent Communication**
   - Actions logged in `logs/system_sync_report.md`
   - Status changes notify Valentine
   - Escalations follow defined paths

3. **Autonomous Execution**
   - Agents work independently within scope
   - Hand-offs at defined checkpoints
   - Human approval for sensitive operations

### Task Lifecycle

Created → TaskBoard.csv updated

Assigned → Agent reviews dependencies

In Progress → Work begins, logging active

Completed → Status updated, Valentine notified

Verified → Human/Valentine review

Archived → Logged in system reports

text

### Coordination Patterns

**Sequential:** Claude (Docs) → SuperGrok (Implementation) → Valentine (Verification)  
**Parallel:** SuperGrok (API) + Perplexity (Research) → Valentine (Consolidation)  
**Escalation:** Agent (Blocked) → Valentine (Coordination) → Human (Decision)

## 🔐 Security

- Credentials in `credentials/` (gitignored)
- OAuth tokens secured (`token.json` - 600 permissions)
- API keys in environment variables only
- `.gitignore`: `*.env`, `credentials/`, `token.json`

## 🔗 API Integrations

Google Workspace, Microsoft 365, Apple iCloud, Zapier, xAI API, Perplexity API

## 📞 Support

Technical Issues → SuperGrok | Research → Perplexity | Documentation → Claude | Workflow → Valentine | Critical → Human

---

**Status**: Active Development | **Updated**: Oct 24, 2025 | **License**: Internal

# AI Mastermind Team

> Cross-platform AI collaboration system enabling multiple AI agents to coordinate complex tasks across Google Workspace, Microsoft 365, and Apple iCloud.

## 🚀 Quick Start


cat TaskBoard.csv # View current tasks
cat RolesAndProtocols.md # Review agent roles
ls -la # Check project structure

text

## 👥 Team Members

- **SuperGrok** (xAI): Task execution, automation, system operations, logging
- **Perplexity Comet**: Web research, real-time data retrieval, fact-checking
- **Claude Desktop**: Documentation, analysis, problem-solving, Mac integration
- **Valentine**: Task orchestration, coordination, status updates, hand-offs
- **Human**: Oversight, final approvals, sensitive operations, escalations

## 📋 Current Status

- ✅ **T001**: Setup Core Infrastructure - COMPLETED (2025-10-24)
- 🔄 **T004**: Generate Documentation (Claude) - IN PROGRESS
- 📌 **T002**: Configure Google Drive API (SuperGrok) - PENDING
- 📌 **T003**: Research AI Best Practices (Perplexity) - PENDING
- 📌 **T005-T008**: See TaskBoard.csv for details

## 📚 Documentation

- [RolesAndProtocols.md](RolesAndProtocols.md) - Agent roles and API integrations
- [TaskBoard.csv](TaskBoard.csv) - Live task tracking
- [workflows_guide.md](docs/workflows_guide.md) - Collaboration patterns

## 🔧 Technical Setup

**Prerequisites:** macOS/Linux/Windows, Python 3.8+, Git, API credentials

**Installation:**
cd ~/AI-Mastermind-Core
pip install -r requirements.txt
python automations.py

text

## Agent Collaboration Workflows

### Core Workflow Principles

1. **TaskBoard-Driven Coordination**
   - All agents check `TaskBoard.csv` for assignments
   - Status updates: Not Started → In Progress → Completed
   - Dependencies tracked to prevent blocking

2. **Transparent Communication**
   - Actions logged in `logs/system_sync_report.md`
   - Status changes notify Valentine
   - Escalations follow defined paths

3. **Autonomous Execution**
   - Agents work independently within scope
   - Hand-offs at defined checkpoints
   - Human approval for sensitive operations

### Task Lifecycle

Created → TaskBoard.csv updated

Assigned → Agent reviews dependencies

In Progress → Work begins, logging active

Completed → Status updated, Valentine notified

Verified → Human/Valentine review

Archived → Logged in system reports

text

### Coordination Patterns

**Sequential:** Claude (Docs) → SuperGrok (Implementation) → Valentine (Verification)  
**Parallel:** SuperGrok (API) + Perplexity (Research) → Valentine (Consolidation)  
**Escalation:** Agent (Blocked) → Valentine (Coordination) → Human (Decision)

## 🔐 Security

- Credentials in `credentials/` (gitignored)
- OAuth tokens secured (`token.json` - 600 permissions)
- API keys in environment variables only
- `.gitignore`: `*.env`, `credentials/`, `token.json`

## 🔗 API Integrations

Google Workspace, Microsoft 365, Apple iCloud, Zapier, xAI API, Perplexity API

## 📞 Support

Technical Issues → SuperGrok | Research → Perplexity | Documentation → Claude | Workflow → Valentine | Critical → Human

---

**Status**: Active Development | **Updated**: Oct 24, 2025 | **License**: Internal

# AI Mastermind Team - Project Master Plan

## Project Overview
A cross-platform AI collaboration system enabling seamless task execution, data sharing, and automated workflows across multiple AI agents (SuperGrok, Perplexity Comet, Claude Desktop, Valentine) and cloud platforms (Google Workspace, Microsoft 365, Apple iCloud).

## Goals
- Enable multiple AI agents to collaborate on complex tasks
- Automate workflows across Google Workspace, Microsoft 365, iCloud
- Centralized task tracking and status monitoring
- Secure API integration and data synchronization

## Collaborators
- **SuperGrok**: Task analysis, execution, and logging (via xAI)
- **Perplexity Comet**: Web-based research and data retrieval
- **Claude Desktop**: Desktop-based task processing and Mac integration
- **Valentine**: Project orchestration and task hand-off coordination
- **Human Users**: Oversight, task assignment, and escalation handling

## Quick-Start Instructions
1. Clone repository or download files to your Downloads folder
2. Create AI-Mastermind-Core folder structure:
   - docs/
   - automations/
   - templates/
   - logs/
3. Set up cloud storage (Google Drive/OneDrive)
4. Configure API keys in config.env (copy from config.env.template)
5. Run automations.py or automations.js to test system
6. Review TaskBoard.csv for task assignments

## Project Structure
```
AI-Mastermind-Core/
├── README.md
├── TaskBoard.csv
├── TaskTracker.json
├── config.env.template
├── .gitignore
├── package.json
├── requirements.txt
├── docs/
│   └── RolesAndProtocols.md
├── automations/
│   ├── automations.js
│   └── automations.py
├── templates/
└── logs/
    └── system_sync_report.md
```

## Installation

### For Node.js:
```bash
npm install
node automations/automations.js
```

### For Python:
```bash
pip install -r requirements.txt
python automations/automations.py
```
