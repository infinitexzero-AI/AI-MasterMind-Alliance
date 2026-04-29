#!/usr/bin/env python3

import os
import json
import subprocess
import datetime
from pathlib import Path

WORKSPACE_DIR = "/Volumes/XDriveBeta/AILCC_PRIME"
OUTPUT_FILE = os.path.join(WORKSPACE_DIR, "SYSTEM_INVENTORY.md")
JSON_OUTPUT = os.path.join(WORKSPACE_DIR, "SYSTEM_INVENTORY.json")

def get_pm2_status():
    try:
        # Get raw JSON from PM2
        result = subprocess.run(["pm2", "jlist"], capture_output=True, text=True, timeout=10)
        if result.returncode != 0:
            return []
        data = json.loads(result.stdout)
        services = []
        for process in data:
            services.append({
                "name": process.get("name"),
                "status": process.get("pm2_env", {}).get("status"),
                "memory": process.get("monit", {}).get("memory", 0) // (1024 * 1024), # MB
                "cpu": process.get("monit", {}).get("cpu", 0)
            })
        return services
    except Exception as e:
        print(f"Error getting PM2 status: {e}")
        return []

def get_docker_status():
    try:
        result = subprocess.run(["docker", "ps", "--format", "{{json .}}"], capture_output=True, text=True, timeout=10)
        containers = []
        for line in result.stdout.strip().split("\n"):
            if line:
                data = json.loads(line)
                containers.append({
                    "name": data.get("Names"),
                    "status": data.get("State"),
                    "image": data.get("Image"),
                    "ports": data.get("Ports")
                })
        return containers
    except Exception as e:
        print(f"Error getting Docker status: {e}")
        return []

def scan_directories():
    target_dirs = ["nexus-dashboard", "valentine-core", "daemon", "n8n_foundation"]
    stats = {}
    for d in target_dirs:
        path = os.path.join(WORKSPACE_DIR, d)
        if os.path.exists(path):
            file_count = 0
            size_mb = 0
            for root, dirs, files in os.walk(path):
                # Prevent traversal into node_modules and hidden folders
                dirs[:] = [d for d in dirs if d != 'node_modules' and not d.startswith('.')]
                
                for f in files:
                    if not f.startswith('.'):
                        file_count += 1
                        try:
                            size_mb += os.path.getsize(os.path.join(root, f)) / (1024 * 1024)
                        except FileNotFoundError:
                            pass
            stats[d] = {"files": file_count, "size_mb": round(size_mb, 2)}
        else:
            stats[d] = {"files": 0, "size_mb": 0, "status": "Missing"}
    return stats

def check_mounts():
    mounts = {
        "XDriveBeta": "/Volumes/XDriveBeta",
        "GoogleDrive": "/Volumes/Google Drive"
    }
    status = {}
    for name, path in mounts.items():
        status[name] = "Mounted" if os.path.ismount(path) or os.path.exists(path) else "Disconnected"
    return status

def generate_markdown(pm2, docker, dirs, mounts):
    now = datetime.datetime.now().isoformat()
    
    md = f"# 📊 Sovereign OS System Inventory\n"
    md += f"*Last Updated: {now}*\n\n"
    
    md += "## ⚙️ PM2 Daemon Services\n"
    if pm2:
        md += "| Service Name | Status | CPU % | Memory (MB) |\n"
        md += "|---|---|---|---|\n"
        for s in pm2:
            status_icon = "🟢" if s['status'] == "online" else "🔴"
            md += f"| {status_icon} {s['name']} | {s['status']} | {s['cpu']}% | {s['memory']} MB |\n"
    else:
        md += "> No PM2 services detected.\n"
    
    md += "\n## 🐳 Docker Containers\n"
    if docker:
        md += "| Container Name | Image | Status | Ports |\n"
        md += "|---|---|---|---|\n"
        for c in docker:
            status_icon = "🟢" if "running" in c['status'].lower() else "🔴"
            md += f"| {status_icon} {c['name']} | {c['image']} | {c['status']} | {c['ports']} |\n"
    else:
        md += "> No Docker containers running.\n"

    md += "\n## 📁 Core Directory Statistics\n"
    md += "| Component | File Count | Size (MB) |\n"
    md += "|---|---|---|\n"
    for name, stat in dirs.items():
        if stat.get("status") == "Missing":
            md += f"| ⚠️ {name} | Missing | - |\n"
        else:
            md += f"| 📁 {name} | {stat['files']} | {stat['size_mb']} MB |\n"

    md += "\n## 💾 Hardware / Cloud Mounts\n"
    md += "| Storage Node | Status |\n"
    md += "|---|---|\n"
    for name, status in mounts.items():
        icon = "🟢" if status == "Mounted" else "🔴"
        md += f"| {icon} {name} | {status} |\n"
        
    return md

def main():
    print("Gathering inventory telemetry...")
    pm2 = get_pm2_status()
    docker = get_docker_status()
    dirs = scan_directories()
    mounts = check_mounts()
    
    # Save JSON dump
    data = {
        "timestamp": datetime.datetime.now().isoformat(),
        "pm2": pm2,
        "docker": docker,
        "directories": dirs,
        "mounts": mounts
    }
    with open(JSON_OUTPUT, 'w') as f:
        json.dump(data, f, indent=2)
        
    # Save Markdown
    md = generate_markdown(pm2, docker, dirs, mounts)
    with open(OUTPUT_FILE, 'w') as f:
        f.write(md)
        
    print(f"Inventory updated at {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
