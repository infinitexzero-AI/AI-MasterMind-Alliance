# AILCC Vanguard Windows Local Drop (Clipboard Sync)
# Captures local Windows clipboard and bridges it over LAN to the Mac Relay Server

$NodeName = "ThinkPad27"
$MacIP = "10.0.0.245"
$RelayUrl = "http://${MacIP}:5005/api/system/clipboard"

Write-Host "AILCC Local Drop (Clipboard Sync) Initialized on $NodeName"
Write-Host "Bridging over LAN to Origin Node at -> $MacIP"

$LastLocalClip = ""
$LastRemoteClip = ""

while ($true) {
    try {
        # 1. Check if local Windows clipboard changed
        # Fix: PowerShell 5.1 does not support the -Raw flag. Read lines and join.
        $ClipArray = Get-Clipboard -ErrorAction SilentlyContinue
        
        if ($null -ne $ClipArray) {
            # In PS5.1, multi-line clipboards come as an array of strings. Join them.
            if ($ClipArray -is [array]) {
                $CurrentLocal = $ClipArray -join "`n"
            } else {
                $CurrentLocal = $ClipArray.ToString()
            }
        } else {
            $CurrentLocal = ""
        }
        
        if ($CurrentLocal -and $CurrentLocal -ne $LastLocalClip -and $CurrentLocal -ne $LastRemoteClip) {
            $LastLocalClip = $CurrentLocal
            $Body = @{ action="set"; text=$CurrentLocal; source=$NodeName } | ConvertTo-Json
            
            Invoke-RestMethod -Uri $RelayUrl -Method Post -Body $Body -ContentType 'application/json' | Out-Null
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Pushed Windows Clipboard -> Network"
        }

        # 2. Poll Mac Relay for remote clipboard incoming from Mac
        $BodyGet = @{ action="get" } | ConvertTo-Json
        $Resp = Invoke-RestMethod -Uri $RelayUrl -Method Post -Body $BodyGet -ContentType 'application/json' -ErrorAction SilentlyContinue
        
        $RemoteText = $Resp.text
        if ($RemoteText -and $RemoteText -ne $LastLocalClip -and $RemoteText -ne $LastRemoteClip) {
            $RemoteText | Set-Clipboard
            $LastRemoteClip = $RemoteText
            $LastLocalClip = $RemoteText
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Pulled Network Clipboard -> Windows"
        }
    } catch {
        Write-Host "NETWORK ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $LastLocalClip = "" # Reset so it tries again next time
        Start-Sleep -Seconds 3
    }
    
    # Tick rate
    Start-Sleep -Seconds 1.5
}
