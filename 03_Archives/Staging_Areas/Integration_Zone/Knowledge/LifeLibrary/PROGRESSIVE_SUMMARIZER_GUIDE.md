# Progressive Summarizer - Quick Start Guide

## What It Does

Automatically creates **progressive summaries** of your documents using AI - the missing "Distill" step in your Second Brain!

**Input**: Any PDF, DOCX, TXT, MD, or code file  
**Output**: `.summary.md` file with:
- Executive Summary
- Key Points
- Important Details
- Actionable Takeaways
- Related Topics

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd ~/ailcc-framework/ailcc-framework
pip3 install google-generativeai PyPDF2 python-docx
```

### 2. Get Gemini API Key
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### 3. Configure
```bash
# Create credentials file
mkdir -p config/credentials
echo '{"api_key": "YOUR_KEY_HERE"}' > config/credentials/gemini.json

# Or set environment variable
export GEMINI_API_KEY="your-key-here"
```

## Usage

### Summarize One File
```bash
python3 scripts/progressive_summarizer.py --file ~/LifeLibrary/Academic_Wing/_Active/lecture1.pdf
```

### Batch Summarize (Recommended!)
```bash
# Summarize 10 academic files
python3 scripts/progressive_summarizer.py --batch --domain academic --limit 10

# Summarize 20 professional files
python3 scripts/progressive_summarizer.py --batch --domain professional --limit 20

# Summarize from all domains
python3 scripts/progressive_summarizer.py --batch --limit 30
```

### Update Inventory Database
```bash
python3 scripts/progressive_summarizer.py --batch --domain academic --limit 10 --update-db
```

## Examples

### Example 1: Your Anatomy Lecture
```bash
python3 scripts/progressive_summarizer.py --file ~/LifeLibrary/Academic_Wing/courses/ANAT2311/lecture1.pdf
```

**Creates**: `lecture1.summary.md`
```markdown
# Summary: lecture1.pdf

**Created**: 2025-12-06  
**Word Count**: 2,456

## EXECUTIVE SUMMARY
This lecture introduces human anatomy fundamentals, covering the hierarchical organization from cells to organ systems...

## KEY POINTS
- Human body has 11 major organ systems
- Anatomical terminology uses Latin/Greek roots
- Homeostasis is the body's self-regulation
...
```

### Example 2: Batch Your Active Work
```bash
# Summarize everything you're currently working on
python3 scripts/progressive_summarizer.py --batch --domain ai_technical --limit 15
```

**Output**:
```
📚 Batch Summarization
============================================================
Domain: ai_technical
Files to process: 15

📄 Processing: drive_watcher.py
  📖 Extracting text...
  🧠 Generating summary...
  💾 Saving summary...
  ✅ Summary created: drive_watcher.summary.md
  
... (processes all 15 files)

============================================================
📊 Batch Summary Results
============================================================
  Processed: 15
  Created: 13 ✅
  Skipped: 2
  Failed: 0
============================================================
```

## What Gets Summarized

**Supported Formats**:
- ✅ PDF documents
- ✅ Word docs (.docx)
- ✅ Text files (.txt)
- ✅ Markdown (.md)
- ✅ Code files (.py, .js, .tsx, etc.)

**Prioritizes**:
- `_Active/` folders (current work)
- Larger files (more content to distill)
- Files without existing summaries

## Summary Format

Each `.summary.md` includes:

1. **Executive Summary** - 2-3 sentences capturing essence
2. **Key Points** - 5-7 main ideas
3. **Important Details** - Specific facts/quotes worth remembering
4. **Actionable Takeaways** - What you can DO with this
5. **Connections** - Related topics/areas

## Integration with Life Library

**Summaries saved**:
```
~/LifeLibrary/
├── Academic_Wing/_Active/
│   ├── lecture1.pdf
│   ├── lecture1.summary.md        ← AI-generated summary
│   ├── assignment.docx
│   └── assignment.summary.md
```

**Database updated**:
```sql
SELECT file_name, summary_path, has_summary 
FROM files 
WHERE has_summary = 1;
```

## Automation

**Weekly Auto-Summarization**:
```bash
# Add to crontab
crontab -e

# Run every Sunday at 8 PM
0 20 * * 0 python3 ~/ailcc-framework/ailcc-framework/scripts/progressive_summarizer.py --batch --limit 20 --update-db
```

## Tips

1. **Start small**: Summarize 5-10 files in one domain
2. **Review quality**: Check if summaries are helpful
3. **Adjust prompts**: Edit `create_progressive_summary()` if needed
4. **Batch by domain**: Keep related summaries together
5. **Search summaries**: Use `grep` to find insights across all summaries

```bash
# Find all summaries mentioning "machine learning"
grep -r "machine learning" ~/LifeLibrary/**/*.summary.md
```

## Troubleshooting

**"API key not found"**:
```bash
# Check if file exists
cat ~/ailcc-framework/ailcc-framework/config/credentials/gemini.json

# Or set env var
export GEMINI_API_KEY="your-key-here"
python3 scripts/progressive_summarizer.py --batch
```

**"Unsupported file type"**:
- Only PDF, DOCX, TXT, MD, and code files supported
- Convert other formats or add support in `extract_text()`

**"Summary already exists"**:
- Deletes are skipped automatically
- Delete `.summary.md` to regenerate

## Next Steps

1. **Summarize your active work first**
2. **Review summaries - are they useful?**
3. **Set up weekly automation**
4. **Build Express system to USE summaries for creating outputs**

---

*Part of Life Library Second Brain Integration*  
*Implements CODE framework: Capture → Organize → **DISTILL** → Express*
