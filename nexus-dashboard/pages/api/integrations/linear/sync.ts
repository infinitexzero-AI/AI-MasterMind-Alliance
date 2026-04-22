import type { NextApiRequest, NextApiResponse } from 'next';
import { TaskQueue } from '../../../../lib/taskQueue';
import { withAuth } from '../../../../lib/apiAuth';
import { withRateLimit } from '../../../../lib/rateLimiter';
import { corsHeaders } from '../../../../lib/cors';
import { linearClient, isLinearEnabled } from '../../../../lib/linearClient'; // Ensure this path is correct
import { ApiResponse } from '../../../../types/api.types';

// Helper for CORS middleware pattern
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: (req: NextApiRequest, res: NextApiResponse, result: (result: unknown) => void) => void) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  // Apply CORS manually
  corsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate Limit check logic is wrapped in withRateLimit, but here we can't easily chain strictly if we want a clean handler function.
  // We will rely on withRateLimit wrapping the export.


  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed', timestamp: new Date().toISOString() });
  }

  if (!isLinearEnabled()) {
    return res.status(503).json({ success: false, error: 'Linear integration not configured (Missing API Key)', timestamp: new Date().toISOString() });
  }

  try {
    const me = await linearClient.viewer;
    const myIssues = await me.assignedIssues({
        filter: {
            state: { name: { eq: "In Progress" } }
        }
    });

    const syncedTasks = [];

    for (const issue of myIssues.nodes) {
        // Use static create method
        const task = TaskQueue.create({
            title: `[Linear-${issue.identifier}] ${issue.title}`,
            context: issue.description || "Imported from Linear",
            priority: issue.priority > 2 ? 'high' : 'medium', // Mapped to 'medium' instead of 'normal'
            source: 'linear',
            targetAgent: 'OmniRouter', // Default router
            metadata: {
                linearId: issue.id,
                linearUrl: issue.url
            }
        });
        syncedTasks.push(task);
    }

    return res.status(200).json({
      success: true,
      data: {
        syncedCount: syncedTasks.length,
        tasks: syncedTasks.map(t => t.taskId)
      },
      timestamp: new Date().toISOString(),
    });


  } catch (error: unknown) {
    console.error('Linear Sync Error:', error);
    return res.status(500).json({ success: false, error: (error instanceof Error ? error.message : String(error)) || 'Internal Server Error', timestamp: new Date().toISOString() });
  }
}

// Chain middleware: withRateLimit(withAuth(handler))
export default withRateLimit(withAuth(handler));
