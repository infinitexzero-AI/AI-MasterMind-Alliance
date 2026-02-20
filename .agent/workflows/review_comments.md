---
description: Review user comments in a file and provide feedback or implement changes
---

# Review Comments Workflow

Use this workflow when the user has placed comments in a file (code or document) and wants the agent to review them.

## Protocol for Users

1. **Place Comment**: Add a comment directly in the file using the tag `// AGENT:` followed by your instruction or question.
    - Example in Markdown: `<!-- // AGENT: Please expand this section -->`
    - Example in Python: `# // AGENT: Check this logic for off-by-one errors`
2. **Request Review**: Ask the agent to "/review_comments" or simply state that you have added comments for review.

## Protocol for Agent

1. **Locate Comments**: Use `grep_search` to find all occurrences of `// AGENT:` in the relevant directory or file.
2. **Process and Respond**:
    - For each comment, identify the context (surrounding lines).
    - If the comment is a question, answer it in the chat via `notify_user`.
    - If the comment is an instruction, implement the changes directly.
3. **Clean Up**: Once handled, remove the `// AGENT:` comment from the file to signify completion.
4. **Confirm**: Notify the user that the comments have been processed.
