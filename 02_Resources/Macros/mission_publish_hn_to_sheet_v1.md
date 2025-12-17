---
workflow_name: mission_publish_hn_to_sheet_v1
version: v1
created: 2025-12-16
author: Comet/System
parent_version: null
changelog: |
  - Initial creation connecting Scraper -> Publisher (Google Sheets)
---

# Macro: HN to Google Sheets Pipeline

## Objective
Scrape Top 5 Hacker News stories and publish them to a live Google Sheet.

## Prerequisites
- Tools required: `browser`, `terminal`
- Data inputs: `google_credentials.json` in `~/.aimma/`
- Environment: Python with `gspread`

## Execution Steps

### Step 1: Scrape Data (The Scraper)
**Tool**: `browser`
**Action**: Navigate to `news.ycombinator.com`, extract top 5 stories, return as JSON string.
**Output**: JSON Payload
**Stop condition**: Browser Error

### Step 2: Save Temporary Data
**Tool**: `file_ops`
**Action**: Save JSON string to `~/AILCC_PRIME/temp_hn_payload.json`
**Output**: File saved.
**Stop condition**: Write Error

### Step 3: Publish to Cloud (The Publisher)
**Tool**: `terminal`
**Action**: Run `python3 bin/google_sheets_adapter.py ~/AILCC_PRIME/temp_hn_payload.json`
**Output**: Success Message / Sheet URL
**Stop condition**: Connection/Auth Failure

## Success Criteria
- [ ] Data scraped from HN
- [ ] Data visible in Google Sheet "AILCC_Data_Stream"

## Safety Checks
- Verify credentials exist before run
- Sanitize input data
