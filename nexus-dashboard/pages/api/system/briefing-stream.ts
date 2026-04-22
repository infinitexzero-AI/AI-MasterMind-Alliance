import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * Wave 7: Autonomous Briefing Engine (SSE)
 * Provides a real-time stream of what the system is accomplishing.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // 1. Initial Briefing
  sendEvent({
    type: 'BRIEFING_START',
    message: 'Initializing morning summary for AI Mastermind Alliance...',
    timestamp: new Date().toISOString()
  });

  // 2. Scan Recent Accomplishments (Logs/Tasks)
  const taskPath = '/Users/infinite27/AILCC_PRIME/tasks/100_task_master_plan.json';
  if (fs.existsSync(taskPath)) {
    const tasks = JSON.parse(fs.readFileSync(taskPath, 'utf8'));
    const completed = tasks.waves.flatMap((w: any) => w.tasks).filter((t: any) => t.status === 'completed');
    
    sendEvent({
      type: 'ACCOMPLISHMENTS',
      count: completed.length,
      recent: completed.slice(-3).map((t: any) => t.description)
    });
  }

  // 3. Keep Stream Alive with System Pulse
  const interval = setInterval(() => {
    sendEvent({
      type: 'HEARTBEAT',
      status: 'Neural Hub Active',
      load: Math.random() * 100
    });
  }, 5000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
}
