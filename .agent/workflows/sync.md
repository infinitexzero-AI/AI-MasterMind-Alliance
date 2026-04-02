---
description: Synchronize Vanguard ThinkPad changes to the Command Center Hub
---

This workflow executes the Vanguard automated Git sync, pushing local changes and skipping any excluded machine state.

// turbo
1. Run the Vanguard sync script to push ThinkPad code changes to the Hub
`powershell -ExecutionPolicy Bypass -File .\scripts\vanguard_sync.ps1`
