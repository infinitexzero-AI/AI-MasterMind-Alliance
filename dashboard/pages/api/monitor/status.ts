// Simple health/status endpoint for the Forge Monitor dashboard
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    agents: ['claude', 'openai', 'grok', 'codexforge'],
  });
}
