import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);
const CACHE_FILE = path.join(process.cwd(), '.system_updates.json');

async function checkBrew() {
    try {
        await execPromise('brew update');
        const { stdout } = await execPromise('brew outdated --json');
        return JSON.parse(stdout);
    } catch (e) {
        console.error('Brew update check failed', e);
        return { formulae: [], casks: [] };
    }
}

async function checkNPM() {
    try {
        const { stdout } = await execPromise('npm outdated -g --json');
        return JSON.parse(stdout || '{}');
    } catch (e) {
        // npm outdated returns exit code 1 if updates found
        if ((e as any).stdout) {
            try {
                return JSON.parse((e as any).stdout);
            } catch { return {}; }
        }
        return {};
    }
}

async function checkDocker() {
    try {
        const { stdout } = await execPromise('docker version --format "{{.Client.Version}}"');
        const currentVersion = stdout.trim();
        
        // We can't easily check for Docker Desktop updates via CLI without complex scraping,
        // so we'll report the current version. If brew manages it, checkBrew will catch the cask update.
        return { current: currentVersion };
    } catch (e) {
        return { current: 'Not running/Not found' };
    }
}

async function runMonitor() {
    console.log('[UpdateMonitor] Checking system updates...');
    
    const [brew, npm, docker] = await Promise.all([
        checkBrew(),
        checkNPM(),
        checkDocker()
    ]);

    const results = {
        timestamp: new Date().toISOString(),
        brew,
        npm,
        docker,
        summary: `Brew: ${brew.formulae?.length || 0} formulae, ${brew.casks?.length || 0} casks outdated. NPM: ${Object.keys(npm).length} global packages outdated.`
    };

    fs.writeFileSync(CACHE_FILE, JSON.stringify(results, null, 2));
    console.log('[UpdateMonitor] Results saved to', CACHE_FILE);
    console.log(results.summary);
}

runMonitor();
