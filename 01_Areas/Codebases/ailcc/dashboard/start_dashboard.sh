#!/bin/bash

# AILCC Dashboard Startup Script
# Launches both the Next.js Frontend (3000) and the Neural Relay (3001)

# Function to kill child processes on exit
cleanup() {
    echo "Shutting down AILCC Dashboard services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "🚀 Initializing AILCC Nexus Dashboard..."

# 1. Start Neural Relay (Backend Link)
echo "🔌 Starting Neural Relay on Port 3001..."
node server/relay.js &
RELAY_PID=$!

# Wait a moment for relay to initialize
sleep 2

# 2. Start Next.js Frontend
echo "💻 Starting Dashboard UI on Port 3000..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Services Launched:"
echo "   - Relay: PID $RELAY_PID (Port 3001)"
echo "   - UI:    PID $FRONTEND_PID (Port 3000)"
echo "Press Ctrl+C to stop all services."

# Wait for both processes
wait $RELAY_PID $FRONTEND_PID
