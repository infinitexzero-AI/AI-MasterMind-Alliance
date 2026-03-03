---
description: Activate Scholar Mode (Study Environment)
---

# Scholar Mode Workflows

// turbo-all

## Available Scholar Tools

### 1. PDF to Markdown

Extract text from any PDF and convert to clean Markdown with heading detection.

```bash
python3 /Users/infinite27/AILCC_PRIME/scripts/pdf_to_md.py <path_to_pdf>
```

Output: Creates a `.md` file in the same directory as the PDF.

### 2. APA Citation Formatter

Paste a DOI and get a properly formatted APA 7th edition citation.

```bash
python3 /Users/infinite27/AILCC_PRIME/scripts/cite_apa.py <DOI>
```

Example: `python3 /Users/infinite27/AILCC_PRIME/scripts/cite_apa.py 10.1371/journal.pmen.0000065`

### 3. Study Timer (Pomodoro)

Interactive Pomodoro timer with macOS notifications and automatic session logging to the Intelligence Vault.

```bash
python3 /Users/infinite27/AILCC_PRIME/scripts/study_timer.py
```

Sessions are logged to `/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault/study_sessions.jsonl`

### 4. Markdown to Word Document

Convert any Markdown file to a professionally formatted `.docx`. Use the `/md-to-docx` workflow.

## Quick Reference

| Tool | Command | Output |
| --- | --- | --- |
| PDF → MD | `pdf_to_md.py <file.pdf>` | `file.md` in same dir |
| DOI → APA | `cite_apa.py <DOI>` | Formatted citation |
| Study Timer | `study_timer.py` | Vault log + notifications |
| MD → DOCX | `/md-to-docx` | Formatted Word doc |
