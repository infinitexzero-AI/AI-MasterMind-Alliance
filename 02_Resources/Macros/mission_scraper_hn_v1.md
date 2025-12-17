---
workflow_name: mission_scraper_hn_v1
version: v1
created: 2025-12-16
author: Comet/System
parent_version: null
changelog: |
  - Initial test creation for Hacker News
---

# Macro: The Scraper (Hacker News Edition)

## Objective
Turn unstructured web pages (Hacker News Front Page) into strict JSON datasets.

## Prerequisites
- Tools required: `browser`
- Data inputs: `https://news.ycombinator.com`
- Environment: Generic Web

## Execution Steps

### Step 1: Initialize The Scraper protocols
**Tool**: `browser`
**Action**: Enable logging and navigate to target
**Output**: Ready state
**Stop condition**: On network error

### Step 2: Navigate to Target
**Tool**: `browser`
**Action**: Go to `https://news.ycombinator.com`
**Output**: Page Loaded
**Stop condition**: HTTP 404/500

### Step 3: Extract Data
**Tool**: `browser`
**Action**: Identify the top 5 story links and their point counts.
**Output**: List of objects `{ "rank": int, "title": string, "points": int, "url": string }`
**Stop condition**: Elements not found

### Step 4: Normalize & Save
**Tool**: `file_ops`
**Action**: Save extracted list to `~/AILCC_PRIME/scraped_hn_data.json`
**Output**: JSON File
**Stop condition**: Write permission denied

## Success Criteria
- [ ] 5 items extracted
- [ ] JSON file created/valid
- [ ] Trace log generated

## Safety Checks
- Confirm no sensitive data in logs
- Verify write permissions before file operations
- Check rate limits before API loops
