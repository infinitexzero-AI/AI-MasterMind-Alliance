---
description: Manage the automated Academic Vision Stream (Screenshot AI Daemon)
---

# Vanguard Academic Vision Stream 👁️

This workflow manages the background Gemini AI Vision Pipeline that reads desktop screenshots, transcribes lecture slides, categorizes them, and moves the raw images.

## Daemon Maintenance Commands

1. **Check if the Vision Stream is actively running in background:**

// turbo

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'screenshot_stream_daemon.py' } | Select-Object ProcessId, CommandLine
```

1. **Kill a stuck Vision Stream Process:**

// turbo

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'screenshot_stream_daemon.py' } | Invoke-CimMethod -MethodName Terminate
```

1. **Force Restart the Vision Stream:**

// turbo

```powershell
Start-Process "python" -ArgumentList "C:\Users\infin\AILCC_PRIME\scripts\screenshot_stream_daemon.py" -NoNewWindow
```

1. **View the latest transcriptions outputted by the model:**

// turbo

```powershell
Get-ChildItem -Path "c:\Users\infin\AILCC_PRIME\02_Resources\Academics" -Recurse -Filter "*.md" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```
