# ⚡️ Valentine System Triage: Cloud Storage Topology & Optimization Strategy

**Date:** 2026-05-26 (MacBook-Control-Plane)  
**Context:** Vanguard Swarm Tactical Sprint Plan (May 26 – June 1, 2026 Move-Out Deadline)  
**SSD Pressure:** 10.67 GB free / 112.7 GB total boot volume (URGENT buffer front-loading)  
**Swarm Roles:** Grok (Strategy Lead) → Antigravity (Local Execution / Shell Automation) per Valentine Core routing  
**Assets:** 4 topological clouds under `/Users/infinite27/Library/CloudStorage/` + iCloud (`com~apple~CloudDocs`)  
**Method:** Safe high-level `ls -1` only (NO recursive find, NO `du`, NO deep scans on CloudStorage or Mobile Documents to prevent File Provider hydration hangs). Trust prior size/context reports.  
**Goal:** Reduce boot SSD footprint via macOS File Provider "online-only" / "Optimize Storage" + structural cleanup + selective archiving. Enable zero-friction academics + move-out.

---

## 1. Current Inventory Report (Safe Shallow `ls -1`)

### CloudStorage Top-Level Mounts
```
GoogleDrive-eastcoastfreshcoats@gmail.com
GoogleDrive-eastcoastfreshcoats@gmail.com (2025-12-13 9:04 PM)   [STALE]
GoogleDrive-eastcoastfreshcoats@gmail.com (2025-12-29 4:55 PM)   [STALE]
GoogleDrive-eastcoastfreshcoats@gmail.com (2026-01-09 6:07 PM)   [STALE]
GoogleDrive-eastcoastfreshcoats@gmail.com (2026-03-31 9:38 PM)   [STALE]
GoogleDrive-eastcoastfreshcoats@gmail.com (2026-04-09 12:56 PM) [STALE]
GoogleDrive-eastcoastfreshcoats@gmail.com (2026-04-20 3:14 PM) [STALE]
OneDrive-MountAllisonUniversity
OneDrive-Personal
```

**Stale Google mounts (6 variants):** High-priority cleanup. These are historical File Provider instances; clutter UI and may retain cache bloat. (Previous session noted .tmp/.Encrypted in some.)

### OneDrive-MountAllisonUniversity (Academic Cloud – Active Courses)
**Purpose per spec:** PSYC 3141, BIOL 3991, CLAS 2501 (Summer 2026), Obsidian Vault (intended co-location).

**Top-level (shallow ls -1):**
- ACADEMIC ADMIN
- Apps & AI
- Arts & Letters 1st - 4th Year (contains CLAS-2501 + CLAS_VMC_2501_Syllabus_SS2026.pdf)
- Attachments and Drive Storage
- BIOLOGY 1st - 4th YEAR (contains BIOL-3991)
- BUSINESS DATA 2019 - 2026
- CLAS-2501 Assignment 1 Powerpoint.docx / .pptx (loose, current)
- CitSci Project Proposal – Part 1.docx (loose BIOL)
- Documents
- Exit Liquidity Planning.docx
- MATH, PHYS, COMPSCI
- Meetings
- Microsoft Teams Chat Files
- Notebooks
- PSYCHOLOGY 1st-4th Year (contains PSYC-3141)
- Pictures
- Recordings
- Social Neuroscience.docx (loose, current PSYC)
- The Art & Science of Learning
- Webinar Notes.docx
- Week 3 iNaturalist Data Assignment BIOL-3991... (loose, current)
- iCloud_Migration_Test
- icalexport.ics
- (No top-level "Obsidian" or "Summer 2026" folder)

**Key sub observations (targeted shallow ls on category folders):**
- PSYCHOLOGY 1st-4th Year/: PSYC-3141/ (active Summer), plus many older PSYC papers/essays (e.g. PSYC3151, 2701, 2201, 3101, labs, haxby/kanwisher PDFs).
- BIOLOGY 1st - 4th YEAR/: BIOL-3991/ (active), plus 2023 anatomy, limnology papers, GENS-2811, HLTH1011, old lectures.
- Arts & Letters 1st - 4th Year/: CLAS-2501/ + SS2026 syllabus (active Summer).
- Loose current work at root indicates incomplete organization for Summer term.
- .Trash: now 0 entries (previously reported ~65k suspicious entries in prior scan – resolved or mount-specific; good).

