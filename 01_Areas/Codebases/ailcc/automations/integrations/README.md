# External Integrations - Third-Party APIs

This directory contains integrations with external services and APIs.

## Active Components

### `linear_integration.py`
**Linear API Integration** - Extract projects, issues, milestones

**Status**: ✅ Fully functional

**Capabilities**:
- Fetch team projects
- Extract issues and activities
- Export data to JSON
- GraphQL query handling

**Usage**:
```bash
python3 automations/integrations/linear_integration.py
```

**Output**: `linear_artifacts.json`

---

### `hn_poller.py`
**Hacker News Intel Poller** - Automated tech intelligence gathering

**Status**: ✅ Running in background

**Capabilities**:
- Poll Hacker News front page every 5 minutes  
- Filter for AI/tech relevant stories
- Auto-inject to Cortex intelligence feed
- Deduplication cache (.hn_seen.json)

**Running**: PID varies (check with `ps aux | grep hn_poller`)

## Future Integrations

- `github_integration.py` - GitHub API for repos, PRs, issues
- `notion_sync.py` - Notion workspace sync
- `slack_integration.py` - Slack messaging and bot

## Configuration

All integrations use `.env` file in `automations/python/` for API keys:
```bash
LINEAR_API_KEY=lin_api_...
LINEAR_TEAM_ID=...
GITHUB_TOKEN=ghp_...
NOTION_API_KEY=secret_...
```

## Related Documentation

- Integration Strategy: `/docs/architecture/integration_strategy.md`
