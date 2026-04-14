# AILCC Nexus Alliance Launch Sequence (Windows Vanguard)
# Run this script to spin up the entire distributed agentic mesh.

Write-Host "--- AI Mastermind Alliance Launch Sequence ---" -ForegroundColor Cyan

# 1. Start Docker Core (Redis, Qdrant, n8n)
Write-Host "[1/4] Starting Docker Stack..." -ForegroundColor Yellow
# Assuming docker-compose is at project root/docker
if (Test-Path ".\docker-compose.yml") {
    docker-compose up -d
}

# 2. Start Performance Throttler (Hardware Sovereignty)
Write-Host "[2/4] Initializing Performance Throttler..." -ForegroundColor Yellow
Start-Process python -ArgumentList "01_Areas/Codebases/ailcc/scripts/performance_throttler.py" -WindowStyle Minimized

# 3. Start Neural Relay (Socket Service)
Write-Host "[3/5] Launching Neural Relay on Port 5005..." -ForegroundColor Yellow
$RelayPath = "01_Areas/Codebases/ailcc/dashboard/server/relay.js"
Start-Process node -ArgumentList $RelayPath -WindowStyle Minimized

# 4. Start Nexus Dashboard (Next.js Frontend)
Write-Host "[4/5] Starting Nexus Dashboard on Port 3000..." -ForegroundColor Yellow
$DashboardPath = "$PSScriptRoot\01_Areas\Codebases\ailcc\dashboard"
Start-Process powershell -ArgumentList "-NoProfile -Command Set-Location '$DashboardPath'; npm run dev" -WindowStyle Minimized

# 5. Start Vanguard Research Node (OpenClaw)
Write-Host "[5/5] Activating Vanguard Research Engine..." -ForegroundColor Yellow
$VanguardPath = "01_Areas/Codebases/ailcc/core/vanguard_openclaw_node.py"
Start-Process python -ArgumentList $VanguardPath -WindowStyle Minimized

Write-Host "--- ALLIANCE CORE ONLINE ---" -ForegroundColor Green
Write-Host "Neural Link: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Target Mode: PEAK PERFORMANCE (NoSuppression)" -ForegroundColor White
