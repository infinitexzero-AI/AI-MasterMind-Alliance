import time
import requests
import redis
import subprocess
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [CORTEX-HEARTBEAT] %(message)s")

# Define target endpoints
SERVICES = {
    "redis": {"type": "redis", "host": "localhost", "port": 6379, "container": "hippocampus-redis"},
    "api": {"type": "http", "url": "http://localhost:8090/health", "container": "hippocampus-api"},
    "n8n": {"type": "http", "url": "http://localhost:5678/healthz", "container": "ailcc-n8n-orchestrator"},
    "chroma": {"type": "http", "url": "http://localhost:8123/api/v2/heartbeat", "container": "ailcc-hippocampus-db"},
    "dashboard": {"type": "http", "url": "http://localhost:3000/api/health", "container": "nexus-dashboard"}
}

def restart_container(container_name):
    logging.warning(f"⚠️ Triggering auto-recovery for container: {container_name}")
    try:
        subprocess.run(["docker", "restart", container_name], check=True)
        logging.info(f"✅ Auto-recovery successful. {container_name} is back online.")
    except subprocess.CalledProcessError as e:
        logging.error(f"❌ Critical Failure: Could not restart {container_name}. Error: {e}")

def check_redis(service):
    try:
        r = redis.Redis(host=service["host"], port=service["port"], socket_timeout=3)
        return r.ping()
    except Exception:
        return False

def check_http(service):
    try:
        res = requests.get(service["url"], timeout=10)
        return res.status_code in [200, 401] # 401 is fine for n8n if auth is guarding, it means server is up
    except Exception:
        return False

def cortex_sweep():
    logging.info("Initiating Cortex Sweep...")
    for name, config in SERVICES.items():
        is_healthy = False
        if config["type"] == "redis":
            is_healthy = check_redis(config)
        elif config["type"] == "http":
            is_healthy = check_http(config)

        if is_healthy:
            logging.debug(f"[OK] {name}")
        else:
            logging.error(f"[FAIL] {name} is unreachable. Deploying countermeasures.")
            restart_container(config["container"])
            
    # Sub-Routine: Storage Circuit Breaker (10GB Threshold)
    try:
        from storage_evacuation import check_disk_space, execute_evacuation, PRIMARY_DRIVE, CRITICAL_THRESHOLD
        free_space = check_disk_space(PRIMARY_DRIVE)
        if free_space < CRITICAL_THRESHOLD:
            logging.warning("⚠️ Storage critical. Executing auto-evacuation protocol.")
            execute_evacuation()
    except Exception as e:
        logging.error(f"Failed to run storage circuit breaker: {e}")

    # Sub-Routine: Entropy Judge (Run periodically based on global SWEEP_COUNT)
    global SWEEP_COUNT
    if SWEEP_COUNT % 10 == 0:
        try:
            from entropy_judge import run_judge_cycle
            run_judge_cycle()
        except Exception as e:
            logging.error(f"Failed to run Entropy Judge: {e}")
            
    SWEEP_COUNT += 1

SWEEP_COUNT = 0

if __name__ == "__main__":
    logging.info("🔱 AILCC Cortex Heartbeat Monitor Activated. System 4.0 Watchdog Online.")
    while True:
        try:
            cortex_sweep()
            time.sleep(30) # Sweep every 30 seconds
        except KeyboardInterrupt:
            logging.info("Cortex Heartbeat gracefully shutting down.")
            break
        except Exception as e:
            logging.error(f"Watchdog encountered critical failure: {e}")
            time.sleep(10)
