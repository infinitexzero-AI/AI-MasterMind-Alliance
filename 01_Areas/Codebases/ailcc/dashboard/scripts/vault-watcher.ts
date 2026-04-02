import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';

// Define directories relative to the dashboard root (or absolute)
// For safety, assuming the script runs from the dashboard root:
const VAULT_DIR = '/Users/infinite27/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT';
const INBOX_DIR = path.join(VAULT_DIR, 'Inbox');
const ARCHIVED_DIR = path.join(VAULT_DIR, 'Archived');

// Ensure directories exist
[INBOX_DIR, ARCHIVED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

console.log(`[Vault Watcher] Starting... Watching: ${INBOX_DIR}`);

const watcher = chokidar.watch(INBOX_DIR, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
    }
});

const embedFile = async (filePath: string) => {
    try {
        const ext = path.extname(filePath).toLowerCase();
        if (ext !== '.md' && ext !== '.txt') return;

        console.log(`[Vault Watcher] Detected new file: ${path.basename(filePath)}`);
        const content = fs.readFileSync(filePath, 'utf8');

        // Call the local embed API
        const response = await fetch('http://localhost:3000/api/intelligence/embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: content,
                metadata: {
                    source: 'vault-watcher',
                    filename: path.basename(filePath),
                    timestamp: new Date().toISOString()
                }
            })
        });

        if (response.ok) {
            console.log(`[Vault Watcher] Successfully embedded ${path.basename(filePath)}`);
            // Move to archive
            const destPath = path.join(ARCHIVED_DIR, path.basename(filePath));
            fs.renameSync(filePath, destPath);
            console.log(`[Vault Watcher] Moved ${path.basename(filePath)} to Archived/`);
        } else {
            console.error(`[Vault Watcher] Failed to embed ${path.basename(filePath)}: HTTP ${response.status}`);
            const errorText = await response.text();
            console.error(errorText);
        }
    } catch (error) {
        console.error(`[Vault Watcher] Error processing ${filePath}:`, error);
    }
};

watcher
    .on('add', filePath => embedFile(filePath))
    .on('error', error => console.error(`[Vault Watcher] Watcher error: ${error}`));

// Keep the process running
process.on('SIGINT', () => {
    watcher.close();
    console.log('[Vault Watcher] Shutting down');
    process.exit(0);
});