**Size context (trusted prior reports):** Academic folders (especially legacy year categories + Notebooks/Recordings/Pictures) among largest local-downloaded contributors. Scattered active files + old term bloat.

### OneDrive-Personal (Personal / Long-term Cloud)
**Top-level:**
- AILCC_System_Master_Archive
- AILCC_VAULT
- Attachments
- Book.xlsx
- Documents
- ECFC Business Sheet 1.xlsx + multiple 2022-2023 Payroll Spreadsheets (old)
- Gail's Cover Letter 2022.docx
- Obsidian/ (contains "Pattern Weaver Vault")
- Payroll Organization Oct. 26th.xlsx
- Resume.docx
- deploy_windows_vanguard.ps1

**Obsidian note:** Primary active vault "Pattern Weaver Vault" lives here (not yet in Academic). iCloud~md~obsidian container also present (for iOS Obsidian app sync).

### GoogleDrive-eastcoastfreshcoats@gmail.com (Cold / Archive Cloud)
**Main recent mount top:**
- My Drive/
- Other computers/
- Shared drives/

**My Drive top-level (shallow):**
- AI Frameworks and Ideas
- AI Mastermind Alliance Hardware
- AICC
- AILCC_ARCHIVE
- AILCC_DATA
- AILCC_Intelligence_Mirror
- Academic Funding Administration
- BILLS TAX DUES
- Books & Knowledge
- COMMAND_INBOX
- Component Status Role.gsheet
- Google AI Studio
- House Painter Position.gform
- IMG_6723.MOV (sample large media)
- Law and Ethics in Research.gsheet
- MATH-1151 (recent academic – borderline active/cold)
- Math 1151 Outline 2026.pdf
- Mini Lit. Review Draft 1.0 Feb. 8th.gdoc
- ReferencesQRTEK2025.html
- Saved from Chrome (multiple)
- Tcps is completed.gdoc

**Size context (trusted):** Contains bulk archives (AILCC_ARCHIVE/DATA/Mirror), old academic (MATH-1151), media, funding/bills, books. Ideal cold tier. Stale dated mounts add potential hidden bloat.

### iCloud (com~apple~CloudDocs – Apple Mirror / Edge Sync)
**Path:** `/Users/infinite27/Library/Mobile Documents/com~apple~CloudDocs`

**Top-level (shallow ls -1):**
- 00-Inbox
- 01_Projects
- 02-Areas / 02_Areas
- 03-Resources / 03_Resources
- 04-Archives / 04_Archives   (PARA-style structure – excellent for mobile capture)
- 298 St. Thomas
- 3D Brain Scan SceenShots
- A.I. Lab
- AI-Command-Center
- AILCC_Backups
- AILCC_Core_Docs
- AILCC_Nexus
- AI_Mastermind
- BIOL-3991 iNat Candidates (current course overlap)
- Backgroundcheck2025
- Coinbase
- Desktop
- Documents
- Downloads
- LifeLibrary_Mobile
- New stuff to organize
- Next 5 Moves Worksheets
- OneDrive - Mount Allison University (possible mirror/copy)
- Personal ID & Documentation
- Photos Library.photoslibrary (large – primary candidate for Optimize)
- Project_Screenshots
- Shortcuts

**Role:** iOS edge sync, dynamic UI layouts, Shortcuts, quick capture (Inbox), small active AILCC docs, personal ID. **NOT bulk storage.**

**Obsidian iOS:** iCloud~md~obsidian container exists (separate from CloudDocs).

**Size context (trusted):** Photos Library + Desktop/Docs/Downloads + AILCC folders contribute to local footprint. iCloud "Optimize Mac Storage" is key lever.

