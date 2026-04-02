
import type { NextApiRequest, NextApiResponse } from 'next';
import { CodeOrchestrator } from '../../../services/code-orchestration/orchestrator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ message: 'Tasks array is required' });
  }

  try {
    const orchestrator = new CodeOrchestrator(
      process.env.ANTHROPIC_API_KEY || '',
      process.env.OPENAI_API_KEY || '',
      process.env.GOOGLE_API_KEY || ''
    );

    const results = await orchestrator.executeAll(tasks);
    res.status(200).json({ results });

  } catch (error: any) {
    console.error('Cortex Execute Error:', error);
    res.status(500).json({ message: error.message });
  }
}
