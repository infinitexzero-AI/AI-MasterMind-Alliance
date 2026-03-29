import requests
import time
import subprocess
import os

# Configuration
SERVICES = {
    "nexus-dashboard": "http://localhost:3001",
    "hippocampus-api": "http://localhost:8090/health",
}
INTERVAL = 60 # seconds
RETRY_COUNT = 3

def check_health(name, url):
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            print(f"[HEARTBEAT] {name} is healthy.")
            return True
        else:
            print(f"[HEARTBEAT] {name} returned status code {response.status_code}.")
            return False
    except Exception as e:
        print(f"[HEARTBEAT] {name} check failed: {e}")
        return False

def recover_system():
    print("[HEARTBEAT] Attempting system recovery via docker-compose...")
    try:
        subprocess.run(["docker-compose", "up", "-d"], check=True)
        print("[HEARTBEAT] Recovery command executed.")
    except Exception as e:
        print(f"[HEARTBEAT] Recovery failed: {e}")

def main():
    print("[HEARTBEAT] Cortex Heartbeat Started.")
    while True:
        all_healthy = True
        for name, url in SERVICES.items():
            healthy = False
            for _ in range(RETRY_COUNT):
                if check_health(name, url):
                    healthy = True
                    break
                time.sleep(5)
            
            if not healthy:
                all_healthy = False
                print(f"[HEARTBEAT] {name} IS DOWN.")
        
        if not all_healthy:
            recover_system()
        
        time.sleep(INTERVAL)

if __name__ == "__main__":
    main()
