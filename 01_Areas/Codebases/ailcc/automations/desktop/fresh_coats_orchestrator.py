
import os
import sys
import json
import logging
import argparse
import datetime
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load env
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(env_path)

# Import Bridge
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from bridges.email_watcher import EmailWatcher

# Mock Data for Simulation (until API keys are present)
MOCK_RECON_DATA = {
    "property_value": "$450,000",
    "sq_ft": 2400,
    "year_built": 1985,
    "recent_permits": ["Roof Replacement (2020)", "Deck Addition (2018)"],
    "neighborhood_comps": ["$460,000", "$445,000", "$475,000"]
}

class FreshCoatsOrchestrator:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.email_bridge = EmailWatcher()
        if not self.gemini_key:
            logger.warning("GEMINI_API_KEY not found. Strategy generation will be simulated.")
        
    def ingest_lead(self, lead_data: dict) -> dict:
        """Step 1: Parse and validate new lead."""
        logger.info(f"📥 [AntiGravity] Ingesting Lead: {lead_data.get('name')} @ {lead_data.get('address')}")
        return lead_data

    def perform_research(self, address: str) -> dict:
        """Step 2: Simulate Perplexity Reconnaissance."""
        logger.info(f"🔍 [Perplexity] Researching property: {address}...")
        # In a real scenario, this would call Perplexity API or custom search tool
        # Simulating a delay and result
        import time
        time.sleep(1) 
        logger.info("   ✅ Data retrieved: Zillow, County Records, Recent Sales")
        return MOCK_RECON_DATA

    def generate_strategy(self, lead: dict, research: dict) -> dict:
        """Step 3: Generate Quote Strategy via Gemini (acting as Claude 2IC)."""
        logger.info("🧠 [Claude] Analyzing profitability and generating strategy...")
        
        if self.gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                prompt = f"""
                You are Claude, the Tactical 2IC for Fresh Coats Painting.
                Analyze this lead and generate a quote strategy.
                
                LEAD:
                Name: {lead.get('name')}
                Address: {lead.get('address')}
                Type: {lead.get('service_type')}
                
                RESEARCH:
                Value: {research.get('property_value')}
                Sq Ft: {research.get('sq_ft')}
                Year: {research.get('year_built')}
                
                OUTPUT JSON ONLY:
                {{
                    "estimated_cost": "$X,XXX",
                    "suggested_price": "$X,XXX",
                    "margin": "XX%",
                    "strategy_note": "One sentence strategy",
                    "email_draft": "Short outreach email"
                }}
                """
                response = model.generate_content(prompt)
                clean_json = response.text.replace('```json', '').replace('```', '').strip()
                return json.loads(clean_json)
            except Exception as e:
                logger.error(f"Gemini generation failed: {e}")
        
        # Fallback simulation
        return {
            "estimated_cost": "$3,200",
            "suggested_price": "$5,500",
            "margin": "42%",
            "strategy_note": "High-value neighborhood, confident pricing recommended.",
            "email_draft": f"Hi {lead.get('name')}, based on your home at {lead.get('address')}, we have prepared a premium exterior refresh package..."
        }

    def execute_actions(self, lead: dict, strategy: dict):
        """Step 4: Execute final actions (File gen, Email draft)."""
        logger.info("⚙️ [AntiGravity] Executing workflows...")
        
        # 1. Generate Quote PDF (Mock text file)
        filename = f"Quote_{lead.get('name').replace(' ', '_')}_{datetime.date.today()}.txt"
        with open(filename, 'w') as f:
            f.write("FRESH COATS PAINTING - OFFICIAL QUOTE\n")
            f.write("=====================================\n")
            f.write(f"Client: {lead.get('name')}\n")
            f.write(f"Address: {lead.get('address')}\n")
            f.write("-------------------------------------\n")
            f.write(f"Suggested Price: {strategy.get('suggested_price')}\n")
            f.write(f"Notes: {strategy.get('strategy_note')}\n")
        
        logger.info(f"   📄 Generated Quote: {filename}")
        
        logger.info(f"   📄 Generated Quote: {filename}")
        
        # 2. 'Send' Email via Bridge
        subject = f"Your Quote for {lead.get('address')}"
        self.email_bridge.send_draft(to=lead.get('email'), subject=subject, body=strategy.get('email_draft'))
        
        return filename

    def run(self, lead_json_str: str):
        try:
            lead_data = json.loads(lead_json_str)
        except json.JSONDecodeError:
            logger.error("Invalid JSON input")
            return

        print("-" * 60)
        print("🚀 STARTING FRESH COATS AUTOMATION LOOP")
        print("-" * 60)
        
        # 1. Ingest
        self.ingest_lead(lead_data)
        
        # 2. Recon
        research = self.perform_research(lead_data.get('address'))
        
        # 3. Strategy
        strategy = self.generate_strategy(lead_data, research)
        logger.info(f"   💡 Strategy: {strategy.get('strategy_note')} (Margin: {strategy.get('margin')})")
        
        # 4. Execution
        doc_path = self.execute_actions(lead_data, strategy)
        
        print("-" * 60)
        print("✅ WORKFLOW COMPLETE")
        print(f"   Artifact: {doc_path}")
        print("-" * 60)
    def poll_mode(self):
        print("-" * 60)
        print("📡 STARTING FRESH COATS EMAIL WATCHER")
        print("-" * 60)
        
        # Check once for now (in a real daemon this would loop)
        leads = self.email_bridge.check_for_leads()
        
        if not leads:
            print("No new leads found.")
            return

        for lead in leads:
            print(f"\n⚡ TRIGGER: Processing {lead.get('name')}...")
            self.run(json.dumps(lead))
            self.email_bridge.mark_as_read(lead.get('_source_email_id'))
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fresh Coats Lead Automation")
    parser.add_argument("--lead", type=str, help="JSON string of lead data", 
                        default=None)
    parser.add_argument("--poll", action="store_true", help="Check email inbox for leads")
    args = parser.parse_args()
    
    orchestrator = FreshCoatsOrchestrator()
    
    if args.poll:
        orchestrator.poll_mode()
    elif args.lead:
        orchestrator.run(args.lead)
    else:
        # Default mock run
        default_lead = '{"name": "John Doe", "address": "123 Maple Ave, Westfield NJ", "service_type": "Exterior", "email": "john@example.com"}'
        orchestrator.run(default_lead)
