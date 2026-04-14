import os
import sys
import json
import psutil
import docker
from datetime import datetime

def get_docker_stats():
    try:
        client = docker.from_env()
        containers = client.containers.list()
        stats = []
        
        # Essential containers to track on Windows Vanguard node
        essential = ['ailcc_n8n', 'ailcc_redis', 'ailcc_qdrant', 'nexus-hippocampus']
        
        running_names = [c.name for c in containers]
        
        res = {
            "containers": [],
            "status": "HEALTHY" if all(name in running_names for name in essential) else "DEGRADED"
        }
        
        for name in essential:
            status = "online" if name in running_names else "offline"
            container_stats = {"name": name, "status": status, "cpu": 0, "mem": 0}
            
            if status == "online":
                try:
                    c = client.containers.get(name)
                    container_stats["state"] = c.status
                except:
                    pass
            res["containers"].append(container_stats)
            
        return res
    except Exception as e:
        return {"error": str(e), "status": "UNAVAILABLE", "containers": []}

def get_system_vitals():
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Map to SystemHealthResponse structure for health.api
    return {
        "memory": {
            "freeRAM": mem.available // (1024 * 1024),
            "swapUsed": str(psutil.swap_memory().used // (1024 * 1024)),
            "swapTotal": str(psutil.swap_memory().total // (1024 * 1024)),
            "swapPercent": psutil.swap_memory().percent,
            "status": "healthy" if mem.percent < 90 else "warning"
        },
        "disk": {
            "used": f"{disk.used // (1024**3)}GB",
            "total": f"{disk.total // (1024**3)}GB",
            "percent": disk.percent
        },
        "cpu": psutil.cpu_percent(interval=None),
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    output = {
        "system": get_system_vitals(),
        "docker": get_docker_stats()
    }
    print(json.dumps(output))
