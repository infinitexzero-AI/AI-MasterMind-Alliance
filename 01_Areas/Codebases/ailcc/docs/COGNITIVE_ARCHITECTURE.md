# COGNITIVE ARCHITECTURE: AI MASTERMIND ALLIANCE (AIMmA)

## Overview

This document defines the intelligence hierarchy, reasoning protocols, and memory systems of the AI Mastermind Alliance. The architecture is designed to transition from reactive task execution to autonomous, goal-oriented orchestration.

## 1. Intelligence Hierarchy (Roles)

| Role | Agent | Intent |
| :--- | :--- | :--- |
| **Scout** | Comet | Perceptual input, web search, real-time data gathering. |
| **Architect** | Claude / Gemini | Logic, code implementation, structural planning. |
| **Visionary** | Valentine | UI/UX, aesthetics, human alignment, system polish. |
| **The Bridge** | Antigravity | Local filesystem control, terminal execution, system bridging. |
| **Strategist** | Scholar | Academic and financial roadmaps, long-term convergence. |

## 2. ReACT Reasoning Loop

The system operates on an enhanced **Thought-Action-Observation** loop:

1. **Thought (Reasoning)**: Before any action, the Orchestrator reflects on the task description and queries **Semantic Memory** for historical context.
2. **Action (Execution)**: The task is dispatched to the optimal agent role.
3. **Observation (Reflection)**: The result is analyzed for success and potential follow-up actions. Results are persisted to **Episodic Memory**.

## 3. Tiered Memory System

### Working Memory (High Velocity)

- Stores immediate conversational context and current loop state.
- Volatile: Cleared after major task completion or loop resets.

### Episodic Memory (Historical)

- A chronological log of all task outcomes, successes, and failures.
- Location: `mode6_archive.json`.
- Used for: Avoiding repetitive mistakes and learning from previous attempts.

### Semantic Memory (Knowledge Base)

- Structured facts, system protocols, and long-term intelligence.
- Location: `mode6_semantic.json`.
- Used for: Grounding reasoning in verified system truths and the 4-Pillar Taxonomy.

## 4. Delegation Protocol

- **Horizontal Delegation**: Agents of similar tier sharing context.
- **Vertical Delegation**: Escalation from Scout to Architect when research yields structural tasks.
- **Feedback Loops**: Observation phases can trigger new tasks (Self-Healing).
