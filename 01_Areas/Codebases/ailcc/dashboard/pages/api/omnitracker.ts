import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Cross-platform path resolution
const BASE_DIR = 'C:/Users/infin/AILCC_PRIME';
const VANGUARD_DIR = path.join(BASE_DIR, '03_Data_Stores/OneDrive_Nexus/01_Projects/Tax_Crisis_Defense_2026');
const TASK_MD = path.join(BASE_DIR, 'task.md');
const MANIFEST_MD = path.join(VANGUARD_DIR, 'WEEKLY_TRIAGE_MANIFEST_APRIL2026.md');
const CORRESPONDENCE_MD = path.join(VANGUARD_DIR, 'CORRESPONDENCE_DRAFTS_APRIL2026.md');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const tasks: any[] = [];

    // Helper to generate IDs
    const genId = (prefix: string) => `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`;

    // Helper to parse Markdown tasks
    const parseMarkdownTasks = (filePath: string, domain: string, defaultUrgency: string = 'ROUTINE') => {
        if (!fs.existsSync(filePath)) return;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach(line => {
            // Match "- [ ] Task Description" or "- [/] Task Description"
            const match = line.match(/^\s*-\s*\[([ x/])\]\s*(.*)/);
            // Also match "- **Immediate Action**: Task" pattern
            const actionMatch = line.match(/^\s*-\s*\*\*Immediate Action\*\*:\s*(.*)/);

            if (match) {
                const isCompleted = match[1] === 'x';
                const isInProgress = match[1] === '/';
                const title = match[2].trim();
                
                if (!isCompleted && title.length > 0) {
                    let urgency = defaultUrgency;
                    if (title.toLowerCase().includes('critical') || title.toLowerCase().includes('urgent')) urgency = 'CRITICAL';
                    else if (title.toLowerCase().includes('high')) urgency = 'HIGH';

                    tasks.push({
                        id: genId(domain.substring(0, 3).toUpperCase()),
                        title: title,
                        domain: domain,
                        urgency: urgency,
                        status: isInProgress ? 'ACTIVE' : 'PENDING',
                        requiredAgents: domain === 'VANGUARD' ? ['Antigravity', 'Grok'] : ['Valentine']
                    });
                }
            } else if (actionMatch) {
                const title = actionMatch[1].trim();
                tasks.push({
                    id: genId('ACTION'),
                    title: title,
                    domain: 'VANGUARD',
                    urgency: 'CRITICAL',
                    status: 'PENDING',
                    requiredAgents: ['Antigravity', 'Grok']
                });
            }
        });
    };

    // 1. Vanguard Tasks (From Weekly Manifest)
    try {
        parseMarkdownTasks(MANIFEST_MD, 'VANGUARD', 'HIGH');
    } catch (e) {
        console.error("Error parsing Vanguard Manifest", e);
    }

    // 2. Correspondence Actions (From Drafts)
    try {
        parseMarkdownTasks(CORRESPONDENCE_MD, 'VANGUARD', 'CRITICAL');
    } catch (e) {
        console.error("Error parsing Correspondence Drafts", e);
    }

    // 3. Sovereign Tasks (From Root task.md)
    try {
        parseMarkdownTasks(TASK_MD, 'SOVEREIGN', 'ROUTINE');
    } catch (e) {
        console.error("Error parsing root task.md", e);
    }

    // 3. Fallback to Hippocampus (if exists and hasn't been parsed yet)
    // Adding some legacy check but prioritized real project files
    const HIPPOCAMPUS_DIR = path.join(BASE_DIR, '01_Areas/Codebases/ailcc/hippocampus_storage');
    
    // Add Academic Progress if available
    try {
        const acadPath = path.join(HIPPOCAMPUS_DIR, 'scholar_reports/academic_progress.json');
        if (fs.existsSync(acadPath) && tasks.filter(t => t.domain === 'SCHOLAR').length === 0) {
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
    } catch (e) { /* ignore */ }

    // Sort logically by Urgency
    const urgencyMap: Record<string, number> = { 'CRITICAL': 100, 'HIGH': 50, 'ROUTINE': 10, 'LOW': 1 };
    tasks.sort((a, b) => (urgencyMap[b.urgency] || 0) - (urgencyMap[a.urgency] || 0));

    // Limit to top 15 most important tasks
    res.status(200).json(tasks.slice(0, 15));
}
