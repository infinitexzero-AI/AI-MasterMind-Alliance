import type { NextApiRequest, NextApiResponse } from 'next';
import { linearClient, isLinearEnabled } from '../../../lib/linearClient';
import { withRateLimit } from '../../../lib/rateLimiter';
import { corsHeaders } from '../../../lib/cors';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    corsHeaders(req, res);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isLinearEnabled()) {
        // Return mock data if Linear is not configured (for dev/demo)
        return res.status(200).json({
            success: true,
            data: [
                { id: '1', title: ' Configure Linear API Key', state: { name: 'Todo', color: '#f59e0b' }, priority: 1, identifier: 'LIN-1' },
                { id: '2', title: 'Review System Architecture', state: { name: 'In Progress', color: '#3b82f6' }, priority: 2, identifier: 'LIN-2' },
                { id: '3', title: 'Optimize Neural Pathways', state: { name: 'Done', color: '#10b981' }, priority: 3, identifier: 'LIN-3' },
            ],
            isMock: true
        });
    }

    try {
        const me = await linearClient.viewer;
        const myIssues = await me.assignedIssues({
            filter: {
                state: {
                    name: { nin: ['Done', 'Canceled'] } // valid operator for "not in"
                }
            },
            first: 20,
            orderBy: 'updatedAt' as any // Force cast to bypass strict SDK typing or remove valid enum lookup for now
        });

        const formattedIssues = await Promise.all(myIssues.nodes.map(async (issue) => {
            const state = await issue.state;
            return {
                id: issue.id,
                title: issue.title,
                identifier: issue.identifier,
                priority: issue.priority,
                state: {
                    name: state?.name,
                    color: state?.color
                },
                url: issue.url
            };
        }));

        return res.status(200).json({
            success: true,
            data: formattedIssues
        });

    } catch (error: unknown) {
        console.error('Linear API Error:', error);
        return res.status(500).json({ success: false, error: (error instanceof Error ? error.message : String(error)) });
    }
}

export default withRateLimit(handler);
