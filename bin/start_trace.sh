#!/bin/bash
# Quick helper to start a traced workflow run

WORKFLOW_NAME=$1
VERSION=${2:-v1}
TIMESTAMP=$(date +"%Y%m%d_%H%M")
RUN_ID="${WORKFLOW_NAME}__${TIMESTAMP}__${VERSION}"
TRACE_FILE="$HOME/AILCC_PRIME/traces/${RUN_ID}.jsonl"

echo "Starting traced run: $RUN_ID"
echo "{\"run_id\":\"$RUN_ID\",\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",\"event\":\"workflow_start\",\"workflow\":\"$WORKFLOW_NAME\",\"version\":\"$VERSION\",\"operator\":\"comet\"}" > "$TRACE_FILE"

echo "Trace logging to: $TRACE_FILE"
export AILCC_TRACE_FILE="$TRACE_FILE"
export AILCC_RUN_ID="$RUN_ID"
