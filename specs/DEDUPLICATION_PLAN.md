# Deduplication & Cleanup Plan

**Goal:** Identify and remove redundant files to reclaim disk space (Target: >10GB Free).

## 1. Analysis Strategy
We will look for:
1.  **Large Files (>50MB):** Video recordings, ZIPs, models.
2.  **Duplicate Filenames:** "Copy", "Duplicate", " (1)".
3.  **Redundant Archives:** `node_modules` in old projects, `.git` in subfolders.

## 2. Tools
*   `find`: For size and name patterns.
*   `fdupes` (if available) / Python script: For hash-based deduplication.
*   `du -sh`: For directory sizing.

## 3. Target Directories
*   `~/AILCC_PRIME`
*   `~/Desktop` (if not offloaded)
*   `~/Downloads`

## 4. Execution Steps
1.  **Scan:** Run abundance checks (done).
2.  **Report:** List candidates for deletion.
3.  **User Verify:** User approves deletion list.
4.  **Delete:** `rm` or `trash` command.

## 5. Automation
We will create `cleanup_duplicates.py` to automate scanning and prompting.
