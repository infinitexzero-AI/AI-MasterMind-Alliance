# Mythos-Tier Architecture: AI Mastermind Alliance

This document outlines the structural framework integrating Fable 5 / Claude Desktop methodologies into the AI Mastermind Alliance. This integration moves the system from "Self-Learning" to "Self-Improving" by establishing clear boundaries between Makers and Verifiers, and maintaining a durable Memory layer.

## The Four-Layer Architecture

### 1. Primitives
*   **Definition:** The raw tools, execution engines, and sub-agents.
*   **Components:** 
    *   Fable 5 / Claude Desktop (macbook instance).
    *   Antigravity (System Architect).
    *   Local tools (MCP servers, bash, filesystem).
*   **Role:** This is the baseline execution layer. "Where most people stop."

### 2. Orchestration
*   **Definition:** Goal-driven loops with an Independent Grader.
*   **Components:** 
    *   Mode 6 Dispatcher.
    *   Comet Assist (The Verifier).
*   **Role:** Manages the lifecycle of tasks. Ensures the "Maker != Verifier" Golden Rule is strictly enforced.

### 3. Memory
*   **Definition:** The state file the agent writes before ending every session, and reads at the start of the next.
*   **Components:** 
    *   `fable_state_memory.md`
*   **Contents:** 
    *   **Verified facts:** Ground truth established by the Verifier.
    *   **Distilled rules:** Systematic improvements for future prompts.
    *   **What worked:** Proven execution paths.
    *   **What's next:** Pending tasks and strategies.
*   **Role:** Skip this, and every session restarts from zero. Memory builds. System sharpens. Results compound.

### 4. Self-Improvement
*   **Definition:** The agent checks its own output (via independent Comet loop), grades it, and writes the lesson back into memory.
*   **Mechanism:** 
    *   Run -> Output -> Independent Review -> Lesson Learned -> Next Run (Better).
*   **Role:** Tomorrow's run inherits today's sharpened system. The environment around the model keeps improving.

## The Golden Rule: Maker ≠ Verifier
*   **Maker (Antigravity/Claude):** Produces output based on the Primitives and Orchestration.
*   **Verifier (Comet Assist/Independent Loop):** Takes the output, compares it against a strict rubric, and returns Pass (Yes/No). 
*   **Result:** A separate agent checks output against a rubric until it actually passes, breaking the flawed loop of an agent grading itself.
