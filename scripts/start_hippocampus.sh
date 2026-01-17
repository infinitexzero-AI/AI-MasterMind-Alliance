#!/bin/bash
echo "🧠 Starting Hippocampus (Python Server)..."

# Run the Python implementation (Docker-free)
# This serves the Qdrant local storage on port 6333
python3 scripts/serve_hippocampus.py
