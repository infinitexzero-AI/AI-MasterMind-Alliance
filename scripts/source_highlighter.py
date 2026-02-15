import fitz  # PyMuPDF
import os
import re

def highlight_pdf(pdf_path, search_text, output_path):
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return False
    
    doc = fitz.open(pdf_path)
    highlighted = False
    
    for page in doc:
        # Normalize search text for better matching (ignoring some punctuation/whitespace)
        text_instances = page.search_for(search_text)
        
        # If no exact match, try a more relaxed search (first 50 chars)
        if not text_instances and len(search_text) > 50:
            text_instances = page.search_for(search_text[:50])
            
        for inst in text_instances:
            annot = page.add_highlight_annot(inst)
            annot.set_colors(stroke=(1, 1, 0)) # Yellow
            annot.update()
            highlighted = True
    
    if highlighted:
        doc.save(output_path)
        doc.close()
        print(f"Successfully highlighted: {output_path}")
        return True
    else:
        doc.close()
        print(f"Text not found in {pdf_path}: {search_text[:30]}...")
        return False

# Mapping of verified PDFs to their claims/evidence/titles for anchor highlighting
targets = [
    {
        "file": "Auger_2019.pdf",
        "text": "Auger Auger et al.",
        "output": "Auger_2019_Highlighted.pdf"
    },
    {
        "file": "Murray_Knudson_2023.pdf",
        "text": "Is It All in Your Head?",
        "output": "Murray_Knudson_2023_Highlighted.pdf"
    },
    {
        "file": "Atcheson_2024_Final.pdf",
        "text": "Living Wage for New Brunswick",
        "output": "Atcheson_2024_Highlighted.pdf"
    },
    {
        "file": "Schwartzmann_2024.pdf",
        "text": "Modulation of neural oscillations in escitalopram treatment",
        "output": "Schwartzmann_2024_Highlighted.pdf"
    },
    {
        "file": "Ward_2023.pdf",
        "text": "Telehealth and In-Person Behavioral Health Services in Rural Communities",
        "output": "Ward_2023_Highlighted.pdf"
    }
]

source_dir = "/Users/infinite27/AILCC_PRIME/AI-MasterMind-Alliance/02_Resources/Academics/HLTH-1011/Sources/"

for target in targets:
    src = os.path.join(source_dir, target["file"])
    dst = os.path.join(source_dir, target["output"])
    highlight_pdf(src, target["text"], dst)
