# AI Mastermind Alliance Update v.2

**Status**: DRAFT | **Date**: Dec 13, 2025 | **Target**: End of Year Sprint

## 1. Executive Summary & Convergence

This document consolidates the **Master Orchestration Protocol (v1.0)** with the user's high-level **Life OS Roadmap (Phases 8-11)**.
The "Alliance" (Claude, Grok, Perplexity) provides the *infrastructure* to execute the "Life OS" (Scholar, Tycoon, Neuro-balance) *objectives*.

### The Convergence

- **Protocol v1.0** (Dec 6) focused on agent roles (Infrastructure).
- **Life OS** (ongoing) focuses on User domains (Scholar, Financial, Health).
- **Update v.2** aligns these: The Alliance's primary mission for the remainder of 2025 is to **Stabilize the System** (dashboard, communication) and **Survive/Thrive** (Exams, Bursary, Foundation for 2026).

---

## 2. Deep Context Search Findings

A scan of relevant workspaces (`AILCC_PRIME`, `00_Projects`, `conversation_history`) reveals:

1. **Current Tech State**:
    - **Dashboard (Command Center)**: In "Recovery" phase. 'Prefrontal Cortex' (Tasks) working. 'Motor Cortex' (n8n, WebSockets) is the active blocker.
    - **Agents**: Roles defined (Claude=Local, Grok=Reasoning, Perplexity=Info).
    - **Data**: `dashboard_state.json` tracks progress.
2. **Immediate User Pressures**:
    - **Academic**: "Scholar Protocol" needs wiring for finals (Dec 2025).
    - **Financial**: Emergency Bursary application, "Financial & Legal Engine" needed.
    - **Technical**: Need to offload apps (Disk Space), fix WebSockets, and integration `Antigravity` fully.
3. **Roadmap Discrepancies**:
    - Protocol v1 had generic "Phase 1-3".
    - Life OS is at "Phase 8" (Dashboard).
    - **Resolution**: We adopt the **Life OS Phase Numbering** (8-11) as the master timeline.

---

## 3. The Progressive Timeline (End of 2025 Sprint)

**Objective**: Clear the "100 Steps" by Dec 31, 2025.
**Pace**: ~6 steps/day.

### Phase 8.5: The "Motor Cortex" & Stabilization (Dec 13 - Dec 15)

*Goal: System fully responsive, zero lint errors, reliable websockets.*

### Phase 9.0: The Scholar's Sprint (Dec 16 - Dec 20)

*Goal: Automate exam prep, complete Bursary, academic survival.*

### Phase 10.0: The Financial & Legal Engine (Dec 21 - Dec 25)

*Goal: Secure funding, legal advocacy tools, income generation setup.*

### Phase 11.0: Architecting 2026 (Dec 26 - Dec 31)

*Goal: Deep clean, "Sentience" foundations (Memory), System 2.0 launch.*

---

## 4. The Next 100 Steps (Detailed Execution)

### SECTION 1: SYSTEM RECOVERY (Steps 1-25)

- [ ] 1. **[CRITICAL]** Fix Syntax Error in `AntigravityPanel.tsx` (current blocker).
- [ ] 2. Resolve `MetaMask` runtime error in Dashboard.
- [ ] 3. Verify WebSocket Relay Server (`relay.js`) on port 3001.
- [ ] 4. Connect `LiveAgentFeed` to Relay Server.
- [ ] 5. Connect `SystemHUD` to Relay Server.
- [ ] 6. End-to-end test: Python Engine → Relay → Dashboard Frontend.
- [ ] 7. **[CLEANUP]** Remove console debug logs from `useSocket`.
- [ ] 8. Consolidate `ailcc/src/command-center` lint errors (any types).
- [ ] 9. Fix Accessibility issues in `ProjectStatus.tsx`.
- [ ] 10. Remove unused imports in `AgentGrid.tsx`.
- [ ] 11. **[VISUAL]** Finalize "Cyber-Glass" CSS tokens in `globals.css`.
- [ ] 12. Unify `StatusCard` component styles.
- [ ] 13. Unify `ArtifactTimeline` component styles.
- [ ] 14. Unify `ImageGenerator` component styles.
- [ ] 15. Verify "Prefrontal Cortex" (Task View) data binding.
- [ ] 16. Implement "Motor Cortex" UI placeholder.
- [ ] 17. Configure `n8n` webhook endpoint in Dashboard.
- [ ] 18. Test `n8n` connectivity (Hello World workflow).
- [ ] 19. Create `deployment` trigger in Dashboard.
- [ ] 20. Script `one-click-deploy` shell script.
- [ ] 21. Wire `one-click-deploy` to Dashboard button.
- [ ] 22. **[MCP]** Verify GitKraken MCP connection.
- [ ] 23. Verify CloudRun MCP connection.
- [ ] 24. Verify Linear MCP connection.
- [ ] 25. **[MILESTONE]** Dashboard v2.0 "Green Light" (Stable & Integrated).

### SECTION 2: SCHOLAR PROTOCOL (Steps 26-50)

