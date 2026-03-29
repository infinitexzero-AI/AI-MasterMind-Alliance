#!/usr/bin/env python3
"""
StorageMind — Unified AILCC Storage Orchestrator
=================================================
Consolidates: ResourceGuard, storage_orchestrator, storage_evacuation,
              storage_migration, vault_cloud_sync, organize_icloud,
              monitor_storage into ONE intelligent controller.

Storage Tiers:
  HOT  → Internal SSD (121 GB) — OS, runtime, active codebases
  WARM → XDriveAlpha (2 TB)    — System logs, cold storage, cloud backups
  COLD → XDriveBeta  (2 TB)    — Academic vault, archival data
  CLOUD → iCloud / OneDrive / GoogleDrive — synced mirrors

Usage:
  python3 StorageMind.py --status        # Show all drive status
  python3 StorageMind.py --recover       # Emergency SSD recovery
  python3 StorageMind.py --optimize      # Full multi-tier optimization
  python3 StorageMind.py --migrate       # Move Academic Vault to XDriveBeta
  python3 StorageMind.py --daemon 300    # Run as daemon (interval in seconds)
"""

import os
import sys
import shutil
import subprocess
import time
import argparse
import logging
import json
from pathlib import Path
from datetime import datetime, timedelta

# ──────────────────────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────────────────────

AILCC_ROOT = Path.home() / "AILCC_PRIME"
LOG_DIR = AILCC_ROOT / "logs"
STATE_DIR = AILCC_ROOT / "06_System" / "State"

# Storage Volumes
VOLUMES = {
    "SSD":    Path("/"),
    "Alpha":  Path("/Volumes/XDriveAlpha"),
    "Beta":   Path("/Volumes/XDriveBeta"),
}

# Cloud Sync Directories (local mirrors)
CLOUD_PATHS = {
    "iCloud":      Path.home() / "Library/Mobile Documents/com~apple~CloudDocs",
    "OneDrive":    Path.home() / "OneDrive",
    "GoogleDrive": Path.home() / "Google Drive",
}

# Thresholds (GB)
SSD_HEALTHY_GB = 20.0
SSD_WARNING_GB = 10.0
SSD_CRITICAL_GB = 2.0

# Cleanup targets — ordered by priority (safest first)
CLEANUP_TARGETS = [
    # (path, description, min_age_days)
    (Path.home() / ".Trash", "Trash", 0),
    (Path.home() / "Library/Caches", "User Caches", 0),
    (Path.home() / ".npm/_cacache", "NPM Cache", 0),
    (Path.home() / "Library/Developer/Xcode/DerivedData", "Xcode DerivedData", 0),
    (AILCC_ROOT / "01_Areas/Codebases/ailcc/dashboard/.next/cache", "Next.js Cache", 0),
    (Path.home() / "Library/Caches/Homebrew", "Homebrew Cache", 0),
    (Path.home() / "Library/Application Support/Google/Chrome/Default/Cache", "Chrome Cache", 0),
]

# Large file evacuation targets (move to Alpha/Beta when SSD is low)
EVACUATION_TARGETS = [
    AILCC_ROOT / "04_Intelligence_Vault/Raw_Ingestion",
    AILCC_ROOT / "logs",
]

# Academic vault migration target
ACADEMIC_SOURCE = AILCC_ROOT / "05_Academic"
ACADEMIC_DEST = VOLUMES["Beta"] / "AILCC_Sovereign_Vault" / "05_Academic"

# PM2 log directory
PM2_LOG_DIR = Path.home() / ".pm2/logs"

# Docker VM path
DOCKER_RAW = Path.home() / "Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [StorageMind] %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(LOG_DIR / "storagemind.log", mode='a'),
    ]
)
log = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def get_free_gb(path: Path) -> float:
    """Return free space in GB for the volume containing `path`."""
    if not path.exists():
        return 0.0
    total, used, free = shutil.disk_usage(str(path))
    return free / (1024 ** 3)

