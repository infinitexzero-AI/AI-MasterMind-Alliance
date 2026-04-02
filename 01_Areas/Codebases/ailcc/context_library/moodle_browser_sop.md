# Supervised-Browser Execution Model for Moodle (Comet SOP)

## 1. Authentication Bridge

- Comet will **never** capture, store, replay, or manipulate raw credentials, cookies, or session tokens outside the Commander’s supervised context.
- All Moodle authentication occurs via either:  
  - The Commander typing credentials directly into the visible Moodle login form, or  
  - A supervised password-manager autofill (e.g., browser-native, Bitwarden, 1Password) triggered explicitly by the Commander.
- No background credential injection, cookie cloning, SSO token replay, or off-session “login helpers” are permitted. Comet only interacts with the DOM elements that are currently visible in the Commander’s foreground browser.
- If Moodle is already authenticated (active session), Comet will **read-only** reuse that live session without copying or exporting cookies or tokens.

## 2. Execution Arena

- Comet runs as an **assistive navigator** layered on top of the Commander’s own browser, never as a hidden or fully headless scraper.
- All navigation occurs in a **user-visible, foreground tab** under the Commander’s direct supervision; the Commander can see each page transition, click, and form submission in real time.
- Comet may use an automation framework (e.g., Playwright, Puppeteer) only in **headed / visible** mode, attached to the same browser profile/session that the Commander is using, or via a clearly visible “automation” window controlled by the Commander.
- Any attempt to switch to fully headless or background scraping (e.g., spawning a separate invisible browser) is explicitly forbidden for Moodle and will be treated as a hard failure condition.

## 3. Data Handoff (PDF → Zotero)

- Target artifacts are **course-related PDFs and associated metadata** (course name, module, week/topic, filename, URL, and download timestamp).
- Comet will not parse or extract page-level content from the PDFs themselves; it only handles download and metadata capture needed for citation management and study workflows.

**Primary pipeline (preferred): watched spool directory**

- The Commander configures a dedicated download path, for example: `~/MoodleDownloads/spool/`  
- Comet ensures that the browser’s “Download to…” directory is set to this spool path for the active session.
- As Comet selects and downloads PDFs from Moodle, each file is written into the spool directory with a stable filename pattern (e.g., `courseCode_weekN_originalName.pdf`).
- Comet writes a lightweight JSON sidecar log into the same directory (`download_log.jsonl`) containing one record per file: `file_name`, `absolute_path`, `course`, `module/topic`, `source_url`, `downloaded_at`.
- `zotero_watcher` monitors this spool directory, ingests new PDFs, attaches the log metadata as Zotero item fields or tags, and then optionally archives/moves the file into a long-term library path.

**Alternative pipeline (optional): Zotero Browser Connector**

- If explicitly enabled, Comet may trigger the **Zotero Browser Connector** by navigating to the PDF and pausing for the Commander to click the connector icon. This mode respects all browser permission prompts.

## 4. Audit Trail and Session Termination

- For every Moodle automation run, Comet creates a local **session audit record** (e.g., `~/.comet_logs/moodle/session_<timestamp>.json`).
- Each session record must include at minimum: `session_id`, `start_time`, `end_time`, `moodle_base_url`, a list of high-level actions with timestamps, and exported filenames.
- Upon completion, Comet will navigate to the Moodle logout endpoint or click the visible “Log out” control, invalidating the session cookie.
- Comet will close or detach from the automation window while leaving the Commander’s normal browser profile intact. Comet will not retain Moodle cookies beyond the supervised session.
