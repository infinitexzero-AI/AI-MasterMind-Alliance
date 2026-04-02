# AI TEAM MASTERMIND - Master Orchestration Protocol
**Version 1.0 | Date: December 6, 2025**

## System Architecture Overview

This protocol enables seamless collaboration between:
- **Claude Desktop** (Local orchestrator with MCP servers)
- **Grok/SuperGrok** (Web-based reasoning and research)
- **Perplexity Comet/Assistant** (Real-time information and analysis)
- **Cross-platform integration** (Apple, Google, Microsoft 365, Cloud ecosystems)

---

## Core Principles

### 1. Agent Role Assignment
Each AI agent operates based on core strengths:

**CLAUDE DESKTOP (Local Command Center)**
- File system management and local automation
- Task orchestration via Things
- Document processing (Notes, PDFs)
- Browser automation (Chrome Control)
- Mac system automation (AppleScript)
- Integration coordinator

**GROK (Web-Based Reasoning Engine)**
- Real-time web research
- Complex reasoning and analysis
- Project dashboard management
- External API interactions
- Social/web data processing

**PERPLEXITY (Information Specialist)**
- Current events and real-time data
- Deep research and fact-checking
- Source verification
- Comparative analysis
- Market intelligence

---

## Workflow Protocols

### Protocol Alpha: Task Delegation System

**Initialization Sequence:**
1. Task enters system via Claude Desktop
2. Claude analyzes task complexity and requirements
3. Task is categorized and routed to appropriate agent(s)
4. Status tracking initiated in Things
5. Shared documentation created in Google Drive/Notes

**Task Routing Matrix:**

| Task Type | Primary Agent | Support Agent(s) | Documentation |
|-----------|---------------|------------------|---------------|
| File Operations | Claude | - | Local logs |
| Web Research | Grok | Perplexity | Google Docs |
| Current Events | Perplexity | Grok | Notes + Drive |
| Automation | Claude | - | AppleScript logs |
| Analysis | Grok | Claude, Perplexity | Shared Drive |
| Integration | Claude | Grok | Things + Notes |

---

### Protocol Beta: Communication Framework

**Shared Communication Channels:**

1. **Google Drive - Central Repository**
   - `/My Drive/AI_AGENT_MASTERMIND/` - Master directory
   - `/COMMAND_INBOX/` - Incoming tasks
   - `/EXECUTION_LOGS/` - Completed work
   - `/SHARED_CONTEXT/` - Cross-agent context

2. **Apple Notes - Quick Sync**
   - Real-time status updates
   - Quick handoff notes
   - Context preservation

3. **Things - Task Tracking**
   - Project: "AI Team Orchestration"
   - Tags: #claude, #grok, #perplexity, #automated
   - Areas: By platform (Apple, Google, Microsoft, Cloud)

**Status Update Protocol:**
- Every task logs start time, agent, and status
- Completion triggers notification to relevant agents
- Blockers immediately documented
- Context preserved for handoffs

---

### Protocol Gamma: Integration Workflows

**Apple Ecosystem Integration:**
```
Claude → AppleScript → System Control
       → Notes → Quick capture
       → Things → Task tracking
       → iCloud Drive → Cloud storage
```

**Google Workspace Integration:**
```
Claude → Chrome Control → Google Docs/Sheets
       → File System → Google Drive sync
Grok → Web API → Google services
```

**Microsoft 365 Integration:**
```
Claude → Browser automation → Office web apps
       → File System → OneDrive sync
Grok → API integration → M365 services
```

---

## Automation Templates

### Template 1: Research-to-Action Pipeline

**Step 1: Research Phase (Perplexity + Grok)**
- Perplexity conducts initial research
- Grok performs deeper analysis
- Results compiled to Google Docs

**Step 2: Processing Phase (Claude)**
- Claude reads research from shared Drive
- Extracts actionable items
- Creates tasks in Things
- Generates implementation notes

**Step 3: Execution Phase (All Agents)**
- Tasks distributed based on type
- Each agent updates status in real-time
- Documentation auto-generated
- Results synced to shared repositories

### Template 2: File Management Workflow

**Trigger:** New file in COMMAND_INBOX
**Process:**
1. Claude detects new file via filesystem monitoring
2. File analyzed and categorized
3. Appropriate agent(s) notified via shared Notes
4. Processing completed
5. Results moved to EXECUTION_LOGS
6. Task marked complete in Things

