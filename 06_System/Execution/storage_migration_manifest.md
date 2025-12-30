# 📦 Storage Migration Manifest

**Objective**: Free up space on the primary 113Gi disk (currently at 91% capacity) by migrating non-essential but large data to `XDriveAlpha` and `XDriveBeta`.

## 📂 Target Candidates for Migration

| Source Path | Estimated Size | Status | Destination Hub |
| :--- | :--- | :--- | :--- |
| `/Users/infinite27/AILCC_PRIME/01_Areas/Codebases` | 1.5 GB | PENDING | `XDriveAlpha/Vault/Codebases` |
| `/Users/infinite27/Library/Application Support/Google/Chrome` | ~4 GB | PENDING | `XDriveBeta/Backup/Chrome` |
| `/Users/infinite27/Library/Mail` | 1.3 GB | PENDING | `XDriveBeta/Backup/Mail` |
| `/Users/infinite27/Library/Application Support/Antigravity` | 571 MB | PENDING | `XDriveAlpha/Backup/Antigravity` |
| `/Users/infinite27/Library/Mobile Documents/com~apple~CloudDocs` | TBD | PENDING | `XDriveAlpha/Vault/iCloud_Migration` |
| `/Users/infinite27/Library/Caches` | 640 MB | COMPLETE | *Purged* |

## 🛠️ Migration Strategy

1. **Stage 1: Analytics**: Identify specific subfolders exceeding 500MB.
2. **Stage 2: Validation**: Ensure destination drives are mounted and healthy.
3. **Stage 3: Transfer**: Use `rsync` for safe transfer with progress tracking.
4. **Stage 4: Reference**: Create symlinks if necessary for system-critical paths.
5. **Stage 5: Cleanup**: Remove source files after checksum verification.

## 📝 Analytics Queue

- [ ] Run `du -sh` on specific high-traffic folders.
- [ ] List top 20 largest files in the home directory.
