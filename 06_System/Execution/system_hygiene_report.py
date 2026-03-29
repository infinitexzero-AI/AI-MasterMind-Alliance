# AILCC SYSTEM HYGIENE REPORT — Observable Infrastructure Health
# Phase 16 / Revision 100 | infinitexzero-AI/ailcc-framework
#
# Generates a comprehensive JSON health report for:
# - Boot disk usage
# - External drive status
# - iCloud sync health
# - PM2 log bloat
# - Antigravity brain size
# - Git repo size
# - PARA coherence score

import os
import sys
import json
import shutil
import logging
import subprocess
from datetime import datetime
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from unified_event_bus import UnifiedEventBus

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

# ─── Configuration ────────────────────────────────────────────────────────────

BASE_PATH = "/Users/infinite27/AILCC_PRIME"
HOME = os.path.expanduser("~")
LOG_PATH = os.path.join(BASE_PATH, "06_System/Logs/hygiene.log")
REPORT_PATH = os.path.join(BASE_PATH, "06_System/State/hygiene_report.json")

EXTERNAL_DRIVES = {
    "XDriveAlpha": "/Volumes/XDriveAlpha",
    "XDriveBeta": "/Volumes/XDriveBeta",
}

# What PARA dirs should exist
PARA_EXPECTED = [
    "00_Projects", "01_Areas", "02_Resources", "03_Archives",
    "06_System", "07_Comet_Sync", "08_Mobile_Edge"
]

# ─── Logger ───────────────────────────────────────────────────────────────────

os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [HYGIENE] - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_PATH),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("HygieneReport")


