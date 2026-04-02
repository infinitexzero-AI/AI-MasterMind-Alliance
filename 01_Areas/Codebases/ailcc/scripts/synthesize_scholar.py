#!/usr/bin/env python3
"""
synthesize_scholar.py — Phase XIII: Kimi k1.5 Synthesis Test
============================================================
Reads the raw parsed text from a defined Scholar Note,
uses the OllamaClient (local gemma3:4b or deepseek) to generate 
an executive summary and extract research methodologies,
and saves the result to a new _summary.md file.

Usage:
    python3 synthesize_scholar.py
"""

import sys
import os
import argparse
import logging
from pathlib import Path

# Fix python path to allow importing from ailcc core
sys.path.append(str(Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc").resolve()))

from core.llm_clients import OllamaClient

HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
SCHOLAR_NOTES_DIR = HIPPOCAMPUS_DIR / "scholar_notes"
TARGET_NOTE_FILE = SCHOLAR_NOTES_DIR / "1_https___arxiv_org_abs_2501_12599.md"
OUTPUT_FILE = SCHOLAR_NOTES_DIR / "1_https___arxiv_org_abs_2501_12599_summary.md"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [SynthesisTest] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

def synthesize_note():
    logger.info(f"🚀 Initializing Kimi k1.5 Synthesis Test using Ollama (Local-First)")
    
    if not TARGET_NOTE_FILE.exists():
        logger.error(f"Target note not found at {TARGET_NOTE_FILE}")
        return
        
    logger.info(f"Reading source note: {TARGET_NOTE_FILE.name}")
    content = TARGET_NOTE_FILE.read_text()
    
    # Initialize the local Ollama client (using tinyllama as gemma3 is not pulled)
    client = OllamaClient(model="tinyllama:latest")
    
    system_prompt = (
        "You are the Vanguard Swarm 'Scholar' agent running locally via Ollama. "
        "Your task is to analyze academic notes, extract the core research methodology, "
        "and provide an executive summary that highlights the most critical findings. "
        "Format your output in clean Markdown."
    )
    
    prompt = f"Please synthesize the following academic note into an Executive Summary and a bulleted list of Methodologies:\n\n{content}"
    
    logger.info("🧠 Sending synthesis context to local Ollama. Awaiting inference...")
    result = client.generate(prompt=prompt, system_prompt=system_prompt)
    
    if "Error connecting" in result:
        logger.error(f"Failed to generate summary: {result}")
        logger.info("Make sure the Ollama service is running on your machine (e.g., `ollama run gemma3:4b`).")
        return
        
    logger.info(f"✅ Synthesis complete. Writing output to {OUTPUT_FILE.name}...")
    
    formatted_output = f"# 🧠 Vanguard Swarm Executive Synthesis\n\n**Source:** {TARGET_NOTE_FILE.name}\n**Agent:** Local Ollama (Scholar Node)\n\n---\n\n{result}\n"
    
    OUTPUT_FILE.write_text(formatted_output)
    
    logger.info(f"Synthesis artifact saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    synthesize_scholar = synthesize_note()
