#!/bin/bash
# API Helper: Get Storage Tier Status
# Returns JSON with current status of all storage tiers

set -euo pipefail

# Get internal SSD status
ssd_total=$(df -h / | awk 'NR==2 {print $2}')
ssd_used=$(df -h / | awk 'NR==2 {print $3}')
ssd_free=$(df -h / | awk 'NR==2 {print $4}')
ssd_percent=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')

# Get XDriveAlpha status
if [ -d "/Volumes/XDriveAlpha" ]; then
    alpha_mounted=true
    alpha_total=$(df -h /Volumes/XDriveAlpha | awk 'NR==2 {print $2}')
    alpha_used=$(df -h /Volumes/XDriveAlpha | awk 'NR==2 {print $3}')
    alpha_free=$(df -h /Volumes/XDriveAlpha | awk 'NR==2 {print $4}')
    alpha_percent=$(df -h /Volumes/XDriveAlpha | awk 'NR==2 {print $5}' | tr -d '%')
else
    alpha_mounted=false
    alpha_total="0"
    alpha_used="0"
    alpha_free="0"
    alpha_percent="0"
fi

# Get XDriveBeta status
if [ -d "/Volumes/XDriveBeta" ]; then
    beta_mounted=true
    beta_total=$(df -h /Volumes/XDriveBeta | awk 'NR==2 {print $2}')
    beta_used=$(df -h /Volumes/XDriveBeta | awk 'NR==2 {print $3}')
    beta_free=$(df -h /Volumes/XDriveBeta | awk 'NR==2 {print $4}')
    beta_percent=$(df -h /Volumes/XDriveBeta | awk 'NR==2 {print $5}' | tr -d '%')
else
    beta_mounted=false
    beta_total="0"
    beta_used="0"
    beta_free="0"
    beta_percent="0"
fi

# Get Docker.raw size
docker_raw_size="0MB"
if [ -f "$HOME/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw" ]; then
    docker_raw_size=$(du -sh "$HOME/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw" 2>/dev/null | awk '{print $1}')
fi

# Determine health status
ssd_status="healthy"
if [ "$ssd_percent" -gt 85 ]; then
    ssd_status="critical"
elif [ "$ssd_percent" -gt 75 ]; then
    ssd_status="warning"
fi

alpha_status="healthy"
if [ "$alpha_mounted" = false ]; then
    alpha_status="unmounted"
elif [ "$alpha_percent" -gt 85 ]; then
    alpha_status="critical"
elif [ "$alpha_percent" -gt 75 ]; then
    alpha_status="warning"
fi

beta_status="healthy"
if [ "$beta_mounted" = false ]; then
    beta_status="unmounted"
elif [ "$beta_percent" -gt 85 ]; then
    beta_status="critical"
elif [ "$beta_percent" -gt 75 ]; then
    beta_status="warning"
fi

# Output JSON
cat <<EOF
{
  "hot": {
    "name": "Internal SSD",
    "path": "/",
    "total": "$ssd_total",
    "used": "$ssd_used",
    "free": "$ssd_free",
    "percent": $ssd_percent,
    "status": "$ssd_status",
    "dockerRaw": "$docker_raw_size",
    "tier": "hot",
    "description": "Active work, Docker, Dev tools"
  },
  "warm": {
    "name": "XDriveAlpha",
    "path": "/Volumes/XDriveAlpha",
    "mounted": $alpha_mounted,
    "total": "$alpha_total",
    "used": "$alpha_used",
    "free": "$alpha_free",
    "percent": $alpha_percent,
    "status": "$alpha_status",
    "tier": "warm",
    "description": "Archives, Old projects, Large files"
  },
  "cold": {
    "name": "XDriveBeta",
    "path": "/Volumes/XDriveBeta",
    "mounted": $beta_mounted,
    "total": "$beta_total",
    "used": "$beta_used",
    "free": "$beta_free",
    "percent": $beta_percent,
    "status": "$beta_status",
    "tier": "cold",
    "description": "Backups, Disaster recovery"
  },
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
