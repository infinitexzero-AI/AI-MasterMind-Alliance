param(
    [string]$Message = "[Vanguard] Automated Sync via AI"
)

Write-Host "[*] Vanguard Node Sync Initiated" -ForegroundColor Cyan

# Ensure git is tracking everything except our .gitignore rules
git add .
git commit -m $Message

# Push to central hub
Write-Host "[>] Transmitting to Command Center Hub..." -ForegroundColor Yellow
git push origin main

Write-Host "[OK] Sync Complete! The Alliance is aligned." -ForegroundColor Green
