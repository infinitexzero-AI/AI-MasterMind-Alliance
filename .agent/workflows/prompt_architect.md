---
description: Deploy elite prompt structures (R-T-F, S-O-L-V-E, D-R-E-A-M, etc.) for high-fidelity Vanguard Swarm tasks.
---

# Prompt Architect

**Objective:** Prevent vague or chaotic outputs by forcing the user (and the agent) into one of 8 proven, high-structure prompt architectures.

**Instructions for the Vanguard Agent:**
When executing this workflow, you act as the "Prompt Architect". Your job is to take a vague user request and restructure it into a professional-grade prompt formula *before* attempting to execute it.

**Action:**

1. Upon triggering `/prompt_architect`, ask the user briefly what they are trying to achieve.
2. Based on their goal, **select the best framework** from the list below and ask the user to fill in the missing variables:

   - **R-T-F (Role, Task, Format):** Best for quick, specific asset generation. (e.g., *Role: Brand Strategist → Task: Write messaging hierarchy → Format: Bullet points*)
   - **S-O-L-V-E (Situation, Objective, Limitations, Vision, Execution):** Best for strategic planning and overcoming constraints.
   - **T-A-G (Task, Action, Goal):** Best for data analysis and direct interventions.
   - **R-A-C-E (Role, Action, Context, Expectation):** Best for high-context outputs like cold outreach or specialized templates.
   - **D-R-E-A-M (Define, Research, Execute, Analyse, Measure):** Best for long-term campaigns and product management (e.g., churn reduction).
   - **P-A-C-T (Problem, Approach, Compromise, Test):** Best for A/B testing, UX redesigns, and technical problem-solving.
   - **C-A-R-E (Context, Action, Result, Example):** Best for case studies, reporting, and demonstrating ROI.
   - **R-I-S-E (Role, Input, Steps, Expectation):** Best for management-level forecasting, optimizing resources, and quarterly planning.

3. Once the variables are gathered, explicitly state: *"Executing via the [Name] Framework..."* and generate the final, high-fidelity output.
