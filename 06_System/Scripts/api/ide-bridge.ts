import express, { Request, Response } from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';

/**
 * AILCC Agent-Native IDE Bridge
 * Provides a localized HTTP/WebSocket bridge for the Alliance Swarm to query the user's active context.
 */

const execAsync = promisify(exec);
const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

// In-memory buffer of the latest IDE context (pushed by a VSCode extension or polled via clipboard)
const latestIdeContext = {
    activeFile: '',
    cursorLine: 0,
    selectedText: '',
    timestamp: Date.now()
};

// 1. REST Endpoint for the Dashboard (dispatch.ts) to pull active context
app.get('/api/ide/context', async (req: Request, res: Response) => {
    try {
        // Fallback: If no extension is feeding us, try to read the clipboard for code heuristics
        // macOS specific clipboard read
        const { stdout } = await execAsync('pbpaste');
        const clipboardText = stdout.trim();

        // If clipboard looks like code and is recently updated, inject it as context
        if (clipboardText.length > 10 && clipboardText.length < 5000 && !latestIdeContext.selectedText) {
            latestIdeContext.selectedText = clipboardText;
            latestIdeContext.activeFile = 'clipboard_buffer.txt';
        }

        res.json({
            success: true,
            context: latestIdeContext
        });
    } catch (err) {
        console.error('[IDE Bridge] Error reading context:', err);
        res.status(500).json({ success: false, error: 'Failed to read IDE context.' });
    }
});

// 2. Webhook for a potential future VS Code Extension to push live updates
app.post('/api/ide/sync', (req: Request, res: Response) => {
    const { activeFile, cursorLine, selectedText } = req.body;

    if (activeFile !== undefined) latestIdeContext.activeFile = activeFile;
    if (cursorLine !== undefined) latestIdeContext.cursorLine = cursorLine;
    if (selectedText !== undefined) latestIdeContext.selectedText = selectedText;
    latestIdeContext.timestamp = Date.now();

    console.log(`[IDE Bridge] Synced context from ${activeFile || 'unknown'}`);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`[IDE Bridge] 🛡️ Agent-Native Bridge established on port ${PORT}`);
    console.log(`[IDE Bridge] Listening for IDE context Syncs and Clipboard heuristics.`);
});
