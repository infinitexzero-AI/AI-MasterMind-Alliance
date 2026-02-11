#!/bin/bash
# AILCC virtual environment setup script

VENV_PATH="/Users/infinite27/AILCC_PRIME/AI-MasterMind-Alliance/automation/.venv"

echo "Initializing Python virtual environment at $VENV_PATH..."

python3 -m venv "$VENV_PATH"

if [ $? -eq 0 ]; then
    echo "Virtual environment created successfully."
    source "$VENV_PATH/bin/activate"
    
    echo "Upgrading pip..."
    pip install --upgrade pip
    
    echo "Installing core dependencies..."
    # Core packages based on previous audit
    pip install crewai crewai-tools fastapi uvicorn docker diskcache filelock
    
    echo "AILCC Environment Ready."
    echo "To activate manually, run: source $VENV_PATH/bin/activate"
else
    echo "Failed to create virtual environment."
    exit 1
fi
