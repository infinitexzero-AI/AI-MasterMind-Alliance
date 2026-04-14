import pypdf
import os

def extract_transcript_text(pdf_path, output_path):
    if not os.path.exists(pdf_path):
        print(f"Error: PDF not found at {pdf_path}")
        return

    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
        
        print(f"Successfully extracted transcript to {output_path}")
        print(f"Total Pages: {len(reader.pages)}")
    except Exception as e:
        print(f"Error extracting PDF: {e}")

if __name__ == "__main__":
    pdf_path = r"C:\Users\infin\OneDrive\Undergraduate studies\unofficial transcript April 2026.pdf"
    output_path = r"c:\Users\infin\AILCC_PRIME\01_Areas\Codebases\ailcc\hippocampus_storage\academic_matrix\full_transcript_raw.txt"
    extract_transcript_text(pdf_path, output_path)
