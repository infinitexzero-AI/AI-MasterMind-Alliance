import { exec } from 'child_process';
import { promisify } from 'util';

/**
 * AILCC Universal Clipboard Watcher (Hardware Continuity)
 * Polls the macOS clipboard. If an error stack trace or exception is copied,
 * it automatically dispatches a background task to the AILCC for analysis.
 * Works seamlessly with Universal Clipboard (copy on iPhone -> analyze on Mac).
 */

const execAsync = promisify(exec);
const POLL_INTERVAL_MS = 3000;

let lastClipboardHash = '';

// Simple hashing function to avoid re-triggering on the same string
const hashStr = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return h.toString();
};

const DISPATCH_API = 'http://localhost:3000/api/dispatch';

async function pollClipboard() {
    try {
        const { stdout } = await execAsync('pbpaste');
        const text = stdout.trim();

        if (!text || text.length < 10 || text.length > 5000) return; // Ignore empty or massively huge text

        const currentHash = hashStr(text);
        if (currentHash === lastClipboardHash) return; // Unchanged

        // Heuristics: Does this look like an error or stack trace we should auto-analyze?
        const isError = /Error:|Exception:|Traceback \(most recent call last\):|TypeError:|ReferenceError:/i.test(text);
        const isStackTrace = /\bat [A-Za-z0-9_.]+\s+\(/.test(text) || /\b(?:[\\/]?[\w.-]+)+:\d+:\d+\b/.test(text);

        if (isError || isStackTrace) {
            console.log(`[Clipboard Watcher] 🚨 Detected Exception/Trace on clipboard. Dispatching to AILCC...`);
            lastClipboardHash = currentHash; // Store hash immediately to prevent race conditions

            // Dispatch a low-priority research task to FORGE
            const payload = {
                description: `[AUTO-CAPTURED DIAGNOSTIC]\nI just copied this error to my clipboard. Please analyze the root cause and suggest a fix:\n\n${text}`,
                priority: 'low',
                handoffTo: 'code',
            };

            fetch(DISPATCH_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(res => res.json())
                .then(data => {
                    if (data.success) {
                        console.log(`[Clipboard Watcher] ✅ Auto-dispatched diagnostic task routing to ${data.role}`);
                        // Optional: Trigger a macOS notification or voice TTS here
                        execAsync(`say "Error captured. Alliance analyzing."`).catch(() => { });
                    }
                })
                .catch(err => console.error(`[Clipboard Watcher] Failed to dispatch API request:`, err.message));
        }

    } catch (err) {
        // Suppress benign pbpaste errors
    }
}

console.log(`[Clipboard Watcher] 📱 Hardware Continuity Link established. Listening for errors on Universal Clipboard...`);
setInterval(pollClipboard, POLL_INTERVAL_MS);
