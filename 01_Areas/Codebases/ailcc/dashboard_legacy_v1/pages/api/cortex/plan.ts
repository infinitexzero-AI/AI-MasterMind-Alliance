
import type { NextApiRequest, NextApiResponse } from 'next';
import { CodeOrchestrator } from '../../../services/code-orchestration/orchestrator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    const orchestrator = new CodeOrchestrator(
      process.env.ANTHROPIC_API_KEY || '',
      process.env.OPENAI_API_KEY || '',
      process.env.GOOGLE_API_KEY || ''
    );

    const tasks = await orchestrator.plan(prompt);
    res.status(200).json({ tasks });

  } catch (error: any) {
    console.error('Cortex Plan Error:', error);
    res.status(500).json({ message: error.message });
  }
}
