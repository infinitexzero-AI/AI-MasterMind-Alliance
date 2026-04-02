#!/usr/bin/env python3
"""
voice_daemon.py — Autonomous Voice Surface
=============================================================================
A persistent agent listening for ambient voice commands via Push-To-Talk or 
VAD (Voice Activity Detection). It transcribes intent via the LLM Gateway 
and publishes `VOICE_MEMO` payloads directly to the Vanguard Swarm.

Requires:
  pip install SpeechRecognition pyaudio
"""

import os
import json
import logging
import time
import redis
from datetime import datetime
import speech_recognition as sr

logging.basicConfig(level=logging.INFO, format="%(asctime)s [Voice Daemon] %(message)s")
logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

class VoiceDaemon:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300 # Dynamic threshold
        self.recognizer.dynamic_energy_threshold = True
        
        # Check if an API key is available for OpenAI whisper fallback
        self.openai_key = os.getenv("OPENAI_API_KEY")

    def run(self):
        logger.info("Initializing Microphone Array...")
        with sr.Microphone() as source:
            logger.info("Calibrating ambient noise (2 seconds)...")
            self.recognizer.adjust_for_ambient_noise(source, duration=2)
            logger.info("Voice Interface Active. Listening...")

            while True:
                try:
                    # Listen for audio chunk (blocks until speech finishes)
                    audio = self.recognizer.listen(source, timeout=None, phrase_time_limit=15)
                    logger.info("Speech captured. Transcribing...")
                    
                    self.process_audio(audio)
                    
                except sr.WaitTimeoutError:
                    pass
                except KeyboardInterrupt:
                    logger.info("Voice Daemon terminating.")
                    break
                except Exception as e:
                    logger.error(f"Error during audio capture: {e}")

    def process_audio(self, audio):
        try:
            # We attempt standard Google Speech Recognition first for speed
            # In a true local environment, this should swap to `whisper` local models.
            text = self.recognizer.recognize_google(audio)
            logger.info(f"Transcription: '{text}'")
            
            self.broadcast_signal(text)
            
        except sr.UnknownValueError:
            logger.debug("Audio captured but could not be understood.")
        except sr.RequestError as e:
            logger.error(f"Could not request results from Google Speech API; {e}")

    def broadcast_signal(self, text):
        """Sends the transcribed text into the AILCC Neural Synapse"""
        payload = {
            "signal_id": f"voice_{int(time.time())}",
            "source": "VOICE_DAEMON",
            "type": "STATE_CHANGE",
            "severity": "ROUTINE",
            "message": text,
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "intent": "ambient_capture"
            }
        }
        
        try:
            redis_client.publish("neural_synapse", json.dumps(payload))
            logger.info("Broadcasted voice payload to NEURAL_SYNAPSE.")
        except Exception as e:
            logger.error(f"Failed to publish to Redis: {e}")

if __name__ == "__main__":
    daemon = VoiceDaemon()
    daemon.run()