### Template 3: Browser Automation Chain

**Trigger:** Web-based task requirement
**Process:**
1. Claude opens Chrome with specific tabs
2. Executes JavaScript for data extraction
3. Grok processes web data via API
4. Results compiled and saved
5. Next action triggered automatically

---

## Implementation Checklists

### Daily Startup Sequence
- [ ] Verify all MCP servers active (Claude Desktop)
- [ ] Check Things for pending tasks
- [ ] Review shared Notes for overnight updates
- [ ] Sync Google Drive directories
- [ ] Open Chrome with required tabs
- [ ] Verify Grok project dashboard accessibility
- [ ] Confirm Perplexity API status

### System Health Checks
- [ ] File system access verified (all 5 directories)
- [ ] Chrome Control responding
- [ ] Notes sync active
- [ ] Things database accessible
- [ ] PDF tools functional
- [ ] AppleScript execution working
- [ ] Network connectivity confirmed

### Integration Verification
- [ ] Google Drive sync operational
- [ ] OneDrive sync operational
- [ ] iCloud Drive accessible
- [ ] External drive (LaCie) mounted
- [ ] Browser authenticated to key services
- [ ] API credentials valid

---

## Error Handling & Recovery

### Common Issues & Solutions

**Issue: MCP Server Not Responding**
- Solution: Restart Claude Desktop
- Fallback: Use direct file system access
- Documentation: Log issue in Notes

**Issue: File Sync Delay**
- Solution: Force sync via Finder
- Fallback: Use alternative cloud storage
- Documentation: Note timestamp discrepancy

**Issue: Agent Communication Gap**
- Solution: Manual status update in shared Notes
- Fallback: Direct task re-assignment
- Documentation: Update communication log

### Recovery Protocols

1. **Checkpoint System:** Every major task creates checkpoint in Things
2. **Rollback Capability:** Version control via Google Drive
3. **Redundancy:** Critical data stored in multiple locations
4. **Manual Override:** All automations can be manually executed

---

## Performance Metrics

### Key Performance Indicators

**Efficiency Metrics:**
- Task completion time (baseline vs. automated)
- Agent utilization rate
- Handoff latency
- Error rate

**Quality Metrics:**
- Task accuracy
- Documentation completeness
- Integration success rate
- User satisfaction

**Tracking Method:**
- Weekly review in Things Logbook
- Monthly summary in Google Sheets
- Quarterly optimization cycles

---

## Security & Privacy Protocols

### Data Classification
- **Public:** General research, public documentation
- **Private:** Personal files, business documents
- **Confidential:** Credentials, sensitive business data

### Access Control
- Claude: Full local file access
- Grok: Shared Drive (specific directories only)
- Perplexity: Public research only
- Credentials: Never stored in shared locations

### Best Practices
- Regular credential rotation
- Encrypted storage for sensitive data
- Audit logs for all file operations
- Immediate revocation of compromised access

---

## Expansion Roadmap

### Phase 1 (Current): Foundation
- Basic task routing
- File system integration
- Task tracking setup
- Communication protocols

### Phase 2 (Next 30 days): Enhancement
- Advanced automation chains
- API integrations
- Custom AppleScript workflows
- Performance optimization

### Phase 3 (Next 90 days): Scale
- Multi-project support
- Advanced analytics
- Custom agent training
- Enterprise integration

---

## Quick Reference Commands

### Claude Desktop Commands
- "Check inbox for new tasks"
- "Create project handoff note"
- "Generate status report"
- "Execute automation workflow [name]"
- "Sync all cloud directories"

### Integration Triggers
- File drop → Auto-process
- Task creation → Multi-agent alert
- Browser event → Data capture
- Schedule → Automated execution
- Status change → Notification cascade

---

## Support & Troubleshooting

### Documentation Resources
- Master protocol: This document
- Workflow templates: `/AI_ORCHESTRATION_HUB/TEMPLATES/`
- Execution logs: Google Drive `/EXECUTION_LOGS/`
- Quick guides: Apple Notes "AI Team Guide"

### Contact Points
- Claude Desktop: Direct interaction
- Grok Dashboard: https://grok.com/project/4f32c776...
- Perplexity: Via web interface
- System admin: [Your contact info]

---

**Last Updated:** December 6, 2025
**Next Review:** Weekly (every Monday)
**Maintained by:** AI Team Mastermind Collective
