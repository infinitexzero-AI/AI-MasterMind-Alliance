# PRACTICAL WORKFLOW EXAMPLE: Morning Power-Up Routine

**Purpose:** Start your day with all AI agents coordinated and ready for maximum productivity

**Duration:** 5-10 minutes
**Frequency:** Daily (weekday mornings)

---

## PRE-EXECUTION CHECKLIST

✅ Claude Desktop is running (restarted if needed)
✅ Things app is open
✅ Chrome browser is open
✅ All cloud storage synced

---

## STEP-BY-STEP EXECUTION

### Step 1: System Health Verification (2 min)

**Command to Claude:**
"Run system health check - verify all MCP servers and integrations"

**What Claude Does:**
1. Tests filesystem access to all 5 directories
2. Verifies Chrome Control is responsive
3. Checks Apple Notes connectivity
4. Confirms Things integration working
5. Tests PDF tools
6. Verifies OSAScript functionality

**Expected Output:**
Status report in Apple Notes with ✅ or ⚠️ for each system

---

### Step 2: Retrieve Yesterday's Progress (1 min)

**Command to Claude:**
"Show me what was completed yesterday from Things logbook"

**What Claude Does:**
1. Queries Things completed items from yesterday
2. Summarizes accomplishments
3. Identifies any incomplete items
4. Notes any blockers or issues

**Expected Output:**
Quick summary of yesterday's wins and carryover items

---

### Step 3: Load Today's Agenda (2 min)

**Command to Claude:**
"Create my daily dashboard for today"

**What Claude Does:**
1. Pulls all tasks due today from Things
2. Checks upcoming tasks (next 3 days)
3. Reviews inbox items
4. Checks project deadlines
5. Creates organized note with priorities

**What Gets Created:**
Apple Note: "Daily Dashboard - [Date]"
- Top 3 priorities
- All tasks due today
- Upcoming items
- Project status
- Quick links to active work

---

### Step 4: Process Overnight Inputs (2 min)

**Command to Claude:**
"Check command inbox and process any new items"

**What Claude Does:**
1. Scans Google Drive/COMMAND_INBOX/
2. Reviews Things inbox
3. Checks Apple Notes tagged #newtask
4. Processes each item:
   - Categorizes by type
   - Creates Things tasks if needed
   - Routes to appropriate agent
   - Moves to appropriate folder

**Expected Output:**
Summary of new tasks created and routing decisions

---

### Step 5: Open Power Workspace (2 min)

**Command to Claude:**
"Set up my power workspace in Chrome"

**What Claude Does:**
1. Opens Chrome with organized tabs:
   - **Tab Group 1: AI Tools**
     - Grok Dashboard
     - Perplexity
   - **Tab Group 2: Workspace**
     - Gmail
     - Google Drive (AI_AGENT_MASTERMIND folder)
     - Google Calendar
   - **Tab Group 3: Active Projects**
     - Your current project links
     - Resource tabs

2. Arranges windows optimally
3. Sets focus to primary work tab

**Expected Output:**
Chrome organized and ready for immediate work

---

### Step 6: Generate Daily Briefing (1 min)

**Command to Claude:**
"Create my daily briefing"

**What Claude Does:**
1. Compiles information from all sources
2. Generates concise briefing note
3. Includes:
   - System status
   - Today's priorities (top 3)
   - Meeting/deadline reminders
   - Suggested focus areas
   - Quick wins available
   - Any urgent items

**What Gets Created:**
Apple Note: "Daily Briefing - [Date]"
Google Doc in SHARED_CONTEXT/ (accessible to all agents)

---

## ADVANCED OPTIONS

### Option A: Include Research Digest
**Command:** "Include overnight research in my briefing"
- Grok checks dashboard for new insights
- Perplexity scans relevant news
- Results summarized in briefing

### Option B: Project Status Update
**Command:** "Add project status to briefing"
- Reviews all active projects in Things
- Calculates completion percentages
- Identifies blockers
- Suggests next actions

### Option C: Week Preview
**Command:** "Show me week-at-a-glance"
- Displays entire week's tasks
- Highlights major milestones
- Shows workload distribution
- Suggests scheduling adjustments

---

## SAMPLE MORNING SEQUENCE

**Time: 8:30 AM**

**You say:**
"Good morning Claude! Execute my morning power-up routine with project status."

**Claude responds:**
"Good morning! Executing morning power-up routine..."

**[2 minutes later]**

**Claude reports:**
"✅ Morning power-up complete! Here's your daily briefing:

**System Status:** All systems operational

**Top 3 Priorities Today:**
1. Review AICC Project proposals (2 hours)
2. Complete biology assignment (1 hour)  
3. Process ECFC sales calculator updates (1 hour)

**Today's Tasks:** 8 tasks scheduled
**Upcoming:** 12 tasks in next 3 days
**New Inbox Items:** 2 processed and routed

**Project Status:**
- AI Orchestration: 40% complete, on track
- ECFC Sales System: 75% complete, deadline Friday
- Biology coursework: 60% complete, exam prep needed

**Quick Wins Available:**
- Respond to 3 pending emails
- Review yesterday's notes
- Update project dashboard

**Chrome Workspace:** Ready with 9 tabs organized
**Daily Dashboard:** Created in Notes
**Shared Briefing:** Saved to Google Drive for Grok/Perplexity access

Ready to start your productive day! 🚀"

---

## CUSTOMIZATION OPTIONS

You can modify this routine by:

1. **Changing the schedule**
   - Run at different times
   - Skip weekends
   - Adjust for your calendar

2. **Adding components**
   - Weather check
   - Email preview
   - Social media digest
   - Market/industry news

3. **Adjusting depth**
   - Quick version (3 min)
   - Standard version (5-10 min)
   - Deep version (15 min with full analysis)

4. **Integration specifics**
   - Connect to specific Google Sheets
   - Pull from specific email labels
   - Monitor specific file types
   - Track specific projects

---

## TROUBLESHOOTING

**Issue:** Chrome doesn't open properly
**Solution:** Ensure Chrome is already running, then retry

**Issue:** Things tasks not showing
**Solution:** Open Things app first, ensure sync is complete

**Issue:** Files not found in COMMAND_INBOX
**Solution:** Check Google Drive sync status in Finder

**Issue:** Briefing seems incomplete
**Solution:** Run "Verify all systems" first, then retry briefing

---

## EVOLUTION PLAN

**Week 1:** Run manually each morning, observe what's useful
**Week 2:** Optimize based on your usage patterns
**Week 3:** Add custom components specific to your workflow
**Week 4:** Consider automating trigger (scheduled launch)

---

## SUCCESS METRICS

Track these to measure routine effectiveness:
- Time saved vs manual setup
- Tasks completed before noon
- Missed priorities (should be zero)
- Days started "in the zone"
- Overall productivity score

---

**To execute this workflow:**
Simply say: "Claude, run my morning power-up routine"

**To customize:**
Say: "Claude, modify my morning routine to include [specific request]"

**To skip a step:**
Say: "Claude, run morning routine but skip [step name]"

---

**Location:** `~/AI_ORCHESTRATION_HUB/TEMPLATES/MORNING_POWERUP.md`
**Created:** December 6, 2025
**Last Updated:** December 6, 2025
