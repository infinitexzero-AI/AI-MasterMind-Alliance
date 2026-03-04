import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🛡️ AILCC Type-Safety Enforcement Daemon (Phase 22)
 *
 * Watches the filesystem for changes to .ts/.tsx files. On every save,
 * runs a targeted `tsc --noEmit` pass over the changed file's dependency tree.
 * If strict type errors are detected, fires an [INTEGRITY_VIOLATION] event
 * to the system event bus and observability dashboard.
 */

const execAsync = promisify(exec);
const WORKSPACE_DIR = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard';

async function emitEvent(type: string, message: string, severity: 'info' | 'warning' | 'error' | 'success' = 'info') {
    try {
        await fetch('http://localhost:3000/api/system/relay-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'TypeGuardian',
                message: `[${type}] ${message}`,
                severity,
                timestamp: new Date().toISOString()
            })
        });
    } catch (e) {
        console.error('[TypeGuardian] Failed to relay event:', message);
    }
}

async function runTypeCheck(filePath: string) {
    console.log(`[TypeGuardian] 🛡️ Running type-check on ${path.basename(filePath)}...`);
    try {
        await execAsync('npx tsc --noEmit', { cwd: WORKSPACE_DIR, timeout: 30000 });
        console.log(`[TypeGuardian] ✅ ${path.basename(filePath)} — type-safe.`);
        await emitEvent('TYPE_OK', `${path.basename(filePath)} passes strict type-checking.`, 'info');
    } catch (e: unknown) {
        const err = e as { stdout?: string; stderr?: string };
        const output = err.stdout || err.stderr || 'Unknown type error';
        // Extract first 3 errors to keep payload concise
        const lines = output.split('\n').filter(l => l.includes('error TS')).slice(0, 3);
        const summary = lines.join(' | ') || output.slice(0, 200);
        console.warn(`[TypeGuardian] ⚠️ Type violation in ${path.basename(filePath)}: ${summary}`);
        await emitEvent(
            'INTEGRITY_VIOLATION',
            `Type error detected after editing ${path.basename(filePath)}: ${summary}`,
            'error'
        );
    }
}

function watchWorkspace() {
    const watchDirs = ['pages', 'components', 'lib', 'hooks'];
    const debounceMap = new Map<string, ReturnType<typeof setTimeout>>();

    console.log('[TypeGuardian] 🛡️ Daemon Online. Watching for TS/TSX mutations...');

    for (const dir of watchDirs) {
        const targetDir = path.join(WORKSPACE_DIR, dir);
        if (!fs.existsSync(targetDir)) continue;

        fs.watch(targetDir, { recursive: true }, (event, filename) => {
            if (!filename) return;
            if (!filename.endsWith('.ts') && !filename.endsWith('.tsx')) return;
            if (filename.includes('node_modules') || filename.includes('.next') || filename.includes('.next/')) return;
            // Skip auto-generated files
            if (filename.includes('__generated__') || filename.includes('.d.ts')) return;

            const fullPath = path.join(targetDir, filename);

            // Debounce rapid saves (e.g. auto-save flood)
            if (debounceMap.has(fullPath)) clearTimeout(debounceMap.get(fullPath)!);
            debounceMap.set(fullPath, setTimeout(() => {
                debounceMap.delete(fullPath);
                runTypeCheck(fullPath);
            }, 1500));
        });
    }
}

watchWorkspace();
