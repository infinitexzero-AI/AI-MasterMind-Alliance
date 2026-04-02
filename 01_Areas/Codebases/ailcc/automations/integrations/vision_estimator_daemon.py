#!/usr/bin/env python3
"""
vision_estimator_daemon.py — Computer Vision Quoting Engine (Tycoon Module)
===========================================================================
Watches for new property photos in a designated drop zone and uses OpenAI
Vision models to estimate surface area, required paint volume, and labor effort.

Usage:
    python3 vision_estimator_daemon.py --img /path/to/house_photo.jpg
"""

import os
import sys
import json
import base64
import logging
import argparse
from pathlib import Path
from openai import OpenAI
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [VisionQuote] %(message)s")
logger = logging.getLogger(__name__)

HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
QUOTES_DIR      = HIPPOCAMPUS_DIR / "tycoon_reports" / "vision_quotes"

def encode_image(image_path: Path):
    """Convert an image to base64 for the API."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def estimate_paint_job(image_path: Path):
    """Send image to GPT-4o to extract painting variables."""
    if "OPENAI_API_KEY" not in os.environ:
        logger.error("❌ Cannot process: OPENAI_API_KEY missing from environment.")
        return None

    logger.info(f"Analyzing image: {image_path.name}...")
    
    try:
        base64_img = encode_image(image_path)
        client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

        system_prompt = (
            "You are Joel's expert painting estimator (Vanguard Tycoon Agent). "
            "Analyze the provided image of a residential interior or exterior. "
            "Estimate the square footage of the paintable surfaces. "
            "Assume interior walls require 2 coats of standard latex paint (1 gallon covers roughly 350 sq ft). "
            "Return ONLY a strictly formatted JSON object with the keys: "
            "'estimated_sqft' (integer), 'surface_type' (string: interior/exterior), "
            "'gallons_required' (float), 'needs_primer' (boolean), and 'observations' (short array of strings noting damage or extreme height)."
        )

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Calculate materials and effort for this specific view."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_img}"
                            }
                        }
                    ]
                }
            ],
            response_format={ "type": "json_object" },
            max_tokens=300
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("No content returned from OpenAI")

        data = json.loads(content)
        data["source_image"] = image_path.name
        data["processed_at"] = datetime.now().isoformat()
        
        return data

    except Exception as e:
        logger.error(f"Error during computer vision quote generation: {e}")
        return None

def save_quote(data: dict):
    """Save the JSON payload into the Hippocampus Tycoon folders."""
    os.makedirs(QUOTES_DIR, exist_ok=True)
    filename = f"quote_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = QUOTES_DIR / filename
    
    filepath.write_text(json.dumps(data, indent=2))
    logger.info(f"✅ Vision Quote generated and saved: {filepath.name}")
    logger.info(f"Est Gallons: {data.get('gallons_required')} | Primer: {data.get('needs_primer')}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tycoon Computer Vision Estimator")
    parser.add_argument("--img", type=str, required=True, help="Path to the image to analyze")
    args = parser.parse_args()

    img_path = Path(args.img).resolve()
    
    if not img_path.exists():
        logger.error(f"❌ File not found: {img_path}")
        sys.exit(1)
        
    result = estimate_paint_job(img_path)
    if result:
        save_quote(result)
