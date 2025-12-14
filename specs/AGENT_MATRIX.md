# Alliance Agent Specialization Matrix (v1.0)

**Purpose:** Optimal routing of tasks to the most capable agent.
**Usage:** Consult this matrix before delegating a new `Handbook` item.

---

## 🤖 The Agents

| Agent | Core Strength | Primary Domain | Avoid For |
| :--- | :--- | :--- | :--- |
| **Antigravity** | **Execution** | Codebase mutation, Shell ops, File I/O, UI Implementation | Abstract philosophizing, Open-ended brainstorming |
| **Claude Desktop** | **Architecture** | Complex System Design, React/TS Expert Refactoring, Documentation | Real-time Web Search, Direct Shell Execution (limited) |
| **Comet (Perplexity)**| **Research** | Finding libraries, Debugging obscure errors, Market analysis | Writing Production Code, Modifying Local Files |
| **Gork (Celestial)** | **Insight** | Crypto/Market data, Unfiltered opinion, Research synthesis | Multi-step Coding Workflows |
| **n8n (Guardian)** | **Automation** | Recurring Tasks, Webhooks, API Glue, Alerts | Creative Writing, Complex Logic Branching |
| **ChatGPT/Gemini** | **Generalist** | Drafting text, Ideation, Quick Explanations | Mission-Critical Engineering (Hallucination risk) |

---

## 🚦 Task Routing Guide

### 1. "I need to build a new feature."
*   **Step 1 (Plan):** **Claude Desktop** -> Create Spec & Architecture.
*   **Step 2 (Research):** **Comet** -> Find best libraries/docs.
*   **Step 3 (Build):** **Antigravity** -> Scaffold, Code, Test.

### 2. "I see a weird error in the logs."
*   **Option A:** **Antigravity** -> Fetch logs, search codebase.
*   **Option B:** **Comet** -> Paste error to find similar StackOverflow issues.

### 3. "Monitor this price/status/server."
*   **Sole Owner:** **n8n**. Do not ask chat agents to "monitor" things; they sleep.

### 4. "Draft a blog post / email."
*   **Drafting:** **ChatGPT** or **Claude**.
*   **Fact Checking:** **Comet**.

---

## 🔄 Handoff Patterns

*   **Comet -> Antigravity:** Comet finds the URL/Doc -> Antigravity implements the API.
*   **Claude -> Antigravity:** Claude writes the High-Level Plan -> Antigravity executes step-by-step.
*   **Antigravity -> n8n:** Antigravity builds the API -> n8n calls the API on a schedule.

---

**Last Updated:** Dec 13, 2025
**Maintained By:** Antigravity