### Cross-Reference with Prior Session Data & Workload
- Matches embedded context: legacy "1st-4th Year" silos instead of term-based; loose current Summer files at Academic root; Obsidian in Personal; multiple stale Google; .Trash bloat (now cleared); no rclone; minimal Antigravity bin (only check_status).
- Course workload (Summer 2026 active): PSYC 3141 (Quiz 3 overdue, Quiz 4 May 29), BIOL 3991 (Week 3 iNat + CitSci Part 1), CLAS 2501 (A2 overdue May 18, A3 due May 25 – both in sprint priority). MATH 1151 dropped. Obsidian central for notes/deliverables.
- Move-out (June 1 URGENT): Sprint plan emphasizes 2-3hr daily pack blocks + academic surge. Storage triage directly supports by freeing SSD for smooth operation + clear "Keep / Storage / Donate" decisions (cold data already in Google = lower move priority).
- Gaps noted in sprint: No full current rubrics in local tree (rely on Moodle/Obsidian/OneDrive); this strategy provides the missing cloud topology master.

**Key Problems Identified:**
1. Legacy year-based folders (PSYCHOLOGY 1st-4th Year etc.) mix active Summer + years of old work → high local download + cognitive load.
2. Active Summer artifacts scattered (root loose files + deep in legacy).
3. Obsidian vault not co-located with Academic (query intent).
4. Stale Google mounts + prior .Trash bloat (partially resolved).
5. No enforced online-only discipline → SSD pressure (10.7GB free).
6. Zero automation for ongoing triage/archive (relies on manual + Valentine routing for Antigravity execution).
7. iCloud has good PARA bones but also course bits + large Photos.

---

## 2. Master Folder Structure Template for OneDrive-MountAllisonUniversity

**Target State (implement immediately as part of Sprint Day 1-2 pack/academic blocks):**

```
/Users/infinite27/Library/CloudStorage/OneDrive-MountAllisonUniversity/
├── _SYSTEM/
│   ├── ACADEMIC_ADMIN/                 # Enrollment, funding, meetings, current admin (always local)
│   ├── _MANIFESTS/                     # Daily snapshots, archive logs, inventories (generated by automation)
│   └── _TRASH_PURGE/                   # Temporary staging for purge ops
│
├── _ACTIVE_2026_Summer/                # HOT TIER – minimal set "Always keep on this device"
│   ├── PSYC-3141_Social_Neuroscience/
│   │   ├── 00_Notes/                   # Link or section from Obsidian Academic vault
│   │   ├── 01_Assignments/             # Quizzes, labs, essays
│   │   ├── 02_Readings_Papers/         # PDFs + annotations (haxby etc. if current)
│   │   ├── 03_Lectures_Slides/
│   │   └── 99_Submissions_Exports/
│   │
│   ├── BIOL-3991_Applied_Citizen_Science/
│   │   ├── Week_3_iNat_Data/
│   │   ├── CitSci_Project_Part1/
│   │   └── ...
│   │
│   ├── CLAS-2501_Intro_to_Archaeology/
│   │   ├── A1_Experimental_Archaeology/
│   │   ├── A2_Experimental_Archaeology_Slides/
│   │   ├── A3_Digital_Archaeology_LiDAR/
│   │   └── Syllabus_Resources/
│   │
│   └── Obsidian_Academic_Vault/        # MOVE or dedicated copy of Pattern Weaver here (or symlink). Co-locate notes with courses. Use Obsidian vault switcher or multi-vault.
│
├── _ARCHIVE_Past_Terms/                # COLD CANDIDATES – set to online-only immediately; script-move later
│   ├── 2025_Fall/
│   │   └── (old PSYC-3141, BIOL etc. from legacy folders)
│   ├── 2025_Winter/
│   ├── 2024_...
│   └── MATH-1151_Applied_Calculus/     # Recent but dropped – archive here then to Google
│
├── _RESOURCES_Shared/
│   ├── Notebooks/
│   ├── Templates/
│   ├── The_Art_and_Science_of_Learning/
│   └── Webinars/
│
├── MATH_PHYS_COMPSCI/                  # Review contents; most to _ARCHIVE or Google
├── Attachments_and_Drive_Storage/      # Audit; purge or archive
├── Pictures/                           # Current course media only in active; rest to Google Photos or cold
├── Recordings/                         # Same as above
├── Documents/                          # Empty or redirect to _SYSTEM/_ACTIVE
└── (CLEAN: no loose root files after migration – all current moved to _ACTIVE subs)
```

