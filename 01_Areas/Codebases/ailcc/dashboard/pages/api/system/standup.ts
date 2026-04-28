import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Robust path resolution for Windows/Vanguard environment
const BASE_DIR = 'C:/Users/infin/AILCC_PRIME';
const OMNI_QUEUE = path.join(BASE_DIR, '01_Areas/Codebases/ailcc/hippocampus_storage/nexus_state/active_tasks.json');
const MANIFEST_PATH = path.join(BASE_DIR, '03_Data_Stores/OneDrive_Nexus/01_Projects/Tax_Crisis_Defense_2026/WEEKLY_TRIAGE_MANIFEST_APRIL2026.md');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Primary source: Check for recent Standup in the manifest
        if (fs.existsSync(MANIFEST_PATH)) {
            const manifest = fs.readFileSync(MANIFEST_PATH, 'utf-8');
            if (manifest.includes('CRA Federal Shield')) {
                return res.status(200).json({
                    title: "Vanguard Crisis Standup",
                    directive: "Secure Academic Grant & Rebut Payroll Claims",
                    why: "Critical path for Summer 2026 funding and asset protection.",
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Secondary source: JSON queue
        if (fs.existsSync(OMNI_QUEUE)) {
            const data = fs.readFileSync(OMNI_QUEUE, 'utf-8');
            const tasks = JSON.parse(data);
            const standupTask = tasks.find((t: any) => t.source === 'STANDUP_DAEMON' && t.priority === 'ALPHA');

            if (standupTask) {
                return res.status(200).json({
                    title: standupTask.title,
                    directive: standupTask.directive,
                    why: standupTask.why,
                    timestamp: standupTask.id.replace('STANDUP-', '')
                });
            }
        }

        return res.status(200).json({
            title: "Autonomous Vanguard Node",
            directive: "Monitoring OneDrive Nexus for tactical updates.",
            why: "Awaiting new mission parameters from the Intelligence Vault.",
            timestamp: new Date().toISOString()
        });
        
    } catch (error: any) {
        console.error('[Standup API] Error:', error);
        return res.status(200).json({ 
            title: "System Standby", 
            directive: "Extraction fault. Re-initializing tactile stream.",
            why: "Manual override required or filesystem latency detected.",
            timestamp: new Date().toISOString()
        });
    }
}
