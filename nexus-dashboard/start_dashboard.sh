#!/bin/bash

# AILCC Dashboard Startup Script (Optimized for Sovereign OS)
# Launches the Next.js Frontend on port 3007 with high file limits

# Increase file limits for Next.js Watchpack on external drives
ulimit -n 65536

echo "🚀 Initializing AILCC Nexus Dashboard (Sovereign Mode)..."
echo "📂 Root: /Volumes/XDriveBeta/AILCC_PRIME/nexus-dashboard"

# Ensure we are in the right directory
cd /Volumes/XDriveBeta/AILCC_PRIME/nexus-dashboard

# Start Next.js Frontend on port 3007
# The package.json already includes --webpack in the 'dev' script
PORT=3007 npm run dev
