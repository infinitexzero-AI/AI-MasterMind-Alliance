import speech_recognition as sr
import logging
import time
import requests

# Standardize Mastermind Console Output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)

WAKE_WORD = "hey swarm"
# Forwarding the transcribed payload directly into the active PM2 Neural Relay Router
RELAY_URL = "http://127.0.0.1:5005/api/neural-bus"

def listen_for_wake_word():
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()
    
    with microphone as source:
        logging.info("[ACOUSTIC_CALIBRATION] Sampling room acoustics for baseline dynamic ambient noise cancellation...")
        recognizer.adjust_for_ambient_noise(source, duration=2.5)
        logging.info(f"[SYSTEM_ONLINE] Vector 9 Active. Permanently tracking for acoustic anomaly: '{WAKE_WORD}'...")
        
    while True:
        try:
            with microphone as source:
                # 3-second floating capture window. Automatically timeouts if pure silence.
                audio = recognizer.listen(source, timeout=3, phrase_time_limit=7)
            
            # For Epoch 46 we utilize SR Google transcription. Future iteration: Whisper.cpp
            text = recognizer.recognize_google(audio).lower()
            
            if WAKE_WORD in text:
                logging.info(f"[ACOUSTIC_TRIGGER] Identity Confirmed. Raw Matrix: {text}")
                
                # Split everything occurring *after* the wake-word
                command_parts = text.split(WAKE_WORD, 1)
                
                if len(command_parts) > 1:
                    command = command_parts[1].strip()
                    if command:
                        logging.info(f"[ACOUSTIC_PAYLOAD] Extracted Execution Vector: '{command}'")
                        
                        # Post the command to the Swarm Relay Network
                        try:
                            payload = {"source": "acoustic_daemon", "text": command, "type": "voice_command"}
                            response = requests.post(RELAY_URL, json=payload, timeout=5)
                            logging.info(f"[NEURAL_BUS] Payload successfully bridged into Swarm memory. Relay Status: {response.status_code}")
                        except Exception as e:
                            logging.error(f"[NEURAL_BUS_FAILURE] Target off-line: {e}")
                    else:
                        logging.info("[ACOUSTIC_ABORT] No command syntax detected following identity wake-word.")
                
        except sr.WaitTimeoutError:
            pass # Standard acoustic silence behavior
        except sr.UnknownValueError:
            pass # Unintelligible audio or static
        except Exception as e:
            logging.error(f"[ACOUSTIC_SYSTEM_ERROR] {str(e)}")
            time.sleep(1.5)

if __name__ == "__main__":
    listen_for_wake_word()
