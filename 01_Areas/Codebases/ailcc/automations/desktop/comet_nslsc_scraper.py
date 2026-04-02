import asyncio
import json
import re
from datetime import datetime
from pathlib import Path
from playwright.async_api import async_playwright

# AILCC Prime Paths
AUTOMATIONS_DIR = Path(__file__).resolve().parent.parent
TREASURY_DIR = AUTOMATIONS_DIR.parent / "hippocampus_storage" / "treasury"
LEDGER_FILE = TREASURY_DIR / "nslsc_ledger.jsonl"
NSLSC_URL = "https://www.csnpe-nslsc.canada.ca/en/home"

def extract_balance(text: str) -> float:
    """Mathematical extraction of currency strings from raw DOM text."""
    # Matches $12,345.67 or 12345.67
    matches = re.findall(r'\\$?\\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\\.[0-9]{2})?)', text)
    if not matches:
        return 0.0
    
    # Usually the largest currency number on the dashboard is the total loan balance
    max_val = 0.0
    for match in matches:
        clean_num = float(match.replace(',', ''))
        if clean_num > max_val:
            max_val = clean_num
    return max_val

async def harvest_nslsc():
    print("\\n🚀 [Comet] Sovereign Treasury Protocol Initiated (NSLSC)")
    TREASURY_DIR.mkdir(parents=True, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        print(f"Commander: Navigating to {NSLSC_URL}...")
        await page.goto(NSLSC_URL)
        
        print("⏸️  Waiting for Commander to manually authenticate (GCKey or Sign-In Partner).")
        print("   The Canadian Government 2FA layer is actively engaged.")
        print("   Comet is structurally paused. Navigate to the main Dashboard when ready.")
        
        # Wait for the dashboard to load (timeout=0 means infinite wait)
        # The NSLSC dashboard usually contains the word "Dashboard" in the URL or "Loan" in the DOM
        try:
            # We wait until the page text explicitly contains "Balance" or "Dashboard"
            print("\\n⏳ Awaiting physical login bypass...")
            await page.wait_for_function('''() => {
                return window.location.href.toLowerCase().includes('dashboard') || 
                       document.body.innerText.toLowerCase().includes('loan balance');
            }''', timeout=0)
        except Exception as e:
            print(f"⚠️ Error waiting for dashboard: {e}")
            
        print("\\n✅ Authentication confirmed. Active supervised session locked on the NSLSC Dashboard.")
        
        print("   [Extraction] Scanning DOM structure for treasury metrics...")
        
        # Allow DOM to fully hydrate
        await asyncio.sleep(5)
        
        # Extract all raw text to mathematically isolate the balance
        raw_text = await page.evaluate('document.body.innerText')
        balance = extract_balance(raw_text)
        
        if balance > 0:
            print(f"   ✅ DOM scan pulled Loan Balance: ${balance:,.2f}")
            
            record = {
                "id": f"nslsc-{datetime.utcnow().timestamp()}",
                "source": "NSLSC_GOV_API",
                "type": "TREASURY_DEBT",
                "classification": "LOCAL_ONLY",
                "balance": balance,
                "currency": "CAD",
                "scraped_at": datetime.utcnow().isoformat(),
                "node": "Comet Playwright"
            }
            
            with open(LEDGER_FILE, 'a', encoding='utf-8') as f:
                f.write(json.dumps(record) + "\\n")
            
            print(f"   ✅ Saved ledger sequence successfully to: {LEDGER_FILE.name}")
        else:
            print("   ⚠️ Extraction failed. Could not confidently isolate the integer.")

        print("\\n🛑 Treasury extraction complete.")
        print("Commander: The supervised sweep has finished.")
        print("Please manually click 'Sign Out' in NSLSC to terminate the session cookies.")
        print("Comet will automatically close the Chromium window the moment the logout returns to the public gateway.")
        
        # Wait for logout URL or public page
        await page.wait_for_function('''() => {
            return window.location.href.toLowerCase().includes('logout') || 
                   !document.body.innerText.toLowerCase().includes('loan balance');
        }''', timeout=0)
        
        # Add a slight delay to ensure cookies are wiped by the portal
        await asyncio.sleep(2)
        print("\\n✅ Session logged natively. Browser terminating. The environment is now perfectly sealed.")

if __name__ == "__main__":
    try:
        asyncio.run(harvest_nslsc())
    except KeyboardInterrupt:
        print("\\n🛑 Comet explicitly halted by Commander shortcut.")