**Implementation Steps (Safe, low-hydration):**
1. Create the `_SYSTEM`, `_ACTIVE_2026_Summer/...`, `_ARCHIVE_Past_Terms/` skeleton (mkdir via terminal or Finder – metadata only).
2. Move (drag or `mv`) the existing `PSYC-3141/`, `BIOL-3991/`, `CLAS-2501/` folders + loose current files (CLAS A1, CitSci proposal, Social Neuroscience, Week 3 iNat) into the new `_ACTIVE_2026_Summer/` subs.
3. Move older content from PSYCHOLOGY/BIOLOGY/Arts legacy into `_ARCHIVE_Past_Terms/2025_Fall/` etc. (or directly plan Google move).
4. Decide on Obsidian: (a) Move entire "Pattern Weaver Vault" into `_ACTIVE_2026_Summer/Obsidian_Academic_Vault/`, or (b) Create course-specific folders inside vault + keep master in Personal with links. Test one-device first.
5. Immediately after moves: In Finder, multi-select legacy folders + `_ARCHIVE_*` + Pictures/Recordings/old Notebooks → Right-click → "Remove Download" (or OneDrive context "Free up space"). Set only `_ACTIVE_2026_Summer`, `_SYSTEM`, and current admin to "Always keep on this device".
6. Update Obsidian daily note or AILCC log with "Storage triage Day 1 complete – structure X, freed Y (est.)".

**Benefits:** Flat, term-centric, obvious active vs archive, easy for automation to target `_ARCHIVE_Past_Terms/` for Google moves. Reduces visual/mental load during move-out.

---

## 3. Exact Data Classification Rules (What Goes Where)

### OneDrive Academic (Hot / Active Academic – Minimize local download to essentials only)
- **In:** Currently enrolled Summer 2026 courses (PSYC 3141, BIOL 3991, CLAS 2501 full contents + in-progress work). ACADEMIC ADMIN current. Active Obsidian academic vault/sections. Recent lecture recordings or small media for these courses. Current-term funding/enrollment docs.
- **Borderline (review weekly):** MATH-1151 (dropped – move to archive). Any "2026" file not in active course.
- **Never (or immediate archive):** Pre-2026 completed courses, old essays/labs from legacy year folders, large media libraries, full past terms.
- **Local policy:** Only `_ACTIVE_2026_Summer` + `_SYSTEM` folders "Always keep on this device". Everything else online-only.

### OneDrive Personal (Warm / Personal Long-term)
- **In:** Current Resume/CV + cover letters, active personal finance summaries (not full old payroll), AILCC_VAULT / System_Master_Archive (non-academic portions – audit), Book.xlsx (if actively reading), personal deploy scripts, Gail's docs (if relevant), Attachments for personal projects.
- **Move to Google:** Full 2022-2023 ECFC payroll XLSX (keep summary PDF in Personal if needed), old business sheets, completed personal projects >12mo, large personal media not in Photos.
- **Local policy:** Keep core identity docs + current Resume "Always keep". Set bulk old payrolls / AILCC_VAULT subfolders to online-only.

### GoogleDrive (Cold / Archive – Primary long-term academic + bulk home)
- **In:** All pre-Summer2026 academic (full old terms, essays, papers, lectures from PSYCHOLOGY/BIOLOGY/Arts legacy, MATH-1151 once archived, Limnology, Anatomy 2023, etc.). AILCC_ARCHIVE / AILCC_DATA / Intelligence_Mirror (bulk). BILLS TAX DUES (past years). Books & Knowledge (full). Large media (MOVs, photo dumps, 3D scans if not iCloud). COMMAND_INBOX processed items. Old funding / admin closed.
- **Also:** Any file/folder matching: name contains "202[0-5]", "FALL|WINTER|SPRING 202[0-5]", "Archive", "Backup", "Export", "Old", completed assignments >6mo old, size >200MB and not accessed in 30 days (use Finder column).
- **Local policy:** All Google mounts primarily "Stream" / online-only. Only tiny active reference copies (if any) local.