def get_total_gb(path: Path) -> float:
    if not path.exists():
        return 0.0
    total, used, free = shutil.disk_usage(str(path))
    return total / (1024 ** 3)

def get_used_gb(path: Path) -> float:
    if not path.exists():
        return 0.0
    total, used, free = shutil.disk_usage(str(path))
    return used / (1024 ** 3)

def is_mounted(path: Path) -> bool:
    return path.exists() and path.is_dir()

def dir_size_gb(path: Path) -> float:
    """Calculate directory size in GB. Returns 0 if path doesn't exist."""
    if not path.exists():
        return 0.0
    total = 0
    try:
        for p in path.rglob("*"):
            if p.is_file():
                total += p.stat().st_size
    except (PermissionError, OSError):
        pass
    return total / (1024 ** 3)

def rmtree_safe(path: Path, description: str) -> float:
    """Remove directory contents safely, return GB freed."""
    if not path.exists():
        return 0.0
    before = get_free_gb(Path("/"))
    try:
        if path.is_dir():
            shutil.rmtree(str(path), ignore_errors=True)
            path.mkdir(parents=True, exist_ok=True)  # Recreate empty dir
        else:
            path.unlink(missing_ok=True)
    except Exception as e:
        log.error(f"  Failed to clean {description}: {e}")
        return 0.0
    after = get_free_gb(Path("/"))
    freed = after - before
    if freed > 0.001:
        log.info(f"  ✓ {description}: freed {freed:.2f} GB")
    return max(freed, 0.0)

def run_shell(cmd: str, description: str = "") -> bool:
    """Run a shell command, return True on success."""
    try:
        subprocess.run(cmd, shell=True, check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                       timeout=120)
        if description:
            log.info(f"  ✓ {description}")
        return True
    except Exception as e:
        if description:
            log.warning(f"  ⚠ {description} failed: {e}")
        return False

# ──────────────────────────────────────────────────────────────────────────────
# Core Operations
# ──────────────────────────────────────────────────────────────────────────────

