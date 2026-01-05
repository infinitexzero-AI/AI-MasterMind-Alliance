# Google Drive Setup Guide

## Quick Start (15 minutes)

### Step 1: Install Google Drive Desktop

**Download**: https://www.google.com/drive/download/

Or via Terminal:
```bash
# If you have Homebrew
brew install --cask google-drive
```

### Step 2: Sign In
1. Open Google Drive Desktop after installation
2. Sign in with your Google account (the one with free 15GB)
3. Choose where to place your Google Drive folder (default: `~/Google Drive`)

### Step 3: Initial Sync (Optional)
- You can skip syncing everything from cloud
- We only need to sync UP (from Mac to Google Drive)
- This saves your local disk space

### Step 4: Run Sync Script

```bash
cd ~/ailcc-framework/ailcc-framework

# Test first (dry run)
python3 scripts/google_drive_sync.py --dry-run

# Actually sync
python3 scripts/google_drive_sync.py
```

**This will**:
- Create `LifeLibrary_Active/` in your Google Drive
- Copy all 5 _Active folders:
  - Professional
  - Academic  
  - AI_Tech
  - Personal
  - Creative

### Step 5: Access on iPhone

1. Install **Google Drive** app from App Store
2. Sign in with same Google account
3. Navigate to: **My Drive** → **LifeLibrary_Active**
4. See all your active work!

---

## What Gets Synced

**Only active work** (keeps Google Drive usage low):
- `Professional_Wing/_Active/` → `GoogleDrive/LifeLibrary_Active/Professional/`
- `Academic_Wing/_Active/` → `GoogleDrive/LifeLibrary_Active/Academic/`
- `AI_&_Technical_Wing/_Active/` → `GoogleDrive/LifeLibrary_Active/AI_Tech/`
- `Personal_Wing/_Active/` → `GoogleDrive/LifeLibrary_Active/Personal/`
- `Creative_Wing/_Active/` → `GoogleDrive/LifeLibrary_Active/Creative/`

**Not synced** (stays on Mac):
- Full Life Library (263K files) - too big!
- Completed/archived work
- External drive backups

---

## Update Sync (Run Weekly)

```bash
# Quick sync command
python3 ~/ailcc-framework/ailcc-framework/scripts/google_drive_sync.py
```

**Or schedule it** (runs every Sunday at 9 AM):
```bash
# Edit crontab
crontab -e

# Add this line
0 9 * * 0 python3 ~/ailcc-framework/ailcc-framework/scripts/google_drive_sync.py
```

---

## Storage Management

**Google Drive Free Tier**: 15 GB

**Your _Active folders**: Typically 500MB - 2GB  
(Only current work, not full 263K files!)

**If you hit 15GB limit**:
1. Delete old files from Google Drive web interface
2. Keep only truly active work
3. Move completed projects back to Mac-only storage

---

## Troubleshooting

### Google Drive not found
```bash
# Check where it installed
ls ~/Google\ Drive
ls ~/GoogleDrive
ls ~/Library/CloudStorage/
```

Script will auto-detect these locations!

### Sync not working
```bash
# Force re-sync
python3 scripts/google_drive_sync.py --dry-run  # check first
python3 scripts/google_drive_sync.py  # then run
```

### iPhone not showing files
1. Check Google Drive app is signed in
2. Tap refresh icon
3. Navigate to: My Drive → LifeLibrary_Active
4. Wait 1-2 minutes for sync

---

## Benefits

✅ **$0 cost** - Free 15GB tier  
✅ **iPhone access** - Google Drive app  
✅ **Selective sync** - Only active work  
✅ **Automated** - Set and forget  
✅ **No iCloud** - Independent system

---

*Part of Joel's Life Library  
Managed by AILCC Framework*
