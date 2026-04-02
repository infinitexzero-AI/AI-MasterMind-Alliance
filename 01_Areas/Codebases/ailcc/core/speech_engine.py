import subprocess
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [SpeechEngine] %(message)s")
logger = logging.getLogger(__name__)

class SpeechEngine:
    """
    Native Apple Silicon Text-to-Speech (TTS) Framework.
    Utilizes raw subprocess hooks to achieve absolute zero-latency, 100% offline generation.
    """
    
    @staticmethod
    def speak(text: str, voice: str = "Samantha", block: bool = False):
        """
        Executes raw Mac `say` terminology.
        `Samantha` is highly stable and default for System-Level feedback.
        `Alex` is also acceptable.
        `block=False` prevents freezing the Python event loop while the voice speaks.
        """
        logger.info(f"Synthesizing offline audio [{voice}]: {text[:50]}...")
        
        # Clean text to prevent bash injection
        clean_text = text.replace("'", "").replace('"', "")
        cmd = ["say", "-v", voice, clean_text]
        
        try:
            if block:
                subprocess.run(cmd, check=True)
            else:
                # Fire and forget (asynchronous physical sound)
                subprocess.Popen(cmd)
            return {"success": True, "message": "Audio synthesized natively."}
        except Exception as e:
            logger.error(f"TTS synthesis collapsed: {e}")
            return {"success": False, "message": str(e)}

if __name__ == "__main__":
    # Vanguard Archon Test
    SpeechEngine.speak("Vanguard Archon Sequence Initiated.", block=True)
