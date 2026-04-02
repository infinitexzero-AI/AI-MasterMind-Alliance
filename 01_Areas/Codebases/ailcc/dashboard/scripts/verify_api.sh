#!/bin/bash

BASE_URL="http://localhost:3000"
API_KEY="antigravity_dev_key"

echo "1. Checking Health..."
curl -s -X GET "$BASE_URL/api/dashboard/health" \
  -H "X-API-Key: $API_KEY" | grep "success" || echo "Health Check Failed"

echo "\n2. Creating Task..."
TASK_RES=$(curl -s -X POST "$BASE_URL/api/tasks/create" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "title": "Verification Task",
    "context": "Testing via script",
    "priority": "high",
    "targetAgent": "OmniRouter",
    "source": "web"
  }')
echo $TASK_RES
TASK_ID=$(echo $TASK_RES | grep -o '"taskId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TASK_ID" ]; then
    echo "Failed to create task"
    exit 1
fi

echo "\n3. Checking Task Status ($TASK_ID)..."
curl -s -X GET "$BASE_URL/api/tasks/status/$TASK_ID" \
  -H "X-API-Key: $API_KEY"

echo "\n4. Triggering Agent..."
curl -s -X POST "$BASE_URL/api/agents/trigger/OmniRouter" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"action": "spawn"}'

echo "\n5. Testing Webhook..."
# Note: Signature verification might fail here without exact match, but testing endpoint reachability
curl -s -X POST "$BASE_URL/api/webhooks/external" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "grok",
    "payload": {"title": "Webhook Test"},
    "signature": "dummy_signature_will_fail_auth_check"
  }'

echo "\nDone."
