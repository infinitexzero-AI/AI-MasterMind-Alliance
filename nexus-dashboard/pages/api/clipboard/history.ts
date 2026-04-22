import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@alliance-types/api.types';
import { ClipboardManager, ClipboardItem } from '@lib/clipboard';
import { withRateLimit } from '@lib/rateLimiter';
import { corsHeaders } from '@lib/cors';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<ClipboardItem[] | ClipboardItem>>
) {
    corsHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        switch (req.method) {
            case 'GET': {
                const history = ClipboardManager.getHistory();
                return res.status(200).json({
                    success: true,
                    data: history,
                    timestamp: new Date().toISOString()
                });
            }

            case 'POST': {
                const { content, source } = req.body;

                if (!content || !source) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing content or source',
                        timestamp: new Date().toISOString()
                    });
                }

                const newItem = ClipboardManager.addItem(content, source);
                return res.status(200).json({
                    success: true,
                    data: newItem,
                    timestamp: new Date().toISOString()
                });
            }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).json({
                    success: false,
                    error: `Method ${req.method} Not Allowed`,
                    timestamp: new Date().toISOString()
                });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: `Internal server error: ${(error as Error).message}`,
            timestamp: new Date().toISOString()
        });
    }
}

export default withRateLimit(handler);
