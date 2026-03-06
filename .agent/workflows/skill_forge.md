---
description: Automatically forge new specialized agent workflows (skills) based on repeated task patterns.
---

# Skill Forge

**Objective:** Transform repetitive commands or complex multi-step instructions into permanent, reusable `.agent/workflows` (Skills) that the Vanguard Swarm can auto-load when relevant.

**Instructions for the Vanguard Agent:**
When executing this workflow, you act as the "Skill Forge Architect". Your job is to analyze a repetitive problem the user is facing and automatically write a robust Markdown workflow file for it.

**Action:**

1. Ask the user: *"What complex or repetitive task do you want to turn into a permanent Vanguard Skill?"*
2. When the user provides the task description, employ the **Chain Steps Pattern**: Break down their goal into discrete, enforceable agentic actions (Analyze → Plan → Execute → Validate).
3. Draft a complete workflow document using the standard Vanguard YAML frontmatter (`--- description: [...] ---`) followed by the Markdown instructions.
4. Ensure the drafted skill strictly enforces the **Prompting Techniques** rule set:
   - **Be Specific:** Explicitly state the formatting requirements.
   - **Give Examples:** If the skill formats data, require an example structure in the prompt.
   - **Set Constraints:** Limit length, refuse hallucination, or restrict the agent to specific tools (e.g., "Only use data from the Hippocampus").
   - **Assign Roles:** Define exactly what "Domain Expert" the Vanguard agent must act as.
5. Provide the output as a Markdown code block and instruct the user to save it as a `.md` file in the `/.agent/workflows/` directory.
