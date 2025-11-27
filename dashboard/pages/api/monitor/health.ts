// Basic mock API — replace with calls to forge-monitor service
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    agents: [
      { id: 'claude', name: 'Claude', mode: 'real', healthScore: 95, lastSeen: new Date().toISOString(), avgLatencyMs: 420 },
      { id: 'openai', name: 'OpenAI', mode: 'real', healthScore: 93, lastSeen: new Date().toISOString(), avgLatencyMs: 380 },
      { id: 'grok', name: 'Grok', mode: 'mock', healthScore: 80, lastSeen: new Date().toISOString(), avgLatencyMs: 120 }
    ]
  })
}
