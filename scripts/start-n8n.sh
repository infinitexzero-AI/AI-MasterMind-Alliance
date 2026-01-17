#!/bin/bash

# AILCC n8n Start Script
echo "🌟 Initiating n8n Orchestration Layer..."

# Navigate to n8n_foundation directory
cd "$(dirname "$0")/../n8n_foundation" || exit

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi

echo "🚀 Starting n8n container..."
docker-compose up -d

echo "✅ n8n is starting up!"
echo "➡️  Access the editor at: http://localhost:5678"
