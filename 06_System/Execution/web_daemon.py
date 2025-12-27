import json
import os
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime

# Paths
ROOT = "/Users/infinite27/AILCC_PRIME"
TASKS_FILE = f"{ROOT}/06_System/AILCC/web_tasks.json"
OUTPUT_DIR = f"{ROOT}/06_System/AILCC/context/web"
STATUS_FILE = f"{ROOT}/06_System/State/status.json"
LOG_FILE = f"{ROOT}/06_System/Logs/web_daemon.log"

def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"[{timestamp}] {message}"
    print(entry)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")

def update_status(task_desc):
    try:
        with open(STATUS_FILE, "r") as f:
            data = json.load(f)
        data["agents"]["web_daemon"]["status"] = "ACTIVE"
        data["agents"]["web_daemon"]["task"] = task_desc
        data["last_updated"] = datetime.now().isoformat()
        with open(STATUS_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        log(f"Error updating status: {e}")

def set_idle():
    try:
        with open(STATUS_FILE, "r") as f:
            data = json.load(f)
        data["agents"]["web_daemon"]["status"] = "IDLE"
        data["agents"]["web_daemon"]["task"] = "Monitoring inbox"
        data["last_updated"] = datetime.now().isoformat()
        with open(STATUS_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        log(f"Error setting idle: {e}")

def scrape_url(url, task_id):
    log(f"Scraping: {url}")
    try:
        response = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0 (AILCC/Mode5/Daemon)"})
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Basic extraction: Title + Paragraphs
        title = soup.title.string if soup.title else "No Title"
        paragraphs = soup.find_all('p')
        text_content = "\n\n".join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
        
        markdown_content = f"# {title}\n\n*Source: {url}*\n*Captured: {datetime.now().isoformat()}*\n\n---\n\n{text_content}"
        
        filename = f"{task_id}_{int(time.time())}.md"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        with open(filepath, "w") as f:
            f.write(markdown_content)
        
        log(f"Saved to: {filepath}")
        return True
    except Exception as e:
        log(f"Failed to scrape {url}: {e}")
        return False

def process_tasks():
    if not os.path.exists(TASKS_FILE):
        return

    try:
        with open(TASKS_FILE, "r") as f:
            tasks = json.load(f)
    except Exception as e:
        log(f"Error reading tasks: {e}")
        return

    updated = False
    for task in tasks:
        if task.get("status") == "pending":
            update_status(f"Scraping {task['url']}")
            success = scrape_url(task["url"], task.get("id", "task"))
            task["status"] = "done" if success else "failed"
            task["completed_at"] = datetime.now().isoformat()
            updated = True

    if updated:
        with open(TASKS_FILE, "w") as f:
            json.dump(tasks, f, indent=2)
        set_idle()

if __name__ == "__main__":
    log("Web Daemon started.")
    set_idle()
    while True:
        process_tasks()
        time.sleep(5)
