# GitHub Organization Status Report
**Generated:** {{timestamp}}
**Requester:** Antigravity Agent {{agent_id}}
**Target Org:** {{org_name}}

## Executive Summary
{{3_sentence_summary}}

## Critical Issues (Action Required)
- [ ] Issue 1: {{description}} | Severity: {{level}} | ETA: {{time}}
- [ ] Issue 2: {{description}} | Severity: {{level}} | ETA: {{time}}

## Performance Metrics
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| CI Success Rate | {{value}}% | 95% | {{emoji}} |
| Avg PR Merge Time | {{value}}h | 24h | {{emoji}} |
| API Quota Usage | {{value}}% | <80% | {{emoji}} |

## Recommended Actions
1. **Repository Optimization** → Run `git gc --aggressive` on repos: {{list}}
2. **Communication Fix** → Enable PR auto-reminders for teams: {{list}}
3. **Security Update** → Patch vulnerabilities in: {{list}}

## Antigravity Integration Status
- MCP Servers Active: {{count}}
- Agent Execution Success Rate: {{percent}}%
- Last Successful Sync: {{timestamp}}

---
**Next Scan:** {{next_scheduled_time}}
**View Full Report:** [Comet Dashboard]({{dashboard_url}})
