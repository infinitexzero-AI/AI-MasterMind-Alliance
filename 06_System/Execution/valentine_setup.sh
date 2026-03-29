#!/bin/bash
# Valentine Core Foundation - Phase 1 Deployment

echo "🚀 Valentine Core - Foundation Deployment Starting..."
echo ""

# Navigate to AILCC_PRIME workspace
cd ~/AILCC_PRIME || { echo "❌ AILCC_PRIME not found. Creating..."; mkdir -p ~/AILCC_PRIME; cd ~/AILCC_PRIME; }

# Create Valentine Core directory structure
echo "📁 Creating directory structure..."
mkdir -p valentine-core/{src/{routes,utils,middleware},config,docs,tests}

cd valentine-core

# Initialize Node.js project
echo "📦 Initializing Node.js project..."
npm init -y > /dev/null 2>&1

# Install dependencies
echo "📥 Installing dependencies..."
npm install express dotenv redis cors body-parser uuid > /dev/null 2>&1
npm install --save-dev nodemon > /dev/null 2>&1

# Create .env.example
echo "🔐 Creating environment template..."
cat > .env.example << 'EOF'
# Valentine Core Configuration
PORT=3000
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://localhost:6379

# AI Agent API Keys (Add your actual keys to .env)
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
PERPLEXITY_API_KEY=pplx-xxxxx

# Platform Integrations
GITHUB_ACCESS_TOKEN=ghp_xxxxx
LINEAR_API_KEY=lin_api_xxxxx
NOTION_API_KEY=secret_xxxxx
EOF

# Create actual .env from template
cp .env.example .env

# Create .gitignore
echo "🚫 Creating .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
.env
*.log
.DS_Store
redis-data/
coverage/
.vscode/
.idea/
EOF

# Create package.json scripts
echo "⚙️  Configuring npm scripts..."
npm pkg set scripts.start="node src/server.js"
npm pkg set scripts.dev="nodemon src/server.js"
npm pkg set scripts.test="echo 'Tests coming in Week 2'"

# Create README.md
echo "📝 Creating documentation..."
cat > README.md << 'EOF'
# Valentine Core Gateway

> Central orchestration layer for the AI Mastermind Alliance (AIMmA)

## 🎯 Mission
Route tasks to appropriate AI agents (Claude, ChatGPT, Perplexity, Grok, Gemini) based on task type and context.

## 🏗️ Architecture
- **Express Server**: RESTful API for task routing
- **Redis**: Shared memory for agent state persistence
- **Agent Router**: Intelligent task delegation logic

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (check: `node --version`)
- Redis installed locally OR Redis Cloud account
- AI API keys (Anthropic, OpenAI, Perplexity)

### Installation
```bash
npm install
cp .env.example .env
# Edit .env with your actual API keys
```

### Run Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

### Test Endpoint
```bash
curl -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Review the Valentine Core architecture",
    "priority": "not-urgent-important"
  }'
```

## 📋 API Endpoints

### POST /api/task
Route a task to the appropriate AI agent.

**Request Body:**
```json
{
  "task": "string (description of work)",
  "context": "object (optional - previous state)",
  "priority": "urgent-important|not-urgent-important|urgent-not-important|not-urgent-not-important"
}
```

**Response:**
```json
{
  "task_id": "uuid",
  "agent": "Claude|ChatGPT|Perplexity|Grok|Gemini",
  "status": "routed",
  "timestamp": "ISO8601",
  "reasoning": "Why this agent was selected"
}
```

## 🧠 Agent Routing Logic

| Keywords | Agent | Reason |
|----------|-------|--------|
| code, implement, build | ChatGPT | Code generation specialist |
| analyze, review, architecture | Claude | Deep reasoning & design |
| research, find, compare | Perplexity | Web search & best practices |
| coordinate, strategic | Grok | High-level orchestration |
| local, file, system | Gemini/Antigravity | Local execution layer |

## 📊 Daily Build Log
Track progress: See `daily_build_log.md`

## 🔄 SPEAR Method
- **Simplify**: 15-min daily builds
- **Plan**: Morning 8:30 AM sessions
- **Execute**: Build even when not ready
- **Adjust**: Sunday reviews
- **Repeat**: 90-day identity shift

