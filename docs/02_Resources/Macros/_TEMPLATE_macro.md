---
workflow_name: [workflow_identifier]
version: v1
created: YYYY-MM-DD
updated: YYYY-MM-DD
author: [Operator/Optimizer model]
parent_version: null
changelog: |
  - Initial creation
---

# Macro: [Workflow Name]

## Objective
[One-sentence description of what this workflow accomplishes]

## Prerequisites
- Tools required: [browser, terminal, APIs, etc.]
- Data inputs: [files, URLs, credentials needed]
- Environment: [project context, working directory]

## Execution Steps

### Step 1: [Action Name]
**Tool**: `[tool_name]`  
**Action**: [Precise description]  
**Output**: [What gets created/updated]  
**Stop condition**: [When to proceed vs abort]

### Step 2: [Next Action]
...

## Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

## Safety Checks
- Confirm no sensitive data in logs
- Verify write permissions before file operations
- Check rate limits before API loops

## Known Issues
- [Edge case 1 and workaround]
