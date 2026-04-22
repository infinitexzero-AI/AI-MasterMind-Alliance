import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';

const execPromise = promisify(exec);
let lastClipboard = '';

const ERROR_PATTERNS = [
    /Error:/i,
    /Exception/i,
    /Stack trace:/i,
    /at (.*):(\d+):(\d+)/, // Stack trace lines
    /failed/i,
    /rejected/i,
    /panic/i
];

async function checkClipboard() {
    try {
        const { stdout } = await execPromise('pbpaste');
        const current = stdout.trim();

        if (current !== lastClipboard && current.length > 5) {
            lastClipboard = current;

            const isError = ERROR_PATTERNS.some(pattern => pattern.test(current));

            if (isError) {
                console.log('[Clipboard] Error detected. Embedding into Vault...');

                await fetch('http://localhost:3000/api/intelligence/embed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `[CLIPBOARD ERROR CAPTURED]\n\n${current}`,
                        metadata: {
                            source: 'clipboard_watcher',
                            timestamp: new Date().toISOString(),
                            type: 'error_capture'
                        }
                    })
                });
            }
        }
    } catch (error) {
        console.error('[Clipboard Watcher Error]', error);
    }
}

console.log('Clipboard Watcher started. Monitoring for errors...');
setInterval(checkClipboard, 5000); // Check every 5 seconds
