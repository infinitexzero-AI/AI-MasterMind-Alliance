# Core Platform - Cross-Platform Logic

This directory contains core orchestration logic that is platform-agnostic.

## Components

### `agent_registry.py`
**Agent Registry Management** - Central registry for all AI agents

**Status**: ✅ Integrated with Cortex API

**Responsibilities**:
- Track all agents across platforms (Desktop/Browser/Mobile)
- Manage agent sessions and activity
- Provide agent metadata and capabilities
- Handle agent check-ins and intel submissions

**Registry Location**: `/agents/registry.json`

**API Endpoints** (via Cortex):
- `GET /api/agents` - List all registered agents
- `GET /api/agents/{id}` - Get specific agent details
- `POST /api/agents/{id}/session` - Update agent session
- `POST /api/agents/{id}/intel` - Submit intel from agent

## Planned Components

### `event_bus.py`
Cross-platform event routing system

### `cortex.py`
Main orchestration engine (abstracted from drive_watcher.py)

### `config.py`
Centralized configuration management

## Design Philosophy

**Platform-Agnostic**: Code in this directory should work across Desktop, Browser, and Mobile platforms.

**Shared Logic**: Business logic that applies to all platforms lives here.

**No Platform Dependencies**: Should not import platform-specific modules directly.

## Related Documentation

- Architecture Overview: `/docs/architecture/system_overview.md` (coming soon)
