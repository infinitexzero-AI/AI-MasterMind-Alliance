import pypdf
import sys
import json

def extract_transcript(path):
    try:
        reader = pypdf.PdfReader(path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    pdf_path = r"c:\Users\infin\OneDrive\Undergraduate studies\unofficial transcript April 2026.pdf"
    content = extract_transcript(pdf_path)
    # Output the first 2000 characters to see the format
    print(content[:5000])
