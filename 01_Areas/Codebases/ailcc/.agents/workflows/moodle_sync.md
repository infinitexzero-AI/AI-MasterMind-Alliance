---
description: Execute a full Moodle course sync to construct LLM Study Mode datasets
---

# Moodle Course Sync Workflow

## Purpose

This workflow intercepts institutional Moodle data using a Commander-supervised Playwright Chromium browser and natively converts the academic payload into `LOCAL_ONLY` markdown files in the Hippocampus array, optimizing them for Agentic Collaboration via `--study` mode injection.

## Step 1: Start Supervised Moodle Session

Authentication: Commander logs in manually via the visible Chromium window using institutional credentials. No session cookies are extracted, stored, or reused between sessions.

Start the Comet Playwright runbook to interactively traverse Moodle inside a visible Chromium shell.
// turbo
python3 automations/desktop/comet_moodle_controller.py

Commander manually logs out of Moodle before closing the Chromium window. The watcher daemon does not fire until the browser process has terminated.

## Step 1.5: Audit Log

The watcher daemon appends one record per captured resource to `hippocampus_storage/moodle_audit/session_YYYYMMDD.jsonl`:
{"timestamp": "ISO8601", "course": "GENS2101", "resource_url": "...", "local_path": "...", "session_id": "...", "classification": "LOCAL_ONLY"}

## Step 2: Ingest the Spool Array

After the Chromium session safely closes upon logout, execute the physical ingestion bridge. The daemon grabs the PDFs, creates the `.md` semantic nodes, and natively regenerates the `course_index_*.md` files.
// turbo
python3 automations/integrations/moodle_watcher.py

## Step 3: AI Collaboration & Delegation

Once the nodes are compiled, agents can natively drill down using the Query CLI, or you can pull raw context via Study Mode natively.

Execute queries manually:

```bash
# Query the active courses by metadata
python3 automations/integrations/moodle_query_helper.py --course "GENS 2101" --week 1-5

# INJECT full-text of all assignments straight into MacOS `pbcopy` for the AI context loader
python3 automations/integrations/moodle_query_helper.py --course "GENS 2101" --type "assignment" --study
```
