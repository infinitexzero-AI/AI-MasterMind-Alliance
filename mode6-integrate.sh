#!/bin/bash
# Mode 6 Integration Script
# Commit all Mode 6 components to feature/mode-6 branch
# Usage: bash mode6-integrate.sh

set -e

echo "🚀 Mode 6 Integration Script"
echo "Branch: $(git branch --show-current)"
echo ""

# Verify we're on feature/mode-6
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "feature/mode-6" ]; then
    echo "❌ Error: Must be on feature/mode-6 branch"
    echo "Current branch: $CURRENT_BRANCH"
    exit 1
fi

echo "✅ On feature/mode-6 branch"
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes detected:"
    git status --short
    echo ""
fi

# Commit strategy: Logical grouping of related changes

echo "📦 Committing Mode 6 components..."
echo ""

# 1. Intent Router
echo "Step 1/6: Committing Intent Router..."
git add automations/mode6/intent-router/
git commit -m "feat(mode6): Implement Intent Router with capability matching

- Analyzes task intents and classifies by type/complexity
- Selects optimal agent based on capability matrix
- Identifies secondary agents for multi-agent coordination
- Prepares handoff context with prerequisite information
- Maintains routing history for auditing
- References: multi-agent-sop.md, copilot-instructions.md"

echo "✅ Intent Router committed"
echo ""

# 2. Agent Dispatcher
echo "Step 2/6: Committing Agent Dispatcher..."
git add automations/mode6/agent-routing/
git commit -m "feat(mode6): Implement Agent Dispatcher with handoff protocol

- Enforces multi-agent handoff protocol (from multi-agent-sop.md)
- Validates agent availability and context window fit
- Routes to primary and secondary agents
- Implements error handling (fallback agents, escalation)
- Verifies output format compliance
- Executes with mock agent execution (ready for real APIs)"

echo "✅ Agent Dispatcher committed"
echo ""

# 3. Memory Manager
echo "Step 3/6: Committing Memory Manager..."
git add automations/mode6/memory/
git commit -m "feat(mode6): Implement Memory Manager for cross-agent context

- Stores execution results with task relationships
- Builds task dependency graphs for cascade execution
- Enables agents to reference previous work
- Implements retention policies (expiration, archival)
- Tracks memory footprint and cleanup metrics
- Supports prerequisite, related, and follow-up task tracking"

echo "✅ Memory Manager committed"
echo ""

# 4. Shared Types & Orchestrator
echo "Step 4/6: Committing shared components..."
git add automations/mode6/index.ts automations/mode6/intent-router/types.ts
git commit -m "feat(mode6): Add shared types and Mode6Orchestrator entry point

- Exports all Mode 6 components and interfaces
- Mode6Orchestrator: main class for task orchestration
- TaskIntent, RoutingDecision, HandoffContext types
- ExecutionResult and MemoryEntry interfaces
- Follows AILCC Framework conventions"

echo "✅ Shared components committed"
echo ""

# 5. Dashboard & API
echo "Step 5/6: Committing Dashboard UI and API scaffolds..."
git add dashboard/ package.json
git commit -m "feat(dashboard): Add Mode 6 UI scaffolds and API routes

Dashboard Components:
- Main dashboard with real-time metrics cards
- Routing history table with filtering
- Agent distribution and task type charts
- TODO: WebSocket updates, visualizations

API Endpoints (scaffolded):
- GET /api/routing/stats - Routing statistics
- GET /api/memory/metrics - Memory metrics
- POST /api/memory/cleanup - Trigger retention policy

Updated package.json with dependencies"

echo "✅ Dashboard and API committed"
echo ""

# 6. Documentation
echo "Step 6/6: Committing documentation..."
git add README_MODE6.md INTEGRATION_GUIDE.md MODE6_QUICK_REFERENCE.md MODE6_DELIVERY_SUMMARY.md
git commit -m "docs(mode6): Add comprehensive architecture and integration guides

- README_MODE6.md: Full architecture, positioning, workflows
- INTEGRATION_GUIDE.md: Step-by-step setup and verification
- MODE6_QUICK_REFERENCE.md: Quick lookup for developers
- MODE6_DELIVERY_SUMMARY.md: Delivery summary and next steps

Includes:
- Architecture diagrams and explanations
- Component integration points
- API endpoint documentation
- Testing and deployment guides
- References to multi-agent-sop.md and copilot-instructions.md"

echo "✅ Documentation committed"
echo ""

# Summary
echo "════════════════════════════════════════════════════════"
echo "✅ Mode 6 Integration Complete!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📊 Commits Summary:"
git log --oneline -6
echo ""
echo "📝 Files added:"
git diff --name-only main...HEAD | grep -E "^(automations|dashboard|README|INTEGRATION|MODE6|package)" | wc -l
echo "files"
echo ""
echo "Next steps:"
echo "1. Review commits: git log -p feature/mode-6"
echo "2. Push to remote: git push origin feature/mode-6"
echo "3. Create PR on GitHub from feature/mode-6 → main"
echo "4. Use PR template from INTEGRATION_GUIDE.md"
echo ""
echo "📖 Quick Reference:"
echo "- README_MODE6.md - Architecture guide"
echo "- INTEGRATION_GUIDE.md - Integration steps"
echo "- MODE6_QUICK_REFERENCE.md - Developer quick lookup"
echo ""
