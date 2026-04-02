import asyncio
import json
import logging
import os
import speech_recognition as sr
from core.daemon_factory import ReactiveDaemon

logger = logging.getLogger("VoiceInterlock")

class VoiceInterlockDaemon(ReactiveDaemon):
    """
    Phase 88: Project Vanguard
    Provides the AILCC physical awareness via local microphone ingress.
    """
    def __init__(self):
        super().__init__(name="Vanguard_Voice", role="Auditory Sentry")
        self.recognizer = sr.Recognizer()
        # Calibrate energy thresholds for ambient noise dropping
        self.recognizer.energy_threshold = 400
        self.recognizer.dynamic_energy_threshold = True
        self.microphone = sr.Microphone()

    async def get_channels(self):
         return [] # Emits only, doesn't listen to Redis inbound for tasks

    async def run(self):
        """Continuously monitors microphone asynchronously"""
        await self.setup()
        await self.broadcast_status("Vanguard_Voice", "ACTIVE", "Microphone pipeline open. Listening for verbal directives...")
        
        loop = asyncio.get_event_loop()
        
        # We must push the blocking audio stream to a thread to avoid locking async daemons
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=1)
            logger.info("Ambient calibration complete. Voice interlock armed.")
            
            while True:
                try:
                    # Blocking wait for audio sent to a thread executor
                    audio = await loop.run_in_executor(
                        None, 
                        lambda: self.recognizer.listen(source, timeout=1, phrase_time_limit=10)
                    )
                    
                    if audio:
                        await self.broadcast_status("Vanguard_Voice", "IN_PROGRESS", "Audio vector detected. Translating...")
                        
                        # Google Speech-to-Text inference (Built-in to SpeechRecognition)
                        transcript = await loop.run_in_executor(
                            None,
                            lambda: self.recognizer.recognize_google(audio)
                        )
                        
                        if transcript:
                            safe_str = transcript.strip()
                            await self.broadcast_status("Vanguard_Voice", "COMPLETED", f"Transcribed Directive: '{safe_str}'")
                            
                            # Construct and publish the Payload to the master intent router
                            import datetime
                            payload = {
                                "task_id": f"VOICE-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
                                "prompt": safe_str,
                                "target_agent": "Orchestrator",
                                "source": "VOICE_INTERLOCK"
                            }
                            
                            r = self.redis
                            if not r:
                                await self.connect()
                                r = self.redis
                                
                            await r.publish("channel:voice_command", json.dumps(payload))
                                
                except sr.WaitTimeoutError:
                    # Expected if nobody speaks for 1 second
                    continue
                except sr.UnknownValueError:
                    # Audio captured but unrecognizable
                    pass
                except sr.RequestError as e:
                    logger.error(f"Speech API Failure: {e}")
                    await asyncio.sleep(5)
                except Exception as e:
                    logger.error(f"Voice Interlock Exception: {e}")
                    await asyncio.sleep(2)

if __name__ == "__main__":
    daemon = VoiceInterlockDaemon()
    asyncio.run(daemon.run())
