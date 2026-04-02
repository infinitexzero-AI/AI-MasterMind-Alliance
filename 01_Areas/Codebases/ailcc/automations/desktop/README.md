# Desktop Platform - macOS Integrations

This directory contains macOS-specific automation components.

## Components

### `drive_watcher.py`
**Main Cortex API Server** - FastAPI server providing orchestration endpoints

**Responsibilities**:
- Google Drive monitoring and intelligence processing
- Agent registry management  
- Linear issue escalation
- Real-time activity tracking
- Analytics and status reporting

**Runs on**: Port 8000 (default)

**Dependencies**:
- Google Drive API credentials (credentials.json)
- Linear API credentials (.env)
- Agent registry (agents/registry.json)

**Start**: 
```bash
python3 automations/desktop/drive_watcher.py
```

## Platform Requirements

- **OS**: macOS 11+ (Big Sur or later)
- **Python**: 3.11+
- **Access**: Local file system, Google Drive API

## Related Documentation

- See `/docs/platforms/DESKTOP.md` (coming soon)
- Main README: `/README.md`
