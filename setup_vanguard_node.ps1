Write-Host "INITIALIZING VANGUARD COMPUTE ENGINE..." -ForegroundColor Cyan

# 1. Install WSL
Write-Host "1. Installing Windows Subsystem for Linux (Phase 1)..." -ForegroundColor Yellow
wsl --install

# 2. Install OpenSSH Server
Write-Host "2. Installing OpenSSH Server (Phase 3 Security Amendment)..." -ForegroundColor Yellow
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# 3. Configure OpenSSH Server
Write-Host "3. Configuring OpenSSH Server to auto-start and checking firewall..." -ForegroundColor Yellow
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

if (!(Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue | Select-Object Name, Enabled)) {
    Write-Host "Adding Firewall Rule for SSH..."
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
}

Write-Host "--------------------------------------------------------" -ForegroundColor Green
Write-Host "PHASE 1 CORE INSTALLATION COMPLETE." -ForegroundColor Red
Write-Host "Please RESTART this system." -ForegroundColor Yellow
Write-Host "When you reconnect, simply tell me: 'Resume Phase 2' and we will proceed with Docker Desktop deployment!" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------" -ForegroundColor Green

Read-Host -Prompt "Press Enter to continue"
