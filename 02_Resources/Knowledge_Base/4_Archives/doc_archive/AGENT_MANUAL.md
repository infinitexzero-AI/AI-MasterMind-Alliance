# AI Agent Manual: Operating the "Mastermind Alliance"

## Purpose
This document explains to future AI Agents (Claude, Gemini, ChatGPT, etc.) how to navigate and operate within this user's specific system architecture. **Read this before performing complex tasks.**

## 1. Topography (Where am I?)

### Converting "Human Intent" to "File Paths"
- **"School Work"** → `/Users/infinite27/AI-Mastermind-Core/ailcc-framework/modes/mode-1-student`
- **"Career / Business"** → `/Users/infinite27/AI-Mastermind-Core/ailcc-framework/modes/mode-2-professional`
- **"Health / Habits"** → `/Users/infinite27/AI-Mastermind-Core/ailcc-framework/modes/mode-3-life`
- **"System / Automation"** → `/Users/infinite27/AI-Mastermind-Core/ailcc-framework/modes/mode-5-automation`

**⚠️ CRITICAL WARNING**: Do not create new directories at the root level. Always nest within the appropriate `mode` folder.

## 2. Tool Selection Strategy
You are part of a dual-engine system. Choose your tool based on the domain:

### 🟢 Use Google Antigravity (The "Inner Loop")
*When*:** Writing code, detailed debugging, refactoring, repo operations, generating complex artifacts.
*Why*: High-context IDE awareness, multi-agent collaboration, verification capabilities.
*Examples*: "Refactor the authentication logic," "Build a React component," "Analysis of local log archives."

### 🔵 Use Comet Assistant (The "Outer Loop")
*When*: Web research, interacting with SaaS (Linear, GitHub Web), filling forms, scheduling, calendar management.
*Why*: Native browser control, ability to multitask across tabs.
*Examples*: "Find the documentation for Tailwind v4," "Create a ticket in Linear," "Summarize this PDF."

## 3. The "Valentine" Protocol
If the user mentions "Valentine," they are referring to the **Orchestration Layer**.
- **Logs**: Check `/Users/infinite27/logs/valentine.log` first if something is broken.
- **Codebase**: The core logic is in `AI-Mastermind-Core/AI-Mastermind-Core/project-root`.
- **Task**: When asked to "Check Valentine," run the system check script:
  ```bash
  python3 /Users/infinite27/AI-Mastermind-Core/AI-Mastermind-Core/project-root/scripts/system_check.py
  ```

## 3. Interaction Standards

### Coding Style
- **Python**: Use snake_case. Type hinting is mandatory (`def func(a: int) -> int:`).
- **JavaScript/React**: Functional components. Use TailwindCSS (if available) or CSS Modules.

### Memory & Persistence
- **TaskBoard**: The central source of truth for tasks is `TaskBoard.csv`. **Do not keep tasks in your context window only.** Write them to the board.
- **System Profile**: Always verify hardware constraints in `SystemProfile.markdown` before suggesting tools (e.g., do not suggest CUDA libraries for this M2 Mac).

## 4. Troubleshooting Guide

**If you trigger an "Intel Processing Failed":**
1. Check internet connectivity (this user relies on cloud sync).
2. Verify API keys in `config.env`.
3. Retry the operation with exponential backoff.

**If you cannot find a file:**
1. Rerun `find` solely within `ailcc-framework`.
2. The user has a complex nested structure; do not assume standard paths like `~/Documents/Project`.

## 5. The "Prime Directive"
**Optimize for Autonomy.**
The user wants a "Set and Forget" system.
- **Bad**: Asking "Should I save this output?" (Just save it).
- **Good**: "I have saved the output to `mode-2/reports` and updated the index."
