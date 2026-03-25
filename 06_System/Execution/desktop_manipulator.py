import pyautogui
import uvicorn
import logging
import base64
import io
from PIL import ImageGrab
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from interlock import require_human_authorization

app = FastAPI(title="AILCC Desktop Manipulator")
logging.basicConfig(level=logging.INFO)

# Mastermind Fail-Safe Configuration
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.5  # Critical internal delay preventing physics-engine thrashing

class Action(BaseModel):
    action: str  # moveTo, click, type, press, scroll
    x: Optional[int] = None
    y: Optional[int] = None
    text: Optional[str] = None
    button: Optional[str] = 'left'
    clicks: Optional[int] = 1

@app.post("/api/action")
async def execute_actions(actions: List[Action]):
    results = []
    try:
        for act in actions:
            if act.action == "moveTo":
                if act.x is not None and act.y is not None:
                    # Trajectory animation over 0.2s for physical smoothness
                    pyautogui.moveTo(act.x, act.y, duration=0.2)
                    results.append(f"Moved to {act.x}, {act.y}")
            elif act.action == "click":
                pyautogui.click(button=act.button, clicks=act.clicks)
                results.append(f"Clicked {act.button} {act.clicks} times")
            elif act.action == "type":
                if act.text:
                    # Epoch 50: Zero-Trust Biometric Interlock
                    critical_keywords = ["password", "wire ", "transfer", "sudo ", "pay", "checkout", "confirm"]
                    if any(kw in act.text.lower() for kw in critical_keywords):
                        logging.warning(f"[ZERO-TRUST] Interlock tripped by Type action: '{act.text}'")
                        authorized = require_human_authorization(f"Type restricted keystrokes '{act.text}'", "CRITICAL")
                        if not authorized:
                            raise HTTPException(status_code=403, detail="BIOMETRIC_INTERLOCK_DENIED_BY_USER")
                            
                    pyautogui.typewrite(act.text, interval=0.05)
                    results.append(f"Typed '{act.text}'")
            elif act.action == "press":
                if act.text:
                    pyautogui.press(act.text)
                    results.append(f"Pressed {act.text}")
            elif act.action == "scroll":
                if act.y is not None:
                    pyautogui.scroll(act.y)
                    results.append(f"Scrolled {act.y} lines")
            else:
                results.append(f"Unknown action: {act.action}")
                
        logging.info(f"[MANIPULATOR] EXECUTED BATCH: {results}")
        return {"status": "success", "executed": results}
        
    except pyautogui.FailSafeException:
        logging.error("[CRITICAL] FAILSAFE TRIGGERED. Mouse thrown to corner of screen.")
        raise HTTPException(status_code=500, detail="FAILSAFE_INTERLOCK_TRIGGERED")
    except Exception as e:
        logging.error(f"[ERROR] Daemon crash: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vision/capture")
async def capture_screen():
    try:
        logging.info("[VISION] Capturing primary display tensor...")
        screenshot = ImageGrab.grab(all_screens=True)
        if screenshot.mode == "RGBA":
            screenshot = screenshot.convert("RGB")
        img_buffer = io.BytesIO()
        screenshot.save(img_buffer, format="JPEG", quality=75)
        img_str = base64.b64encode(img_buffer.getvalue()).decode("utf-8")
        return {"status": "success", "image": img_str}
    except Exception as e:
        logging.error(f"[VISION_ERROR] Tensor generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    logging.info("[SYSTEM] Booting Vector 8 Physical Cursor Daemon on Port 5008")
    uvicorn.run(app, host="127.0.0.1", port=5008)