def show_status():
    """Display comprehensive status of all storage zones."""
    log.info("━" * 60)
    log.info("💾 AILCC StorageMind — Storage Status Report")
    log.info(f"   Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log.info("━" * 60)

    # Internal SSD
    ssd_free = get_free_gb(VOLUMES["SSD"])
    ssd_total = get_total_gb(VOLUMES["SSD"])
    ssd_pct = ((ssd_total - ssd_free) / ssd_total * 100) if ssd_total else 0
    status = "🚨 CRITICAL" if ssd_free < SSD_CRITICAL_GB else \
             "⚠️  WARNING" if ssd_free < SSD_WARNING_GB else \
             "✅ HEALTHY"
    log.info(f"\n  📀 Internal SSD: {status}")
    log.info(f"     {ssd_free:.2f} GB free / {ssd_total:.1f} GB total ({ssd_pct:.1f}% used)")

    # Docker
    if DOCKER_RAW.exists():
        docker_gb = DOCKER_RAW.stat().st_size / (1024 ** 3)
        d_status = "🚨" if docker_gb > 40 else "⚠️" if docker_gb > 20 else "✅"
        log.info(f"     Docker.raw: {d_status} {docker_gb:.1f} GB")

    # External Drives
    for name, path in [("XDriveAlpha", VOLUMES["Alpha"]), ("XDriveBeta", VOLUMES["Beta"])]:
        if is_mounted(path):
            free = get_free_gb(path)
            total = get_total_gb(path)
            log.info(f"\n  💾 {name}: ✅ Mounted")
            log.info(f"     {free:.2f} GB free / {total:.1f} GB total")
        else:
            log.info(f"\n  💾 {name}: ❌ NOT MOUNTED")

    # Cloud Paths
    log.info(f"\n  ☁️  Cloud Sync Directories:")
    for name, path in CLOUD_PATHS.items():
        if path.exists():
            size = dir_size_gb(path) if path.exists() else 0
            log.info(f"     {name}: ✅ Active ({size:.2f} GB local)")
        else:
            log.info(f"     {name}: ⚪ Not detected")

    # PM2 Logs
    if PM2_LOG_DIR.exists():
        pm2_size = dir_size_gb(PM2_LOG_DIR)
        log.info(f"\n  📝 PM2 Logs: {pm2_size:.2f} GB ({len(list(PM2_LOG_DIR.glob('*')))} files)")

    log.info("\n" + "━" * 60)
    return ssd_free


def recover_ssd():
    """Emergency SSD recovery — clear caches, truncate logs, prune Docker."""
    log.info("🚨 EMERGENCY SSD RECOVERY INITIATED")
    log.info("━" * 60)

    total_freed = 0.0
    ssd_before = get_free_gb(Path("/"))
    log.info(f"   SSD free before: {ssd_before:.2f} GB")

    # Phase 1: Safe cache cleanup
    log.info("\n📂 Phase 1: Cache Cleanup")
    for path, desc, _ in CLEANUP_TARGETS:
        total_freed += rmtree_safe(path, desc)

    # Phase 2: Truncate PM2 logs (keep last 100 lines each)
    log.info("\n📝 Phase 2: PM2 Log Truncation")
    if PM2_LOG_DIR.exists():
        for logfile in PM2_LOG_DIR.glob("*.log"):
            try:
                size_mb = logfile.stat().st_size / (1024 * 1024)
                if size_mb > 1.0:  # Only truncate logs > 1MB
                    lines = logfile.read_text(errors='replace').splitlines()
                    keep = lines[-100:] if len(lines) > 100 else lines
                    logfile.write_text("\n".join(keep) + "\n")
                    log.info(f"  ✓ Truncated {logfile.name} ({size_mb:.1f} MB → kept last 100 lines)")
            except Exception as e:
                log.warning(f"  ⚠ Could not truncate {logfile.name}: {e}")

    # Phase 3: Clear AILCC internal logs
    log.info("\n📊 Phase 3: AILCC Log Cleanup")
    ailcc_logs = AILCC_ROOT / "logs"
    if ailcc_logs.exists():
        for logfile in ailcc_logs.glob("*.log"):
            try:
                age_days = (time.time() - logfile.stat().st_mtime) / 86400
                if age_days > 3:
                    freed = logfile.stat().st_size / (1024 ** 3)
                    logfile.unlink()
                    total_freed += freed
                    log.info(f"  ✓ Removed {logfile.name} ({age_days:.0f} days old)")
            except Exception:
                pass

    # Phase 4: Docker prune (if available)
    log.info("\n🐳 Phase 4: Docker Cleanup")
    if shutil.which("docker"):
        run_shell("docker system prune -af --volumes 2>/dev/null", "Docker system prune")
    else:
        log.info("  Docker not installed, skipping.")

    # Phase 5: Kill zombie processes
    log.info("\n🧟 Phase 5: Zombie Process Cleanup")
    run_shell("pkill -9 -f 'Google Chrome Helper' 2>/dev/null || true", "Chrome helpers")
    run_shell("pkill -9 -f puppeteer 2>/dev/null || true", "Puppeteer zombies")

    ssd_after = get_free_gb(Path("/"))
    actual_freed = ssd_after - ssd_before
    log.info("\n" + "━" * 60)
    log.info(f"✨ Recovery complete. SSD: {ssd_before:.2f} GB → {ssd_after:.2f} GB")
    log.info(f"   Net freed: {actual_freed:.2f} GB")
    log.info("━" * 60)
    return actual_freed


def optimize_all():
    """Full multi-tier optimization across all storage zones."""
    log.info("⚡ FULL STORAGE OPTIMIZATION")
    log.info("━" * 60)

    ssd_free = get_free_gb(Path("/"))

    # Step 1: If SSD is critical, run recovery first
    if ssd_free < SSD_WARNING_GB:
        log.info("SSD below warning threshold — running recovery first...")
        recover_ssd()
        ssd_free = get_free_gb(Path("/"))

    # Step 2: Evacuate large files to Alpha if SSD still tight
    if ssd_free < SSD_HEALTHY_GB and is_mounted(VOLUMES["Alpha"]):
        log.info("\n📦 Evacuating large files to XDriveAlpha...")
        evac_dest = VOLUMES["Alpha"] / "02_Cold_Storage" / f"Evacuation_{datetime.now():%Y%m%d}"
        for target in EVACUATION_TARGETS:
            if target.exists() and target.is_dir():
                size = dir_size_gb(target)
                if size > 0.1:  # Only bother if > 100MB
                    dest = evac_dest / target.name
                    dest.mkdir(parents=True, exist_ok=True)
                    try:
                        log.info(f"  Moving {target.name} ({size:.2f} GB) → Alpha...")
                        for item in target.iterdir():
                            shutil.move(str(item), str(dest / item.name))
                        log.info(f"  ✓ Moved {target.name}")
                    except Exception as e:
                        log.warning(f"  ⚠ Failed to move {target.name}: {e}")

    # Step 3: Rotate PM2 logs to Alpha
    if is_mounted(VOLUMES["Alpha"]) and PM2_LOG_DIR.exists():
        log.info("\n📝 Rotating PM2 logs to XDriveAlpha...")
        log_archive = VOLUMES["Alpha"] / "00_System_Logs" / f"pm2_{datetime.now():%Y%m%d}"
        log_archive.mkdir(parents=True, exist_ok=True)
        for logfile in PM2_LOG_DIR.glob("*.log"):
            size_mb = logfile.stat().st_size / (1024 * 1024)
            if size_mb > 5.0:
                try:
                    shutil.copy2(str(logfile), str(log_archive / logfile.name))
                    # Truncate original after backup
                    logfile.write_text("")
                    log.info(f"  ✓ Archived + truncated {logfile.name} ({size_mb:.1f} MB)")
                except Exception as e:
                    log.warning(f"  ⚠ {logfile.name}: {e}")

    # Step 4: Cloud mirror optimization
    log.info("\n☁️  Cloud Mirror Optimization...")
    for name, path in CLOUD_PATHS.items():
        if path.exists():
            local_size = dir_size_gb(path)
            if local_size > 5.0 and ssd_free < SSD_HEALTHY_GB:
                log.info(f"  {name}: {local_size:.2f} GB local — consider evicting via Finder")
                # Note: brtools evict requires specific file paths and admin rights
                # We log recommendations rather than force-evict
            else:
                log.info(f"  {name}: {local_size:.2f} GB local — OK")
        else:
            log.info(f"  {name}: Not active")

    ssd_final = get_free_gb(Path("/"))
    log.info("\n" + "━" * 60)
    log.info(f"⚡ Optimization complete. SSD free: {ssd_final:.2f} GB")
    log.info("━" * 60)


def migrate_academic_vault():
    """Migrate Academic Vault from SSD to XDriveBeta with rsync."""
    log.info("📚 ACADEMIC VAULT MIGRATION → XDriveBeta")
    log.info("━" * 60)

    if not ACADEMIC_SOURCE.exists():
        log.error(f"❌ Academic source not found: {ACADEMIC_SOURCE}")
        return False

    if not is_mounted(VOLUMES["Beta"]):
        log.error("❌ XDriveBeta is NOT mounted. Connect the drive and retry.")
        return False

    vault_size = dir_size_gb(ACADEMIC_SOURCE)
    beta_free = get_free_gb(VOLUMES["Beta"])
    log.info(f"  Source: {ACADEMIC_SOURCE} ({vault_size:.2f} GB)")
    log.info(f"  Destination: {ACADEMIC_DEST}")
    log.info(f"  XDriveBeta free: {beta_free:.2f} GB")

    if vault_size > beta_free:
        log.error("❌ Not enough space on XDriveBeta!")
        return False

    # Use rsync for reliable copy with progress
    log.info("  Starting rsync migration...")
    ACADEMIC_DEST.mkdir(parents=True, exist_ok=True)

    cmd = f'rsync -av --progress "{ACADEMIC_SOURCE}/" "{ACADEMIC_DEST}/"'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=3600)

    if result.returncode == 0:
        log.info("  ✓ rsync complete. Creating symlink on SSD...")
        # Create a symlink so existing paths still work
        backup = ACADEMIC_SOURCE.parent / "05_Academic_migrated_backup"
        ACADEMIC_SOURCE.rename(backup)
        ACADEMIC_SOURCE.symlink_to(ACADEMIC_DEST)
        log.info(f"  ✓ Symlink created: {ACADEMIC_SOURCE} → {ACADEMIC_DEST}")
        log.info(f"  ✓ Original preserved at: {backup}")
        log.info(f"  💡 After verifying, remove backup: rm -rf '{backup}'")
        return True
    else:
        log.error(f"  ❌ rsync failed: {result.stderr}")
        return False


