import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import path from 'path';

// Resolve boundary into the Python core
const DB_PATH = path.join(process.cwd(), '..', 'core', 'memory', 'vault_vector_store.db');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const db = new sqlite3.Database(DB_PATH);
        db.all("SELECT id, transcript, status, intent, timestamp FROM voice_telemetry ORDER BY timestamp DESC LIMIT 5", (err, rows) => {
            if (err) return res.status(200).json([]);
            res.status(200).json(rows);
            db.close();
        });
    } else if (req.method === 'POST') {
        const { transcript } = req.body;
        
        if (!transcript) {
            return res.status(400).json({ error: "Missing transcript payload" });
        }

        const commandId = `VOICE_${Date.now()}`;
        const db = new sqlite3.Database(DB_PATH);
        
        db.serialize(() => {
            // Guarantee structure existence before executing
            db.run(`CREATE TABLE IF NOT EXISTS voice_telemetry (
                id TEXT PRIMARY KEY,
                transcript TEXT,
                status TEXT DEFAULT 'PENDING',
                intent TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run('INSERT INTO voice_telemetry (id, transcript) VALUES (?, ?)', [commandId, transcript], function(err) {
                if (err) {
                    console.error("[Cortex Next.js] SQLite Write Failure:", err);
                    res.status(500).json({ error: "Failed to securely store audio telemetry" });
                } else {
                    console.log(`[Cortex Next.js] Successfully staged new iOS audio command: ${commandId}`);
                    res.status(200).json({ success: true, commandId, message: "AILCC Command Staged" });
                }
                db.close();
            });
        });
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
