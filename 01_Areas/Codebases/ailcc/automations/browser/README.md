# Browser Platform - Web Automation

This directory contains browser automation and web integration components.

## Components

### `navigator.py`
**Browser Automation Engine** - Selenium-based web navigation

**Status**: ⚠️ Currently disabled due to dependency conflicts with dashboard
**Future**: To be replaced with Playwright

**Capabilities**:
- Automated web navigation
- Form filling and interaction
- Screenshot capture
- Session management

## Platform Requirements

- **Browsers**: Chrome/Brave (primary), Safari, Firefox
- **Python**: 3.11+
- **Dependencies**: Selenium, WebDriver

## Future Additions

- `webhook_receiver.py` - Handle browser extension webhooks
- `bookmarklets/` - JavaScript bookmarklets for quick actions
- `extensions/` - Browser extension code

## Related Documentation

- See `/docs/platforms/BROWSER_INTEGRATION.md`
