# Credentials Manager - Quick Start

## 🔒 Secure API Key Storage

**Uses macOS Keychain** - your keys are encrypted and never stored in plain text files!

## Add Your First API Key (Gemini)

```bash
cd ~/ailcc-framework/ailcc-framework

# Interactive mode (recommended)
python3 scripts/credentials_manager.py add gemini
```

**It will**:
1. Show you where to get the key (https://makersuite.google.com/app/apikey)
2. Let you paste it securely
3. Test it automatically
4. Save to macOS Keychain (encrypted!)

## All Commands

### Add Credentials
```bash
# Interactive (best)
python3 scripts/credentials_manager.py add gemini
python3 scripts/credentials_manager.py add github
python3 scripts/credentials_manager.py add linear

# Direct (for scripts)
python3 scripts/credentials_manager.py add gemini --credential "your-key-here"
```

### List All Keys
```bash
python3 scripts/credentials_manager.py list
```

Output:
```
🔑 Stored Credentials
============================================================

gemini
  Name: Google Gemini API
  Type: api_key
  Added: 2025-12-06T02:40:00

github
  Name: GitHub Personal Access Token
  Type: token
  Added: 2025-12-06T02:40:00
============================================================
```

### Get a Key (for scripts)
```bash
# Get raw key value
python3 scripts/credentials_manager.py get gemini

# Use in scripts
GEMINI_KEY=$(python3 scripts/credentials_manager.py get gemini)
```

### Delete a Key
```bash
python3 scripts/credentials_manager.py delete gemini
```

### Export as Environment Variables
```bash
# Create .env file
python3 scripts/credentials_manager.py export

# Source it
source config/credentials/.env

# Now you have:
echo $GEMINI_API_KEY
echo $GITHUB_API_KEY
```

## Supported Services

Pre-configured services (knows where to get keys):
- ✅ **gemini** - Google Gemini API
- ✅ **github** - GitHub Personal Access Token
- ✅ **linear** - Linear API Key
- ✅ **google_drive** - Google Drive OAuth
- ✅ **openai** - OpenAI API Key
- ✅ **anthropic** - Claude API Key
- ✅ **notion** - Notion Integration Token

Add custom services too!

## Integration with Scripts

### Progressive Summarizer
```python
# scripts/progressive_summarizer.py automatically uses credentials_manager!

from credentials_manager import CredentialsManager

manager = CredentialsManager()
api_key = manager.get_credential('gemini')
# Use api_key...
```

### Any Script
```python
#!/usr/bin/env python3
import sys
from pathlib import Path

# Add credentials manager to path
sys.path.append(str(Path.home() / "ailcc-framework" / "ailcc-framework" / "scripts"))

from credentials_manager import CredentialsManager

manager = CredentialsManager()
github_token = manager.get_credential('github')
gemini_key = manager.get_credential('gemini')
```

## Security

**Where are keys stored?**
- ✅ macOS Keychain (encrypted by system)
- ❌ NOT in plain text files
- ❌ NOT in git repositories
- ❌ NOT in environment variables (unless you export)

**Metadata stored**:
- `config/credentials/credentials_metadata.json`
- Only stores: service name, date added
- Never stores actual keys!

**Access**:
- Requires your Mac login password
- Protected by macOS security
- Can be backed up with Keychain backup

## Quick Setup Flow

```bash
# 1. Add Gemini key
python3 scripts/credentials_manager.py add gemini
# Paste key when prompted

# 2. Verify it's there
python3 scripts/credentials_manager.py list

# 3. Test with Progressive Summarizer
python3 scripts/progressive_summarizer.py --batch --domain academic --limit 3
```

## Troubleshooting

**"security: command not found"**
- You're not on macOS
- Alternative: Store in `config/credentials/keys.json` (less secure)

**"Permission denied"**
- Run: `chmod +x scripts/credentials_manager.py`

**"Credential not found"**
- Check list: `python3 scripts/credentials_manager.py list`
- Re-add: `python3 scripts/credentials_manager.py add <service>`

---

*Part of Life Library - Secure credential management for Second Brain*
