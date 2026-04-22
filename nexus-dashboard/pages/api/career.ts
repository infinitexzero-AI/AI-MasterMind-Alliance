import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import path from 'path';

// Resolve boundary into the Python core
const DB_PATH = path.join(process.cwd(), '..', 'core', 'memory', 'vault_vector_store.db');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const db = new sqlite3.Database(DB_PATH);
        db.all('SELECT id, title, company, description, status, cover_letter, timestamp FROM career_postings ORDER BY timestamp DESC', (err, rows) => {
            if (err) {
                // Table doesn't exist or is locked
                res.status(200).json([]);
                db.close();
                return;
            }
            res.status(200).json(rows);
            db.close();
        });
    } else if (req.method === 'POST') {
        const { id, action } = req.body;
        // Action = APPLIED, REJECTED, INTERVIEW
        const db = new sqlite3.Database(DB_PATH);
        db.run('UPDATE career_postings SET status = ? WHERE id = ?', [action, id], function(err) {
            if (err) {
                res.status(500).json({ error: "Failed to update career status." });
            } else {
                res.status(200).json({ success: true, changes: this.changes });
            }
            db.close();
        });
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
