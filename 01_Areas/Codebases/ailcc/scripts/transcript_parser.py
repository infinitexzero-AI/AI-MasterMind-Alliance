import pypdf
import re
import json
import os
from datetime import datetime

class TranscriptParser:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.history = []
        self.stats = {
            "total_credits_attempted": 0,
            "total_credits_completed": 0,
            "cumulative_gpa": 0.0
        }

    def extract_text(self):
        reader = pypdf.PdfReader(self.pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

    def parse(self):
        text = self.extract_text()
        
        # Regex for course lines: [Code]-[Number] Title [Grade] [Att] [Comp] [Points]
        # Example: BIOL-1201 Human Biology B 3.00 3.00 9.00
        # Some titles have spaces and some course lines are split across lines in the PDF.
        # We'll use a multi-stage regex approach.
        
        # Pattern to find terms: Fall Term - 16/FA, Winter Term - 17/WI
        terms = re.split(r'(Fall Term - \d{2}/FA|Winter Term - \d{2}/WI|Spring Term - \d{2}/SP)', text)
        
        current_term = "Unknown"
        for part in terms:
            if re.match(r'(Fall Term - \d{2}/FA|Winter Term - \d{2}/WI|Spring Term - \d{2}/SP)', part):
                current_term = part.strip()
                continue
            
            # Find courses in this term
            # Pattern: ([A-Z]{4}-\d{4})\s*(.*?)\s+([A-F][+-]?|W)\s+(\d\.\d{2})\s+(\d\.\d{2})\s+(\d\.\d{2}|0\.00)
            courses = re.findall(r'([A-Z]{4}-\d{4})\s*([\s\S]*?)\s+([A-F][+-]?|W|Pass|Fail)\s+(\d+\.\d{2})\s+(\d+\.\d{2})\s+(\d+\.\d{2})', part)
            
            for c in courses:
                code, title, grade, att, comp, points = c
                title = title.replace('\n', ' ').strip()
                
                # Deduplicate or mark repeats if '*' is present (PDF often has * at the end of the line)
                is_repeat = '*' in part[part.find(code):part.find(code)+200] # Simplistic check for repeat marker nearby
                
                course_data = {
                    "term": current_term,
                    "code": code,
                    "title": title,
                    "grade": grade,
                    "credits_attempted": float(att),
                    "credits_completed": float(comp),
                    "grade_points": float(points),
                    "is_repeat": is_repeat
                }
                self.history.append(course_data)

        # Calculate Totals
        total_points = 0
        total_credits_for_gpa = 0
        for c in self.history:
            self.stats["total_credits_attempted"] += c["credits_attempted"]
            self.stats["total_credits_completed"] += c["credits_completed"]
            # W grades don't count towards GPA
            if c["grade"] != 'W':
                total_points += c["grade_points"]
                total_credits_for_gpa += c["credits_attempted"]
        
        if total_credits_for_gpa > 0:
            self.stats["cumulative_gpa"] = round(total_points / total_credits_for_gpa, 2)

        return {
            "history": self.history,
            "stats": self.stats,
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    pdf_path = r"c:\Users\infin\OneDrive\Undergraduate studies\unofficial transcript April 2026.pdf"
    parser = TranscriptParser(pdf_path)
    data = parser.parse()
    
    output_path = r"c:\Users\infin\AILCC_PRIME\01_Areas\Codebases\ailcc\hippocampus_storage\academic_matrix\academic_history.json"
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Successfully parsed {len(data['history'])} courses. Cumulative GPA: {data['stats']['cumulative_gpa']}")
