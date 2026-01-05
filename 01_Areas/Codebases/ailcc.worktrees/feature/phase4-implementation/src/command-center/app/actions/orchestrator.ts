'use server';

import fs from 'fs';
import path from 'path';

// Mock delegation logic for now, eventually this will use LLM or deeper analysis
const AGENT_SKILLS: Record<string, string[]> = {
    'Valentine [Core]': ['frontend', 'ui', 'ux', 'dashboard', 'react', 'css', 'design', 'visual'],
    'Claude [Architect]': ['backend', 'api', 'database', 'architecture', 'system', 'infrastructure', 'cloud'],
    'SuperGrok [Orchestrator]': ['orchestrate', 'plan', 'strategy', 'review', 'research', 'analysis', 'testing', 'qa'],
    'Comet [Browser]': ['research', 'search', 'browser', 'scrape', 'look up', 'find']
};

interface Task {
    title: string;
    description?: string;
    url?: string;
    state?: { name: string };
    html_url?: string;
}

interface LiveStatus {
    timestamp: string;
    linear?: { issues: Task[] };
    github?: { prs: Task[] };
}

export async function launchTeam() {
    try {
        console.log('[ORCHESTRATOR] Initiating Team Launch sequence...');

        // 1. Read Live Status
        const statusPath = path.join(process.cwd(), 'public/data/live_status.json');
        
        let statusData: LiveStatus;
        try {
             const raw = fs.readFileSync(statusPath, 'utf-8');
             statusData = JSON.parse(raw);
        } catch (e: unknown) {
            console.error('[ORCHESTRATOR] Failed to read live status:', e);
            throw new Error('Could not read system status.');
        }

        const plan = {
            timestamp: new Date().toISOString(),
            actions: [] as { type: string; source: string; title: string; assignee: string; reason: string }[]
        };

        // 2. Delegate Linear Issues
        if (statusData.linear?.issues) {
            statusData.linear.issues.forEach((issue) => {
                const assignee = determineAssignee(issue.title + ' ' + (issue.description || ''));
                plan.actions.push({
                    type: 'DELEGATE',
                    source: 'Linear',
                    title: issue.title,
                    assignee: assignee,
                    reason: `Matches skills for ${assignee}`
                });
            });
        }

        // 3. Delegate GitHub PRs
        if (statusData.github?.prs) {
            statusData.github.prs.forEach((pr) => {
                // PRs usually imply review needed
                plan.actions.push({
                    type: 'REVIEW',
                    source: 'GitHub',
                    title: pr.title,
                    assignee: 'SuperGrok', // Default reviewer
                    reason: 'PR requires orchestration review'
                });
            });
        }
        
        // 4. Manual/User actions (Simulation)
        // Check for "blocked" or "awaiting input" - simplified logic
        plan.actions.push({
            type: 'INPUT_REQUIRED',
            source: 'System',
            title: 'Approve Deployment',
            assignee: 'Infinite27', // The User
            reason: 'Critical milestone reached'
        });

        console.log('[ORCHESTRATOR] Generated plan:', plan);
        return { success: true, plan };

    } catch (error: unknown) {
        console.error('[ORCHESTRATOR] Team Launch failed:', error);
        const msg = error instanceof Error ? error.message : String(error);
        return { success: false, error: msg };
    }
}

function determineAssignee(text: string): string {
    const lowerText = text.toLowerCase();
    
    for (const [agent, skills] of Object.entries(AGENT_SKILLS)) {
        if (skills.some(skill => lowerText.includes(skill))) {
            return agent;
        }
    }
    
    return 'Claude'; // Default fallback
}
