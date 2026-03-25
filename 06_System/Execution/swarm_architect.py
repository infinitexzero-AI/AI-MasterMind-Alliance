import os
import glob
import time
import logging
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [META_ARCHITECT] %(message)s")

PM2_LOG_DIR = "/Users/infinite27/.pm2/logs"

class SwarmArchitect:
    """
    Epoch 50 Meta-Programming Protocol:
    The Swarm's dynamic immune system. Monitors PM2 ecosystem crash loops,
    pulls pure stack traces from the APFS disk, and generates automatic structural code patches.
    """
    def __init__(self, model="llama3"):
        self.model = model
        self.last_positions = {}
        
    def scan_logs(self):
        error_logs = glob.glob(os.path.join(PM2_LOG_DIR, "*-error.log"))
        
        for log_file in error_logs:
            if log_file not in self.last_positions:
                self.last_positions[log_file] = os.path.getsize(log_file)
                continue
                
            current_size = os.path.getsize(log_file)
            last_size = self.last_positions[log_file]
            
            if current_size > last_size:
                with open(log_file, 'r') as f:
                    f.seek(last_size)
                    new_errors = f.read()
                    self.last_positions[log_file] = current_size
                    
                    if any(keyword in new_errors for keyword in ["Error:", "Traceback", "Exception", "MODULE_NOT_FOUND"]):
                        component = os.path.basename(log_file).replace('-error.log','')
                        logging.warning(f"CRITICAL ANOMALY: PM2 Crash Loop detected in [{component}]! Initiating Neural Synthesis...")
                        self.propose_fix(component, new_errors[-2000:])

    def propose_fix(self, component, error_trace):
        if not OLLAMA_AVAILABLE:
            logging.error("Local Neural LLM offline. Cannot synthesize code patch natively.")
            return
            
        prompt = f"""You are the AILCC Meta-Architect. 
An internal Swarm infrastructure node ({component}) has crashed.
Analyze the following APFS PM2 stack trace and propose a hyper-concise python or TS code patch to resolve it.

STACK TRACE:
{error_trace}

Return ONLY the proposed code patch wrapped in standard markdown blocks. NO conversational fluff."""

        try:
            logging.info(f"Analyzing stack fracture in {component} using {self.model}...")
            response = ollama.generate(model=self.model, prompt=prompt)
            patch = response['response']
            
            logging.info(f"\\n=== META-ARCHITECT PATCH SYNTHESIS ===\\n{patch}\\n======================================")
            logging.info("To autonomously apply this patch, you must pass the Biometric Zero-Trust (TouchID) Interlock.")
            
        except Exception as e:
            logging.error(f"Synthesis failed: {e}")

    def run(self):
        logging.info("Meta-Architect Online. Tailing PM2 Ecosystem logs for structural decay.")
        while True:
            self.scan_logs()
            time.sleep(10)

if __name__ == "__main__":
    architect = SwarmArchitect()
    architect.run()
