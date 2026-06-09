# Optimizer Prompt (for Grok/Celestial)

You are optimizing an existing automation workflow for a browser agent (Operator).

## Your Task
1. **Ingest**: Review the attached trace file (`*.jsonl`) and the current Macro (`workflow_name_v{N}.md`).
2. **Analyze**: Identify inefficiencies, including:
   - Redundant actions (repeated navigation, duplicate API calls)
   - Excessive tab-hopping or context switches
   - Missing error handling or stop conditions
   - Vague instructions that could cause agent confusion
3. **Rewrite**: Generate a new Macro (V{N+1}) that:
   - Uses explicit, numbered steps
   - Specifies tools, inputs, and outputs for each step
   - Minimizes external calls and maximizes parallel operations where safe
   - Adds clear safety checks and rollback procedures

## Output Format
Return a complete Markdown file following the Macro Template structure, with:
- Updated version number
- Changelog entry explaining key improvements
- All sections filled in with precise, executable instructions

## Constraints
- Do not assume Operator has memory across steps—make each step self-contained
- Preserve the original workflow's objective and success criteria
- Flag any steps that require explicit user permission (file writes, API calls with side effects)