### iCloud (Edge Mirror / Continuity – Light, optimized)
- **In:** Desktop + Documents (for iOS Files/Handoff), Photos Library (Optimize Mac Storage ON – thumbnails local, full in cloud), Shortcuts, AILCC_Core_Docs / Nexus / recent Project_Screenshots / AI_Mastermind (small active), 00-Inbox for mobile capture, Personal ID & Documentation (secure), BIOL-3991 iNat Candidates (if mobile workflow), LifeLibrary_Mobile.
- **Never bulk:** Full course folders, old terms, large videos, AILCC_ARCHIVE, full Obsidian vault (use selective or separate iCloud~md~obsidian for notes if desired), massive Pictures/Recordings.
- **Local policy:** System-wide "Optimize Mac Storage" enabled. Photos.app → iCloud → Optimize. Individual large folders in CloudDocs → Remove Download. Keep only last 30 days active Desktop/Docs downloaded.

**Universal Triage Heuristics (Valentine SPEAR-aligned):**
- Recency + access freq (Finder "Date Last Opened" + "Size" columns, sort largest first).
- Academic term parsing: active course codes + 2026 Summer → Academic; everything older → Google via _ARCHIVE staging.
- Size gate: >100MB single file or >1GB folder → cold unless explicitly in _ACTIVE today.
- Duplicate rule: Canonical in coldest correct tier; placeholder/alias or short link in hotter tiers.
- Move-out rule (June 1): Anything in Google or deep archive = "Storage" box or leave in cloud. Only _ACTIVE + Personal identity + iOS essentials = "Keep (move with me)".

---

## 4. Automation Ideas Using Antigravity Shell Utilities

**Current State (confirmed safe inventory):**
- `agents/antigravity_calls/bin/check_status` (only item; minimal).
- No rclone in PATH or ~/bin.
- No existing *cleanup*/*archive*/*.sh in docs/ (targeted search).
- valentine-core has daily-sprint.sh, life_os_ingest.sh, monitor.sh (potential integration points).
- Vanguard sprint plan has daily pack/academic blocks – perfect hook for storage ops.

**Recommended Immediate Actions (no new code yet):**
1. `brew install rclone` (or download static binary to ~/bin/rclone; `chmod +x`). Run `rclone config` for "gdrive" (eastcoastfreshcoats) + optional onedrive remotes. rclone gives checksum verify, --dry-run, progress, filters – far superior to raw `mv` across mounts.
2. In OneDrive/Google Drive/iCloud apps: confirm Files On-Demand / Stream / Optimize enabled globally.
3. Manual first pass (today): Remove Download on all legacy + archive candidates as described.

**Proposed New Antigravity Scripts (add to agents/antigravity_calls/bin/ ; executable, logged, manifest-generating):**

**A. valentine_archive_term.sh** (core cleanup automation)
```bash
#!/bin/zsh
# Usage: valentine_archive_term.sh --term "2025_Fall" --source "..." --dest "gdrive:AILCC_ARCHIVE/Academic/2025_Fall" [--dry-run]
# - Generates dated manifest (ls -lR + sizes + git-style)
# - Optional rclone move with verify
# - Logs to OneDrive Academic _SYSTEM/_MANIFESTS/archive_$(date +%F).log
# - Appends bullet to Obsidian daily note (if path known) or AILCC log
# - Sets extended attrs / tags for provenance
# Fallback: pure zsh mv + echo manifest if no rclone
```
Example dry-run first, then execute small batches during sprint pack blocks.

**B. cleanup_stale_cloud_mounts.sh**
- List dated GoogleDrive-* (as we saw).
- Check emptiness or age.
- Instructions + optional safe removal (after quitting Drive app; may require reboot or System Settings reset for File Provider).
- OneDrive .Trash force-purge if >0 (via OneDrive app or known cache paths – safe only).

**C. storage_daily_snapshot.sh** (integrate with daily-sprint.sh)
- `df -h /` + `df -h ~` (local free)
- `ls -1 _ACTIVE_2026_Summer/*` counts/sizes (shallow)
- List top 5 largest local folders under Academic (careful – use mdfind or non-recursive)
- Append to _MANIFESTS/daily_$(date).log
- If free < 20GB: osascript -e 'display notification "Storage critical – run triage"'

