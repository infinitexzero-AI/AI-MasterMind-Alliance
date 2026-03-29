#!/bin/bash
# AILCC Alliance Daily Briefing Generator
# Aggregates system state, recent tasks, and strategic forecasting for all agents.

set -euo pipefail

WORKSPACE="/Users/infinite27/AILCC_PRIME"
BRIEF_FILE="$WORKSPACE/ALLIANCE_DAILY_BRIEF.md"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "# 🌐 AI MasterMind Alliance - Daily Synchronization Brief" > "$BRIEF_FILE"
echo "**Generated:** $TIMESTAMP" >> "$BRIEF_FILE"
echo "---" >> "$BRIEF_FILE"

echo "## 📊 System Telemetry & Health" >> "$BRIEF_FILE"
if [ -f "$WORKSPACE/scripts/api/get_system_health.sh" ]; then
    bash "$WORKSPACE/scripts/api/get_system_health.sh" | grep -E "cpu|memory|status" >> "$BRIEF_FILE" || echo "Health data unavailable." >> "$BRIEF_FILE"
else
    echo "Health script not found." >> "$BRIEF_FILE"
fi

echo -e "\n## 🧠 Recent Cognitive Shifts & Actions" >> "$BRIEF_FILE"
echo "### Last 5 Commits (Global State)" >> "$BRIEF_FILE"
git -C "$WORKSPACE" log -n 5 --oneline || echo "Git history unavailable." >> "$BRIEF_FILE"

echo -e "\n## 🔮 Strategic Sentience (Grok/Metaculus Forecasts)" >> "$BRIEF_FILE"
# Pull the latest cached forecasts or note that a sweep is needed
if [ -f "$WORKSPACE/02_Resources/Academics/exa_intelligence_results.json" ]; then
    echo "- Recent semantic intelligence sweeps have been cached (Exa AI)." >> "$BRIEF_FILE"
else
    echo "- Pending semantic intelligence sweep." >> "$BRIEF_FILE"
fi
echo "- Automated forecasting via Metaculus is actively monitoring global variables. (Triggers on demand)." >> "$BRIEF_FILE"

echo -e "\n## 🛡️ Active Operational Directives" >> "$BRIEF_FILE"
echo "- **Antigravity:** Execution of core engineering and structural modifications." >> "$BRIEF_FILE"
echo "- **Comet:** Browser synchronization and UI/UX validation." >> "$BRIEF_FILE"
echo "- **OpenClaw:** Autonomous code refinement and API skill execution." >> "$BRIEF_FILE"
echo "- **Grok:** High-density strategic planning and exogenous variable monitoring." >> "$BRIEF_FILE"

echo -e "\n---\n*End of Brief. All agents must acknowledge state before proceeding with local objectives.*" >> "$BRIEF_FILE"

echo "Daily Brief generated at $BRIEF_FILE"
