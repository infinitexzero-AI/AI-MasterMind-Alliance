import asyncio
import edge_tts
import os

OUTPUT_FILE = "/Users/infinite27/AILCC_PRIME/03_Intelligence_Vault/valentine_voice.mp3"
TEXT = "Chaos neutralized, boss."
VOICE = "en-US-ChristopherNeural"  # Deep, calm male voice

async def synthesize():
    print(f"[Voice Synth] Generating audio for: '{TEXT}'")
    communicate = edge_tts.Communicate(TEXT, VOICE)
    await communicate.save(OUTPUT_FILE)
    print(f"[Voice Synth] Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(synthesize())
