Write-Host "Starting deployment..."
Set-Location C:\Users\infin\AILCC_PRIME\01_Areas\Codebases
if (!(Test-Path ailcc)) { New-Item -ItemType Directory -Path ailcc }
Set-Location ailcc
Write-Host "Extracting TAR..."
tar -xzf ..\ailcc_sync.tar.gz
Write-Host "Creating VENV..."
python -m venv .venv
Write-Host "Installing Requirements..."
.\.venv\Scripts\python -m pip install -r requirements.txt
Write-Host "Deployment Complete."
