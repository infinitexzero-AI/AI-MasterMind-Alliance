#!/bin/bash

# Swarm Control Utility for AILCC
# Usage: ./swarm.sh [command] [args]

API_BASE="http://localhost:3000/api/swarm"

function launch() {
    echo "Launching Swarm for goal: $1"
    curl -s -X POST "$API_BASE/dispatch" \
        -H "Content-Type: application/json" \
        -d "{\"goal\": \"$1\"}" | json_pp
}

function status() {
    echo "Checking Status for Session: $1"
    curl -s -X GET "$API_BASE/status?sessionId=$1" | json_pp
}

function approve() {
    echo "Approving Step: $2 in Session: $1"
    curl -s -X POST "$API_BASE/review" \
        -H "Content-Type: application/json" \
        -d "{\"sessionId\": \"$1\", \"stepId\": \"$2\", \"approved\": true, \"comment\": \"$3\"}" | json_pp
}

case $1 in
    "launch")
        launch "$2"
        ;;
    "status")
        status "$2"
        ;;
    "approve")
        approve "$2" "$3" "$4"
        ;;
    *)
        echo "Usage: $0 {launch|status|approve}"
        echo "  launch \"goal\""
        echo "  status \"sessionId\""
        echo "  approve \"sessionId\" \"stepId\" \"comment\""
        ;;
esac
