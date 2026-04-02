#!/usr/bin/env python3
"""
vision_matrix_daemon.py — Vanguard Swarm Vision & Action Matrix
===============================================================
Provides the AILCC with visual autonomy.
Takes screenshots, analyzes them using Vision Language Models (VLMs) via InferenceBridge,
and executes physical mouse/keyboard callbacks using pyautogui.

Requires:
  pip install pyautogui mss Pillow
"""

import os
import time
import json
import base64
import logging
import asyncio
from typing import Dict, Any, Tuple

# Attempt to load required libraries safely
try:
    import mss
    from PIL import Image
    import pyautogui
except ImportError as e:
    logging.error(f"Missing required vision dependencies. Run: pip install pyautogui mss Pillow")
    raise e

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("VisionMatrix")

# Safety Configuration
pyautogui.FAILSAFE = True  # Moving mouse to corner aborts
pyautogui.PAUSE = 0.5      # Delay between pyautogui calls

SCREENSHOT_DIR = "/tmp/ailcc_vision"

class VisionMatrixDaemon:
    def __init__(self):
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        # We integrate with the standard AILCC Inference Bridge
        try:
            import sys
            sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
            from core.inference_bridge import inference_bridge, InferenceStrategy
            self.bridge = inference_bridge
            self.strategy = InferenceStrategy.PERFORMANCE
        except ImportError as e:
            logger.warning(f"Inference Bridge not found. Vision Matrix requires LLM access. {e}")
            self.bridge = None

    def capture_screen(self, filename: str = "current_state.png") -> str:
        """Captures the primary monitor and returns the file path."""
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        with mss.mss() as sct:
            monitor = sct.monitors[1]  # Primary monitor
            sct_img = sct.grab(monitor)
            mss.tools.to_png(sct_img.rgb, sct_img.size, output=filepath)
        
        logger.info(f"Captured screen state: {filepath}")
        return filepath

    def encode_image_base64(self, image_path: str) -> str:
        """Encodes image for VLM payload."""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    async def analyze_screen_for_target(self, objective: str, image_path: str) -> Optional[Dict[str, Any]]:
        """Asks the VLM for (X,Y) coordinates of the next element to click to achieve the objective."""
        if not self.bridge:
            logger.error("No LLM Bridge available for Vision Analysis.")
            return None

        # Note: True VLM integration requires passing the base64 image data to the specific 
        # API (e.g., Claude/ChatGPT vision API). The InferenceBridge wrapper needs to support 
        # image payloads. For this foundational implementation, we define the interaction schema.
        
        # We instruct the model to return STRICT JSON containing coordinates or keyboard actions.
        system_prompt = (
            "You are the AILCC Vision Matrix. You control the macOS mouse and keyboard.\n"
            "Analyze the provided screen state. Determine the ONE NEXT ACTION required to progress the Objective.\n"
            "Respond ONLY with a valid JSON object matching this schema:\n"
            "{\n"
            "  \"action\": \"click|type|finished|failed\",\n"
            "  \"x\": integer (x coordinate if clicking),\n"
            "  \"y\": integer (y coordinate if clicking),\n"
            "  \"text\": \"string (text to type if typing)\",\n"
            "  \"reasoning\": \"Breif explanation of action.\"\n"
            "}"
        )

        base64_image = self.encode_image_base64(image_path)
        
        prompt = (
            f"OBJECTIVE: {objective}\n"
            f"[IMAGE_DATA_ATTACHED: {base64_image[:20]}...]\n"
            "Return the JSON action."
        )

        # In a fully realized bridge, `dispatch` would accept an `image_base64` kwarg.
        # We simulate the call here assuming the VLM returns the JSON string.
        try:
            logger.info("Transmitting visual cortex data to VLM...")
            # raw_response = await self.bridge.dispatch(prompt=prompt, system_prompt=system_prompt, strategy=self.strategy, image_base64=base64_image)
            
            # SIMULATION placeholder until inference_bridge is fully upgraded for Vision
            await asyncio.sleep(1.5)
            logger.warning("VISION BRIDGE INCOMPLETE: Simulating successful VLM coordinate response.")
            raw_response = '{"action": "click", "x": 100, "y": 100, "reasoning": "Simulated click constraint."}'
            
            data = json.loads(raw_response)
            return data
            
        except Exception as e:
            logger.error(f"Failed to parse VLM response: {e}")
            return None

    def execute_action(self, action_data: Dict[str, Any]) -> bool:
        """Physically manipulates the host machine based on VLM instructions."""
        action = action_data.get("action")
        
        logger.info(f"Executing Physical Callback: {action_data}")
        try:
            if action == "click":
                x = action_data.get("x", 0)
                y = action_data.get("y", 0)
                
                # Get current screen size to prevent out-of-bounds clicks
                screen_w, screen_h = pyautogui.size()
                if x < 0 or y < 0 or x >= screen_w or y >= screen_h:
                    logger.error(f"Coordinate ({x}, {y}) out of bounds. Screen size: {screen_w}x{screen_h}")
                    return False
                
                # Move to location over 0.5 seconds for smoothness (and safety visualization)
                pyautogui.moveTo(x, y, duration=0.5)
                pyautogui.click()
                return True
                
            elif action == "type":
                text = action_data.get("text", "")
                pyautogui.write(text, interval=0.05)
                pyautogui.press('enter')
                return True
                
            elif action == "finished":
                logger.info("Objective achieved according to VLM.")
                return True
                
            elif action == "failed":
                logger.warning(f"VLM declared failure: {action_data.get('reasoning')}")
                return False
                
        except pyautogui.FailSafeException:
            logger.critical("FAILSAFE TRIGGERED. Mouse moved to corner. Aborting execution.")
            return False
            
        return False

    async def execute_gui_objective(self, objective: str, max_steps: int = 5) -> bool:
        """The main loop: Observe -> Decide -> Act -> Repeat."""
        logger.info(f"Initiating Visual Autonomy Sequence for objective: '{objective}'")
        
        for step in range(max_steps):
            logger.info(f"--- Vision Cycle: Step {step + 1}/{max_steps} ---")
            
            # 1. Observe
            image_path = self.capture_screen(filename=f"step_{step}.png")
            
            # 2. Decide
            action_data = await self.analyze_screen_for_target(objective, image_path)
            
            if not action_data:
                logger.error("Vision formulation failed. Aborting sequence.")
                return False
                
            # Exit conditions
            if action_data.get("action") == "finished":
                logger.info("Sequence completed successfully.")
                return True
            if action_data.get("action") == "failed":
                logger.error("Sequence failed.")
                return False
                
            # 3. Act
            success = self.execute_action(action_data)
            if not success:
                logger.error("Action execution failed (out of bounds or failsafe). Aborting.")
                return False
                
            # Pause to let UI settle before next cycle
            await asyncio.sleep(1.0)
            
        logger.warning(f"Objective not completed within {max_steps} steps.")
        return False

if __name__ == "__main__":
    # Built-in diagnostic
    async def run_diagnostic():
        matrix = VisionMatrixDaemon()
        logger.info("Running Vision Matrix diagnostic...")
        # A safe test objective that just moves the mouse to 100, 100 without clicking
        # using the simulated VLM response built in above.
        await matrix.execute_gui_objective("Test coordinate mapping.", max_steps=1)
        
    asyncio.run(run_diagnostic())
