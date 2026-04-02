#!/bin/bash
# ADHD Academic Workflow System - Quick Start
# Launches all ADHD automation services

AILCC_DIR="/Users/infinite27/ailcc-framework/ailcc-framework"
LOG_DIR="$AILCC_DIR/logs"

mkdir -p "$LOG_DIR"

echo "🚀 Starting ADHD Academic Workflow System..."
echo "================================================"

# 1. Check if Cortex API is running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Cortex API already running on port 8000"
else
    echo "🔄 Starting Cortex API..."
    cd "$AILCC_DIR/automations/python"
    python3 drive_watcher.py > "$LOG_DIR/cortex.log" 2>&1 &
    echo "   PID: $!"
    sleep 2
fi

# 2. Start ADHD Email Processor (background service)
if pgrep -f "adhd_email_processor.py" > /dev/null ; then
    echo "✅ Email processor already running"
else
    echo "📧 Starting ADHD Email Processor..."
    cd "$AILCC_DIR/automations/integrations"
    python3 adhd_email_processor.py --continuous --interval 5 > "$LOG_DIR/adhd_email.log" 2>&1 &
    echo "   PID: $!"
fi

# 3. Check Edison Mail database access
EDISON_DB="$HOME/Library/Containers/com.edisonmail.edisonmail/Data/Library/Application Support/EdisonMail/edisonmail.db"
if [ -f "$EDISON_DB" ]; then
    echo "✅ Edison Mail database accessible"
else
    echo "⚠️  Edison Mail database not found"
    echo "   Expected: $EDISON_DB"
    echo "   Email monitoring will not work until Edison Mail is installed"
fi

# 4. Test API connectivity
echo ""
echo "🧪 Testing API endpoints..."
sleep 1

API_STATUS=$(curl -s http://localhost:8000/ | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'UNKNOWN'))" 2>/dev/null)
if [ "$API_STATUS" = "ONLINE" ]; then
    echo "✅ Cortex API responding: $API_STATUS"
else
    echo "❌ Cortex API not responding"
fi

# 5. Display service status
echo ""
echo "================================================"
echo "📊 Service Status:"
echo "   Cortex API:       http://localhost:8000"
echo "   Dashboard:        http://localhost:5173 (if running)"
echo "   Email Monitor:    Every 5 minutes"
echo ""
echo "📝 Logs:"
echo "   Cortex:     tail -f $LOG_DIR/cortex.log"
echo "   Email:      tail -f $LOG_DIR/adhd_email.log"
echo ""
echo "🧪 Quick Tests:"
echo "   Task Breakdown:  curl -X POST http://localhost:8000/api/adhd/tasks/breakdown -H 'Content-Type: application/json' -d '{\"task\":\"Write research paper\", \"task_type\":\"research_paper\"}'"
echo "   Recent Tasks:    curl http://localhost:8000/api/adhd/tasks/recent"
echo ""
echo "✨ ADHD Academic Workflow System is running!"
echo "   Email processor will check for academic emails every 5 minutes"
echo "   Tasks will be auto-created in Google Drive and Apple Reminders"
