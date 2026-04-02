#!/bin/bash

# Navigate to the framework directory
cd "$(dirname "$0")"

echo "----------------------------------------------------------------"
echo "  AILCC CrewAI Integration Setup & Demo"
echo "----------------------------------------------------------------"

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed or not in PATH."
    exit 1
fi

echo "[1/3] Installing dependencies from requirements.txt..."
# Install requirements (user might want to use a venv, but this script assumes active env or global)
pip3 install -r ../requirements.txt

echo "[2/3] Setup complete. Ready to run agents."
echo "----------------------------------------------------------------"
echo "Select a crew to run:"
echo "1) Standard Research Crew (starter_crew.py)"
echo "2) AILCC Orchestrator Crew (ailcc_custom_agents.py)"
echo "3) Exit"

read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo "Running content research crew..."
        python3 starter_crew.py
        ;;
    2)
        echo "Running AILCC orchestrator..."
        python3 ailcc_custom_agents.py
        ;;
    *)
        echo "Exiting."
        ;;
esac
