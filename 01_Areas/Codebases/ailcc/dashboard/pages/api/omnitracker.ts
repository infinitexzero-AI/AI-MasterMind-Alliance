import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const HIPPOCAMPUS_DIR = path.resolve(process.env.HIPPOCAMPUS_DIR || '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage');
    const tasks: any[] = [];

    // Helper to generate IDs
    const genId = (prefix: string) => `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`;

    // 1. Tycoon: NSLSC Status
    try {
        const nslscPath = path.join(HIPPOCAMPUS_DIR, 'tycoon_reports', 'nslsc_status.json');
        if (fs.existsSync(nslscPath)) {
            const data = JSON.parse(fs.readFileSync(nslscPath, 'utf-8'));
            if (!data.error) {
                tasks.push({
                    id: genId('NSLSC'),
                    title: `NSLSC Payment: ${data.next_payment}`,
                    domain: 'TYCOON',
                    urgency: 'HIGH', // Flagging as HIGH to force biometric review
                    status: 'PENDING',
                    requiredAgents: ['Grok', 'Valentine'],
                    deadline: data.payment_date || null
                });
            }
        }
    } catch (e) {
        console.error("Error reading NSLSC", e);
    }

    // 2. Scholar: Academic Progress (Knowledge Gaps)
    try {
        const acadPath = path.join(HIPPOCAMPUS_DIR, 'scholar_reports', 'academic_progress.json');
        if (fs.existsSync(acadPath)) {
            const data = JSON.parse(fs.readFileSync(acadPath, 'utf-8'));
            const gaps = data.core_courses?.missing_gaps || [];
            if (gaps.length > 0) {
                tasks.push({
                    id: genId('ACAD'),
                    title: `Clear Core Knowledge Gaps (${gaps.length} remaining)`,
                    domain: 'SCHOLAR',
                    urgency: 'CRITICAL',
                    status: 'PENDING',
                    requiredAgents: ['Comet', 'Grok']
                });
            }
        }
    } catch (e) {
        console.error("Error reading Academic Progress", e);
    }

    // 3. Scholar: Institutional Deadlines
    try {
        const instPath = path.join(HIPPOCAMPUS_DIR, 'calendar_matrix', 'institutional_deadlines.json');
        if (fs.existsSync(instPath)) {
            const data = JSON.parse(fs.readFileSync(instPath, 'utf-8'));
            const deadlines = data.deadlines || [];
            deadlines.forEach((d: any) => {
                tasks.push({
                    id: d.id || genId('INST'),
                    title: d.title,
                    domain: 'SCHOLAR',
                    urgency: d.urgency || 'ROUTINE',
                    status: 'PENDING',
                    requiredAgents: ['Grok', 'Gemini'],
                    deadline: d.dueDate || null
                });
            });
        }
    } catch (e) {
        console.error("Error reading Institutional Deadlines", e);
    }

    // 4. Sovereign: The Conductor Routine
    try {
        const routinePath = path.join(HIPPOCAMPUS_DIR, 'calendar_matrix', 'daily_routine.json');
        if (fs.existsSync(routinePath)) {
            const data = JSON.parse(fs.readFileSync(routinePath, 'utf-8'));
            const schedule = data.schedule || [];
            if (schedule.length > 0) {
                tasks.push({
                    id: genId('EXT'),
                    title: `Execute Conductor Daily Timeline (${schedule.length} events)`,
                    domain: 'SOVEREIGN',
                    urgency: 'ROUTINE',
                    status: 'PENDING',
                    requiredAgents: ['Valentine']
                });
            }
        }
    } catch (e) {
        console.error("Error reading Conductor Routine", e);
    }

    // 5. Tycoon: East Coast Fresh Coats (Painting Tycoon)
    try {
        const pBizPath = path.join(HIPPOCAMPUS_DIR, 'tycoon_reports', 'painting_biz_status.json');
        if (fs.existsSync(pBizPath)) {
            const data = JSON.parse(fs.readFileSync(pBizPath, 'utf-8'));
            const urgency = data.urgency || 'ROUTINE';

            // If we have low inventory or pending quotes, bubble it up as a single actionable tracking card
            if (urgency === 'CRITICAL' || urgency === 'HIGH') {
                const invCount = data.low_inventory?.length || 0;
                const quoteCount = data.quotes?.pending?.length || 0;

                let title = `Review Fresh Coats Status`;
                if (invCount > 0) title = `Order Low Inventory (${invCount} items!)`;
                else if (quoteCount > 0) title = `Finalize Pending Quotes (${quoteCount})`;

                tasks.push({
                    id: genId('BIZ'),
                    title: title,
                    domain: 'TYCOON',
                    urgency: urgency,
                    status: 'PENDING',
                    requiredAgents: ['Grok', 'Gemini']
                });
            }
        }
    } catch (e) {
        console.error("Error reading Painting Biz Status", e);
    }

    // Sort logically by Urgency
    const urgencyMap: Record<string, number> = { 'CRITICAL': 100, 'HIGH': 50, 'ROUTINE': 10, 'LOW': 1 };
    tasks.sort((a, b) => (urgencyMap[b.urgency] || 0) - (urgencyMap[a.urgency] || 0));

    res.status(200).json(tasks);
}