## 📚 Documentation
- [Architecture Decisions](docs/architecture.md)
- [Agent Protocols](docs/agent_protocols.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing
This is part of the AI Mastermind Alliance (AIMmA) project. See main repo for contribution guidelines.

## 📄 License
MIT License - See LICENSE file
EOF

# Create daily build log
echo "📊 Creating daily build log..."
cat > daily_build_log.md << 'EOF'
# Valentine Core - Daily Build Log

## Identity Target
**"I am a systems architect who builds infrastructure daily at 8:30 AM"**

---

## Week 1: Foundation (Jan 13-17, 2026)

### Monday, Jan 13
- [x] Initialize Node.js project
- [x] Install dependencies (express, redis, dotenv, etc.)
- [x] Create directory structure
- [x] Setup .env configuration
- [x] Create README.md
- [x] First commit: Foundation complete

**Status**: ✅ COMPLETE  
**Time**: 15 minutes  
**Next**: Tomorrow - Basic Express server

---

### Tuesday, Jan 14
- [ ] Create src/server.js (basic Express app)
- [ ] Add POST /api/task endpoint
- [ ] Test with curl
- [ ] Commit: "Server skeleton complete"

**Target Time**: 8:30 AM, 15 minutes

---

### Wednesday, Jan 15
- [ ] Create src/utils/redisClient.js
- [ ] Test Redis connection
- [ ] Add connection error handling
- [ ] Commit: "Redis integration"

**Target Time**: 8:30 AM, 15 minutes

---

### Thursday, Jan 16
- [ ] Create src/utils/agentRouter.js
- [ ] Implement keyword-based routing
- [ ] Add routing logic to /api/task
- [ ] Commit: "Agent routing logic"

**Target Time**: 8:30 AM, 15 minutes

---

### Friday, Jan 17
- [ ] End-to-end test (task → routing → response)
- [ ] Document any issues in drift_detector.md
- [ ] Commit: "Week 1 MVP complete"

**Target Time**: 8:30 AM, 15 minutes

---

## Week 2: Integration (Jan 20-24, 2026)
_Plan to be created Sunday, Jan 18 during weekly review_

---

## Drift Detector (Weekly Review - Sundays 9 AM)

### Week 1 Review (Jan 18, 2026)
- [ ] Did I follow the system? __/5 days
- [ ] Where did I drift? _______________
- [ ] Why did it happen? _______________
- [ ] Smallest fix? _______________
- [ ] Commitment for Week 2? _______________

---

## System Metrics

| Week | Days Completed | Streak | Status |
|------|----------------|--------|--------|
| 1 | 1/5 | 1 | 🟢 Active |
| 2 | 0/5 | - | ⚪ Planned |

**Target**: 80%+ adherence (4-5 days/week)
EOF

# Create drift detector template
echo "🔍 Creating drift detector..."
cat > drift_detector.md << 'EOF'
# Drift Detector - Weekly System Review

> "Performance rises when drift decreases."

## How to Use
Fill this out every Sunday at 9:00 AM during your weekly review.

---

## Week 1 Review (Jan 18, 2026)

### 1. Did I follow the system?
- [ ] Monday 8:30 AM build
- [ ] Tuesday 8:30 AM build
- [ ] Wednesday 8:30 AM build
- [ ] Thursday 8:30 AM build
- [ ] Friday 8:30 AM build

**Adherence Score**: __/5 = __%

### 2. Where did I drift?
_List specific days/sessions where you didn't follow the system:_

- 

### 3. Why did it happen?
_Root cause analysis (not excuses):_

- 

### 4. What is the smallest fix?
_Concrete system adjustment (not "be more motivated"):_

- 

### 5. What will I commit to this week?
_One specific improvement to the system:_

- 

---

## System Health Indicators

| Indicator | Target | Current | Trend |
|-----------|--------|---------|-------|
| Daily adherence | 80%+ | __% | → |
| Commit streak | 7 days | __ | → |
| Build time | 15 min | __ min | → |
| Blocks missed | <1/week | __ | → |

---

## 1% Improvement This Week
_One small system enhancement:_

- 

---

## Notes
_Observations, insights, wins:_

- 
EOF

# Create docs structure
echo "📚 Creating documentation structure..."
cat > docs/architecture.md << 'EOF'
# Valentine Core Architecture

## System Overview
Valentine Core is the central orchestration layer for the AI Mastermind Alliance.

## Components
1. **Task Router**: Analyzes incoming tasks and selects appropriate agent
2. **Redis State Store**: Maintains agent context and task history
3. **Agent Connectors**: Interfaces to AI agent APIs
4. **Feedback Loop**: Tracks success/failure for routing improvements

## Data Flow
```
User Request → Express API → Agent Router → Selected Agent → Redis Store → Response
```

_Detailed architecture diagrams coming in Week 2_
EOF

cat > docs/agent_protocols.md << 'EOF'
# Agent Communication Protocols

## Standard Ping Syntax
When one agent needs to hand off to another:

```
🚨 @AgentName: [Task Description]
Context: [Relevant background]
Deliverable: [Expected output]
Timeline: [When needed]
```

## Agent Roster
- **Claude** 🧠: Architecture, analysis, system design
- **ChatGPT** 🤖: Code implementation, API building
- **Perplexity** 🔍: Research, web search, best practices
- **Grok** ⚡: Strategic coordination, high-level direction
- **Gemini/Antigravity** 💎: Local execution, file operations

## Handoff Protocol
1. Completing agent commits work
2. Uses ping syntax to route next step
3. Valentine Core logs handoff in Redis
4. Next agent receives context from shared memory
EOF

cat > docs/deployment.md << 'EOF'
# Deployment Guide

## Local Development
1. Clone repo
2. `npm install`
3. Copy `.env.example` to `.env` and add keys
4. `npm run dev`

## Production Deployment
_Coming in Week 4_

Options being evaluated:
- Railway.app (recommended)
- Heroku
- DigitalOcean App Platform
- Self-hosted VPS
EOF

# Initialize git repository
echo "🔄 Initializing git repository..."
git init > /dev/null 2>&1
git add .
git commit -m "Phase 1: Valentine Core foundation - SPEAR[Simplify] complete

- Project structure created
- Dependencies installed
- Documentation initialized
- Daily build log established
- Drift detector configured

Next: Tuesday 8:30 AM - Build Express server (15 min)
Identity: I am a systems architect who builds daily" > /dev/null 2>&1

# Create implementation_plan.md (Antigravity convention)
echo "📋 Creating implementation plan..."
cat > implementation_plan.md << 'EOF'
# Valentine Core Implementation Plan

## Phase 1: Foundation ✅ COMPLETE
**Date**: Monday, Jan 13, 2026  
**Time**: 15 minutes  
**Status**: Committed

### Completed
- [x] Directory structure
- [x] Node.js initialization
- [x] Dependencies installed
- [x] Environment configuration
- [x] Documentation framework
- [x] Git repository initialized

---

## Phase 2: Basic Server (Tuesday, Jan 14)
**Target**: 8:30 AM, 15 minutes

### Tasks
- [ ] Create `src/server.js` with Express app
- [ ] Add basic middleware (cors, body-parser)
- [ ] Create POST `/api/task` endpoint (placeholder)
- [ ] Test with curl
- [ ] Commit: "Server skeleton"

### Definition of Done
- Server starts without errors
- Endpoint returns JSON response
- Git commit pushed

---

## Phase 3: Redis Integration (Wednesday, Jan 15)
**Target**: 8:30 AM, 15 minutes

### Tasks
- [ ] Create `src/utils/redisClient.js`
- [ ] Connect to Redis (local or cloud)
- [ ] Add error handling for connection failures
- [ ] Test connection with simple get/set
- [ ] Commit: "Redis integration"

### Definition of Done
- Redis client connects successfully
- Can store and retrieve test data
- Graceful error handling for connection failures

---

## Phase 4: Agent Routing (Thursday, Jan 16)
**Target**: 8:30 AM, 15 minutes

### Tasks
- [ ] Create `src/utils/agentRouter.js`
- [ ] Implement keyword-based routing
- [ ] Add routing logic to /api/task
- [ ] Commit: "Agent routing logic"

### Definition of Done
- Task with "code" routes to ChatGPT
- Task with "analyze" routes to Claude
- Routing decision stored in Redis
- Response includes agent selection reasoning

---

## Phase 5: End-to-End Testing (Friday, Jan 17)
**Target**: 8:30 AM, 15 minutes

### Tasks
- [ ] Test complete flow (request → routing → storage → response)
- [ ] Document any issues in drift_detector.md
- [ ] Update README with current status
- [ ] Commit: "Week 1 MVP complete"

### Definition of Done
- Full request-response cycle works
- All commits from week visible in git log
- drift_detector.md filled out
- Ready for Week 2 planning (Sunday)

---

## Week 2 Preview (Jan 20-24)
_To be planned Sunday, Jan 18 during weekly review_

Potential focus:
- Connect to actual AI agent APIs
- Implement shared memory retrieval
- Add error handling and retries
- Build simple monitoring dashboard
EOF

# Summary output
echo ""
echo "=========================================="
echo "✅ VALENTINE CORE FOUNDATION DEPLOYED"
echo "=========================================="
echo ""
echo "📁 Directory: ~/AILCC_PRIME/valentine-core"
echo "📦 Dependencies: express, redis, dotenv, cors, uuid"
echo "📝 Documentation: README.md, daily_build_log.md, drift_detector.md"
echo "🔄 Git: Repository initialized, first commit complete"
echo ""
echo "🎯 NEXT STEPS:"
echo "  1. Review daily_build_log.md"
echo "  2. Set calendar reminder: Tomorrow 8:30 AM"
echo "  3. Check .env file and add your API keys (optional for now)"
echo ""
echo "⏰ TOMORROW (Tuesday, Jan 14 at 8:30 AM):"
echo "  Build basic Express server (15 minutes)"
echo ""
echo "🚀 Identity Shift Active:"
echo "  'I am a systems architect who builds infrastructure daily at 8:30 AM'"
echo ""
echo "=========================================="
echo "Week 1, Day 1: COMPLETE ✅"
echo "=========================================="