**D. set_fileprovider_online_only.scpt** (or .sh wrapper)
- AppleScript or `xattr` / `brctl` commands to batch "Remove Download" on paths (Finder selection simulation or direct).
- Safer: document exact manual steps + one-liner for known paths.

**E. pre_move_freeze.sh** (Sprint Day 5-6)
- Ensure _ACTIVE + critical Personal/iCloud items are fully downloaded ("Always keep").
- Force-archive everything else possible.
- Generate full 4-cloud inventory .md (shallow ls only).
- Verify SSD free target (>25-30GB).
- Tag / label boxes for physical move consistent with cloud tiers.

**Integration Points:**
- Add to `agents/antigravity_calls/bin/` + registry if exists.
- Hook into `docs/01_Areas/Codebases/valentine-core/daily-sprint.sh` or `core/valentine-core/` scripts.
- Valentine router (per architecture): "storage cleanup / archive term" tasks → Antigravity (local exec).
- Vanguard Swarm: morning brief includes "Storage triage 30min" in pack blocks.
- Git commit all manifests + this strategy doc for ThinkPad ↔ MacBook cross-device continuity (as per AILCC git layer).
- Future: rclone cron/launchd for weekly "suggest archives" (list Academic files untouched >90 days).

**Risks & Mitigations (Critical for Move Window):**
- Hydration hangs: Never recursive ops on mounts during automation. Use rclone with --max-depth 2, --dry-run always first, monitor `fs_usage` or Activity Monitor Disk tab. Small batches only.
- Obsidian + OneDrive conflicts: Large .obsidian/ + plugin data + daily notes can churn. Pause OneDrive sync during vault moves; prefer iCloud for primary vault long-term or add git plugin + private repo. Test sync on one Mac first.
- Quota / billing: Check web UIs for each provider before bulk moves.
- Data loss: Always manifest + dry-run + spot-check after move. Keep XDriveBeta (or external) as physical buffer during June 1.
- Stale mounts: Research exact "remove old File Provider" steps for Google/OneDrive before scripting rm.
- Time pressure (June 1): Front-load structure + online-only in Days 1-2; archive in 3-5. Use Joel buffer for surprises.

---

## 5. Actionable 6-Day Checklist (Integrate into Vanguard Sprint Plan)

