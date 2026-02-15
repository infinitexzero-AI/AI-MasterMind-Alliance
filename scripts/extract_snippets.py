import fitz
import os

source_dir = "/Users/infinite27/AILCC_PRIME/AI-MasterMind-Alliance/02_Resources/Academics/HLTH-1011/Sources/"
files = ["Auger_2019.pdf", "Murray_Knudson_2023.pdf", "Atcheson_2024_Final.pdf", "Schwartzmann_2024.pdf", "Ward_2023.pdf"]

for f in files:
    path = os.path.join(source_dir, f)
    if os.path.exists(path):
        doc = fitz.open(path)
        print(f"--- {f} ---")
        # Print first 500 chars of first page
        print(doc[0].get_text()[:500])
        doc.close()
