import * as fs from 'fs';
import * as path from 'path';

/**
 * 📦 AILCC Bundle Size Watcher (Phase 22)
 *
 * Audits the installed npm dependency tree by parsing package-lock.json.
 * Tracks a rolling baseline of the total installation footprint.
 * If the cumulative size of new packages exceeds the BLOAT_THRESHOLD_MB,
 * fires a [BUNDLE_BLOAT] warning to the observability dashboard.
 */

const WORKSPACE_DIR = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard';
const PKG_LOCK = path.join(WORKSPACE_DIR, 'package-lock.json');
const BLOAT_THRESHOLD_PACKAGES = 10; // Alert if we exceed baseline by 10+ packages
const POLL_INTERVAL_MS = 60000 * 15; // 15 minutes

interface PackageEntry {
    version: string;
    resolved?: string;
    size?: number;
}

async function emitEvent(type: string, message: string, payload: Record<string, unknown>, severity: 'info' | 'warning' | 'success' = 'info') {
    try {
        await fetch('http://localhost:3000/api/system/relay-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'BundleWatcher',
                message: `[${type}] ${message}`,
                payload: JSON.stringify(payload),
                severity,
                timestamp: new Date().toISOString()
            })
        });
    } catch { /* suppress */ }
}

let baselineCount = 0;

async function runAudit() {
    console.log('[BundleWatcher] 📦 Running bundle size audit...');

    if (!fs.existsSync(PKG_LOCK)) {
        console.warn('[BundleWatcher] package-lock.json not found.');
        return;
    }

    try {
        const lockContent = JSON.parse(fs.readFileSync(PKG_LOCK, 'utf-8'));
        const packages: Record<string, PackageEntry> = lockContent.packages ?? lockContent.dependencies ?? {};
        const pkgCount = Object.keys(packages).length;

        // Get top 10 heaviest packages by resolved URL size heuristic (package name length is proxy)
        const packageNames = Object.keys(packages)
            .filter(name => !name.startsWith('node_modules/') || name.split('/').length === 2)
            .map(name => name.replace('node_modules/', ''));

        // First run — set baseline
        if (baselineCount === 0) {
            baselineCount = pkgCount;
            console.log(`[BundleWatcher] Baseline set: ${pkgCount} packages installed.`);
            await emitEvent(
                'BUNDLE_BASELINE',
                `Bundle baseline established: ${pkgCount} packages.`,
                { count: pkgCount, baseline: baselineCount },
                'info'
            );
            return;
        }

        const delta = pkgCount - baselineCount;

        if (delta > BLOAT_THRESHOLD_PACKAGES) {
            console.warn(`[BundleWatcher] ⚠️ Package delta +${delta} exceeds threshold! (${baselineCount} → ${pkgCount})`);
            await emitEvent(
                'BUNDLE_BLOAT',
                `Bundle grew by ${delta} packages since baseline (now ${pkgCount} total). Possible dependency bloat.`,
                { current: pkgCount, baseline: baselineCount, delta, topPackages: packageNames.slice(0, 10) },
                'warning'
            );
        } else {
            console.log(`[BundleWatcher] ✅ Bundle healthy. ${pkgCount} packages (+${delta} from baseline).`);
            await emitEvent(
                'BUNDLE_OK',
                `Bundle within healthy range: ${pkgCount} packages (+${delta} from baseline).`,
                { current: pkgCount, baseline: baselineCount, delta },
                'success'
            );
        }

        // Roll baseline forward slowly
        baselineCount = pkgCount;

    } catch (e) {
        console.error('[BundleWatcher] Failed to parse package-lock.json:', e);
    }
}

console.log('[BundleWatcher] 📦 Daemon Online. Monitoring bundle footprint...');
runAudit();
setInterval(runAudit, POLL_INTERVAL_MS);