**Day 1 (Mon May 26 – Academic Surge + Pack Buffer):**
- [x] Safe shallow inventory + this strategy formulated (current session).
- [ ] Enable/confirm Files On-Demand + Optimize in all 3 cloud apps.
- [ ] Create master folder skeleton (_SYSTEM, _ACTIVE_2026_Summer/*, _ARCHIVE_Past_Terms/) in Academic.
- [ ] Migrate loose current files + existing course subs (PSYC-3141, BIOL-3991, CLAS-2501) into _ACTIVE structure.
- [ ] Batch "Remove Download" on all legacy year folders, Pictures, Recordings, Notebooks, MATH_PHYS, Attachments (except active bits). Target 20-30GB+ reclaimed.
- [ ] Decide + action Obsidian vault location (move to Academic _ACTIVE or keep + link). Test.
- [ ] iCloud: set Photos Optimize; Remove Download on large non-essential (3D scans, old archives, Downloads).
- [ ] 15min: review Personal top – mark old ECFC payroll for Google move.
- [ ] Log 3 bullets + commit this doc + any manifests to git.

**Day 2 (Tue – A2 Complete + Pack Ramp + PSYC Q4):**
- [ ] Audit 2-3 largest Google My Drive folders (AILCC_ARCHIVE etc.); confirm cold.
- [ ] Begin first manual archive (e.g. MATH-1151 or one old PSYC term) from Academic _ARCHIVE staging → Google (small batch, verify).
- [ ] Install rclone + basic config (gdrive).
- [ ] Draft `valentine_archive_term.sh` skeleton in bin/ (dry-run mode first).
- [ ] Personal: set old payrolls / AILCC_VAULT bulk to online-only.
- [ ] Pack Block: use new structure to decide "cloud cold = storage unit / leave behind".

**Day 3 (Wed – BIOL + Pack Core):**
- [ ] Run first automated dry-run archive via new script on 1 term.
- [ ] Cleanup stale Google mounts (manual via apps/Settings first; script later).
- [ ] Snapshot script v1: daily_storage_snapshot.sh – run manually, commit log.
- [ ] iCloud deep review: move any course overlap (BIOL iNat) to Academic _ACTIVE if not already; purge "New stuff to organize".
- [ ] Pack: label boxes consistent with tiers (Google items = low priority physical move).

**Day 4-5 (Thu-Fri – Heavy Pack + Buffer):**
- [ ] Bulk archive remaining _ARCHIVE_Past_Terms/ (script or batches).
- [ ] Full manifests for all 4 clouds (shallow ls + trusted sizes).
- [ ] Final online-only sweep: verify only _ACTIVE + minimal Personal/iCloud downloaded.
- [ ] Test: open a cold placeholder from Academic – confirm it hydrates cleanly without hang.
- [ ] pre_move_freeze.sh dry-run.
- [ ] Update sprint plan with storage wins; note SSD free.

**Day 6 (Sat May 31 – Final Buffer):**
- [ ] Execute freeze script (or manual equivalent).
- [ ] Physical move prep: only hot-tier data needs local copies / easy access.
- [ ] Git push all strategy artifacts + logs.
- [ ] 30min Joel buffer + sleep.

**Post Move (Sackville, June+):**
- Re-evaluate with new local storage (XDriveAlpha?).
- Shift primary vault strategy if needed (iCloud/Git preferred for Obsidian?).
- Schedule weekly Antigravity storage triage via launchd or manual.

**Success Metrics (End of Sprint):**
- Boot SSD free ≥ 25-30 GB (from 10.7).
- Academic local downloaded footprint < 8-10 GB (only _ACTIVE + _SYSTEM).
- Zero stale Google mounts.
- Clean _ACTIVE_2026_Summer structure live + Obsidian co-located (or explicitly decided).
- At least 1-2 terms archived via process (manual or script).
- Full manifests + this strategy committed + synced to ThinkPad.
- No hydration incidents during ops.
- Move-out proceeds with clear cloud = physical box mapping.

---

## Alignment with Valentine System Triage & AILCC Standards

This document embodies Valentine Core (task router → Antigravity for local/system) + SPEAR method (Simplify structure, Plan template + rules, Execute in sprint blocks, Adjust for Obsidian/OneDrive quirks + stale mounts, Repeat via automation + daily snapshots).

High-signal, zero-friction, front-loaded for June 1 move-out buffer. All ops respect the "safe shallow only" rule established in this execution.

**References & Supersedes:**
- [docs/05_Templates/storage_topology.md](/Volumes/XDriveBeta/AILCC_PRIME/docs/05_Templates/storage_topology.md) (old local/boot focus – now historical)
- [docs/06_System/CLAUDE_TO_ANTIGRAVITY_STORAGE_OPS.md](/Volumes/XDriveBeta/AILCC_PRIME/docs/06_System/CLAUDE_TO_ANTIGRAVITY_STORAGE_OPS.md) (2025 local reclaim – context)
- [docs/05_Tasks/Vanguard_Swarm_Tactical_Sprint_Plan_May26-June1_2026.md](/Volumes/XDriveBeta/AILCC_PRIME/docs/05_Tasks/Vanguard_Swarm_Tactical_Sprint_Plan_May26-June1_2026.md) (integrate storage blocks)
- Valentine Core (docs/01_Areas/Codebases/valentine-core/ + core/valentine-core/)
- Antigravity calls (agents/antigravity_calls/)

**Next Immediate (post this doc):**
- Execute Day 1 checklist items.
- Create first Antigravity storage script.
- Commit + cross-device sync.

**Status:** COMPLETE – Strategy formulated, documented, ready for execution under Vanguard Swarm.

---

*Generated under strict adherence to no-hydration scan rules. All inventory data from safe `ls -1` + trusted prior reports + course/sprint context. Aligned with AILCC Prime + Antigravity directives.*