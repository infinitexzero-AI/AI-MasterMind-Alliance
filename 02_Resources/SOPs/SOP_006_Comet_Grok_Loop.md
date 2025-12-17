# SOP: Comet-Grok Optimization Cycle (SOP_006)

**Objective**: To continuously refine automation workflows by using "Grok" (Optimizer) to critique and rewrite the execution traces of "Comet" (Operator).

## 1. The Cycle

### Phase 1: Run & Trace (Operator)

1. **Preamble**: Load a specific Macro (e.g., `workflow_name_v1`).
2. **Execute**: Comet runs tasks in the browser/terminal.
3. **Log**: All actions are captured in `traces/*.jsonl`.
    * *System Flag*: Ensure `trace=true` is sent in the task payload.

### Phase 2: Critique & Rewrite (Optimizer)

1. **Ingest**: Feed the `.jsonl` trace to Grok.
2. **Prompt**:
    > "Identify inefficiencies in this trace. Rewrite the process as a robust, tool-aware system prompt for a browser agent that minimizes tab-hopping."
3. **Output**: Grok generates an optimized SOP/Prompt (V2).

### Phase 3: Stabilize (Macro)

1.  **Save**: Store the Grok output as a new Macro (e.g., `workflow_name_v2.md`).
2.  **Deploy**: Use V2 for the next run.
3.  **Regression Test**: Compare V2 usage against V1 baselines.

## 2. Universal Role Taxonomy (30 Patterns)

### 1-10: Research & Triage
1.  **Synthesizer**: Information fusion (Research).
2.  **Watchman**: Continuous monitoring (Alerting).
3.  **Scraper**: Structured extraction (Datasets).
4.  **Clerk**: Form automation (Data entry).
5.  **Curator**: Queue triage (Classification).
6.  **Auditor**: State verification (QA/Testing).
7.  **Sniper**: Precision transactions (High-stakes).
8.  **Publisher**: Content distribution (Posting).
9.  **Librarian**: Resource organization (Asset mgmt).
10. **Architect**: Workflow optimization (Meta-learning).

### 11-20: Operations & Logic
11. **Navigator**: Multi-tab orchestration.
12. **Translator**: Format conversion.
13. **Validator**: Input sanitization.
14. **Aggregator**: Batch collection.
15. **Scheduler**: Time-based execution.
16. **Diff Detector**: Change tracking.
17. **Authenticator**: Session management.
18. **Uploader**: File transfer (Push).
19. **Downloader**: Resource retrieval (Pull).
20. **Search Operator**: Query execution.

### 21-30: Advanced Utilities
21. **Cloner**: Replication & Backup.
22. **Interceptor**: Real-time stream capture.
23. **Comparator**: Multi-option analysis.
24. **Notifier**: Alert distribution.
25. **Paginator**: Sequential traversal.
26. **Filter**: Subset extraction.
27. **Merger**: Data consolidation.
28. **Splitter**: Data partitioning.
29. **Enricher**: Data augmentation.
30. **Archiver**: Historical preservation.

## 3. Role Composition Matrix

| **Pattern**       | **Primary Tools**                  | **Atomic Actions**                   |
|-------------------|------------------------------------|--------------------------------------|
| Synthesizer       | search_web, get_page_text          | Aggregate, cross-reference           |
| Watchman          | navigate, read_page                | Poll, compare, alert                 |
| Scraper           | read_page, find                    | Extract, paginate, normalize         |
| Clerk             | form_input, computer               | Fill, validate, submit               |
| Curator           | read_page, computer                | Classify, route, archive             |
| Auditor           | read_page, computer                | Assert, capture, report              |
| Sniper            | form_input, confirmation           | Stage, verify, execute               |
| Publisher         | form_input, navigate               | Adapt, stage, publish                |
| Librarian         | read_page, find                    | Scan, classify, reorganize           |
| Architect         | External LLM, file ops             | Parse, refactor, optimize            |
| Navigator         | tabs_create, navigate              | Parallelize, aggregate               |
| Translator        | get_page_text, file ops            | Parse, transform, write              |
| Validator         | form_input, read_page              | Check, sanitize, flag                |
| Aggregator        | navigate, read_page                | Fetch, normalize, append             |
| Scheduler         | External scheduler, navigate       | Wait, trigger, execute               |
| Diff Detector     | read_page, computer                | Snapshot, compare, report            |
| Authenticator     | navigate, form_input               | Login, verify session                |
| Uploader          | navigate, computer                 | Select files, transfer               |
| Downloader        | navigate, computer                 | Fetch, verify, store                 |
| Search Operator   | search_web, read_page              | Query, parse, filter                 |
| Cloner            | get_page_text, computer            | Capture, replicate, verify           |
| Interceptor       | read_page, computer                | Capture, buffer, persist             |
| Comparator        | navigate (multi-tab), read_page    | Load, extract, score                 |
| Notifier          | navigate, API integration          | Detect, format, send                 |
| Paginator         | navigate, find, computer           | Iterate, extract, continue           |
| Filter            | read_page, find                    | Apply rules, extract matches         |
| Merger            | read_page, schema matching         | Identify keys, merge, resolve        |
| Splitter          | read_page, classification          | Partition, route                     |
| Enricher          | search_web, navigate               | Lookup, augment, join                |
| Archiver          | navigate, get_page_text, computer  | Capture, timestamp, store            |

## 3. Storage

*   **Traces**: `/Users/infinite27/AILCC_PRIME/traces/`
*   **Macros**: `/Users/infinite27/AILCC_PRIME/02_Resources/Macros/`
