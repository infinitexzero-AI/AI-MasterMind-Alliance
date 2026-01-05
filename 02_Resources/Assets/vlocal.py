#!/usr/bin/env python3
"""
Valentine Optimization System - Automated Ongoing Checks with Logging and Notifications
"""

import os
import sys
import time
import threading
from datetime import datetime

try:
    import psutil
    import requests
except ImportError:
    psutil = None

LOGS_DIR = "./logs"
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

def notify_user(message: str):
    """Send a user notification (customize for integration)"""
    print(f"[NOTIFY] {message}")
    # Example: Send to Slack, Email, or desktop notification

def log_event(message: str):
    """Write an event or report to a log file"""
    with open(os.path.join(LOGS_DIR, "valentine.log"), "a") as log:
        log.write(f"{datetime.now().isoformat()} - {message}\n")

def check_system_resources():
    """Return current resource dictionary"""
    res = {}
    if psutil:
        res["cpu"] = psutil.cpu_percent(interval=1)
        mem = psutil.virtual_memory()
        res["mem_usage"] = mem.percent
        res["mem_avail"] = mem.available / (1024**3)
        res["mem_total"] = mem.total / (1024**3)
        disk = psutil.disk_usage('/')
        res["disk"] = disk.percent
        res["disk_free"] = disk.free / (1024**3)
        res["processes"] = len(psutil.pids())
    else:
        res = None
    return res

def valentine_capacity_report(res):
    """Generate and optionally notify/report Valentine status"""
    if not res:
        return "psutil not available - install with: pip3 install psutil"
    memory_score = (res["mem_avail"] / res["mem_total"]) * 100
    disk_score = min((res["disk_free"] / 10) * 100, 100)
    cpu_load = 100 - res["cpu"]
    valentine_score = (memory_score + disk_score + cpu_load) / 3
    status = "🔴 LIMITED" if valentine_score < 60 else (
             "🟡 GOOD" if valentine_score < 80 else "🟢 EXCELLENT")
    report = (
        f"Valentine check at {datetime.now()}:\n"
        f"CPU Usage: {res['cpu']}% | RAM: {res['mem_usage']}% (Available: {res['mem_avail']:.2f} GB)\n"
        f"Disk Usage: {res['disk']}% (Free: {res['disk_free']:.2f} GB)\n"
        f"Processes: {res['processes']}\n"
        f"Score: {valentine_score:.1f}/100 - {status}"
    )
    log_event(report)
    notify_user(report)
    return report

def run_ongoing_checks(interval_sec=300, stop_event=None):
    """Automate ongoing checks every interval_sec seconds"""
    while not (stop_event and stop_event.is_set()):
        res = check_system_resources()
        rep = valentine_capacity_report(res)
        print(rep)
        time.sleep(interval_sec)

def valentine_integration_hook(report):
    """Integrate with external agent/process (e.g., send/trigger action)"""
    # Example: API call to remote agent/process, socket, webhook, etc
    print(f"[VALENTINE] Integration hook triggered.")
    # requests.post("https://valentine.myapi/notify", json={"report": report})

def main():
    print("="*60)
    print("Valentine Ongoing Optimization System\nAutomated Monitoring, Logging, Notification, Integration")
    print("="*60)
    # One time initial check
    res = check_system_resources()
    show = valentine_capacity_report(res)
    print(show)
    # Integration hook
    valentine_integration_hook(show)
    # Ongoing checks (threaded for live environments)
    stop_flag = threading.Event()
    # Change interval_sec as needed (e.g., every 60 seconds)
    thread = threading.Thread(target=run_ongoing_checks, args=(300, stop_flag))
    thread.daemon = True
    thread.start()
    print("Ongoing monitoring started. Press Ctrl+C to exit.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        stop_flag.set()
        print("\nStopped Valentine ongoing optimization.")

if __name__ == "__main__":
    main()
