import re
import json

def parse_transcript(file_path):
    courses = []
    current_term = None
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    term_pattern = re.compile(r'^(Fall|Winter|Session) Term - (\d{2}/[A-Z]+)$|^(Session) - (\d{2}/[A-Z]+)$')
    # Course pattern: code, title, grade, credits...
    # e.g., BIOL-1201Human Biology B 3.00 3.00 9.00
    course_pattern = re.compile(r'^([A-Z]{4}-\d{4})(.*?)\s+(A\+|A|A-|B\+|B|B-|C\+|C|C-|D\+|D|D-|F|W|X|CIP)\s*\*?\s*(\d+\.\d+)?\s*(\d+\.\d+)?\s*(\d+\.\d+)?$')
    
    for line in lines:
        line = line.strip()
        term_match = term_pattern.match(line)
        if term_match:
            current_term = line
            continue
            
        course_match = course_pattern.match(line)
        if course_match:
            code = course_match.group(1)
            title = course_match.group(2).strip()
            grade = course_match.group(3)
            cred_att = course_match.group(4) if course_match.group(4) else "0.00"
            cred_comp = course_match.group(5) if course_match.group(5) else "0.00"
            grade_points = course_match.group(6) if course_match.group(6) else "0.00"
            
            # extract prefix/number
            prefix = code.split('-')[0]
            number = code.split('-')[1]
            
            courses.append({
                "term": current_term,
                "code": code,
                "prefix": prefix,
                "number": number,
                "title": title,
                "grade": grade,
                "credits_attempted": float(cred_att) if cred_att else 0.0,
                "credits_completed": float(cred_comp) if cred_comp else 0.0,
                "grade_points": float(grade_points) if grade_points else 0.0
            })
            
    return courses

if __name__ == '__main__':
    courses = parse_transcript(r'c:\Users\infin\AILCC_PRIME\scratch\raw_transcript.txt')
    output_path = r'c:\Users\infin\AILCC_PRIME\01_Areas\Codebases\ailcc\hippocampus_storage\academic_matrix\academic_record_parsed.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(courses, f, indent=2)
    print(f"Parsed {len(courses)} courses to {output_path}")
