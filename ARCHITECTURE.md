# AILCC Framework Architecture

## Overview
The AILCC Framework is a multi-agent orchestration system supporting:
- Intent classification
- Agent dispatching
- Centralized configuration
- Real and mock agent adapters
- Memory management with task dependencies
- CI integration
- Documentation sync for Perplexity/Comet/GitHub agents

---

# 1. Core Modules

## 1.1 Intent Router
- Classifies user input
- Identifies task complexity
- Maps tasks to one or multiple agents
- Produces `IntentResult` objects

## 1.2 Agent Dispatcher
- Receives an `IntentResult`
- Selects one or multiple agent adapters
- Executes real or mock mode depending on config
- Merges final output and error states

## 1.3 Memory Manager
- Persists task context
- Creates dependency graphs
- TTL-based retention
- Exposes introspection helpers

---

# 2. Agent Adapters

Adapters share a unified structure:
- `sendMessage()`
- `supportsIntent()`
- Error normalization
- ConfigLoader-driven behavior

### 2.1 Claude Adapter
- Endpoint: `https://api.anthropic.com/v1/messages`
- Real + mock mode

### 2.2 OpenAI Adapter
- Endpoint: `https://api.openai.com/v1/completions`
- Real + mock mode

### 2.3 Grok Adapter (Phase 3)
- Endpoint: `https://api.x.ai/v1/chat/completions`
- Real + mock mode

---

# 3. ConfigLoader
Single source of truth for:
- API keys
- Environment modes
- Retry policies
- Agent enable/disable flags

---

# 4. Mode 6 Automation Loop
- Structured task controller
- Multi-stage execution
- Recursive agent planning
- Automated task management

---

# 5. Testing & CI
- Jest test suite
- GitHub Actions CI for Node 18 + 20

---

# 6. Documentation Sync (Perplexity/Comet)
- Provides reference information to external agents
- Ensures cross-agent alignment
