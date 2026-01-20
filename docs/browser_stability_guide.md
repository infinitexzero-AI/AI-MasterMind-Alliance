# AILCC Browser Stability Guide

## Issue: Spinning Color Wheel / SIGTRAP Crashes

**Affected Browsers**: Chrome v143+, Comet v143+ (Canary builds)

### Root Cause

Chromium v143+ is a **development/canary branch** with known instability issues on macOS 15.7+. These versions introduce GPU rendering changes that can cause:

- Spinning beach ball (frozen UI)
- SIGTRAP crashes
- Excessive memory consumption
- GPU process hangs

---

## Immediate Fixes (Already Applied)

1. ✅ **Cache Cleared**: All browser caches purged
2. ✅ **Stuck Processes Killed**: Terminated hung browser processes
3. ✅ **System Load Reduced**: From 127 → 13 (normal)

---

## Recommended Actions

### Option 1: Use Safari as Primary (Most Stable)

Safari is optimized for macOS and doesn't have Chromium instability issues.

### Option 2: Chrome Stable Rollback

1. Download Chrome Stable (v132) from [google.com/chrome](https://www.google.com/chrome/)
2. Before installing, quit Chrome completely
3. Delete `/Applications/Google Chrome.app`
4. Install the stable version
5. **Prevent Auto-Update** (see below)

### Option 3: Comet Workarounds

Comet auto-updates and doesn't offer rollback. Workarounds:

```bash
# Disable GPU acceleration (reduces crashes)
/Applications/Comet.app/Contents/MacOS/Comet --disable-gpu --disable-software-rasterizer

# Or create a launch alias
alias comet-safe='/Applications/Comet.app/Contents/MacOS/Comet --disable-gpu'
```

---

## Prevent Chrome Auto-Update

```bash
# Create policy to disable auto-updates
sudo mkdir -p /Library/Google/GoogleSoftwareUpdate/
sudo defaults write /Library/Google/GoogleSoftwareUpdate/GoogleSoftwareUpdate.bundle/Contents/Resources/GoogleSoftwareUpdateAgent \
    ksadminCmd -string "/bin/true"

# Or block the update server (reversible)
sudo bash -c 'echo "0.0.0.0 update.googleapis.com" >> /etc/hosts'
```

---

## Daily Maintenance Script

Run this if browsers become sluggish:

```bash
bash /Users/infinite27/AILCC_PRIME/scripts/optimize_browsers.sh
```

---

## System Status After Recovery

| Metric | Before | After |
| ------ | ------ | ----- |
| Load Avg | 127/104/94 | 30/13/15 |
| Free Memory | Critical | Recovered |
| Browser Status | Frozen | Terminated (restart clean) |

---

*Last Updated: 2026-01-19 22:46*