- [ ] 26. Create `modes/mode-1-student/current_courses.json`.
- [ ] 27. Input COMM 3611 syllabus data.
- [ ] 28. Input other active course data.
- [ ] 29. Create "Study Session" agent prompt template.
- [ ] 30. Implement "Course Material Search" (local fd/grep).
- [ ] 31. Build "Assignment Tracker" component in Dashboard.
- [ ] 32. Wire Tracker to `dashboard_state.json`.
- [ ] 33. **[AUTOMATION]** Script to summarize PDF readings (using Claude).
- [ ] 34. Setup "Focus Mode" in Dashboard (hides non-essential widgets).
- [ ] 35. Integrate Pomodoro timer into System HUD.
- [ ] 36. **[EXAM]** Generate COMM 3611 Study Guide (Artifact).
- [ ] 37. Generate Flashcards for COMM 3611.
- [ ] 38. Simulate Exam questions (Agent driven).
- [ ] 39. Review Essay drafts for pending assignments.
- [ ] 40. Final Polish of Essay 1.
- [ ] 41. Final Polish of Essay 2.
- [ ] 42. Submit Assignments (Manual confirmation step).
- [ ] 43. Verify Exam Schedule in Calendar.
- [ ] 44. Setup "Morning Briefing" for Exam Days.
- [ ] 45. **[BURSARY]** Draft Emergency Bursary Letter (v2 - refined).
- [ ] 46. Collect Supporting Financial Docs (PDFs).
- [ ] 47. Compile Bursary Application Package.
- [ ] 48. Review Bursary Package (User Audit).
- [ ] 49. Submit/Email Bursary Application.
- [ ] 50. **[MILESTONE]** Academic Semester Secured.

### SECTION 3: FINANCIAL & LEGAL ENGINE (Steps 51-75)

- [ ] 51. Create `modes/mode-2-professional/financial_overview.md`.
- [ ] 52. Map all Income Sources vs Expenses.
- [ ] 53. Identify "Quick Win" income opportunities (Remote/Freelance).
- [ ] 54. Update CV/Resume (Master Version).
- [ ] 55. Tailor CV for "Tech/AI" roles.
- [ ] 56. Tailor CV for "Academic/Research" roles.
- [ ] 57. Setup "Job Board Scraper" (n8n workflow).
- [ ] 58. Filter jobs for "Remote" & "New Brunswick".
- [ ] 59. Automate "Intro Email" generation for applications.
- [ ] 60. **[LEGAL]** Create "Self-Advocacy" document template.
- [ ] 61. Research Tenant Rights (NB specific).
- [ ] 62. Research Student Aid Appeal process.
- [ ] 63. Setup "Legal Document" organized folder.
- [ ] 64. Draft "Situation Statement" for potential appeals.
- [ ] 65. Connect Financial Dashboard widget (Mock data first).
- [ ] 66. Wire Financial Widget to Sheet/JSON.
- [ ] 67. Set up "Budget Alert" thresholds.
- [ ] 68. Review "App Offloading" results (Disk Space for work).
- [ ] 69. Move large apps to LaCie drive.
- [ ] 70. Verify System Performance after offload.
- [ ] 71. Cloud Backup of Critical Legal/Financial docs.
- [ ] 72. **[NETWORKING]** Draft update email to mentors/advisors.
- [ ] 73. Send update emails.
- [ ] 74. Research "Winter Grants" or opportunistic funding.
- [ ] 75. **[MILESTONE]** Financial Defense Established.

### SECTION 4: SYSTEM EVOLUTION (Steps 76-100)

- [ ] 76. **[ARCHIVE]** Archive Fall 2025 Semester materials.
- [ ] 77. Clean `Downloads` and `Desktop` folders.
- [ ] 78. Deep Clean `node_modules` across workspace.
- [ ] 79. **[SWARM]** Design "Swarm Protocol" (Phase 9) architecture.
- [ ] 80. Create `Agent_Registry.json` for Swarm.
- [ ] 81. Define "Queen Bee" (Orchestrator) vs "Worker" roles.
- [ ] 82. Prototype "Inter-Agent Messaging" (IAM) protocol.
- [ ] 83. **[MEMORY]** Design "Long-Term Memory" (Vector DB plan).
- [ ] 84. Select Vector DB (Pinecone vs Chroma vs Local).
- [ ] 85. Script "Daily Journal" auto-ingestion to Memory.
- [ ] 86. **[NEURO]** Design "Neuro-Balance" Dashboard functionality.
- [ ] 87. Integrate "Dopamine Menu" concept into UI.
- [ ] 88. Setup "Sleep/Recovery" tracking fields.
- [ ] 89. **[VISION 2026]** Draft "2026 Master Plan" document.
- [ ] 90. Define Q1 2026 OKRs (Objectives).
- [ ] 91. Create "Jan 1 Launch" checklist.
- [ ] 92. Update `README.md` for AILCCv2.
- [ ] 93. Commit all code to git (Stable Branch).
- [ ] 94. Create "Release v2.0" tag.
- [ ] 95. Full System Backup (Time Machine/Cloud).
- [ ] 96. "Comet" Assistant final integration check.
- [ ] 97. "Grok" Dashboard final sync.
- [ ] 98. "Claude" Context refresh.
- [ ] 99. User Final Review of 2025.
- [ ] 100. **[VICTORY]** CELEBRATE NEW YEAR & SYSTEM LAUNCH.
