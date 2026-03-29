# AILCC Vanguard Telemetry Service - ThinkPad27
# Deploys as a background daemon to monitor local resource utilization
# and broadcast data across the OmniTracker via native OneDrive syncing.

$NodeName = "ThinkPad27"
$Role = "Compute Mule"
$OS = "Windows 11 Pro"
$VaultPath = "$env:USERPROFILE\OneDrive\AILCC_VAULT"
$StatusFile = "$VaultPath\status_$NodeName.json"

# Ensure OneDrive Vault directory exists
if (-Not (Test-Path -Path $VaultPath)) {
    Write-Host "[!] AILCC_VAULT directory not found at $VaultPath"
    Write-Host "[*] Creating Vault Directory..."
    New-Item -ItemType Directory -Force -Path $VaultPath | Out-Null
}

Write-Host "💠 AILCC Vanguard Node [$NodeName] Initialized."
Write-Host "📡 Broadcasting telemetry to -> $StatusFile"
Write-Host "Press Ctrl+C to terminate the daemon."

while ($true) {
    try {
        # 1. Capture Global CPU Utilization
        $CPUPercent = (Get-Counter '\Processor(_Total)\% Processor Time' -ErrorAction SilentlyContinue).CounterSamples.CookedValue
        $CPUInt = [math]::Round($CPUPercent)

        # 2. Capture Global Memory Utilization
        $Memos = Get-CimInstance Win32_OperatingSystem
        $TotalMemory = $Memos.TotalVisibleMemorySize
        $FreeMemory = $Memos.FreePhysicalMemory
        $UsedMemory = $TotalMemory - $FreeMemory
        $MemoryPercent = [math]::Round(($UsedMemory / $TotalMemory) * 100)

        # 3. Capture System Uptime
        $LastBoot = $Memos.LastBootUpTime
        $UptimeSpan = (Get-Date) - $LastBoot
        $UptimeString = "$($UptimeSpan.Days)d $($UptimeSpan.Hours)h $($UptimeSpan.Minutes)m"

        # 4. Construct JSON Payload
        $JsonObj = @{
            node = $NodeName
            os = $OS
            role = $Role
            cpu = $CPUInt
            memory = $MemoryPercent
            uptime = $UptimeString
            timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
            battery = "100%" # Stub for stationary mule
        }

        $JsonPayload = $JsonObj | ConvertTo-Json -Compress

        # 5. Overwrite the Heartbeat File in OneDrive
        Out-File -FilePath $StatusFile -InputObject $JsonPayload -Encoding utf8 -Force

        # Console Output for local monitoring
        Write-Host "[$((Get-Date).ToString("o"))] CPU: $CPUInt% | MEM: $MemoryPercent% | UPTIME: $UptimeString"

    } catch {
        Write-Warning "Failed to gather metrics: $_"
    }

    # Pulse every 10 seconds to limit OneDrive syncing overhead
    Start-Sleep -Seconds 10
}
