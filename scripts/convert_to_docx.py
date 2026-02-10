import docx
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os

def create_docx(md_path, docx_path):
    doc = docx.Document()
    
    # Set default style to double-spaced and 12pt Times New Roman
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    paragraph_format = style.paragraph_format
    paragraph_format.line_spacing = 2.0
    
    with open(md_path, 'r') as f:
        lines = f.readlines()
        
    for line in lines:
        line = line.strip()
        if not line:
            doc.add_paragraph()
            continue
            
        if line.startswith('# '):
            p = doc.add_heading(line[2:], level=1)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        elif line.startswith('## '):
            doc.add_heading(line[3:], level=2)
        elif line.startswith('### '):
            doc.add_heading(line[4:], level=3)
        elif line.startswith('**') and line.endswith('**'):
            p = doc.add_paragraph()
            p.add_run(line[2:-2]).bold = True
        elif line.startswith('- '):
            doc.add_paragraph(line[2:], style='List Bullet')
        elif line.startswith('* '):
            doc.add_paragraph(line[2:], style='List Bullet')
        elif line.startswith('> '):
            p = doc.add_paragraph(line[2:])
            p.paragraph_format.left_indent = Pt(36)
        else:
            # Handle simple bold/italic inline (very basic)
            p = doc.add_paragraph(line)
            
    doc.save(docx_path)
    print(f"Successfully saved to {docx_path}")

if __name__ == "__main__":
    md_file = "/Users/infinite27/.gemini/antigravity/brain/ac330fb6-353a-4aee-857b-0c5c9d27d604/final_draft_mini_lit_review.md"
    docx_file = "/Users/infinite27/.gemini/antigravity/brain/ac330fb6-353a-4aee-857b-0c5c9d27d604/Final_Draft_Mini_Lit_Review.docx"
    create_docx(md_file, docx_file)
