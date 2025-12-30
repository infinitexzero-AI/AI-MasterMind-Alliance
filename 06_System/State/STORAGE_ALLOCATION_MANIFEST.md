# 🧠 Hippocampus: Storage Allocation Manifest

This document defines the definitive allocation of data across the AI Mastermind Alliance storage ecosystem.

## 🔴 1. HOT STORAGE (Real-Time / Sync)

*High-performance local SSD with iCloud synchronization.*

| Path | Description | Use Case |
| :--- | :--- | :--- |
| `~/AILCC/` | Root for Mode 5 Operations (Symlinked). | Active Agent Control. |
| `~/AILCC_PRIME/` | Primary Codebase & State Brain. | System Logic. |
| `~/.config/antigravity/` | Local Conversation DB & Model Configs. | Intelligence Persistence. |
| `Documents/AI-Mastermind-Alliance-2025/` | Unified Human-AI Workspace. | Strategic Planning. |

## 🟡 2. WARM STORAGE (Local SSD - Off-Sync)

*Active datasets that do not require cloud synchronization.*

| Path | Description | Device |
| :--- | :--- | :--- |
| `~/Downloads/` | Temporary file arrivals. | Local SSD |
| `~/Desktop/` | Active UI assets and current work-in-progress. | Local SSD |
| `~/Library/Caches/` | App speed data (Purged regularly). | Local SSD |

## 🔵 3. COLD STORAGE (XDriveAlpha / Archives)

*High-volume media and long-term memory.*

| Path | Description | Device |
| :--- | :--- | :--- |
| `/Volumes/XDriveAlpha/Archives/` | Archived iCloud folders (e.g., `A.I. Lab`, `Joel_LifeLibrary`). | XDriveAlpha |
| `/Volumes/XDriveAlpha/Vault/` | Secondary backups of system state. | XDriveAlpha |
| `/Volumes/XDriveAlpha/*.photoslibrary` | High-volume media storage. | XDriveAlpha |
| `/Volumes/XDriveBeta/XDrive-Alpha_Migration/` | Secondary Mirror/Redundancy. | XDriveBeta |

## 🔄 4. ACTIVE MIGRATIONS

- **Archives**: Mirrored & Evicted `298 St. Thomas`, `Academic Career Ideas`, `Flag Football`, `NB power Bills`, `A.I. Lab`, `Joel_LifeLibrary`, `Personal ID & Docs`, `Product Lab`, `iCloud Photos 2`.
- **3D Scan 2024**: COMPLETE. Frame repository local stubs pruned.
- **OneDrive**: COMPLETE. 1.8GB migrated to `/Volumes/XDriveAlpha/Archives/OneDrive_Mirror`.
- **Infrastructure**: Canonical alignment to `AILCC_PRIME/protocols` and `knowledge.db` INITIALIZED.

## 📜 5. PROTOCOL

1. **Cloud Eviction**: Once a folder is verified on XDriveAlpha, the iCloud copy is deleted.
2. **Weekly Sync**: `long_term_sync.sh` mirrors XDriveAlpha to XDriveBeta.
3. **Threshold**: Local SSD available space must remain above **2GB** for optimal AI performance.
