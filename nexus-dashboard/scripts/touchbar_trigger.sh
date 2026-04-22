#!/bin/bash

# NEXUS Touch Bar Trigger Script
# Usage: ./touchbar_trigger.sh "Task Title" [Priority]

TITLE="${1:-Quick Task from TouchBar}"
PRIORITY="${2:-high}"
API_KEY="antigravity_dev_key"
URL="http://localhost:3000/api/tasks/create"

curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{
    \"title\": \"$TITLE\",
    \"context\": \"Triggered via MacBook Touch Bar\",
    \"priority\": \"$PRIORITY\",
    \"targetAgent\": \"OmniRouter\",
    \"source\": \"touchbar\"
  }"
