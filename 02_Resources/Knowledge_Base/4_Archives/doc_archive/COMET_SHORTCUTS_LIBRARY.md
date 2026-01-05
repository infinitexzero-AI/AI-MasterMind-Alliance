# Comet Assistant Shortcuts Library

## Instructions
1. Open **Comet Assistant** in your browser sidebar.
2. Type `/` and select **"Create New Shortcut"**.
3. Copy-paste the **Prompt** below for each shortcut name.

> **Note**: All shortcuts here assume `TaskBoard.csv` lives at user canonical path:
> `~/AILCC_PRIME/core/TaskBoard.csv`

---

### 1. `/ailcc-overview`
**Prompt:**
```text
Analyze the current webpage or open a tab to the AILCC system documentation.
Extract and summarize:
1. Current system structure (modes, purpose of each)
2. Key agents and their responsibilities
3. Active automation scripts and integrations
4. Major pain points or blockers
Provide a 5-bullet summary suitable for a weekly retrospective.
```

### 2. `/comet-research-mode1`
**Prompt:**
```text
You are helping with Mode 1 (Academic/Student) research.
When I provide an assignment, paper topic, or learning goal:
1. Search for 5–10 high-quality sources (academic papers, textbooks, reputable blogs)
2. Summarize each in 2–3 sentences
3. Create a reading order (easiest to hardest)
4. Extract key definitions, frameworks, or theories from each
5. Return a structured Markdown outline.
```

### 3. `/comet-taskboard-update`
**Prompt:**
```text
I will provide you a TaskBoard context or ask you to infer from our conversation what tasks I've mentioned.
Your job:
1. Extract all mentioned tasks (explicit or implied)
2. Categorize by mode (1–5)
3. Assign priority (High, Medium, Low)
4. Estimate effort
5. Return a CSV-formatted update in a code block:
mode,task,priority,effort,due_date,status
I will then copy–paste this into TaskBoard.csv.
```

### 4. `/comet-mode2-professional-brief`
**Prompt:**
```text
Scan the current tab(s) and extract professional/career-related context:
1. Open meetings or calendar invites
2. GitHub issues or Linear tickets
3. Emails or Slack threads
Synthesize into a "Daily Briefing" for Mode 2 (Professional):
- Top 3 priorities for today
- Key blockers or decisions needed
- Upcoming deadlines (next 7 days)
```

### 5. `/comet-habit-tracker`
**Prompt:**
```text
You are Mode 3 (Life) habit & wellness assistant.
Scan any open health/habit tracking apps or logs:
1. Summarize the last 7 days of habit data
2. Identify 2–3 trends
3. Suggest 1–2 micro-improvements
Return as a markdown "Weekly Wellness Report".
```

### 6. `/comet-github-sync`
**Prompt:**
```text
If you see a GitHub repo open or I mention a repo name:
1. Navigate to or search for the repo
2. Check latest commits, open issues, and branch status
3. Return a "GitHub Status Report" summarizing activity and blockers.
```

### 7. `/comet-system-health`
**Prompt:**
```text
Run a quick "system health check" for the AILCC ecosystem.
Ask/check:
1. Is TaskBoard.csv up-to-date?
2. Is Valentine responding?
3. Are all mode directories accessible?
4. MCP servers status?
Return a "System Health Report" judging overall Green/Yellow/Red status.
```

### 8. `/comet-wiring-spec`
**Prompt:**
```text
Mode 5 (Automation) helper – synthesize current automation architecture.
1. Extract current integrations and their purpose
2. Identify gaps (e.g., "We have GitHub ↔ Linear but not Comet ↔ n8n")
3. Propose a simple ASCII diagram of the flow.

### 9. `/comet-apple-sysadmin`
**Prompt:**
```text
You are an expert macOS SysAdmin.
I need to optimize my iCloud Settings for storage.
1. Guide me to: System Settings > Apple ID > iCloud.
2. Explain exactly which toggles to enable for "Messages in iCloud" and "Optimize Mac Storage".
3. If I want to use Google Photos instead, explain how to install the uploader.
My goal is to free up local space on a 128GB Mac.
```
```
