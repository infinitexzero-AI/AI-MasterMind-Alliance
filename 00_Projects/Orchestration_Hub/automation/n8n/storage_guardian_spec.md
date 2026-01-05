# n8n Workflow Specification: Storage Guardian (v1.2)

**Objective:** Automate persistent monitoring of Mac SSD health using the Antigravity v1.2 Protocol Inspector.

## Workflow Definition (YAML-style)

```yaml
name: Storage_Guardian_v1.2
trigger:
  type: cron
  schedule: "0 */6 * * *"  # Every 6 hours

nodes:
  - name: Check_Health
    type: Execute Command (SSH or local)
    command: |
      /Users/infinite27/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/protocol_inspector.py --action check_health
    capture_exit_code: true
    on_fail: continue  # Essential to capture exit status 1/2

  - name: Branch_On_Status
    type: Switch
    rules:
      - exit_code == 0:  # GREEN
          next: Log_Green
      - exit_code == 1:  # YELLOW
          next: Alert_Yellow
      - exit_code == 2:  # RED
          next: Alert_Red

  - name: Log_Green
    type: Set (or HTTP to Notion API)
    action: Append to Notion "Storage Logs" table
    fields:
      timestamp: "{{ $now }}"
      status: "GREEN"
      notes: "System nominal"

  - name: Alert_Yellow
    type: Execute Command
    command: |
      /Users/infinite27/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/protocol_inspector.py --action snapshot
    then:
      type: Send Message (Telegram/Slack/Email)
      subject: "⚠️ Storage YELLOW"
      body: "{{ snapshot_output }}"

  - name: Alert_Red
    type: Execute Command
    command: |
      /Users/infinite27/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/protocol_inspector.py --action snapshot
    then:
      - type: Send Message (Telegram/Slack/Email)
        subject: "🔴 Storage RED – Action Required"
        body: "{{ snapshot_output }}"
      - type: HTTP Request (Linear API)
        method: POST
        endpoint: https://api.linear.app/graphql
        body:
          query: |
            mutation {
              issueCreate(input: {
                teamId: "YOUR_TEAM_ID"
                title: "Storage RED – Offload Required"
                description: "{{ snapshot_output }}"
                priority: 1
              }) { issue { id } }
            }
```
