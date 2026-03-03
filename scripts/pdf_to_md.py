#!/usr/bin/env python3
"""Extract text from a PDF and convert to clean Markdown."""
import sys, os

def extract_pdf(pdf_path):
    try:
        import fitz  # PyMuPDF
    except ImportError:
        print("Installing PyMuPDF...")
        os.system(f"{sys.executable} -m pip install PyMuPDF -q")
        import fitz

    doc = fitz.open(pdf_path)
    md_lines = []
    
    for i, page in enumerate(doc):
        blocks = page.get_text("dict")["blocks"]
        for block in blocks:
            if "lines" not in block:
                continue
            for line in block["lines"]:
                text = "".join(span["text"] for span in line["spans"]).strip()
                if not text:
                    continue
                # Detect headings by font size
                max_size = max(span["size"] for span in line["spans"])
                is_bold = any("bold" in span["font"].lower() for span in line["spans"])
                if max_size > 16 and is_bold:
                    md_lines.append(f"\n# {text}\n")
                elif max_size > 13 and is_bold:
                    md_lines.append(f"\n## {text}\n")
                elif is_bold and max_size > 11:
                    md_lines.append(f"\n### {text}\n")
                else:
                    md_lines.append(text)
    
    doc.close()
    
    # Write output
    base = os.path.splitext(pdf_path)[0]
    out_path = f"{base}.md"
    with open(out_path, "w") as f:
        f.write("\n".join(md_lines))
    
    print(f"Extracted {len(doc)} pages -> {out_path}")
    return out_path

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 pdf_to_md.py <path_to_pdf>")
        sys.exit(1)
    extract_pdf(sys.argv[1])
