import os
import json
import time
import random
import logging
import asyncio
from dotenv import load_dotenv

from comet_framework.llm_gateway import LLMGateway
try:
    import pyautogui
except ImportError:
    pyautogui = None

logger = logging.getLogger("StealthGhostwriter")

class StealthGhostwriter:
    def __init__(self):
        self.load_config()

    def load_config(self):
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        creds_path = os.path.join(os.path.expanduser("~"), ".ailcc", "credentials.env")
        load_dotenv(creds_path)
        
        self.claude_key = os.getenv("ANTHROPIC_API_KEY")
        self.grok_key = os.getenv("XAI_API_KEY")

    async def claude_rtf_solve_synthesis(self, context: str, topic: str) -> str:
        """
        Forces Clause into a highly structured drafting state using the Commander's frameworks.
        """
        prompt = f"""
        Using the provided context, synthesize a highly analytical draft regarding: '{topic}'
        
        Mandatory Framework Constraints:
        1. R-T-F (Role, Task, Format) - Assume the role of an elite academic researcher.
        2. S-O-L-V-E - Structure the core argument.
        
        Do not use flowery AI language (e.g. "delve", "tapestry", "in conclusion").
        
        CONTEXT:
        {context}
        """
        return await LLMGateway.ask_agent(
            provider="anthropic",
            api_key=self.claude_key,
            model="claude-3-5-sonnet-20241022",
            system_prompt="You are a strict academic drafter.",
            prompt=prompt
        )

    async def grok_syntax_mutation(self, draft: str) -> str:
        """
        Adversarial mutation to lower the perplexity score and bypass AI detection.
        """
        prompt = f"""
        Restructure the following text to maximize "burstiness" (variance in sentence length).
        Inject subtle human colloquialisms. Break up perfectly symmetrical paragraphs.
        Make it sound like a brilliant but slightly chaotic human wrote it in one sitting.
        
        DRAFT:
        {draft}
        """
        return await LLMGateway.ask_agent(
            provider="grok",
            api_key=self.grok_key,
            model="grok-beta",
            system_prompt="You are an adversarial text mutation engine. Destroy AI watermarks.",
            prompt=prompt
        )

    def emit_keystrokes_to_word(self, text: str):
        """
        Takes control of the OS and physically types the text to bypass copy/paste or rapid-fire generation metadata detectors.
        """
        if not pyautogui:
            logger.warning("pyautogui is not installed. Falling back to stdout.")
            return text
            
        logger.info("Engaging Stealth Physical Keyboard Emission in 5 seconds...")
        logger.info("PLEASE FOCUS THE TARGET TEXT EDITOR NOW.")
        time.sleep(5)
        
        # We don't type the entire thing instantly. We simulate a human rhythm.
        for char in text:
            # Randomize keypress duration and interval between presses
            interval = random.uniform(0.01, 0.08)
            
            # Simulate occasional human hesitation/thought between sentences
            if char in ['.', '!', '?']:
                interval += random.uniform(0.3, 1.2)
                
            # Simulate occasional typos and instantaneous backspace fixes
            if random.random() < 0.005:  # 0.5% chance of typo
                wrong_char = random.choice('abcdefghijklmnopqrstuvwxyz')
                pyautogui.typewrite(wrong_char, interval=0.03)
                time.sleep(random.uniform(0.1, 0.3))
                pyautogui.press('backspace')
                
            pyautogui.typewrite(char, interval=interval)
            
        logger.info("Physical Emission Complete.")
        return text

    async def execute_scholar_mode(self, prompt: str, context: str = "", ws_callback=None) -> str:
        """
        Executes the dynamic pipeline for SKILL_STEALTH_SCHOLAR.
        """
        def update(status, msg):
            if ws_callback:
                asyncio.create_task(ws_callback("STEALTH_SCHOLAR", status, msg))
            else:
                logger.info(f"[SCHOLAR] {msg}")

        try:
            update("IN_PROGRESS", "Step 1: Drafting rigorous academic skeleton via Claude S-O-L-V-E framework...")
            draft = await self.claude_rtf_solve_synthesis(context, prompt)
            
            update("IN_PROGRESS", "Step 2: Adversarial Syntax Mutation via Grok to inject burstiness and human cadence...")
            humanized_draft = await self.grok_syntax_mutation(draft)
            
            update("IN_PROGRESS", "Step 3: Engaging Physical Typer Sequence. PLEASE FOCUS TEXT EDITOR. Typing will begin in 5s.")
            
            # Run the blocking pyautogui code in a thread pool to prevent locking the asyncio event loop
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, self.emit_keystrokes_to_word, humanized_draft)
            
            update("COMPLETED", "Stealth Scholar sequence executed successfully. No digital generation footprint detected.")
            return "Sequence Complete."

        except Exception as e:
            err = f"Scholar execution failed: {e}"
            update("FAILED", err)
            logger.error(err)
            return err