class SystemHygieneReport:
    """
    Generates observable health metrics for the entire AILCC infrastructure.
    Results stored in Redis and on disk for dashboard consumption.
    """

    def __init__(self):
        self.bus = UnifiedEventBus()
        self.redis_client = None
        if REDIS_AVAILABLE:
            try:
                self.redis_client = redis.Redis(host='127.0.0.1', port=6379, db=0, decode_responses=True)
                self.redis_client.ping()
            except redis.ConnectionError:
                self.redis_client = None

    def _run(self, cmd):
        """Run a shell command and return output."""
        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
            return result.stdout.strip()
        except Exception:
            return ""

    def _dir_size_mb(self, path):
        """Get directory size in MB."""
        try:
            result = subprocess.run(
                ["du", "-sm", path], capture_output=True, text=True, timeout=30
            )
            return int(result.stdout.split()[0]) if result.stdout else 0
        except Exception:
            return 0

    def check_boot_disk(self):
        """Boot disk usage."""
        total, used, free = shutil.disk_usage("/")
        return {
            "total_gb": round(total / (1024**3), 1),
            "used_gb": round(used / (1024**3), 1),
            "free_gb": round(free / (1024**3), 1),
            "used_pct": round((used / total) * 100, 1),
            "status": "CRITICAL" if free < 5 * (1024**3) else "WARNING" if free < 10 * (1024**3) else "OK"
        }

    def check_external_drives(self):
        """External drive availability and usage."""
        drives = {}
        for name, path in EXTERNAL_DRIVES.items():
            if os.path.exists(path):
                try:
                    total, used, free = shutil.disk_usage(path)
                    drives[name] = {
                        "mounted": True,
                        "total_gb": round(total / (1024**3), 1),
                        "used_gb": round(used / (1024**3), 1),
                        "free_gb": round(free / (1024**3), 1),
                        "used_pct": round((used / total) * 100, 1),
                    }
                except Exception:
                    drives[name] = {"mounted": True, "error": "Cannot read disk info"}
            else:
                drives[name] = {"mounted": False}
        return drives

    def check_icloud(self):
        """iCloud sync status."""
        mobile_docs = os.path.join(HOME, "Library/Mobile Documents")
        size_mb = self._dir_size_mb(mobile_docs) if os.path.exists(mobile_docs) else 0
        
        # Check for stuck uploads via brctl
        brctl_out = self._run("brctl status 2>/dev/null | grep -c 'needs-upload'")
        stuck_uploads = int(brctl_out) if brctl_out.isdigit() else 0

        # Check if Desktop & Docs sync is enabled
        desktop_sync = self._run("defaults read MobileMeAccounts 2>/dev/null | grep -c CLOUDDESKTOP")
        desktop_sync_active = int(desktop_sync) > 0 if desktop_sync.isdigit() else False

        return {
            "local_cache_mb": size_mb,
            "stuck_uploads": stuck_uploads,
            "desktop_docs_sync": desktop_sync_active,
            "status": "WARNING" if stuck_uploads > 0 or desktop_sync_active else "OK"
        }

    def check_pm2_logs(self):
        """PM2 log sizes."""
        log_dir = os.path.join(HOME, ".pm2/logs")
        if not os.path.exists(log_dir):
            return {"total_mb": 0, "status": "OK"}
        
        size_mb = self._dir_size_mb(log_dir)
        return {
            "total_mb": size_mb,
            "status": "WARNING" if size_mb > 100 else "OK"
        }

    def check_antigravity(self):
        """Antigravity brain and recordings size."""
        brain_mb = self._dir_size_mb(os.path.join(HOME, ".gemini/antigravity/brain"))
        recordings_mb = self._dir_size_mb(os.path.join(HOME, ".gemini/antigravity/browser_recordings"))
        total_mb = self._dir_size_mb(os.path.join(HOME, ".gemini"))
        
        return {
            "brain_mb": brain_mb,
            "recordings_mb": recordings_mb,
            "total_mb": total_mb,
            "status": "WARNING" if total_mb > 2000 else "OK"
        }

    def check_git(self):
        """Git repo size."""
        git_mb = self._dir_size_mb(os.path.join(BASE_PATH, ".git"))
        return {
            "git_mb": git_mb,
            "status": "WARNING" if git_mb > 500 else "OK"
        }

    def check_para_coherence(self):
        """Count orphan files/dirs at root that don't match PARA structure."""
        root_items = os.listdir(BASE_PATH)
        orphans = []
        for item in root_items:
            if item.startswith('.'):
                continue
            full = os.path.join(BASE_PATH, item)
            if os.path.islink(full):
                continue  # Symlinks are fine
            if item not in PARA_EXPECTED and not item.endswith('.bak'):
                orphans.append(item)
        
        # Check for broken symlinks
        broken = []
        for item in root_items:
            full = os.path.join(BASE_PATH, item)
            if os.path.islink(full) and not os.path.exists(full):
                broken.append(item)

        score = max(0, 100 - (len(orphans) * 10) - (len(broken) * 20))
        return {
            "score": score,
            "orphans": orphans,
            "broken_symlinks": broken,
            "status": "OK" if score >= 80 else "WARNING" if score >= 50 else "CRITICAL"
        }

    def generate(self):
        """Generate the full hygiene report."""
        logger.info("🔍 Generating system hygiene report...")

        report = {
            "timestamp": datetime.now().isoformat(),
            "boot_disk": self.check_boot_disk(),
            "external_drives": self.check_external_drives(),
            "icloud": self.check_icloud(),
            "pm2_logs": self.check_pm2_logs(),
            "antigravity": self.check_antigravity(),
            "git": self.check_git(),
            "para_coherence": self.check_para_coherence(),
        }

        # Calculate overall health
        statuses = [
            report["boot_disk"]["status"],
            report["icloud"]["status"],
            report["pm2_logs"]["status"],
            report["antigravity"]["status"],
            report["para_coherence"]["status"],
        ]
        if "CRITICAL" in statuses:
            report["overall"] = "CRITICAL"
        elif "WARNING" in statuses:
            report["overall"] = "WARNING"
        else:
            report["overall"] = "HEALTHY"

        # Save to disk
        with open(REPORT_PATH, "w") as f:
            json.dump(report, f, indent=2)

        # Save to Redis
        if self.redis_client:
            self.redis_client.setex(
                "ailcc:hygiene:report",
                3600,
                json.dumps(report)
            )

        # Emit event
        self.bus.emit(
            event_type="HYGIENE_REPORT",
            source="SystemHygieneReport",
            message=f"System health: {report['overall']} | Disk: {report['boot_disk']['free_gb']}GB free",
            payload={
                "overall": report["overall"],
                "disk_free_gb": report["boot_disk"]["free_gb"],
                "para_score": report["para_coherence"]["score"]
            },
            priority=2 if report["overall"] == "CRITICAL" else 3
        )

        logger.info("✅ Hygiene report generated: %s", report["overall"])
        return report

    def print_report(self, report):
        """Pretty-print the report to console."""
        status_emoji = {"OK": "🟢", "WARNING": "🟡", "CRITICAL": "🔴", "HEALTHY": "🟢"}
        
        print(f"\n{'='*60}")
        print(f"  AILCC System Hygiene Report")
        print(f"  {report['timestamp']}")
        print(f"{'='*60}")
        
        bd = report["boot_disk"]
        print(f"\n  {status_emoji.get(bd['status'], '⚪')} Boot Disk: {bd['free_gb']}GB free / {bd['total_gb']}GB ({bd['used_pct']}% used)")
        
        for name, drv in report["external_drives"].items():
            if drv["mounted"]:
                print(f"  🟢 {name}: {drv.get('free_gb', '?')}GB free / {drv.get('total_gb', '?')}GB")
            else:
                print(f"  ⚫ {name}: Not mounted")
        
        ic = report["icloud"]
        print(f"\n  {status_emoji.get(ic['status'], '⚪')} iCloud: {ic['local_cache_mb']}MB local | Stuck: {ic['stuck_uploads']} | Desktop Sync: {'ON ⚠️' if ic['desktop_docs_sync'] else 'OFF ✅'}")
        
        pm = report["pm2_logs"]
        print(f"  {status_emoji.get(pm['status'], '⚪')} PM2 Logs: {pm['total_mb']}MB")
        
        ag = report["antigravity"]
        print(f"  {status_emoji.get(ag['status'], '⚪')} Antigravity: Brain {ag['brain_mb']}MB | Recordings {ag['recordings_mb']}MB | Total {ag['total_mb']}MB")
        
        gt = report["git"]
        print(f"  {status_emoji.get(gt['status'], '⚪')} Git: {gt['git_mb']}MB")
        
        pc = report["para_coherence"]
        print(f"  {status_emoji.get(pc['status'], '⚪')} PARA Coherence: {pc['score']}/100")
        if pc["orphans"]:
            print(f"      Orphans: {', '.join(pc['orphans'][:5])}")
        if pc["broken_symlinks"]:
            print(f"      Broken Symlinks: {', '.join(pc['broken_symlinks'])}")
        
        print(f"\n  Overall: {status_emoji.get(report['overall'], '⚪')} {report['overall']}")
        print(f"{'='*60}\n")


if __name__ == "__main__":
    reporter = SystemHygieneReport()
    report = reporter.generate()
    reporter.print_report(report)
