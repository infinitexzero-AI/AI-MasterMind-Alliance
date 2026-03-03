---
description: Convert a Markdown file to a properly formatted Word document (.docx)
---

# Markdown to Word Document Conversion

// turbo-all

## Steps

1. Identify the source `.md` file the user wants converted. If not specified, ask.

2. Generate a Python conversion script at `/tmp/md_to_docx.py` using `python-docx`. The script should:
   - Parse the markdown content
   - Create proper Word headings (H1, H2, H3)
   - Format tables with `Light Shading Accent 1` style
   - Use bullet points for list items
   - Use `Calibri` font at 11pt
   - Center the title
   - Avoid special characters like em-dashes (—) in headings — use plain hyphens (-)
   - Save the `.docx` to the same directory as the source `.md` file, with the same base name

3. Run the script:

```bash
python3 /tmp/md_to_docx.py
```

1. Provide the user with a clickable file link to the generated `.docx` file.

## Notes

- `python-docx` must be installed: `pip3 install python-docx`
- For complex markdown with code blocks, consider using `pandoc` as a fallback
- Always avoid special Unicode characters (em-dashes, curly quotes) in headings — they render as symbols in some Word versions
