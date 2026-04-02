import asyncio
import json
import logging
import os
from bs4 import BeautifulSoup
import html2text
from playwright.async_api import async_playwright

from core.daemon_factory import ReactiveDaemon
from core.llm_gateway import LLMGateway

logger = logging.getLogger("BrowserDaemon")

class BrowserDaemon(ReactiveDaemon):
    """
    Phase 85: AGI Deep-Research Integration
    Grants the Vanguard Swarm native access to the live internet via fully headless Chromium.
    """
    def __init__(self):
        super().__init__(name="Comet", role="Autonomous Web Researcher")
        self.grok_key = os.getenv("GROK_API_KEY")

    async def get_channels(self):
         return ["channel:browser_request"]

    async def handle_message(self, channel, payload):
         task_id = payload.get("task_id", "unknown")
         prompt = payload.get("prompt", "")
         
         await self.broadcast_status("Comet", "IN_PROGRESS", f"Initializing stealth Chromium instance to investigate: {prompt[:40]}...")
         
         try:
             # Convert the natural language query into a secure external search URL
             search_query = prompt.replace(' ', '+')
             search_url = f"https://duckduckgo.com/html/?q={search_query}"
             
             markdown_content = ""
             
             async with async_playwright() as p:
                 browser = await p.chromium.launch(headless=True)
                 context = await browser.new_context(
                     user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                 )
                 page = await context.new_page()
                 
                 await self.broadcast_status("Comet", "IN_PROGRESS", f"Scraping SERP topography...")
                 await page.goto(search_url, timeout=30000)
                 
                 # Force implicit wait for results to load in pure HTML
                 await asyncio.sleep(2)
                 html = await page.content()
                 
                 soup = BeautifulSoup(html, "html.parser")
                 results = [a.get('href') for a in soup.find_all('a', class_='result__url')]
                 
                 if results and "//duckduckgo.com/l/?" in results[0]:
                     # Clean DDG redirect wrapper
                     import urllib.parse
                     top_url = urllib.parse.unquote(results[0].split("uddg=")[1].split("&")[0])
                 else:
                     top_url = results[0] if results else None
                 
                 if top_url:
                     await self.broadcast_status("Comet", "IN_PROGRESS", f"Extracting DOM matrix from target: {top_url}")
                     
                     await page.goto(top_url, timeout=45000)
                     
                     # Give JS time to hydrate SPAs securely
                     await asyncio.sleep(3)
                     
                     page_html = await page.content()
                     
                     # Render structural DOM to raw Markdown
                     h2t = html2text.HTML2Text()
                     h2t.ignore_links = False
                     h2t.ignore_images = True
                     h2t.body_width = 0
                     markdown_content = h2t.handle(page_html)
                     
                     # Enforce sanity limits on context window
                     markdown_content = markdown_content[:25000]
                 else:
                     markdown_content = "Target null. No external domains located for this objective."
                     
                 await browser.close()
                 
             # AGI Synthesis
             await self.broadcast_status("Comet", "IN_PROGRESS", "Filtering scraped markdown through Grok contextual synthesis...")
             
             system_prompt = "You are Comet, an Elite Deep-Research Swarm Node. You just autonomously navigated the web and scraped this site. Answer the Commander's query conclusively based ONLY on the scraped context. Output flawless markdown."
             final_report = await LLMGateway.ask_agent(
                 "grok", self.grok_key, "grok-beta", 
                 system_prompt, 
                 f"Commander Query: {prompt}\n\nScraped Markdown Context:\n{markdown_content}"
             )
             
             await self.broadcast_status("Comet", "COMPLETED", final_report)
             
         except Exception as e:
             logger.error(f"Playwright navigation matrix failed: {e}")
             await self.broadcast_status("Comet", "FAILED", f"Headless Browser crashed: {str(e)}")

if __name__ == "__main__":
    daemon = BrowserDaemon()
    asyncio.run(daemon.run())
