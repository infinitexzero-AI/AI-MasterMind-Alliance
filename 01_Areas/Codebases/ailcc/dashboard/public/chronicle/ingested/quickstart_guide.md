# Quick Start Guide - AI Mastermind Team

Get up and running with the AI Mastermind Team in **10 minutes**. This guide covers the absolute essentials to start collaborating with the AI agent team.

## ⏱️ 10-Minute Setup Checklist

- [ ] **2 min**: Install prerequisites
- [ ] **3 min**: Set up environment variables
- [ ] **2 min**: Authenticate with Google
- [ ] **2 min**: Verify installation
- [ ] **1 min**: Start your first task

---

## Step 1: Install Prerequisites (2 minutes)

### Check Python Version

```bash
python3 --version
# Should show Python 3.8 or higher
```

If Python is not installed or version is too old:
- **Mac**: `brew install python3`
- **Linux**: `sudo apt-get install python3`
- **Windows**: Download from [python.org](https://python.org)

### Install Required Packages

```bash
cd ~/AI-Mastermind-Core/
pip3 install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client msal requests python-dotenv
```

**That's it!** Core dependencies installed.

---

## Step 2: Set Up Environment (3 minutes)

### Create Your Config File

```bash
cp config.env.template config.env
nano config.env  # or use your favorite text editor
```

### Add Minimum Required Credentials

**For immediate start, you only need Google credentials** (already configured):

```bash
# Google APIs - Already set up!
# credentials.json and token.json are present

# Optional: Add other APIs later
# MICROSOFT_CLIENT_ID=your_id_here
# XAI_API_KEY=your_key_here
# PERPLEXITY_API_KEY=your_key_here
```

**Note**: `credentials.json` and `token.json` are already in place from T001! You're ready to go.

### Save and Close

Press `Ctrl+X`, then `Y`, then `Enter` (if using nano)

---

## Step 3: Authenticate with Google (2 minutes)

### Validate Your Token

```bash
python3 automations/validate_google_token.py
```

**Expected Output**:
```
============================================================
Google OAuth Token Validation
============================================================

📂 Loading token.json...
✅ Token loaded

🔐 Validating token...
✅ Token valid for 45 minutes

🔍 Checking scopes...
✅ All required scopes present

============================================================
✅ Token validation complete!
============================================================
```

### If Token is Invalid

Run the authentication setup:
```bash
python3 automations/google_auth_setup.py
```

This will:
1. Open your browser
2. Ask you to log in to Google
3. Request permission for Drive and Calendar
4. Save a new `token.json`

---

## Step 4: Verify Installation (2 minutes)

### Run System Check

```bash
python3 automations/system_check.py
```

**Expected Output**:
```
🔍 AI Mastermind Team - System Check
====================================

✅ Python 3.11.5
✅ Required packages installed
✅ Project structure verified
✅ credentials.json found
✅ token.json found
✅ config.env configured
✅ Google Drive API accessible
✅ Google Calendar API accessible

====================================
🎉 All systems operational!
====================================
```

### Quick API Test

```bash
python3 -c "from automations.google_client import get_client; c = get_client(); print('✅ Google APIs ready!')"
```

---

## Step 5: Start Your First Task (1 minute)

### Check the TaskBoard

```bash
cat TaskBoard.csv
```

You'll see tasks like:
```csv
TaskID,TaskName,AssignedTo,Status,Priority,Notes,Deadline
T001,Setup Infrastructure,SuperGrok,Complete,High,"Completed 2025-10-25",2025-10-24
T002,Google Drive API,SuperGrok,Complete,High,"OAuth working, sync deployed",2025-10-26
T003,Research Best Practices,Perplexity,In Progress,Medium,"Report 80% complete",2025-10-27
T004,Documentation,Claude,In Progress,High,"README and guides complete",2025-10-25
```

### Run Your First Sync

Test the Google Drive sync:

```bash
python3 automations/sync_taskboard_to_drive.py
```

**Expected Output**:
```
============================================================
TaskBoard Sync - 2025-10-25 15:30:00
============================================================

📋 Found TaskBoard.csv (modified: 2025-10-25T15:20:00)
📤 Uploading newer TaskBoard.csv...
✅ Updated TaskBoard.csv
✅ Sync complete: uploaded

============================================================
```

---

## 🎉 You're Ready!

**Congratulations!** Your AI Mastermind Team is now operational. Here's what you can do:

### Immediate Next Steps

1. **View your tasks**
   ```bash
   cat TaskBoard.csv
   ```

2. **Check system logs**
   ```bash
   tail -20 logs/system_sync_report.md
   ```

3. **Upload a test file**
   ```bash
   echo "Hello AI Team!" > test.txt
   python3 -c "from automations.google_drive_setup import upload_file; upload_file('test.txt')"
   ```

---

## 📚 Common Tasks

### Update a Task Status

Edit `TaskBoard.csv`:
```bash
nano TaskBoard.csv
```

Change the Status field, save, and sync:
```bash
python3 automations/sync_taskboard_to_drive.py
```

### Create a New Task

Add a new row to `TaskBoard.csv`:
```csv
T015,New Feature,SuperGrok,Not Started,Medium,"Description here",2025-10-30
```

### Check Agent Assignments

See what's assigned to each agent:
```bash
grep "SuperGrok" TaskBoard.csv
grep "Claude" TaskBoard.csv
grep "Perplexity" TaskBoard.csv
grep "Valentine" TaskBoard.csv
```

### View Recent Activity

```bash
tail -50 logs/system_sync_report.md
```

---

## 🔧 Troubleshooting Quick Fixes

### "Module not found" error

```bash
pip3 install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### "Token expired" error

```bash
rm token.json
python3 automations/google_auth_setup.py
```

### "Permission denied" error

```bash
chmod +x automations/*.py
```

### "File not found" error

Make sure you're in the project directory:
```bash
cd ~/AI-Mastermind-Core/
pwd  # Should show: /Users/yourname/AI-Mastermind-Core
```

---

## 📖 What to Read Next

Now that you're set up, dive deeper:

1. **[README.md](README.md)** - Complete project overview
2. **[API_INTEGRATION.md](docs/API_INTEGRATION.md)** - Set up additional APIs (Microsoft, xAI, etc.)
3. **[WORKFLOWS.md](docs/WORKFLOWS.md)** - How agents collaborate
4. **[RolesAndProtocols.md](RolesAndProtocols.md)** - Agent responsibilities

---

## 🚀 Advanced Setup (Optional)

### Add Microsoft Graph API (5 minutes)

1. Follow [Microsoft_Graph_Setup.md](docs/Microsoft_Graph_Setup.md)
2. Register Azure AD app
3. Add credentials to `config.env`
4. Run: `python3 automations/debug_microsoft_graph.py`

### Add Automation (5 minutes)

Set up automatic hourly sync:

**Mac/Linux (cron)**:
```bash
crontab -e
```

Add this line:
```
0 * * * * cd ~/AI-Mastermind-Core && python3 automations/sync_taskboard_to_drive.py >> logs/cron.log 2>&1
```

**Or use the built-in scheduler**:
```bash
python3 automations/sync_taskboard_to_drive.py &
# Runs in background, syncing every hour
```

### Add Calendar Integration (3 minutes)

Automatically create calendar events for deadlines:

```bash
python3 automations/sync_task_deadlines_to_calendar.py
```

This creates calendar reminders for all tasks with deadlines.

---

## 🎯 Quick Reference Commands

### Daily Operations

```bash
# Check tasks
cat TaskBoard.csv

# Sync to Drive
python3 automations/sync_taskboard_to_drive.py

# View logs
tail -20 logs/system_sync_report.md

# Health check
python3 automations/system_check.py
```

### File Operations

```bash
# List Drive files
python3 -c "from automations.google_drive_setup import list_drive_files; print(list_drive_files())"

# Upload file
python3 -c "from automations.google_drive_setup import upload_file; upload_file('yourfile.txt')"

# Download TaskBoard
python3 -c "from automations.google_drive_setup import download_taskboard; download_taskboard()"
```

### Token Management

```bash
# Validate token
python3 automations/validate_google_token.py

# Refresh token
python3 automations/google_auth_setup.py

# Check token expiry
python3 -c "from automations.validate_google_token import load_token, validate_token; import json; t=load_token(); print(validate_token(t)[2])"
```

---

## 💡 Pro Tips

### 1. Use Aliases for Quick Access

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
alias ai='cd ~/AI-Mastermind-Core'
alias tasks='cat ~/AI-Mastermind-Core/TaskBoard.csv'
alias sync='cd ~/AI-Mastermind-Core && python3 automations/sync_taskboard_to_drive.py'
alias logs='tail -30 ~/AI-Mastermind-Core/logs/system_sync_report.md'
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

Now you can:
```bash
ai      # Jump to project
tasks   # View tasks
sync    # Run sync
logs    # View recent activity
```

### 2. Watch Mode for Real-Time Sync

Monitor TaskBoard for changes and auto-sync:

```bash
python3 automations/sync_taskboard_to_drive.py monitor
```

This watches `TaskBoard.csv` and syncs immediately when you save changes.

### 3. Git Version Control

Track your project changes:

```bash
cd ~/AI-Mastermind-Core
git init
git add .
git commit -m "Initial AI Mastermind setup"
```

After making changes:
```bash
git add .
git commit -m "Updated TaskBoard with new tasks"
```

### 4. Backup Important Files

Create a backup script:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf ~/ai-backup-$DATE.tar.gz ~/AI-Mastermind-Core/TaskBoard.csv ~/AI-Mastermind-Core/logs/ ~/AI-Mastermind-Core/config.env
echo "✅ Backup created: ~/ai-backup-$DATE.tar.gz"
```

Make executable and run:
```bash
chmod +x backup.sh
./backup.sh
```

### 5. Visual TaskBoard

For a nicer view of tasks, install `csvlook`:

```bash
pip3 install csvkit
```

Then view TaskBoard in table format:
```bash
csvlook TaskBoard.csv
```

---

## 🤔 FAQ

### Q: Do I need all the API keys to start?

**A:** No! Start with just Google (already set up). Add others as needed:
- Microsoft Graph: For Office 365 integration
- xAI: For SuperGrok advanced features
- Perplexity: For research capabilities
- Zapier: For workflow automation

### Q: How do I know which tasks are mine?

**A:** Check the `AssignedTo` column in TaskBoard.csv. If you're the human user, look for tasks needing approval or escalation.

### Q: Can multiple agents work on the same task?

**A:** Yes! Use the format: `"SuperGrok, Claude"` in the AssignedTo field for collaborative tasks.

### Q: What if I break something?

**A:** Don't worry! You can:
1. Restore from Google Drive (files are synced)
2. Use Git to revert changes
3. Re-run setup scripts
4. Check logs for what went wrong

### Q: How do I add a new agent?

**A:** 
1. Add their name to `RolesAndProtocols.md`
2. Assign tasks to them in TaskBoard.csv
3. Document their capabilities
4. Set up any required API integrations

### Q: Where do I report bugs or request features?

**A:** Create a new task in TaskBoard.csv:
```csv
T016,Bug: Sync failing,Valentine,Not Started,High,"Describe the bug here",2025-10-26
```

### Q: How secure is this setup?

**A:** Very secure if you:
- ✅ Keep `config.env`, `token.json`, and `credentials.json` private
- ✅ Add them to `.gitignore`
- ✅ Don't commit them to public repos
- ✅ Rotate API keys regularly
- ✅ Use strong passwords

---

## 📱 Mobile Access (Bonus)

### Access TaskBoard from Phone

Since TaskBoard syncs to Google Drive, you can:

1. **View on phone**: Open Google Drive app → AI-Mastermind-Core folder → TaskBoard.csv
2. **Edit on phone**: Use Google Sheets (converts CSV automatically)
3. **Get notifications**: Set up Google Drive notifications for file changes

### Quick Phone Commands

Use a mobile terminal app (Termux on Android, iSH on iOS):

```bash
# Install Python and dependencies
pkg install python git

# Clone project (if using Git)
git clone <your-repo-url>
cd AI-Mastermind-Core

# View tasks
cat TaskBoard.csv

# Quick sync
python3 automations/sync_taskboard_to_drive.py
```

---

## 🎓 Learning Path

### Week 1: Master the Basics
- ✅ Complete this quick start
- ✅ Create and update tasks
- ✅ Run manual syncs
- ✅ Review agent activity logs

### Week 2: Add Integrations
- 📚 Read API_INTEGRATION.md
- 🔧 Set up Microsoft Graph
- 🤖 Configure xAI API
- 🔗 Add Zapier webhooks

### Week 3: Optimize Workflows
- 📖 Study WORKFLOWS.md
- ⚙️ Set up automated syncs
- 📅 Enable calendar integration
- 🔄 Implement custom workflows

### Week 4: Advanced Features
- 🚀 Create custom automation scripts
- 📊 Build reporting dashboards
- 🤝 Design multi-agent workflows
- 🔍 Optimize performance

---

## 🆘 Getting Help

### Documentation Resources

- **README.md**: Project overview and full setup
- **API_INTEGRATION.md**: Detailed API configuration
- **WORKFLOWS.md**: Agent collaboration patterns
- **Microsoft_Graph_Setup.md**: Microsoft 365 integration
- **Google_Drive_Setup.md**: Google API details

### Check System Status

```bash
# Full diagnostic
python3 automations/system_check.py

# API health
python3 automations/google_client.py

# View error logs
cat logs/error_log.log
```

### Debug Mode

Run any script with verbose output:

```bash
python3 -v automations/sync_taskboard_to_drive.py
```

---

## ✅ Success Checklist

Before moving on, verify you can:

- [ ] View TaskBoard.csv
- [ ] Run sync successfully
- [ ] See files in Google Drive
- [ ] Update task status
- [ ] View system logs
- [ ] Run health check (all green)
- [ ] Upload a test file
- [ ] Understand agent roles

**All checked?** You're officially part of the AI Mastermind Team! 🎉

---

## 🚀 What's Next?

Your AI team is ready to:

1. **Automate workflows** across Google, Microsoft, and Apple platforms
2. **Coordinate tasks** between multiple AI agents
3. **Sync data** in real-time with multi-cloud integration
4. **Generate reports** on progress and performance
5. **Scale operations** as your needs grow

### Start Building

Pick a task from TaskBoard.csv and dive in! The agents are standing by to help you achieve your goals.

**Remember**: The AI Mastermind Team works best when:
- Tasks are clearly defined
- Status is kept up-to-date
- Agents communicate through logs
- Human provides oversight

---

**Welcome to the AI Mastermind Team!** 🤖🧠✨

---

**Created by**: Claude Desktop (Documentation Specialist)  
**Task**: T004 - Quick Start Guide  
**Date**: October 25, 2025  
**Status**: ✅ COMPLETE  
**Time to Complete**: 10 minutes  
**Difficulty**: ⭐ Beginner-friendly  

Need help? Check the other docs or update TaskBoard.csv with your questions!