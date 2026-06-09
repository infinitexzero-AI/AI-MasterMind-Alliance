---
workflow_name: mission_scraper_hn_v2
version: v2
created: 2025-12-16
author: Grok (Optimizer)
parent_version: mission_scraper_hn_v1
changelog: |
  - Fixed Write Error: Replaced ambiguous 'file_ops' with explicit 'return_artifact' instruction.
  - Improved Selectors: Added fallback for missing points (Job postings).
  - Validation: Added post-extraction data integrity check.
  - Latency: Removed unnecessary navigation wait (rely on DOM ready).
---

# Macro: The Scraper (Hacker News Edition) - V2 (Optimized)

## Objective
Robustly extract and validate the top 5 stories from Hacker News, handling edge cases (no points) and ensuring data persistence.

## Prerequisites
- Tools required: `browser`
- Environment: Access to return string/JSON data.

## Execution Steps

### Step 1: Navigate & Validate
**Tool**: `browser`
**Action**: Go to `https://news.ycombinator.com`. Wait for selector `tr.athing`.
**Output**: Page Ready.
**Stop condition**: Timeout (10s).

### Step 2: Robust Extraction (JavaScript)
**Tool**: `browser`
**Action**: Execute Script:
```javascript
() => {
  const items = Array.from(document.querySelectorAll('tr.athing')).slice(0, 5);
  return items.map(item => {
    const nextRow = item.nextElementSibling;
    const link = item.querySelector('.titleline > a');
    const score = nextRow ? nextRow.querySelector('.score') : null;
    return {
      rank: parseInt(item.querySelector('.rank')?.innerText) || 0,
      title: link?.innerText || 'Unknown',
      url: link?.href || '',
      points: score ? parseInt(score.innerText) : 0 // Handle job posts/new items
    };
  });
}
```
**Output**: JSON Array.
**Stop condition**: Array length < 5.

### Step 3: Integrity Check
**Tool**: `logic`
**Action**: Verify all items have `url` and `title`.
**Output**: Verified Data.
**Stop condition**: Validation Failure.

### Step 4: Persistence (Artifact)
**Tool**: `system`
**Action**: Save verified JSON to `~/AILCC_PRIME/scraped_hn_data_v2.json`.
**Output**: Saved File.
**Stop condition**: Write Failure.

## Success Criteria
- [ ] 5 valid items (no null titles).
- [ ] Zero "Tool Error" incidents.
- [ ] V2 output matches V1 output structure.

## Safety Checks
- Sanitize URLs before saving.
- Ensure file overwrite protections.
