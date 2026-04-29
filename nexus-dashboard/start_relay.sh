#!/bin/bash
# start_relay.sh - Hardened entry point for Neural Relay
# Resolves EMFILE (too many open files) on XDriveBeta

# Increase file descriptor limit for external drive stability
ulimit -n 65536

echo "🚀 Launching Neural Relay (Stabilized Mode) on Port 5005..."
PORT=5005 node server/relay_stabilized.js
