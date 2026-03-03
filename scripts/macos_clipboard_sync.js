import { execSync } from 'child_process';
import http from 'http';

/**
 * macOS Clipboard Sync Daemon
 * Monitors the macOS clipboard and POSTs new content to the AILCC API.
 */

const API_URL = 'http://localhost:3000/api/clipboard/history';
const POLL_INTERVAL_MS = 2000;

let lastClipboardContent = '';

function getClipboardContent() {
    try {
        return execSync('pbpaste').toString().trim();
    } catch (error) {
        console.error('Error reading clipboard:', error);
        return '';
    }
}

async function syncToDashboard(content) {
    const data = JSON.stringify({
        content: content,
        source: 'macbook'
    });

    const url = new URL(API_URL);
    const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(responseBody));
                } else {
                    reject(new Error(`API responded with status ${res.statusCode}: ${responseBody}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

function poll() {
    const currentContent = getClipboardContent();

    if (currentContent && currentContent !== lastClipboardContent) {
        console.log(`[${new Date().toISOString()}] New clipboard content detected. Syncing...`);
        syncToDashboard(currentContent)
            .then(() => {
                console.log('✅ Successfully synced.');
                lastClipboardContent = currentContent;
            })
            .catch((error) => {
                console.error('❌ Sync failed:', error.message);
            });
    }

    setTimeout(poll, POLL_INTERVAL_MS);
}

console.log('============= MACOS CLIPBOARD SYNC DAEMON STARTED =============');
console.log(`Polling every ${POLL_INTERVAL_MS}ms...`);
poll();
