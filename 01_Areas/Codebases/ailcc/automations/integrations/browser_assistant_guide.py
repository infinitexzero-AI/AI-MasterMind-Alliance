#!/usr/bin/env python3
"""
browser_assistant_guide.py — Autonomous Browser Execution Guide (Vanguard Swarm)
================================================================================
This script serves as the master template and execution engine for automated
browser interactions within the Mastermind OS. 

It uses Playwright to autonomously navigate the Mastermind dashboard, verify UI 
components are rendering correctly, and perform highly-specific repetitive tasks
(quick wins) on the web.

Usage:
    python3 browser_assistant_guide.py --verify-dashboard
    python3 browser_assistant_guide.py --quick-win [task_name]
"""

import os
import time
import json
import logging
import argparse
import urllib.request
import urllib.error
from pathlib import Path
from playwright.sync_api import sync_playwright

logging.basicConfig(level=logging.INFO, format="%(asctime)s [BrowserGuide] %(message)s")
logger = logging.getLogger(__name__)

AILCC_ROOT = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc")
SCREENSHOT_DIR = AILCC_ROOT / "logs" / "browser_proofs"

def wait_for_server(url: str, timeout_seconds: int = 60) -> bool:
    """Polls the local development server until it responds before launching Playwright."""
    logger.info(f"Polling {url} to ensure server is online...")
    start_time = time.time()
    
    while time.time() - start_time < timeout_seconds:
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                if response.status == 200:
                    logger.info("✅ Server is online and ready.")
                    return True
        except urllib.error.URLError:
            pass
        
        time.sleep(2)
        
    logger.error(f"❌ Server at {url} failed to respond within {timeout_seconds} seconds. Aborting browser execution.")
    return False

def verify_dashboard_ui():
    """Autonomously navigates the Mastermind Nexus to verify Phase 100 UI components."""
    if not wait_for_server("http://localhost:3000"):
        return
        
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    
    with sync_playwright() as p:
        logger.info("Launching autonomous browser instance...")
        # Launch headed so the Commander can watch the ghost in the machine
        browser = p.chromium.launch(headless=False, slow_mo=500)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            logger.info("Navigating to local Mastermind Nexus (http://localhost:3000)...")
            page.goto("http://localhost:3000", timeout=60000)
            
            # Wait for the UI components to mount
            page.wait_for_load_state("domcontentloaded")
            # Extra buffer for React hydration
            time.sleep(2)
            
            # 1. Verify OmniTracker is visible
            logger.info("Scanning for OmniTracker component...")
            omnitracker = page.locator("text=ACTIVE INITIATIVES")
            if omnitracker.is_visible():
                logger.info("✅ OmniTracker verified.")
            else:
                logger.warning("❌ OmniTracker not found.")

            # 2. Verify Friday Voice Protocol
            logger.info("Scanning for Friday Voice Protocol...")
            voice = page.locator("text=FRIDAY PROTOCOL (VOICE)")
            if voice.is_visible():
                logger.info("✅ Voice Protocol widget verified.")

            # 3. Take a full-page proof-of-work screenshot
            proof_path = SCREENSHOT_DIR / f"dashboard_verification_{int(time.time())}.png"
            page.screenshot(path=str(proof_path), full_page=True)
            logger.info(f"📸 Visual proof of work saved to: {proof_path.name}")
            
            # 4. Simulate a scroll down to the Tycoon/Sovereign components
            page.mouse.wheel(0, 1000)
            time.sleep(1)
            
            logger.info("Dashboard UI verification sweep completed.")
            
        except Exception as e:
            logger.error(f"Browser automation failed: {e}")
        finally:
            browser.close()

def execute_quick_win(task_name: str):
    """
    Template for executing distinct, high-ROI asynchronous web tasks (The Comet Protocol).
    """
    logger.info(f"Executing Browser Quick Win: {task_name}")
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            if task_name == "fetch_sp500":
                page.goto("https://finance.yahoo.com/quote/%5EGSPC", timeout=30000)
                price_element = page.locator("fin-streamer[data-field='regularMarketPrice']").first
                price = price_element.inner_text()
                logger.info(f"📈 Current S&P 500 Global Value: {price}")
                
            elif task_name == "fetch_weather":
                # Simple weather payload string extraction
                page.goto("https://wttr.in/Toronto?format=j1", timeout=30000)
                json_data = json.loads(page.locator("body").inner_text())
                temp = json_data['current_condition'][0]['temp_C']
                desc = json_data['current_condition'][0]['weatherDesc'][0]['value']
                logger.info(f"🌤️ Current Weather in Toronto: {temp}°C | Condition: {desc}")
                
            elif task_name == "scrape_news":
                page.goto("https://news.ycombinator.com/", timeout=30000)
                titles = page.locator(".titleline > a").all_inner_texts()
                logger.info("📰 Top 3 Hacker News Headlines:")
                for i, title in enumerate(titles[:3]):
                    logger.info(f"   {i+1}. {title}")
                    
            elif task_name == "local_dashboard_health":
                logger.info("Running silent background health check on Mastermind OS...")
                if not wait_for_server("http://localhost:3000", timeout_seconds=10):
                    logger.warning("Local server is currently offline.")
                    return
                
                # Attach console listener for React render errors
                page.on("console", lambda msg: logger.warning(f"Browser Console {msg.type}: {msg.text}") if msg.type == "error" else None)
                page.goto("http://localhost:3000", timeout=60000)
                page.wait_for_load_state("domcontentloaded")
                time.sleep(2)
                
                omni = page.locator("text=ACTIVE INITIATIVES").is_visible()
                voice = page.locator("text=FRIDAY PROTOCOL (VOICE)").is_visible()
                
                if omni and voice:
                    logger.info("💗 Dashboard Health Check PASSED. All critical widgets rendering natively.")
                else:
                    logger.warning(f"💔 Dashboard Health Check FAILED. Omni Tracker: {omni}, Friday Protocol: {voice}")
                    
            else:
                logger.warning(f"Unknown quick win task: {task_name}")
                
        except Exception as e:
            logger.error(f"Task {task_name} encountered an Exception: {e}")
            proof = SCREENSHOT_DIR / f"error_{task_name}_{int(time.time())}.png"
            page.screenshot(path=str(proof), full_page=True)
            logger.info(f"📸 Failure trace visual captured to {proof.name}")
        finally:
            browser.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mastermind OS Browser Guide")
    parser.add_argument("--verify-dashboard", action="store_true", help="Run automated test over local UI elements")
    parser.add_argument("--quick-win", type=str, help="Execute a specific asynchronous web task")
    args = parser.parse_args()

    if args.verify_dashboard:
        verify_dashboard_ui()
    elif args.quick_win:
        execute_quick_win(args.quick_win)
    else:
        logger.info("No command provided. Use --verify-dashboard or --quick-win [task]")
