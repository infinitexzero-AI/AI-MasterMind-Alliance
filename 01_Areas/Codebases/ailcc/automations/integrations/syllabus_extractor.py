import re
import json
from datetime import datetime
from pathlib import Path

class SyllabusExtractor:
    def __init__(self, course_id):
        self.course_id = course_id

    def extract_from_file(self, file_path: str):
        path = Path(file_path)
        if not path.exists():
            return []
        
        # In a full deployment, this would use pdfplumber/docx and an LLM to parse exact dates.
        # For the Phase 73 integration, we parse markdown/text heuristics for assignment headers.
        content = path.read_text(errors='ignore')
        
        assignments = []
        # Simple heuristic: Look for lines with "Assignment", "Exam", "Quiz" and a percentage
        lines = content.split('\n')
        for i, line in enumerate(lines):
            # very rough mock extraction
            if 'Midterm' in line or 'Exam' in line or 'Paper' in line or 'assignment' in line.lower():
                if len(line) < 100:
                    weight = 10
                    match = re.search(r'(\d+)%', line)
                    if match:
                        weight = int(match.group(1))
                    
                    assignments.append({
                        "id": f"extracted_{self.course_id}_{i}",
                        "course_id": self.course_id,
                        "title": line.strip()[:50] + " (Extracted)",
                        "type": "PAPER" if 'Paper' in line else "EXAM" if 'Exam' in line else "PROJECT",
                        "weight_percentage": weight,
                        "due_date": datetime.now().isoformat(),
                        "status": "TODO"
                    })
        return assignments

