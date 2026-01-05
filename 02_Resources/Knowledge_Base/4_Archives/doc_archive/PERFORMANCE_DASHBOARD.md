# 🏎️ Valentine Performance Dashboard

**Machine**: MacBook Pro (User: infinite27)
**Target**: "Always-On" Agent Readiness

## 📊 Live Metrics (The "Valentine Score")
*Run `/valentine-check` to update*

| Metric | Target | Current Status |
|--------|--------|----------------|
| **Disk Usage** | < 80% | **88% (⚠️ Warning)** |
| **RAM Load** | < 70% | ~75% (Stable) |
| **Valentine Score** | > 80 | **Pending Calc** |

## 🧹 Storage Audit (Dec 2025)
**Total User Data**: ~46GB
**Hardware Context**: 128GB Drive (Small Capacity). 
*Space is at a premium.*

**Heavy Hitters**:
1.  `~/Library/Application Support` (14GB) - *Likely App Caches*
2.  `~/Library/Messages` (5.8GB) - *Old Attachments*
3.  `~/Library/Mobile Documents` (5.3GB) - *iCloud Sync*
4.  `~/Pictures` (4.2GB)

**Action Items**:
- [x] Archive Legacy Core (Moved to iCloud)
- [x] Move Photos Lib (Moved to `/Volumes/LaCie/AILCC_STORAGE_OFFLOAD`)
- [ ] **Manual**: Enable "Messages in iCloud" (Saves ~6GB)
- [ ] **Manual**: Enable "Optimize Mac Storage" (Saves ~5GB)

## ⚡ Power Tuning
**Current Profile**:
- ✅ `womp 1` (Wake on LAN active)
- ✅ `powernap 1` (Background sync active)
- ⚠️ `disksleep 10` (Disk sleeps after 10m - potential agent lag)

**Optimization Command**:
```bash
sudo pmset -a disksleep 0
```
*(Prevents disk spin-down when plugged in)*