def write_status_json():
    """Write machine-readable status for the Nexus Dashboard."""
    status = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "ssd": {
            "free_gb": round(get_free_gb(Path("/")), 2),
            "total_gb": round(get_total_gb(Path("/")), 1),
            "status": "critical" if get_free_gb(Path("/")) < SSD_CRITICAL_GB
                      else "warning" if get_free_gb(Path("/")) < SSD_WARNING_GB
                      else "healthy"
        },
        "drives": {},
        "cloud": {}
    }
    for name, path in VOLUMES.items():
        if name == "SSD":
            continue
        status["drives"][name] = {
            "mounted": is_mounted(path),
            "free_gb": round(get_free_gb(path), 2) if is_mounted(path) else None,
            "total_gb": round(get_total_gb(path), 1) if is_mounted(path) else None,
        }
    for name, path in CLOUD_PATHS.items():
        status["cloud"][name] = {
            "active": path.exists(),
            "local_size_gb": round(dir_size_gb(path), 2) if path.exists() else None,
        }

    state_file = STATE_DIR / "storagemind_status.json"
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps(status, indent=2))
    log.info(f"📊 Status written to {state_file}")
    return status


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main():
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    parser = argparse.ArgumentParser(
        description="StorageMind — Unified AILCC Storage Orchestrator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 StorageMind.py --status        # Show all drive status
  python3 StorageMind.py --recover       # Emergency SSD recovery
  python3 StorageMind.py --optimize      # Full multi-tier optimization
  python3 StorageMind.py --migrate       # Move Academic Vault to XDriveBeta
  python3 StorageMind.py --daemon 300    # Run as 5-minute daemon
        """
    )
    parser.add_argument("--status", action="store_true", help="Show storage status")
    parser.add_argument("--recover", action="store_true", help="Emergency SSD recovery")
    parser.add_argument("--optimize", action="store_true", help="Full optimization")
    parser.add_argument("--migrate", action="store_true", help="Migrate Academic Vault to XDriveBeta")
    parser.add_argument("--daemon", type=int, metavar="SECS", help="Daemon mode interval")

    args = parser.parse_args()

    if not any(vars(args).values()):
        parser.print_help()
        return

    if args.status:
        show_status()
        write_status_json()

    if args.recover:
        recover_ssd()
        write_status_json()

    if args.optimize:
        optimize_all()
        write_status_json()

    if args.migrate:
        migrate_academic_vault()
        write_status_json()

    if args.daemon:
        log.info(f"🔁 Daemon mode: checking every {args.daemon}s")
        while True:
            ssd_free = get_free_gb(Path("/"))
            if ssd_free < SSD_CRITICAL_GB:
                log.warning(f"🚨 SSD CRITICAL ({ssd_free:.2f} GB) — triggering auto-recovery")
                recover_ssd()
            elif ssd_free < SSD_WARNING_GB:
                log.warning(f"⚠️ SSD WARNING ({ssd_free:.2f} GB) — triggering optimization")
                optimize_all()
            else:
                log.info(f"✅ SSD healthy ({ssd_free:.2f} GB free)")
            write_status_json()
            time.sleep(args.daemon)


if __name__ == "__main__":
    main()
