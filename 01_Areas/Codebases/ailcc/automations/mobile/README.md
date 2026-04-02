# Mobile Platform - iOS Integrations

This directory contains iOS and mobile-specific automation components.

## Status

🔧 **In Development** - Infrastructure ready, components to be added

## Planned Components

### `shortcuts_api.py`
Apple Shortcuts webhook receiver for iOS integration

### `voice_commands.py`  
Siri voice command processing

### `ios_sync.py`
Data synchronization with iOS devices

## Integration Points

**Apple Shortcuts** can POST to Cortex API:
- `POST /api/agents/mobile_shortcuts/intel` - Submit intelligence
- `POST /api/intel/inject` - Inject general intelligence

## Platform Requirements

- **iOS**: 16+ (for Shortcuts integration)
- **Network**: HTTPS endpoints for production
- **Setup**: See `/docs/platforms/MOBILE_INTEGRATION.md`

## Related Documentation

- Mobile Integration Guide: `/docs/platforms/MOBILE_INTEGRATION.md`
- Cortex API Docs: `/docs/guides/api_usage.md` (coming soon)
